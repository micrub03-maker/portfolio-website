import { createPortal } from 'react-dom';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useMediaQuery } from 'react-responsive';
import 'jsvectormap/dist/jsvectormap.min.css';
import travelData from '../data/travel.json';
import LifeStoryEasterEgg from './LifeStoryEasterEgg';

const ZOOM_MAX = 8;

// --- Icons ---

const GlobeIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);


const MapPinIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const HouseIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

// --- Sub-components ---

const TripHighlightCard = ({ title, year }) => (
  <div className="bg-white/10 border border-white/10 rounded-lg px-2 py-1.5">
    <p className="text-[10px] text-white leading-tight">{title}</p>
    {year && <p className="text-[9px] text-white/40 mt-0.5">{year}</p>}
  </div>
);

const TripDreamCard = ({ title }) => (
  <div className="bg-amber-500/15 border border-amber-400/20 rounded-lg px-2 py-1.5">
    <p className="text-[10px] text-amber-100 leading-tight">{title}</p>
  </div>
);

const StatItem = ({ icon: Icon, label, value, onClick }) => (
  <div className="flex flex-col items-center gap-0.5 flex-1" onClick={onClick} style={onClick ? { cursor: 'pointer' } : {}}>
    <Icon className="w-3 h-3 text-white/60" />
    <span className="text-xs font-semibold text-white">{value}</span>
    <span className="text-[10px] text-white/60 text-center leading-tight">{label}</span>
  </div>
);


// --- World Map via JSVectorMap ---

const VISITED_COUNTRY_CODES = travelData.visited_countries.map(c => c.code);

// jsvectormap's EventHandler uses a module-level singleton registry.
// map.destroy() calls EventHandler.flush() which removes ALL registered
// listeners globally — killing any other live map instances on the same page.
// This set lets surviving WorldMap instances reinitialize after a flush.
export const _pendingReinit = new Set();

