import React, { useEffect, useRef, useState } from "react";
import { Navigate, Route, BrowserRouter as Router, Routes, useLocation } from "react-router-dom";
import About from "./pages/About";
import ResumePage from "./pages/ResumePage";
import { Loader } from "./components/Loader";
import BlueprintMode from "./components/BlueprintMode";
import { LanguageProvider } from "./i18n";
import { BackgroundProvider, useBackground } from "./contexts/BackgroundContext";
import { Analytics } from "@vercel/analytics/react";

// Maps the in-page section ids (anchors on the single /about route) to the
// readable path segments reported to Vercel Analytics as virtual pageviews.
// This is purely an analytics signal — the URL bar, router, and history are
// never touched, so nothing changes for the visitor. It exists so the Vercel
// "Pages" dashboard can break /about down by the section people actually view
// (/about/projects, /about/resume, …) instead of collapsing everything into
// a single /about row.
const SECTION_PATHS = [
  ['home', 'home'],
  ['about', 'about'],
  ['projects', 'projects'],
  ['resume', 'resume'],
  ['interests', 'interests'],
  ['getInTouch', 'contact'],
];

function AppContent() {
  const location = useLocation();
  const { setCurrentRoute, getBackgroundClass } = useBackground();

  // The /about page is the same route whether you land on "/", "/home", or
  // "/about" (the others redirect here), so treat them all as the about page
  // for analytics. Any other route (e.g. the resume page) is reported as-is.
  const isAboutPage =
    location.pathname === '/about' ||
    location.pathname === '/' ||
    location.pathname === '/home';

  const [activeSection, setActiveSection] = useState('home');

  // Mirror the TableOfContents scroll detection: the active section is the
  // last one whose top has scrolled above a small offset from the viewport top.
  // We only run this on the about page; the listener is passive and reads the
  // live DOM, so it picks up sections once About has mounted.
  useEffect(() => {
    if (!isAboutPage) return;
    const detect = () => {
      const scrollPosition = window.scrollY + 100;
      let current = SECTION_PATHS[0][0];
      for (let i = SECTION_PATHS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTION_PATHS[i][0]);
        if (el && el.offsetTop <= scrollPosition) {
          current = SECTION_PATHS[i][0];
          break;
        }
      }
      setActiveSection(current);
    };
    window.addEventListener('scroll', detect, { passive: true });
    // Detect after the first paint so the sections exist and the landing
    // section fires its initial pageview.
    const raf = requestAnimationFrame(detect);
    return () => {
      window.removeEventListener('scroll', detect);
      cancelAnimationFrame(raf);
    };
  }, [isAboutPage]);

  const sectionSlug =
    SECTION_PATHS.find(([id]) => id === activeSection)?.[1] ?? 'home';
  // Both route and path are set to the per-section path so each section appears
  // as its own row in the Vercel "Pages" dashboard.
  const analyticsPath = isAboutPage ? `/about/${sectionSlug}` : location.pathname;

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
      <BlueprintMode />
      {/* Passing route + path puts Analytics in manual mode (auto-tracking is
          disabled), so each section is reported as its own virtual pageview. */}
      <Analytics route={analyticsPath} path={analyticsPath} />
    </main>
  );
}

export default function App() {
  return (
    <Router>
      <BackgroundProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </BackgroundProvider>
    </Router>
  );
}
