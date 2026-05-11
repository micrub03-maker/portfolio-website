import React, { useState, useRef } from "react";

const projects = [
  {
    id: "roar",
    title: "AI Racing Tech – Localization",
    tech: ["C++", "Python", "ROS 2"],
    description:
      "Capstone work on Berkeley's ROAR platform focusing on LiDAR-driven localization, ROS 2 perception stacks, and SLAM tooling to keep autonomous race vehicles locked onto their pose at speed.",
    image: "/images/roarcar.png",
    href: "https://roar.berkeley.edu/",
    cta: "View ROAR Website",
  },
  {
    id: "calsol",
    title: "CalSol Gen XI Solar Vehicle",
    tech: ["KiCad", "C++"],
    description:
      "Designing, manufacturing, and testing electrical components and firmware for the Gen XI solar car competing in the 2026 American Solar Challenge.",
    image: "/images/calsolcar.png",
    href: "https://calsol.berkeley.edu/",
    cta: "Visit Team Site",
  },
  {
    id: "kite",
    title: "Kite – AI Email Assistant",
    tech: ["Python", "JavaScript", "Firebase"],
    description:
      "AI-powered Gmail assistant that turns your inbox into a queryable database. Features natural language search, thread summarization, context-aware reply generation, and automated calendar management.",
    image: "/images/askkite.png",
    href: "https://usekite.app",
    cta: "View Website",
  },
  {
    id: "tuinet",
    title: "Project TūīNet",
    tech: ["C++", "Python", "Raspberry Pi"],
    description:
      "IoT device for detecting and identifying New Zealand native bird species using AI-powered audio recognition. Built with Raspberry Pi and OWL's ClusterDuck Protocol to monitor bird populations in remote areas.",
    image: "/images/tuinet.jpg",
    href: "https://medium.com/project-owl/project-t%C5%AB%C4%ABnet-tools-for-native-wildlife-conservation-5551211158fe",
    cta: "View Project",
  },
  {
    id: "scrabble",
    title: "AI Scrabble Bot",
    tech: ["HTML", "CSS", "JavaScript", "Python"],
    description:
      "A web-based Scrabble game with an AI opponent that computes optimal moves using a DAWG dictionary and board evaluation heuristics.",
    image: "/images/scrabbless.png",
    href: "https://logankm02.github.io/scrabble-bot/",
    cta: "View Website",
  },
  // {
  //   id: "findurparty",
  //   title: "findUrParty iOS App",
  //   tech: ["Swift"],
  //   description:
  //     "Native iOS app for discovering and sharing social events, published on the App Store with real-time location features.",
  //   image: "/images/findurpartyss.jpg",
  //   href: "https://apps.apple.com/app/id6465749219",
  //   cta: "View on App Store",
  // },
  // {
  //   id: "website",
  //   title: "Personal Website",
  //   tech: ["React", "Three.js", "Tailwind"],
  //   description:
  //     "This website — built with React, Three.js for the 3D opening animation, and Tailwind CSS for styling.",
  //   image: "/images/webss.png",
  //   href: "https://logankm02.github.io/website2.0/",
  //   cta: "View Website",
  // },
  // {
  //   id: "blackjack",
  //   title: "Blackjack Game",
  //   tech: ["HTML", "CSS", "JavaScript", "Python"],
  //   description:
  //     "Browser-based Blackjack with a Python backend handling game logic, card counting hints, and session management.",
  //   image: "/images/blackjackss.png",
  //   href: "https://logankm02.github.io/blackjack/",
  //   cta: "View Website",
  // },
  // {
  //   id: "travel",
  //   title: "Travel & Remote Work Helper",
  //   tech: ["HTML", "CSS", "JavaScript"],
  //   description:
  //     "A lightweight tool for remote workers that surfaces timezone overlaps, visa requirements, and coworking spots for any destination.",
  //   image: "/images/weatherss.png",
  //   href: "https://logankm02.github.io/travel-helper/",
  //   cta: "View Website",
  // },
  // {
  //   id: "messaging",
  //   title: "Personal Messaging Site",
  //   tech: ["React", "Firebase"],
  //   description:
  //     "Real-time messaging web app with Firebase authentication and Firestore-backed message sync.",
  //   image: "/images/messagess.png",
  //   href: "https://logankm02.github.io/Message-App/",
  //   cta: "View Website",
  // },
];

export default function ProjectSpotlight() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const touchStartX = useRef(null);

  const goTo = (idx) => {
    setVisible(false);
    setTimeout(() => {
      setActiveIndex(idx);
      setVisible(true);
    }, 180);
  };

  const handleNext = () => goTo((activeIndex + 1) % projects.length);
  const handlePrev = () => goTo((activeIndex - 1 + projects.length) % projects.length);

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? handleNext() : handlePrev();
    touchStartX.current = null;
  };

  const active = projects[activeIndex];

  return (
    <div
      className="rounded-2xl bg-white/70 backdrop-blur-md border border-gray-100 shadow-lg overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Main content — fixed height so image never dictates the card size */}
      <div className="flex flex-col md:flex-row h-[420px] md:h-[380px]">
        {/* Info panel */}
        <div
          className={`md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto transition-opacity duration-180 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">
              {activeIndex + 1} / {projects.length}
            </p>
            <h2 className="text-xl font-bold text-gray-900 mb-3">{active.title}</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {active.tech.map((t) => (
                <span
                  key={t}
                  className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 font-medium"
                >
                  {t}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{active.description}</p>
          </div>

          <div className="flex items-center justify-between mt-6">
            <a
              href={active.href}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 px-5 py-2 rounded-full shadow-sm transition-all hover:shadow-md"
            >
              {active.cta}
            </a>

            {/* Arrow nav */}
            <div className="flex gap-2">
              <button
                onClick={handlePrev}
                className="w-9 h-9 rounded-full border border-gray-200 bg-white hover:bg-gray-50 shadow-sm flex items-center justify-center text-gray-600 transition-all hover:shadow-md"
                aria-label="Previous project"
              >
                ‹
              </button>
              <button
                onClick={handleNext}
                className="w-9 h-9 rounded-full border border-gray-200 bg-white hover:bg-gray-50 shadow-sm flex items-center justify-center text-gray-600 transition-all hover:shadow-md"
                aria-label="Next project"
              >
                ›
              </button>
            </div>
          </div>
        </div>

        {/* Image panel */}
        <div className="md:w-1/2 relative overflow-hidden select-none cursor-pointer">
          <img
            src={active.image}
            alt={active.title}
            className={`w-full h-full object-cover transition-opacity duration-180 ${
              visible ? "opacity-100" : "opacity-0"
            }`}
          />
          {/* Left click zone */}
          <button
            className="absolute left-0 top-0 bottom-0 w-1/3 group"
            onClick={handlePrev}
            aria-label="Previous project"
          >
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-lg leading-none">‹</span>
            </div>
          </button>
          {/* Right click zone */}
          <button
            className="absolute right-0 top-0 bottom-0 w-1/3 group"
            onClick={handleNext}
            aria-label="Next project"
          >
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-lg leading-none">›</span>
            </div>
          </button>
        </div>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-1.5 py-3 border-t border-gray-100">
        {projects.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === activeIndex ? "w-6 bg-gray-700" : "w-1.5 bg-gray-300"
            }`}
            aria-label={`Go to project ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
