import React, { useState, useEffect } from 'react';

const WorldClock = () => {
  const [times, setTimes] = useState({});
  const [weather, setWeather] = useState({});

  const locations = [
    { 
      id: 'berkeley', 
      name: 'Berkeley, California', 
      timezone: 'America/Los_Angeles', 
      color: 'bg-blue-500', // UC Berkeley blue
      unit: '°F',
      lat: 37.8715,
      lon: -122.2730
    },
    { 
      id: 'wellington', 
      name: 'Wellington, New Zealand', 
      timezone: 'Pacific/Auckland', 
      color: 'bg-black', // New Zealand All Blacks
      unit: '°C',
      lat: -41.2924,
      lon: 174.7787
    },
    { 
      id: 'rochester', 
      name: 'Rochester, New York', 
      timezone: 'America/New_York', 
      color: 'bg-yellow-500', // University of Rochester yellow
      unit: '°F',
      lat: 43.1566,
      lon: -77.6088
    },
    { 
      id: 'sydney', 
      name: 'Sydney, Australia', 
      timezone: 'Australia/Sydney', 
      color: 'bg-orange-500', // Sydney Harbour Bridge orange/rust
      unit: '°C',
      lat: -33.8688,
      lon: 151.2093
    }
  ];

  // Update times every second
  useEffect(() => {
    const updateTimes = () => {
      const newTimes = {};
      locations.forEach(location => {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
          timeZone: location.timezone,
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        newTimes[location.id] = timeString;
      });
      setTimes(newTimes);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch weather data
  useEffect(() => {
    const fetchWeather = async () => {
      const weatherData = {};
      
      // Mock weather data for demo
      // To enable real weather, uncomment the API code below and add your API key
      const mockTemps = {
        berkeley: 68,
        wellington: 16,
        sydney: 22,
        rochester: 38
      };
      
      for (const location of locations) {
        try {
          // Using mock data for now
          weatherData[location.id] = mockTemps[location.id];
          
          /* 
          // Uncomment this section to use real weather API:
          const API_KEY = import.meta.env.VITE_WEATHER_API_KEY || 'your_api_key_here';
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${API_KEY}&units=${location.unit === '°C' ? 'metric' : 'imperial'}`
          );
          const data = await response.json();
          weatherData[location.id] = Math.round(data.main.temp);
          */
        } catch (error) {
          console.error(`Error fetching weather for ${location.name}:`, error);
          weatherData[location.id] = '--';
        }
      }
      
      setWeather(weatherData);
    };

    fetchWeather();
    // Update weather every 15 minutes
    const weatherInterval = setInterval(fetchWeather, 15 * 60 * 1000);
    return () => clearInterval(weatherInterval);
  }, []);

  return (
    <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-3 shadow-2xl border border-white/20 hover:scale-105 transition-all h-full overflow-hidden">
      <div className="widget-gradient"></div>
      <div className="relative z-10 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-white font-semibold text-xs uppercase tracking-wide">World Clock</p>
        </div>
        <div className="flex items-center gap-1 text-green-300 text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse"></span>
          Live
        </div>
      </div>
      <div className="text-white/90 flex-1 flex flex-col gap-2 justify-between">
        {locations.map(location => (
          <div key={location.id} className="border border-white/10 rounded-xl px-3 py-2 flex flex-1 items-center justify-between bg-white/5">
            <div>
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 ${location.color} rounded-full`}></div>
                <span className="font-semibold text-xs">{location.name}</span>
              </div>
              <p className="text-white/60 text-[11px] mt-0.5 uppercase tracking-wide">
                {location.timezone.replace(/_/g, ' ')}
              </p>
            </div>
            <div className="text-right">
              <div className="font-mono text-sm font-semibold">
                {times[location.id] || '--:-- --'}
              </div>
              <div className="text-white/60 text-xs">
                {weather[location.id] !== undefined ? `${weather[location.id]}${location.unit}` : `--${location.unit}`}
              </div>
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
};

export default WorldClock;
