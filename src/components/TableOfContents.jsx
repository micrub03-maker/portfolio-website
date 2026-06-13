import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';

const TableOfContents = ({ isWidget = false, onSectionNavigate }) => {
  const isDesktop = useMediaQuery({ query: '(min-width: 768px)' });
  const [activeSection, setActiveSection] = useState('home');
  const [isHovered, setIsHovered] = useState(false);
  const [isDarkBackground, setIsDarkBackground] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false); // Fix: Issue #12
  const hideTimer = useRef(null);
  const activeSectionRef = useRef('home');

  useEffect(() => {
    activeSectionRef.current = activeSection;
  }, [activeSection]);

  // Fix: F-8 — close the mobile popover when scrolling back to the hero
  useEffect(() => {
    if (activeSection === 'home') setMobileOpen(false);
  }, [activeSection]);

  const sections = [
    { id: 'home', label: 'home' },
    { id: 'about', label: 'about me' },
    { id: 'projects', label: 'projects' },
    { id: 'resume', label: 'resume overview' },
    { id: 'interests', label: 'interests' },
    { id: 'getInTouch', label: 'contact' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i].id);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i].id);
          break;
        }
      }
      const tocScrollPosition = window.scrollY + window.innerHeight / 3;
      const homeSection = document.getElementById('home');
      if (homeSection) {
        setIsDarkBackground(tocScrollPosition <= homeSection.offsetTop + homeSection.offsetHeight);
      }
    };

    const handleMouseMove = (e) => {
      if (activeSectionRef.current === 'home') return;
      const distFromRight = window.innerWidth - e.clientX;
      if (distFromRight < 80) {
        if (hideTimer.current) clearTimeout(hideTimer.current);
        setIsHovered(true);
      } else if (distFromRight > 200) {
        if (hideTimer.current) clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(() => setIsHovered(false), 50);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const scrollToSection = (sectionId) => {
    if (sectionId === 'projects') {
      // Scroll first with no concurrent state changes — firing the close signal
      // simultaneously would trigger dropdown exit animations whose scroll-
      // anchoring compensation cancels the smooth scroll. Instead, fire
      // onSectionNavigate (which closes dropdowns) only after the scroll ends.
      const element = document.getElementById(sectionId);
      if (element) {
        const y = element.getBoundingClientRect().top + window.pageYOffset + 30;
        window.scrollTo({ top: y, behavior: 'smooth' });
        let notified = false;
        const notify = () => {
          if (notified) return;
          notified = true;
          window.removeEventListener('scrollend', notify);
          onSectionNavigate?.('projects');
        };
        window.addEventListener('scrollend', notify, { once: true });
        setTimeout(notify, 500); // Fix: Issue #13 — shorter fallback for browsers without 'scrollend'
      }
      return;
    }
    onSectionNavigate?.(sectionId);
    // Defer scroll past two animation frames so React flushes the accordion
    // state change and the browser lays out before we measure + scroll. This
    // prevents the concurrent layout shift from cancelling the smooth scroll.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          const top = rect.top + window.pageYOffset;
          if (sectionId === 'getInTouch') {
            // Anchor so the whole contact widget is visible: center it when it
            // fits the viewport, otherwise top-align with a small gap.
            const vh = window.innerHeight;
            const y = rect.height <= vh ? top - (vh - rect.height) / 2 : top - 20;
            window.scrollTo({ top: Math.max(y, 0), behavior: 'smooth' });
          } else {
            const yOffset = (sectionId === 'about' || sectionId === 'interests' || sectionId === 'resume') ? -10 : -80;
            window.scrollTo({ top: top + yOffset, behavior: 'smooth' });
          }
        }
      })
    );
  };

  // Widget version
  if (isWidget) {
    return (
      <div className="relative bg-slate-900/50 backdrop-blur-md rounded-2xl p-3 shadow-2xl border border-white/20 hover:scale-105 transition-all h-full overflow-hidden">
        <div className="widget-gradient"></div>
        <div className="relative z-10 h-full flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
              <p className="text-white font-semibold text-xs uppercase tracking-wide">Navigation</p>
            </div>
          </div>
          <nav className="space-y-1.5 flex-1 flex flex-col justify-between">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`block w-full text-center flex-1 flex items-center justify-center px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeSection === section.id
                    ? 'bg-white/20 text-white font-semibold'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {section.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    );
  }

  // Fix: Issue #12 — mobile: compact floating button + section popover
  if (!isDesktop) {
    // Fix: F-8 — hidden on the hero, matching the desktop floating TOC
    if (activeSection === 'home') return null;
    return (
      <>
        {/* Fix: F-8 — transparent backdrop closes the popover on outside tap */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40" onClick={() => setMobileOpen(false)} />
        )}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 8 }}
              transition={{ duration: 0.15 }}
              className="fixed bottom-16 right-4 z-50 rounded-2xl bg-black/70 backdrop-blur-md border border-white/15 shadow-lg p-2"
            >
              <nav className="flex flex-col">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => { scrollToSection(section.id); setMobileOpen(false); }}
                    className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeSection === section.id
                        ? 'bg-white/20 text-white font-semibold'
                        : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    {section.label}
                  </button>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle section navigation"
          aria-expanded={mobileOpen}
          className="fixed bottom-4 right-4 z-50 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/15 shadow-lg flex items-center justify-center text-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </>
    );
  }

  const isOnHome = activeSection === 'home';

  return (
    <>
      {/* Arrow tab — persistent hint when not on home and panel is collapsed */}
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: !isOnHome && !isHovered ? 1 : 0, x: !isOnHome && !isHovered ? 0 : 16 }}
        transition={{ duration: 0.2 }}
        style={{ pointerEvents: !isOnHome && !isHovered ? 'auto' : 'none' }}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 cursor-pointer"
        onMouseEnter={() => {
          if (hideTimer.current) clearTimeout(hideTimer.current);
          setIsHovered(true);
        }}
      >
        <motion.div
          animate={{
            backgroundColor: isDarkBackground ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.75)',
            borderColor: isDarkBackground ? 'rgba(255,255,255,0.3)' : 'rgb(229,231,235)',
          }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-center pl-2 pr-1 py-4 rounded-l-xl shadow-lg border border-r-0 backdrop-blur-md"
        >
          <motion.svg
            animate={{ color: isDarkBackground ? '#ffffff' : '#475569' }}
            transition={{ duration: 0.3 }}
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </motion.svg>
        </motion.div>
      </motion.div>

      {/* Full TOC panel — slides in on hover, hidden on home */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: isHovered && !isOnHome ? 1 : 0, x: isHovered && !isOnHome ? 0 : 50 }}
        transition={{ duration: 0.12 }}
        style={{ pointerEvents: isHovered && !isOnHome ? 'auto' : 'none' }}
        className="fixed right-8 top-1/3 transform -translate-y-1/3 z-40"
        onMouseEnter={() => { if (hideTimer.current) clearTimeout(hideTimer.current); }}
        onMouseLeave={() => { hideTimer.current = setTimeout(() => setIsHovered(false), 50); }}
      >
        <motion.div
          animate={{
            backgroundColor: isDarkBackground ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.7)',
            borderColor: isDarkBackground ? 'rgba(255, 255, 255, 0.3)' : 'rgb(243, 244, 246)'
          }}
          transition={{ duration: 0.3 }}
          className="backdrop-blur-md rounded-2xl p-4 shadow-lg border"
        >
          <nav className="space-y-2">
            {sections.map((section) => (
              <motion.button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                animate={{
                  backgroundColor: activeSection === section.id
                    ? (isDarkBackground ? 'rgba(255, 255, 255, 0.25)' : 'rgba(51, 65, 85, 0.15)')
                    : 'rgba(0, 0, 0, 0)',
                  color: isDarkBackground ? '#ffffff' : '#334155'
                }}
                whileHover={{
                  backgroundColor: isDarkBackground ? 'rgba(255, 255, 255, 0.15)' : 'rgba(51, 65, 85, 0.1)'
                }}
                transition={{ duration: 0.2 }}
                className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                  activeSection === section.id ? 'font-semibold' : ''
                }`}
              >
                {section.label}
              </motion.button>
            ))}
          </nav>
        </motion.div>
      </motion.div>
    </>
  );
};

export default TableOfContents;
