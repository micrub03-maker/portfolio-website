import React, { useEffect, useRef, useState } from "react";
import { Navigate, Route, BrowserRouter as Router, Routes, useLocation } from "react-router-dom";
import About from "./pages/About";
import ResumePage from "./pages/ResumePage";
import { Loader } from "./components/Loader";
import { BackgroundProvider, useBackground } from "./contexts/BackgroundContext";

function AppContent() {
  const location = useLocation();
  const { setCurrentRoute, getBackgroundClass } = useBackground();

  // Smooth loader handoff: when the visitor lands on "/", we redirect to
  // /about so the real page mounts and paints *underneath* the loader. The
  // loader is an opaque overlay; on click it fades itself out, revealing the
  // already-rendered About page behind it (a true crossfade, no blank gap and
  // no remount). It only appears on a fresh landing at "/", matching the prior
  // behavior where refreshing /about never showed the loader.
  const initialPathRef = useRef(location.pathname);
  const [loaderDone, setLoaderDone] = useState(false);
  const showLoader = initialPathRef.current === "/" && !loaderDone;

  useEffect(() => {
    setCurrentRoute(location.pathname);
  }, [location.pathname, setCurrentRoute]);

  return (
    <main className={`w-full min-h-screen relative transition-colors duration-1000 ${getBackgroundClass()}`}>
      {/* Fix: Issue #1 / F-3 — old /home links redirect; unknown paths fall back to the loader */}
      <Routes>
        <Route path="/" element={<Navigate to="/about" replace />} />
        <Route path="/about" element={<About />} />
        <Route path="/home" element={<Navigate to="/about" replace />} />
        <Route path="/Michael-Rubin-Resume.PlsHireMe" element={<ResumePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {showLoader && <Loader onEnterComplete={() => setLoaderDone(true)} />}
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
