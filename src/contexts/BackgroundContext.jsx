import React, { createContext, useContext, useState } from 'react';

const BackgroundContext = createContext();

export const useBackground = () => {
  const context = useContext(BackgroundContext);
  if (!context) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
};

export const BackgroundProvider = ({ children }) => {
  const [homeLoaded, setHomeLoaded] = useState(false);
  const [aboutContentLoaded, setAboutContentLoaded] = useState(false);
  const [currentRoute, setCurrentRoute] = useState('/');

  // Fix: Issue #1
  const getBackgroundClass = () => {
    if (currentRoute === '/about') {
      return aboutContentLoaded
        ? 'bg-[#0a192f]'
        : 'bg-[#0a192f]';
    }
    return homeLoaded ? 'bg-gradient-to-b from-sunset to-transparent bg-cover' : 'bg-transparent';
  };

  const value = {
    homeLoaded,
    setHomeLoaded,
    aboutContentLoaded,
    setAboutContentLoaded,
    currentRoute,
    setCurrentRoute,
    getBackgroundClass
  };

  return (
    <BackgroundContext.Provider value={value}>
      {children}
    </BackgroundContext.Provider>
  );
};