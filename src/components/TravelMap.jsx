import { createPortal } from 'react-dom';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import 'jsvectormap/dist/jsvectormap.min.css';
import travelData from '../data/travel.json';

const BACKEND_URL = 'http://localhost:8000/api/polarsteps';

const ZOOM_MAX = 8;

// --- Icons ---

const GlobeIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const RoadIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
  </svg>
);

const SuitcaseIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

// --- Sub-components ---

const StatItem = ({ icon: Icon, label, value }) => (
  <div className="flex flex-col items-center gap-0.5 flex-1">
    <Icon className="w-3 h-3 text-white/60" />
    <span className="text-xs font-semibold text-white">{value}</span>
    <span className="text-[10px] text-white/60">{label}</span>
  </div>
);

const SkeletonBlock = ({ className }) => (
  <div className={`animate-pulse bg-white/20 rounded ${className}`} />
);

// --- World Map via JSVectorMap ---

const VISITED_COUNTRY_CODES = travelData.visited_countries.map(c => c.code);

// mapRef is owned by TravelMap and passed down so zoom handlers and
// the WorldMap init share a single, stable reference.
function WorldMap({ mapRef, onTooltip }) {
  const mountRef = useRef(null);
  const activeNameRef = useRef('');
  const isDraggingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // destroyed flag prevents the stale async continuation that fires after
    // React Strict Mode's cleanup from appending a second SVG on top of the
    // correctly-initialised one, which would make the map appear frozen on zoom.
    let destroyed = false;

    const initMap = async () => {
      try {
        // Sequential imports — world.js calls window.jsVectorMap.addMap() which
        // requires the main library to have run first and set window.jsVectorMap.
        // Promise.all does NOT guarantee this order.
        const { default: JsVectorMap } = await import('jsvectormap');
        await import('jsvectormap/dist/maps/world.js');

        await new Promise(r => requestAnimationFrame(r));

        if (destroyed || !mountRef.current) return;

        const regionValues = {};
        VISITED_COUNTRY_CODES.forEach(code => { regionValues[code] = 'visited'; });

        const map = new JsVectorMap({
          selector: mountRef.current,
          map: 'world',
          draggable: false,
          regionsSelectable: false,
          zoomOnScroll: false,
          zoomButtons: false,
          showTooltip: true,
          zoomMin: 1,
          zoomMax: ZOOM_MAX,
          series: {
            regions: [{
              values: regionValues,
              attribute: 'fill',
              scale: { visited: '#558071' },
            }],
          },
          regionStyle: {
            initial: {
              fill: 'rgba(255, 255, 255, 0.13)',
              stroke: 'rgba(255, 255, 255, 0.07)',
              strokeWidth: 0.5,
            },
            hover: { fill: '#78ab9a' },
            selected: { fill: 'rgba(255, 255, 255, 0.13)' },
            selectedHover: { fill: '#78ab9a' },
          },
          onRegionClick: (e) => e.preventDefault(),
          // Intercept JSVectorMap's native tooltip show event.
          // e.preventDefault() stops the native tooltip element from becoming
          // visible; we drive our own React-portal tooltip instead.
          onRegionTooltipShow: (e, tooltip) => {
            e.preventDefault();
            activeNameRef.current = tooltip.text();
            onTooltip?.({ visible: true, name: tooltip.text(), x: e.clientX, y: e.clientY });
          },
        });

        // Second guard: cleanup may have fired while the sync constructor ran
        if (destroyed) {
          try { map.destroy(); } catch {}
          if (mountRef.current) mountRef.current.innerHTML = '';
          return;
        }

        mapRef.current = map;
      } catch (err) {
        console.error('TravelMap map init error:', err);
      }
    };

    initMap();

    return () => {
      destroyed = true;
      try { mapRef.current?.destroy?.(); } catch {}
      mapRef.current = null;
      // jsvectormap's destroy() does not remove the SVG from the DOM;
      // clear it manually so a Strict Mode re-mount starts with a clean container.
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
        mountRef.current.classList.remove('jvm-container');
      }
    };
  }, [mapRef, onTooltip]);

  // Custom pan — jsvectormap's built-in drag uses container-level mousemove which
  // loses tracking the moment the cursor leaves the container during a fast drag.
  // Document-level listeners ensure the drag stays live until mouseup anywhere.
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const onMouseDown = (e) => {
      if (e.button !== 0) return;
      isDraggingRef.current = true;
      lastPosRef.current = { x: e.clientX, y: e.clientY };
      el.style.cursor = 'grabbing';
    };

    const onMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      const map = mapRef.current;
      if (!map) return;
      map.transX -= (lastPosRef.current.x - e.clientX) / map.scale;
      map.transY -= (lastPosRef.current.y - e.clientY) / map.scale;
      map._applyTransform?.();
      lastPosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      el.style.cursor = 'grab';
    };

    el.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="absolute inset-0"
      style={{ background: 'rgba(0,0,0,0.20)' }}
      onMouseMove={(e) => {
        // Skip tooltip tracking while a mouse button is held (user is panning)
        if (e.buttons !== 0) return;
        const isOverCountry = e.target?.classList?.contains('jvm-element');
        if (isOverCountry && activeNameRef.current) {
          onTooltip?.({ visible: true, name: activeNameRef.current, x: e.clientX, y: e.clientY });
        } else if (!isOverCountry && activeNameRef.current) {
          activeNameRef.current = '';
          onTooltip?.({ visible: false, name: '', x: 0, y: 0 });
        }
      }}
      onMouseLeave={() => {
        activeNameRef.current = '';
        onTooltip?.({ visible: false, name: '', x: 0, y: 0 });
      }}
    >
      <div ref={mountRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />
    </div>
  );
}

