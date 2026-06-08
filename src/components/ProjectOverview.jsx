import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const slides = [
  {
    title: "Mechanical/Controls Engineer @ MPC Lab",
    description:
      "Contracted with UC Berkeley's MPC Lab as a mechanical/control intern to support on the development of an all-terrain autonomous surveillance rover for NIWC Pacific.",
    mediaType: "video",
    mediaLabel: "ONR Luci intro",
    projectKey: "luci",
    link: "https://sites.google.com/berkeley.edu/mpc-lab/home",
    cta: "Visit Lab Website",
  },
  {
    title: "Driver Safety Lead @ CALSOL",
    description:
      "Designing, manufacturing and testing chassis parts for our gen XI solar car competing in the American Solar Challenge race this summer",
    mediaType: "image",
    mediaLabel: "CALSOL car",
    projectKey: "calsol",
    link: "https://calsol.berkeley.edu/",
    cta: "Visit Team Site",
  },
  {
    title: "Optics lead @ Axiris autorefractor project",
    description:
      "Enabling Accessible Vision Screening Through Low-Cost Handheld Autorefraction for Resource-Constrained Settings",
    mediaType: "image",
    mediaLabel: "Axiris logo",
    projectKey: "axiris",
  },
];

export default function ProjectOverview({ onProjectClick }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isHovered]);

  const goTo = (idx) => setActiveIndex(idx);
  const active = slides[activeIndex];

  return (
    <div
      className="relative bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 hover:scale-105 transition-all w-full h-full overflow-hidden flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
            Project overview
          </h3>
        </div>

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
      </div>

      {/* Media block */}
      <div
        className="relative z-10 mx-3 rounded-xl overflow-hidden flex-1 min-h-0 cursor-pointer select-none bg-white/5 border border-white/10"
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
            {/* TODO: replace with real media once assets are provided */}
            <span className="text-white/30 text-xs font-mono text-center px-4">
              TEMP: {active.mediaLabel}
            </span>
          </motion.div>
        </AnimatePresence>

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