// mapRef is owned by TravelMap and passed down so zoom handlers and
// the WorldMap init share a single, stable reference.
function WorldMap({ mapRef, onTooltip, zoomMax = ZOOM_MAX, isMobile = false }) {
  const mountRef = useRef(null);
  const activeNameRef = useRef('');
  const isDraggingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  // Holds the current initMap fn so doReinit can re-invoke it without re-running the effect.
  const initMapFnRef = useRef(null);
  // Preserves zoom/pan across reinits triggered by another instance's destroy().
  const pendingTransformRef = useRef(null);

  useEffect(() => {
    // destroyed: prevents stale async continuations after React Strict Mode's
    // double-invoke cleanup from appending a second SVG on top of the real one.
    let destroyed = false;
    // initGen: cancels in-flight initMap calls when doReinit starts a fresh one.
    let initGen = 0;

    const initMap = async () => {
      const myGen = ++initGen;
      try {
        // Sequential imports — world.js calls window.jsVectorMap.addMap() which
        // requires the main library to have run first and set window.jsVectorMap.
        // Promise.all does NOT guarantee this order.
        const { default: JsVectorMap } = await import('jsvectormap');
        await import('jsvectormap/dist/maps/world.js');

        await new Promise(r => requestAnimationFrame(r));

        if (destroyed || !mountRef.current || initGen !== myGen) return;

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
          zoomMax: zoomMax,
          series: {
            regions: [{
              values: regionValues,
              attribute: 'fill',
              scale: { visited: '#558071' },
            }],
          },
          regionStyle: {
            initial: {
              fill: 'rgba(255, 255, 255, 0.2)',
              stroke: 'rgba(0, 0, 0, 0.25)',
              strokeWidth: 1.5,
            },
            hover: { fill: '#78ab9a' },
            selected: { fill: 'rgba(255, 255, 255, 0.2)' },
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
        if (destroyed || initGen !== myGen) {
          try { map.destroy(); } catch {}
          if (mountRef.current) mountRef.current.innerHTML = '';
          if (mountRef.current) mountRef.current.classList.remove('jvm-container');
          return;
        }

        mapRef.current = map;

        // Restore zoom/pan if this reinit followed a flush from another instance.
        if (pendingTransformRef.current) {
          const { scale, transX, transY } = pendingTransformRef.current;
          pendingTransformRef.current = null;
          map.scale = scale;
          map.transX = transX;
          map.transY = transY;
          map._applyTransform?.();
        }
      } catch (err) {
        console.error('TravelMap map init error:', err);
      }
    };

    initMapFnRef.current = initMap;

    // When another WorldMap instance is destroyed its map.destroy() calls
    // EventHandler.flush(), wiping this instance's event listeners too.
    // doReinit disposes the now-listenerless map state and recreates it.
    const doReinit = () => {
      initGen++; // cancel any in-flight initMap
      if (mapRef.current) {
        // Save zoom/pan so the new instance starts where the user left off.
        pendingTransformRef.current = {
          scale: mapRef.current.scale ?? 1,
          transX: mapRef.current.transX ?? 0,
          transY: mapRef.current.transY ?? 0,
        };
        try { mapRef.current._tooltip?.dispose?.(); } catch {}
        mapRef.current = null;
      }
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
        mountRef.current.classList.remove('jvm-container');
      }
      initMapFnRef.current?.();
    };
    _pendingReinit.add(doReinit);

    initMap();

    return () => {
      destroyed = true;
      initGen++;
      _pendingReinit.delete(doReinit);

      // Snapshot surviving instances before destroy() flushes all events.
      const survivors = new Set(_pendingReinit);

      try { mapRef.current?.destroy?.(); } catch {}
      mapRef.current = null;
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
        mountRef.current.classList.remove('jvm-container');
      }

      // Reinit survivors after the flush so their tooltip events are restored.
      if (survivors.size > 0) {
        setTimeout(() => survivors.forEach(fn => fn()), 0);
      }
    };
  }, [mapRef, onTooltip]);

  // Custom pan — desktop only; touch devices scroll the page instead.
  useEffect(() => {
    if (isMobile) return;
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
  }, [isMobile]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="absolute inset-0"
      style={{ background: 'rgba(0,0,0,0.20)' }}
      onMouseMove={isMobile ? undefined : (e) => {
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
      onMouseLeave={isMobile ? undefined : () => {
        activeNameRef.current = '';
        onTooltip?.({ visible: false, name: '', x: 0, y: 0 });
      }}
    >
      <div ref={mountRef} style={{ width: '100%', height: '100%', cursor: 'grab', touchAction: 'pan-y' }} />
    </div>
  );
}

// --- Main Component ---

const TravelMap = ({ compact = false, onNavigate }) => {
  const isMobile = useMediaQuery({ query: '(max-width: 767px)' });
  const mapRef = useRef(null);
  const [lifeStoryOpen, setLifeStoryOpen] = useState(false);

  // Tooltip state: only visible/name trigger re-renders.
  // Position is written directly to the DOM element via tooltipElRef to avoid
  // a re-render on every mousemove.
  const [tooltipInfo, setTooltipInfo] = useState({ visible: false, name: '' });
  const tooltipElRef = useRef(null);
  const tooltipPos = useRef({ x: 0, y: 0 });

  const belgiumTimerRef = useRef(null);

  const handleTooltip = useCallback(({ visible, name, x, y }) => {
    if (visible) {
      tooltipPos.current = { x, y };
      if (tooltipElRef.current) {
        tooltipElRef.current.style.top = `${y - 32}px`;
        tooltipElRef.current.style.left = `${x + 12}px`;
      }
      setTooltipInfo(prev => {
        if (prev.visible && prev.name === name) return prev;
        // Country changed — clear any pending Belgium timer
        if (belgiumTimerRef.current) {
          clearTimeout(belgiumTimerRef.current);
          belgiumTimerRef.current = null;
        }
        if (name === 'Belgium') {
          belgiumTimerRef.current = setTimeout(() => {
            setTooltipInfo(cur => cur.visible ? { ...cur, name: "you didn't even know where it was, did you..." } : cur);
            belgiumTimerRef.current = null;
          }, 2000);
        }
        return { visible: true, name };
      });
    } else {
      if (belgiumTimerRef.current) {
        clearTimeout(belgiumTimerRef.current);
        belgiumTimerRef.current = null;
      }
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

  const header = (
    <div className="flex items-center gap-2">
      <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
        <svg className="w-3 h-3 text-white rotate-45" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0 C10.5 1 10 4 10 7 L2 9 L2 13 L10 12 L10 18 L8 19 L8 21 L12 20 L16 21 L16 19 L14 18 L14 12 L22 13 L22 9 L14 7 C14 4 13.5 1 12 0 Z" />
        </svg>
      </div>
      <span className="text-xs font-semibold text-white uppercase tracking-wide">Travel map &amp; stats</span>
    </div>
  );

  const mapArea = (
    <div className={`relative rounded-lg overflow-hidden ${compact ? 'flex-1 min-h-[9rem]' : 'flex-1 min-h-[9rem]'}`}>
      <WorldMap mapRef={mapRef} onTooltip={isMobile ? null : handleTooltip} zoomMax={compact ? 4 : ZOOM_MAX} isMobile={isMobile} />
      {!isMobile && (
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
      )}
    </div>
  );

  return (
    <>
      <div className={`flex flex-col gap-2 relative backdrop-blur-md rounded-2xl border border-white/20 p-3 shadow-2xl overflow-hidden ${compact ? 'bg-black/30' : 'bg-white/10 md:h-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          {header}
          {onNavigate && (
            <button
              onClick={onNavigate}
              className="flex items-center gap-1 text-[10px] text-white/60 hover:text-white/90 transition-colors bg-white/10 hover:bg-white/20 rounded-full px-2 py-0.5"
              aria-label="View in Interests section"
            >
              explore ↓
            </button>
          )}
        </div>

        {compact ? (
          isMobile ? (
            /* Mobile compact: full-width map, stats row below */
            <>
              {mapArea}
              <div className="flex justify-around border-t border-white/20 pt-2">
                <StatItem icon={GlobeIcon} label="countries" value={travelData.visited_countries.length} />
                <StatItem icon={HouseIcon} label="countries lived" value={travelData.homes_count} onClick={() => setLifeStoryOpen(true)} />
                <StatItem icon={MapPinIcon} label="continents" value={travelData.continents_count} />
              </div>
            </>
          ) : (
          /* Desktop compact: map | stats | trip highlights */
          <div className="flex flex-row gap-2">
            {mapArea}
            <div className="flex flex-col gap-3 justify-center w-20 shrink-0 border-l border-white/20 pl-3">
              <StatItem icon={GlobeIcon} label="countries" value={travelData.visited_countries.length} />
              <StatItem icon={HouseIcon} label="countries lived" value={travelData.homes_count} onClick={() => setLifeStoryOpen(true)} />
              <StatItem icon={MapPinIcon} label="continents" value={travelData.continents_count} />
            </div>
            <div className="flex flex-col gap-1 w-36 shrink-0 border-l border-white/20 pl-3 justify-center">
              <p className="text-[9px] uppercase tracking-wide text-white/40 font-semibold mb-0.5">favourite trips</p>
              {travelData.trip_highlights.filter(h => h.type === 'highlight').map((h, i) => (
                <TripHighlightCard key={i} title={h.title} year={h.year} />
              ))}
              <p className="text-[9px] uppercase tracking-wide text-white/40 font-semibold mt-1.5 mb-0.5">dream trips</p>
              {travelData.trip_highlights.filter(h => h.type === 'dream').map((h, i) => (
                <TripDreamCard key={i} title={h.title} />
              ))}
            </div>
          </div>
          )
        ) : (
          /* Default: map on top, stats strip below */
          <>
            {mapArea}
            <div className="flex divide-x divide-white/20">
              <StatItem icon={GlobeIcon} label="countries" value={travelData.visited_countries.length} />
              <StatItem icon={HouseIcon} label="countries lived" value={travelData.homes_count} onClick={() => setLifeStoryOpen(true)} />
            </div>
          </>
        )}
      </div>

      {lifeStoryOpen && <LifeStoryEasterEgg onClose={() => setLifeStoryOpen(false)} />}

      {/* Country name tooltip — desktop only; not shown on touch devices */}
      {!isMobile && tooltipInfo.visible && createPortal(
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