// --- Main Component ---

const TravelMap = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  // mapRef lives here so both WorldMap init and handleZoom share the same instance
  const mapRef = useRef(null);

  // Tooltip state: only visible/name trigger re-renders.
  // Position is written directly to the DOM element via tooltipElRef to avoid
  // a re-render on every mousemove.
  const [tooltipInfo, setTooltipInfo] = useState({ visible: false, name: '' });
  const tooltipElRef = useRef(null);
  const tooltipPos = useRef({ x: 0, y: 0 });

  const handleTooltip = useCallback(({ visible, name, x, y }) => {
    if (visible) {
      tooltipPos.current = { x, y };
      // Direct DOM write for position — avoids re-render on every mousemove
      if (tooltipElRef.current) {
        tooltipElRef.current.style.top = `${y - 32}px`;
        tooltipElRef.current.style.left = `${x + 12}px`;
      }
      // Only re-render if visibility or country name actually changed
      setTooltipInfo(prev =>
        prev.visible && prev.name === name ? prev : { visible: true, name }
      );
    } else {
      setTooltipInfo(prev => prev.visible ? { visible: false, name: prev.name } : prev);
    }
  }, []);

  const handleZoom = useCallback((direction) => {
    const map = mapRef.current;
    if (!map) return;
    const factor = direction === 'in' ? 1.5 : 1 / 1.5;
    // _setScale clamps against zoomMin/zoomMax × _baseScale set in the constructor,
    // so ZOOM_MAX is enforced without any custom raw-scale comparison.
    map._setScale?.(
      (map.scale ?? 1) * factor,
      (map._width ?? 300) / 2,
      (map._height ?? 200) / 2,
      false,
      false
    );
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(BACKEND_URL);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      setData(await res.json());
    } catch (err) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const isOffline = error && (error.includes('fetch') || error.includes('Failed') || error.includes('NetworkError'));

  return (
    <>
      <div className="flex flex-col gap-2 relative bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-3 shadow-2xl md:h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GlobeIcon className="w-4 h-4 text-white/70" />
            <span className="text-sm font-semibold text-white">Travel map &amp; stats</span>
          </div>
          {!error && !loading && (
            <a
              href="https://www.polarsteps.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              Polarsteps
            </a>
          )}
        </div>

        {/* World map — grows to fill remaining card space; overlays sit on top */}
        <div className="flex-1 min-h-[9rem] relative rounded-lg overflow-hidden">
          <WorldMap mapRef={mapRef} onTooltip={handleTooltip} />

          {/* Zoom controls — sibling to WorldMap, not inside its SVG DOM */}
          <div className="absolute top-2 right-2 z-20 flex flex-col gap-1">
            <button
              aria-label="Zoom in"
              className="w-6 h-6 rounded bg-black/40 text-white/80 text-sm flex items-center justify-center hover:bg-black/60 transition-colors"
              onPointerDown={(e) => { e.stopPropagation(); handleZoom('in'); }}
            >+</button>
            <button
              aria-label="Zoom out"
              className="w-6 h-6 rounded bg-black/40 text-white/80 text-sm flex items-center justify-center hover:bg-black/60 transition-colors"
              onPointerDown={(e) => { e.stopPropagation(); handleZoom('out'); }}
            >−</button>
          </div>

          {/* "Places I've visited" label — bottom-left overlay */}
          <p className="absolute bottom-1.5 left-2 text-[10px] text-white/50 z-10 pointer-events-none">
            Places I&apos;ve visited
          </p>
        </div>

        {/* Stats strip — shows skeleton while loading, values when ready, hidden on offline */}
        {loading ? (
          <div className="flex gap-3">
            <SkeletonBlock className="h-6 flex-1" />
            <SkeletonBlock className="h-6 flex-1" />
            <SkeletonBlock className="h-6 flex-1" />
          </div>
        ) : !error && data ? (
          <div className="flex divide-x divide-white/20">
            <StatItem
              icon={GlobeIcon}
              label="countries"
              value={(data.countries?.length ?? travelData.visited_countries.length)}
            />
            <StatItem
              icon={RoadIcon}
              label="km travelled"
              value={Number(data.km_count || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
            />
            <StatItem
              icon={SuitcaseIcon}
              label="trips"
              value={data.trip_count ?? (data.trips?.length ?? travelData.trips.length)}
            />
          </div>
        ) : (
          // Offline / error — show static country count from travel.json
          <div className="flex divide-x divide-white/20">
            <StatItem icon={GlobeIcon} label="countries" value={travelData.visited_countries.length} />
            <StatItem icon={SuitcaseIcon} label="trips" value={travelData.trips.length} />
            {isOffline && (
              <div className="flex-1 flex items-center justify-center">
                <span className="text-[10px] text-white/40 italic">backend offline</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Country name tooltip — portalled to document.body so it is never clipped
          by overflow-hidden or contained by any ancestor's backdrop-filter context */}
      {tooltipInfo.visible && createPortal(
        <div
          ref={tooltipElRef}
          className="pointer-events-none bg-black/70 text-white/90 text-[10px] px-2 py-1 rounded-md border border-white/15 backdrop-blur-sm whitespace-nowrap"
          style={{
            position: 'fixed',
            zIndex: 9999,
            top: `${tooltipPos.current.y - 32}px`,
            left: `${tooltipPos.current.x + 12}px`,
          }}
        >
          {tooltipInfo.name}
        </div>,
        document.body
      )}
    </>
  );
};

export default TravelMap;
