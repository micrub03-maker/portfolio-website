import React, { useEffect, useState, useRef } from "react";

const projectData = [
  {
    id: "roar",
    title: "AI Racing Tech Capstone",
    role: "Software Engineer, Localization",
    blurb:
      "Building LiDAR-driven localization, SLAM tooling, and ROS 2 perception stacks for Berkeley's ROAR autonomous racing platform.",
    tech: ["C++", "Python", "ROS 2"],
    image: "/images/roarcar.png",
    link: "https://roar.berkeley.edu/",
    cta: "View ROAR Website",
  },
  {
    id: "calsol",
    title: "CalSol Gen XI Solar Vehicle",
    role: "Electrical Engineer",
    blurb:
      "Designing, manufacturing, and testing electrical components plus firmware for the Gen XI solar car racing in the 2026 American Solar Challenge.",
    tech: ["KiCad", "C++"],
    image: "/images/calsolcar.png",
    link: "https://calsol.berkeley.edu/",
    cta: "Visit Team Site",
  },
  {
    id: "kite",
    title: "Kite – AI Email Assistant",
    role: "Founding Engineer",
    blurb:
      "Shipping an AI-powered Gmail companion with semantic search, thread summarization, and automated workflows used by paying customers.",
    tech: ["JavaScript", "Flask", "Firebase"],
    image: "/images/askkite.png",
    link: "https://usekite.app",
    cta: "Explore Kite",
  },
];

export default function CurrentProjects() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const touchStartX = useRef(null);

  const goTo = (idx) => {
    setVisible(false);
    setTimeout(() => {
      setActiveIndex(idx);
      setVisible(true);
    }, 200);
  };

  const handleNext = () => goTo((activeIndex + 1) % projectData.length);
  const handlePrev = () => goTo((activeIndex - 1 + projectData.length) % projectData.length);

  useEffect(() => {
    const timer = setInterval(handleNext, 6000);
    return () => clearInterval(timer);
  }, [activeIndex]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? handleNext() : handlePrev();
    touchStartX.current = null;
  };

  const active = projectData[activeIndex];

  return (
    <div
      className="relative bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 hover:scale-105 transition-all w-full h-full overflow-hidden flex flex-col"
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
            Project Overview
          </h3>
        </div>
        <div className="flex gap-1">
          {projectData.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === activeIndex ? "w-5 bg-white" : "w-2 bg-white/30"
              }`}
              aria-label={`Go to project ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Focused image — click left/right halves to navigate */}
      <div className="relative z-10 mx-3 rounded-xl overflow-hidden flex-1 min-h-0 cursor-pointer select-none">
        <img
          src={active.image}
          alt={active.title}
          className={`w-full h-full object-cover transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`}
        />
        {/* Left click zone */}
        <button
          className="absolute left-0 top-0 bottom-0 w-1/3 group"
          onClick={handlePrev}
          aria-label="Previous project"
        >
          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-white text-sm leading-none">‹</span>
          </div>
        </button>
        {/* Right click zone */}
        <button
          className="absolute right-0 top-0 bottom-0 w-1/3 group"
          onClick={handleNext}
          aria-label="Next project"
        >
          <div className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-white text-sm leading-none">›</span>
          </div>
        </button>
        {/* Title overlay */}
        <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-3 py-3 transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`}>
          <p className="text-white text-sm font-bold leading-tight">{active.title}</p>
          <p className="text-white/70 text-xs">{active.role}</p>
        </div>
      </div>

      {/* Bottom info */}
      <div className={`relative z-10 px-3 pt-2 pb-3 transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`}>
        <p className="text-white/80 text-xs leading-relaxed mb-2">{active.blurb}</p>
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            {active.tech.map((t) => (
              <span
                key={t}
                className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-white/90 border border-white/10"
              >
                {t}
              </span>
            ))}
          </div>
          <a
            href={active.link}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-black bg-white/90 hover:bg-white font-medium px-3 py-1 rounded-full transition-colors whitespace-nowrap"
          >
            {active.cta}
          </a>
        </div>
      </div>
    </div>
  );
}
