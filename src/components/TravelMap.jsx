// NOTE: This widget fetches from a local Polarsteps backend that uses the
// unofficial polarsteps-api library. It only works when the backend server
// is running at BACKEND_URL. In production (GitHub Pages) it degrades
// gracefully to an "offline" message.

import React, { useState, useEffect, useCallback } from 'react';

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
    <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
      <Icon className="w-3 h-3 text-white" />
    </div>
    <span className="text-white font-bold text-sm leading-none">{value}</span>
    <span className="text-white/60 text-[10px] uppercase tracking-wide leading-none">{label}</span>
  </div>
);

const CountryMarker = ({ country }) => {
  const display = country.flag_emoji || (country.code ? country.code.slice(0, 2) : '?');
  return (
    <div className="relative group flex-shrink-0">
      <div
        className="w-7 h-7 rounded-full bg-white/20 border border-white/30 flex items-center justify-center
                   text-sm cursor-default hover:bg-white/30 hover:scale-110 transition-all"
        title={country.name}
      >
        {display}
      </div>
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1
                      bg-gray-900/90 text-white text-[10px] rounded-lg whitespace-nowrap
                      opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none
                      z-20 border border-white/10 shadow-xl">
        {country.name}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900/90" />
      </div>
    </div>
  );
};

const SkeletonBlock = ({ className }) => (
  <div className={`bg-white/10 rounded animate-pulse ${className}`} />
);

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

  // --- Loading skeleton ---
  if (loading) {
    return (
      <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-3 shadow-2xl border border-white/20 h-full overflow-hidden">
        <div className="widget-gradient" />
        <div className="relative z-10 h-full flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <SkeletonBlock className="w-5 h-5 rounded-full" />
            <SkeletonBlock className="w-28 h-3 rounded" />
          </div>
          <div className="flex gap-2">
            <SkeletonBlock className="flex-1 h-10 rounded-xl" />
            <SkeletonBlock className="flex-1 h-10 rounded-xl" />
            <SkeletonBlock className="flex-1 h-10 rounded-xl" />
          </div>
          <SkeletonBlock className="flex-1 rounded-xl" />
        </div>
      </div>
    );
  }

  // --- Error state ---
  if (error) {
    const isOffline = error.includes('fetch') || error.includes('Failed') || error.includes('NetworkError');
    return (
      <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-3 shadow-2xl border border-white/20 h-full overflow-hidden flex flex-col justify-between">
        <div className="widget-gradient" />
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
              <GlobeIcon className="w-3 h-3 text-white" />
            </div>
            <p className="text-white font-semibold text-xs uppercase tracking-wide">Travel map & stats</p>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center px-2">
            <span className="text-2xl">✈️</span>
            <p className="text-white/70 text-xs leading-relaxed">
              {isOffline
                ? 'Backend offline. Run the Polarsteps server locally to see travel data.'
                : "Couldn't load travel stats from Polarsteps."}
            </p>
            {!isOffline && (
              <button
                onClick={fetchData}
                className="mt-1 text-[11px] text-white/80 bg-white/10 hover:bg-white/20 border border-white/20
                           rounded-lg px-3 py-1 transition-all hover:scale-105"
              >
                Try again
              </button>
            )}
          </div>
          {isOffline && (
            <p className="text-white/30 text-[10px] text-center mt-2">
              Local-only integration
            </p>
          )}
        </div>
      </div>
    );
  }

  // --- Data ready ---
  const kmFormatted = Number(data.km_count || 0).toLocaleString('en-US', { maximumFractionDigits: 0 });
  const countries = data.countries || [];
  const tripCount = data.trip_count ?? (data.trips?.length ?? 0);

  return (
    <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-3 shadow-2xl border border-white/20 hover:scale-105 transition-all h-full overflow-hidden">
      <div className="widget-gradient" />
      <div className="relative z-10 h-full flex flex-col gap-2">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
              <GlobeIcon className="w-3 h-3 text-white" />
            </div>
            <p className="text-white font-semibold text-xs uppercase tracking-wide">Travel map & stats</p>
          </div>
          <span className="text-white/50 text-[10px] font-medium tracking-wide">Polarsteps</span>
        </div>

        {/* Stats strip */}
        <div className="flex items-center justify-around border border-white/10 rounded-xl px-2 py-2 bg-white/10">
          <StatItem icon={GlobeIcon} label="Countries" value={data.country_count ?? countries.length} />
          <div className="w-px h-8 bg-white/10" />
          <StatItem icon={RoadIcon} label="Km" value={`${kmFormatted}`} />
          <div className="w-px h-8 bg-white/10" />
          <StatItem icon={SuitcaseIcon} label="Trips" value={tripCount} />
        </div>

        {/* Map area */}
        <div className="flex-1 rounded-xl bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border border-white/10 p-2 overflow-hidden flex flex-col gap-1.5">
          <p className="text-white/40 text-[10px] uppercase tracking-wider">Places I've visited</p>
          {countries.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-white/30 text-xs">
              No country data available
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5 overflow-y-auto content-start flex-1
                            scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {countries.map((country, i) => (
                <CountryMarker key={country.code || i} country={country} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default TravelMap;
