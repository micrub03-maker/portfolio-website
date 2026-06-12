import React, { useEffect } from "react";
import { Route, BrowserRouter as Router, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import ResumePage from "./pages/ResumePage";
import { Loader } from "./components/Loader";
import { BackgroundProvider, useBackground } from "./contexts/BackgroundContext";

function AppContent() {
  const location = useLocation();
  const { setCurrentRoute, getBackgroundClass } = useBackground();

  useEffect(() => {
    setCurrentRoute(location.pathname);
  }, [location.pathname, setCurrentRoute]);

  return (
    <main className={`w-full min-h-screen relative transition-colors duration-1000 ${getBackgroundClass()}`}>
      <Routes>
        <Route path="/" element={<Loader />} />
        <Route path="/home" element={<About />} />
        <Route path="/3d" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/Michael-Rubin-Resume.PlsHireMe" element={<ResumePage />} />
      </Routes>
    </main>
  );
}

export default function App() {
  return (
    <Router>
      <BackgroundProvider>
        <AppContent />
      </BackgroundProvider>
    </Router>
  );
}
