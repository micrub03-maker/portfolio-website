import React, { useEffect } from "react";
import { Navigate, Route, BrowserRouter as Router, Routes, useLocation } from "react-router-dom";
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
      {/* Fix: Issue #1 / F-3 — old /home links redirect; unknown paths fall back to the loader */}
      <Routes>
        <Route path="/" element={<Loader />} />
        <Route path="/about" element={<About />} />
        <Route path="/home" element={<Navigate to="/about" replace />} />
        <Route path="/Michael-Rubin-Resume.PlsHireMe" element={<ResumePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
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
