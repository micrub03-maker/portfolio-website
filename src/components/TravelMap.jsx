// TravelMap — world map (JSVectorMap) + showcase cards cloned from meetAndy/slices-of-life sol1
// The Polarsteps stats strip is preserved and degrades gracefully when the backend is offline.

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
    <Icon className="w-4 h-4 text-gray-400" />
    <span className="text-sm font-semibold text-gray-800">{value}</span>
    <span className="text-xs text-gray-400">{label}</span>
  </div>
);

const SkeletonBlock = ({ className }) => (
  <div className={`animate-pulse bg-gray-100 rounded ${className}`} />
);

// --- World Map via JSVectorMap ---

const VISITED_COUNTRY_CODES = travelData.visited_countries.map(c => c.code);

function WorldMap() {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    let map;
    const initMap = async () => {
      try {
        // Dynamically import jsvectormap so bundle doesn't break if not installed
        const [{ default: JsVectorMap }, worldMapModule] = await Promise.all([
          import('jsvectormap'),
          import('jsvectormap/dist/maps/world.js'),
        ]);

        if (!containerRef.current) return;

        const regionValues = {};
        VISITED_COUNTRY_CODES.forEach(code => {
          regionValues[code] = 'visited';
        });

        map = new JsVectorMap({
          selector: containerRef.current,
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
      } catch {
        // jsvectormap not installed — map stays hidden
      }
    };
    initMap();
    return () => {
      try { mapRef.current?.destroy?.(); } catch {}
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-40 rounded-lg overflow-hidden"
      style={{ background: 'rgba(240,244,242,0.5)' }}
    />
  );
}

// --- Showcase cards cloned from meetAndy slices-of-life sol1 ---

const showcaseItems = [
  {
    id: 'next',
    tag: 'Next',
    tagColor: 'bg-blue-100 text-blue-700',
    title: 'Sevilla to Porto',
    description: 'Planning a trip to south Spain and a bit of Portugal!',
    emoji: '\uD83C\uDDEA\uD83C\uDDF8',
  },
  {
    id: 'latest',
    tag: 'Latest',
    tagColor: 'bg-green-100 text-green-700',
    title: 'Oahu, Hawai\u02BBi',
    description: 'Our family is big on all things Disney — spent time at Aulani.',
    emoji: '\uD83C\uDDFA\uD83C\uDDF8',
  },
  {
    id: 'favorite',
    tag: 'Favorite',
    tagColor: 'bg-amber-100 text-amber-700',
    title: 'Florence Study Abroad',
    description: 'Three awesome months in Florence for my last semester. La Dolce Vita.',
    emoji: '\uD83C\uDDEE\uD83C\uDDF9',
  },
];

function ShowcaseCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
      {showcaseItems.map(item => (
        <div
          key={item.id}
          className="flex flex-col gap-1 rounded-xl border border-gray-100 bg-white/70 px-3 py-2.5 shadow-sm"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{item.emoji}</span>
            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${item.tagColor}`}>
              {item.tag}
            </span>
          </div>
          <p className="text-sm font-semibold text-gray-800 leading-snug">{item.title}</p>
          <p className="text-xs text-gray-500 leading-snug">{item.description}</p>
        </div>
      ))}
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
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GlobeIcon className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-semibold text-gray-700">Travel map &amp; stats</span>
        </div>
        {!error && !loading && (
          <a
            href="https://www.polarsteps.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Polarsteps
          </a>
        )}
      </div>

      {/* Stats strip — shows skeleton while loading, values when ready, hidden on offline */}
      {loading ? (
        <div className="flex gap-3">
          <SkeletonBlock className="h-10 flex-1" />
          <SkeletonBlock className="h-10 flex-1" />
          <SkeletonBlock className="h-10 flex-1" />
        </div>
      ) : !error && data ? (
        <div className="flex divide-x divide-gray-100">
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
        <div className="flex divide-x divide-gray-100">
          <StatItem icon={GlobeIcon} label="countries" value={travelData.visited_countries.length} />
          <StatItem icon={SuitcaseIcon} label="trips" value={travelData.trips.length} />
          {isOffline && (
            <div className="flex-1 flex items-center justify-center">
              <span className="text-xs text-gray-400 italic">backend offline</span>
            </div>
          )}
        </div>
      )}

      {/* World map */}
      <div>
        <p className="text-xs text-gray-400 mb-1">Places I&apos;ve visited</p>
        <WorldMap />
      </div>

      {/* Showcase cards — cloned from meetAndy slices-of-life travel section */}
      <ShowcaseCards />
    </div>
  );
};

export default TravelMap;
