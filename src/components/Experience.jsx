import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MediaSlot } from "./MediaSlot";

const mainEntries = [
  {
    key: 'luci',
    logoLabel: 'MPC logo',
    logoSrc: '/images/MPC-logo.png',
    logoHeight: 'h-[80px]',
    logoFit: 'object-contain',
    role: 'Mechanical / Controls Engineer – Project LUCI (UC Berkeley MPC Lab) · May 2026 – Present',
    bullets: [
      'Developing an all-terrain autonomous surveillance rover in collaboration with NIWC Pacific',
      'Redesigning 3D-printed chassis for improved structural integrity, manufacturability, and field usability',
      'Building and executing validation tests for control architecture; integrating NTRIP GPS and vSLAM navigation',
    ],
  },
  {
    key: 'calsol',
    logoLabel: 'calsol logo',
    logoSrc: '/images/calsol.png',
    logoFit: 'object-contain',
    role: 'Chassis Engineer – Driver Safety Lead (CALSOL Solar Vehicle Team) · Sept 2025 – Present',
    bullets: [
      'Led seatbelt system design to meet ASC and World Solar Challenge safety regulations',
      'Reduced lap belt-mount weight by 15% while validating crash-load performance (FOS 1.6)',
      'Topology optimized shoulder anchor designed for efficient in-house manufacturing',
    ],
  },
  {
    key: 'acurity',
    logoLabel: 'Acurity logo',
    logoSrc: '/images/Acurity-logo.png',
    logoHeight: 'h-20',
    logoFit: 'object-contain',
    logoScale: 'scale-[2.3] translate-x-[5%] translate-y-[5%]',
    role: 'AutoCAD Drawing Engineer (KBC Acurity) · Oct 2022 – June 2025',
    bullets: [
      'Produced 300+ technical drawings supporting nationwide security camera installations',
    ],
  },
  {
    key: 'ski',
    logoLabel: 'Big White Ski Resort Logo',
    logoSrc:'/images/Big-White-logo.jpg',
    role: 'Ski Instructor (Big White Ski Resort, Canada) · Nov 2024 – Apr 2025',
    bullets: [
      'Taught and supervised lessons for children ages 3–12 while training for and achieving CSIA Level 2 certification',
    ],
  },
];

const moreEntries = [
    {
    key: 'cern',
    logoLabel: 'CERN logo',
    logoSrc: '/images/CERN_logo.png',
    logoPlain: true,
    role: 'CERN Science Gateway Summer Program (CERN IdeaSquare) · May 2024 – Aug 2024',
    bullets: [
      'Visiting student at CERN Ideasquare',
      'Explored innovation and design methods to turn Big Science technologies into real-world applications',
      'Part of the Honours program at TU Delft',
    ],
  },
  {
    key: 'lde',
    logoLabel: 'LDE logo',
    logoSrc: '/images/LDE-logo.jpg',
    logoPlain: true,
    logoHeight: 'h-20',
    logoFit: 'object-cover',
    logoScale: 'scale-[1.1] -translate-x-[4%]',
    role: 'LDE Sustainability Program (TU Delft / Leiden / Erasmus) · Sept 2022 – June 2023',
    bullets: [
      'Applied systems thinking and sustainability principles to Dutch government research on biofuels and heavy-duty vehicle electrification',
      'Part of the Honours program at TU Delft; weekly lectures combined with research project',
    ],
  },
  {
    key: 'ta',
    logoLabel: 'TU Delft logo',
    logoSrc: '/images/tu-delft-logo.webp',
    compactCard: true,
    role: 'Teaching Assistant – Statics & Mechanics of Materials (TU Delft) · Sept 2022 – Jan 2023',
    bullets: [
      'Taught two sections of 35 students each, totaling 4 weekly sessions',
      'Led discussions/labs with 30% higher attendance/engagement vs prior years',
    ],
  },
  {
    key: 'drop',
    logoLabel: 'DROP Delft logo',
    logoSrc: '/images/DROP-logo-black.png',
    logoPlain: true,
    logoHeight: 'h-[95px]',
    logoFit: 'object-cover',
    logoPadding: 'py-[2.5px]',
    role: 'External Relations Manager – Skate Committee (DROP Delft) · Sept 2021 – June 2022',
    bullets: [
      'Built partnerships with local shops and brands while organizing weekly training sessions and events',
    ],
  },
  {
    key: 'hospitality',
    logoLabel: 'restaurants logo',
    logoSrcs: [
      { src: '/images/Agora-kaffee-logo.png', label: 'Agora Kaffee' },
      { src: '/images/MINT-logo.png', label: 'MINT' },
    ],
    logoSrcsHeight: 'h-[80px]',
    role: 'Hospitality & Events (Antwerp, Belgium) · July 2019 – July 2025',
    bullets: [
      'Worked part-time in restaurants and at events',
      'Handled floor operations, bar service, and customer-facing responsibilities',
    ],
  },
  {
    key: 'filigranes',
    logoLabel: 'Filigranes',
    logoSrc: '/images/Filigranes-logo.jpg',
    logoPlain: true,
    logoHeight: 'h-[95px]',
    logoFit: 'object-cover',
    logoPadding: 'py-[2.5px]',
    role: 'Sales Assistant (Filigranes Bookshop) · July 2020 – Aug 2022',
    bullets: [
      'Books, books, books !! The best first job one could wish for',
      'Supported front-of-house sales, inventory, and customer service in a high-traffic retail environment',
    ],
  },
];

