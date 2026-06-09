// TravelMap — world map (JSVectorMap) + showcase cards cloned from meetAndy/slices-of-life sol1
// The Polarsteps stats strip is preserved and degrades gracefully when the backend is offline.

import React, { useState, useEffect, useCallback, useRef } from 'react';
import 'jsvectormap/dist/jsvectormap.min.css';
import travelData from '../data/travel.json';

const BACKEND_URL = 'http://localhost:8000/api/polarsteps';

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
      d="M9 201-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
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

function WorldMap() {
  const mountRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    let map;
    const initMap = async () => {
      try {
        // Sequential imports — world.js calls window.jsVectorMap.addMap() which
        // requires the main library to have run first and set window.jsVectorMap.
        // Promise.all does NOT guarantee this order.
        const { default: JsVectorMap } = await import('jsvectormap');
        await import('jsvectormap/dist/maps/world.js');

        await new Promise(resolve => requestAnimationFrame(resolve));

        if (!mountRef.current) return;

        console.log("TravelMap mount size before init", {
          width: mountRef.current?.offsetWidth,
          height: mountRef.current?.offsetHeight,
          rect: mountRef.current?.getBoundingClientRect(),
        });

        const regionValues = {};
        VISITED_COUNTRY_CODES.forEach(code => {
          regionValues[code] = 'visited';
        });

        map = new JsVectorMap({
          selector: mountRef.current,
          map: 'world',
          regionsSelectable: false,
          series: {
            regions: [{
              values: regionValues,
              attribute: 'fill',
              scale: { visited: '#558071' },
            }],
          },
          style: {
            initial: {
              fill: 'rgba(200, 200, 200, 0.25)',
              stroke: 'rgba(150, 150, 150, 0.2)',
              strokeWidth: 0.5,
            },
            hover: { fillOpacity: 0.8, fill: '#78ab9a' },
          },
        });
        mapRef.current = map;

        console.log("TravelMap children after init", mountRef.current?.children.length);
        console.log("TravelMap innerHTML after init", mountRef.current?.innerHTML?.slice(0, 200));
      } catch (err) {
        console.error("TravelMap map init error:", err);
      }
    };
    initMap();
    return () => {
      try { mapRef.current?.destroy?.(); } catch {}
    };
  }, []);

  // Fills whatever absolute/relative context the parent provides.
  return (
    <div
      className="absolute inset-0"
      style={{ background: 'rgba(255,255,255,0.05)' }}
    >
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

// --- Main Component ---

const TravelMap = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

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
        <WorldMap />

        {/* "Places I've visited" label — bottom-left overlay */}
        <p className="absolute bottom-1.5 left-2 text-[10px] text-white/50 z-10 pointer-events-none">
          Places I&apos;ve visited
        </p>

        {/* Favourite destination card — bottom-right overlay */}
        <div className="absolute bottom-2 right-2 z-10 flex flex-col gap-0.5 rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm px-2 py-1.5 max-w-[9rem]">
          <div className="flex items-center gap-1">
            <span className="text-sm">🇮🇹</span>
            <span className="text-[9px] font-semibold px-1 py-0.5 rounded-full bg-amber-500/25 text-amber-200">
              Favorite
            </span>
          </div>
          <p className="text-[10px] font-semibold text-white leading-tight line-clamp-1">
            Florence Study Abroad
          </p>
        </div>
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
  );
};

export default TravelMap;
