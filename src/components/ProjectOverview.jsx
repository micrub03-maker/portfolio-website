import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MediaSlot } from "./MediaSlot";

const slides = [
  {
    title: " Mechanical/Control Engineer @ MPC Lab",
    description:
      "Contracted with UC Berkeley's MPC Lab to develop an all-terrain autonomous surveillance rover for NIWC Pacific",
    src: "/images/ONR-LUCI.mp4",
    projectKey: "luci",
    link: "https://sites.google.com/berkeley.edu/mpc-lab/home",
    cta: "Visit Lab Website",
  },
  {
    title: "Driver Safety Lead @ CALSOL",
    description:
      "Designing, manufacturing and testing chassis parts for our gen XI solar car competing in the American Solar Challenge race this summer",
    src: "/images/calsolcar.png",
    projectKey: "calsol",
    link: "https://calsol.berkeley.edu/",
    cta: "Visit Team Site",
  },
  {
    title: "Optics lead @ Axiris",
    description:
      "Enabling accessible vision screening through low-cost handheld autorefraction for resource-constrained settings",
    src: "/images/Axiris-logo.png",
    projectKey: "axiris",
  },
];

export default function ProjectOverview({ onProjectClick, onNavigate }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef(null);

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isHovered]);

  const goTo = (idx) => setActiveIndex(idx);
  const handleNext = () => goTo((activeIndex + 1) % slides.length);
  const handlePrev = () => goTo((activeIndex - 1 + slides.length) % slides.length);

  const handleTouchStart = (e) => { touchStartX.current = e.targetTouches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? handleNext() : handlePrev();
    touchStartX.current = null;
  };

  const active = slides[activeIndex];

  return (
    <div
      className="relative bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 hover:scale-105 transition-all w-full h-full overflow-hidden flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="widget-gradient" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-3 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24">
              <path
                d="M4 5h16M4 12h10M4 19h7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h3 className="text-white font-semibold text-xs uppercase tracking-wide">
            Project Spotlight
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Dot indicators */}
          <div className="flex gap-1.5 items-center">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === activeIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/30'
                }`}
              />
            ))}
          </div>
          {onNavigate && (
            <button
              onClick={() => onNavigate(active.projectKey)}
              className="flex items-center gap-1 text-[10px] text-white/60 hover:text-white/90 transition-colors bg-white/10 hover:bg-white/20 rounded-full px-2 py-0.5"
              aria-label="View in Projects section"
            >
              dive in ↓
            </button>
          )}
        </div>
      </div>

      {/* Media block */}
      <div
        className="relative z-10 mx-3 rounded-xl overflow-hidden flex-1 min-h-0 select-none bg-white/5 border border-white/10"
        onClick={() => onProjectClick?.(active.projectKey)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={active.projectKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <MediaSlot label={active.title} src={active.src} />
          </motion.div>
        </AnimatePresence>

        {/* Left click zone */}
        <button
          className="absolute left-0 top-0 bottom-0 w-1/4 group z-20"
          onClick={(e) => { e.stopPropagation(); handlePrev(); }}
          aria-label="Previous project"
        >
          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm">
            ‹
          </div>
        </button>

        {/* Right click zone */}
        <button
          className="absolute right-0 top-0 bottom-0 w-1/4 group z-20"
          onClick={(e) => { e.stopPropagation(); handleNext(); }}
          aria-label="Next project"
        >
          <div className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm">
            ›
          </div>
        </button>

        {/* Title overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 z-10">
          <p className="text-white text-sm font-bold leading-tight">{active.title}</p>
        </div>
      </div>

      {/* Description */}
      <div className="relative z-10 px-3 pt-2 pb-3 min-h-[3.5rem]">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.projectKey + '-desc'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-white/80 text-xs leading-relaxed">{active.description}</p>
            {active.link && (
              <div className="flex justify-end mt-1.5">
                <a
                  href={active.link}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-[11px] text-black bg-white/90 hover:bg-white font-medium px-3 py-0.5 rounded-full transition-colors"
                >
                  {active.cta}
                </a>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