function ExperienceCard({ entry, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className={`flex flex-col sm:flex-row gap-4 rounded-2xl bg-white/70 backdrop-blur-md ring-1 ring-black/5 shadow-xl hover:shadow-2xl transition-shadow ${entry.compactCard ? 'py-2 px-4 md:py-3 md:px-6' : 'p-4 md:p-6'}`}
    >
      {/* Logo */}
      <div className="w-44 flex-shrink-0 flex flex-row gap-1 mx-auto sm:mx-0">
        {entry.logoSrcs
          ? entry.logoSrcs.map((logo) => (
              <div key={logo.label} className={`flex-1 min-w-0 flex flex-col overflow-hidden ${entry.logoSrcsHeight ?? 'h-[100px]'}}`}>
                <MediaSlot label={logo.label} src={logo.src} fill />
              </div>
            ))
          : entry.logoHeight
            ? <div className={`${entry.logoWidth ?? 'w-44'} ${entry.logoHeight} flex-shrink-0 flex items-center justify-center rounded-xl overflow-hidden ${entry.logoPadding ?? (entry.logoFit === 'object-cover' ? '' : 'p-2')} ${entry.logoPlain ? '' : 'bg-white border border-gray-100 shadow-sm'}`}>
                <img src={entry.logoSrc} alt={entry.logoLabel} className={`${entry.logoFit === 'object-cover' ? 'w-full h-full' : 'max-w-full max-h-full'} ${entry.logoFit ?? 'object-contain'} rounded-xl ${entry.logoScale ?? ''}`} />
              </div>
            : <div className={`${entry.logoWidth ?? 'w-44'} flex-shrink-0 flex flex-col rounded-xl overflow-hidden ${entry.logoPlain ? '' : 'bg-white border border-gray-100 shadow-sm'}`}>
                <MediaSlot label={entry.logoLabel ?? 'no logo'} src={entry.logoSrc} fill fit={entry.logoFit ?? 'object-cover'} compact />
              </div>
        }
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-800 text-sm md:text-base leading-snug mb-2 text-center sm:text-left">
          {entry.role}
        </p>
        <ul className="space-y-1">
          {entry.bullets.map((b, j) => (
            <li key={j} className="flex gap-2 text-sm text-gray-800">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

export default function Experience({ onShowLessChipChange }) {
  const [showMore, setShowMore] = useState(false);
  const [toggleVisible, setToggleVisible] = useState(true);
  const toggleRef = useRef(null);

  // Report when our sticky "show less" chip is actually on screen (dropdown open
  // AND the toggle bar scrolled out of frame) so the resume "close" chip can
  // defer to it — they hand off only at the moment one replaces the other.
  React.useEffect(() => {
    onShowLessChipChange?.(showMore && !toggleVisible);
  }, [showMore, toggleVisible, onShowLessChipChange]);

  // Track whether the top toggle bar is in the viewport — the sticky chip is
  // redundant while the bar (which also says "show less") is on screen.
  React.useEffect(() => {
    if (!showMore) {
      setToggleVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      // Only hide the chip's prerequisite when the bar is scrolled ABOVE the
      // viewport — scrolling up past it (bar below) shouldn't surface the chip.
      ([entry]) => setToggleVisible(entry.isIntersecting || entry.boundingClientRect.bottom > 0),
      { threshold: 0 }
    );
    if (toggleRef.current) observer.observe(toggleRef.current);
    return () => observer.disconnect();
  }, [showMore]);

  return (
    /* Fix: Issue #17 — collapsing happens only via the toggle button and sticky chip */
    <div>
      <h3 className="text-center mb-4 text-lg font-semibold text-gray-400 uppercase tracking-wide">Experience</h3>

      <div className="flex flex-col gap-4">
        {mainEntries.map((entry, i) => (
          <ExperienceCard key={entry.key} entry={entry} index={i} />
        ))}

        {/* More Experience toggle */}
        <button
          ref={toggleRef}
          onClick={(e) => { e.stopPropagation(); if (showMore) { setShowMore(false); setTimeout(() => { const y = toggleRef.current?.getBoundingClientRect().top + window.scrollY - 170; window.scrollTo({ top: y, behavior: 'smooth' }); }, 370); } else { setShowMore(true); } }}
          aria-expanded={showMore}
          aria-controls="more-experience"
          className="flex items-center justify-between w-full rounded-2xl bg-white/70 backdrop-blur-md ring-1 ring-black/5 shadow-xl px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-white/80 hover:shadow-2xl transition-all"
        >
          <span>{showMore ? 'Okay, that\'s everything — show less' : 'More experience — the full picture'}</span>
          <motion.span
            animate={{ rotate: showMore ? 180 : 0 }}
            transition={{ duration: 0.25 }}
            className="text-gray-600 text-lg leading-none"
          >
            ▾
          </motion.span>
        </button>

        {/* Dropdown */}
        <AnimatePresence>
          {showMore && (
            <motion.div
              id="more-experience"
              key="more"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
            >
              <div className="flex flex-col gap-4">
                {moreEntries.map((entry, i) => (
                  <ExperienceCard key={entry.key} entry={entry} index={i} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sticky collapse chip */}
      <AnimatePresence>
        {showMore && !toggleVisible && (
          <motion.button
            key="sticky-collapse"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => { e.stopPropagation(); setShowMore(false); setTimeout(() => { const y = toggleRef.current?.getBoundingClientRect().top + window.scrollY - 170; window.scrollTo({ top: y, behavior: 'smooth' }); }, 370); }}
            /* Progressive single chip (Option 2): shares the bottom-4 slot with the
               resume close chip — they're now mutually exclusive, so the label
               morphs in place from "show less" to "close" rather than stacking. */
            className="fixed bottom-4 left-4 z-50 flex items-center gap-1.5 rounded-full bg-slate-900/50 backdrop-blur-md border border-white/20 shadow-2xl px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-white/80 hover:text-white transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            show less
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
