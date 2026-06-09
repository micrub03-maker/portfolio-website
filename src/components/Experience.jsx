import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const mainEntries = [
  {
    key: 'luci',
    logoLabel: 'MPC logo',
    role: 'Mechanical / Controls Engineer – Project LUCI (UC Berkeley MPC Lab) · May 2025 – Present',
    bullets: [
      'Developing an all-terrain autonomous surveillance rover in collaboration with NIWC Pacific',
      'Redesigning 3D-printed chassis for improved structural integrity, manufacturability, and field usability',
      'Building and executing validation tests for control architecture; integrating NTRIP GPS and vSLAM navigation',
    ],
  },
  {
    key: 'calsol',
    logoLabel: 'calsol logo',
    role: 'Chassis Engineer – Driver Safety Lead (CALSOL Solar Vehicle Team) · Sept 2025 – Present',
    bullets: [
      'Led seatbelt system design to meet ASC and World Solar Challenge safety regulations',
      'Reduced belt-mount weight by 15% while validating crash-load performance (FOS 1.6)',
      'Simplified shoulder anchor design for efficient in-house manufacturing',
    ],
  },
  {
    key: 'acurity',
    logoLabel: 'Acurity logo',
    role: 'AutoCAD Drawing Engineer (KBC Acurity) · Oct 2022 – June 2025',
    bullets: [
      'Produced 300+ technical drawings supporting nationwide security camera installations',
    ],
  },
  {
    key: 'ski',
    logoLabel: null,
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
    role: 'CERN Science Gateway Summer Program (CERN IdeaSquare) · May 2024 – Aug 2024',
    bullets: [
      'Visiting student at CERN Ideasquare; Explored innovation and design methods to turn Big Science technologies into real-world applications',
      'Part of the Honours program at TU Delft',
    ],
  },
  {
    key: 'lde',
    logoLabel: 'LDE logo',
    role: 'LDE Sustainability Program (TU Delft / Leiden / Erasmus) · Sept 2022 – June 2023',
    bullets: [
      'Applied systems thinking and sustainability principles to Dutch government research on biofuels and heavy-duty vehicle electrification',
      'Part of the Honours program at TU Delft; weekly lectures combined with research project',
    ],
  },
  {
    key: 'ta',
    logoLabel: 'TU Delft logo',
    role: 'Teaching Assistant – Statics & Mechanics of Materials (TU Delft) · Sept 2022 – Jan 2023',
    bullets: [
      'Taught two sections of 35 students each, totaling 4 weekly sessions',
      'Led discussions/labs with 30% higher attendance/engagement vs prior years',
    ],
  },
  {
    key: 'drop',
    logoLabel: 'DROP Delft logo',
    role: 'External Relations Manager – Skate Committee (DROP Delft) · Sept 2021 – June 2022',
    bullets: [
      'Built partnerships with local shops and brands while organizing weekly training sessions and events',
    ],
  },
  {
    key: 'hospitality',
    logoLabel: 'restaurants logo',
    role: 'Hospitality & Events (Antwerp, Belgium) · July 2019 – July 2025',
    bullets: [
      'Worked part-time in restaurants and events, handling floor operations, bar service, and customer-facing responsibilities',
    ],
  },
  {
    key: 'filigranes',
    logoLabel: 'Filigranes',
    role: 'Sales Assistant (Filigranes Bookshop, Antwerp) · July 2020 – Aug 2022',
    bullets: [
      'Part time work during holidays. Supported front-of-house sales, inventory, and customer service in a high-traffic retail environment',
      'Books, books, books !! Best first job one could wish for',
    ],
  },
];

function ExperienceCard({ entry, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="flex flex-col sm:flex-row gap-4 rounded-2xl bg-white/70 backdrop-blur-md border border-gray-100 shadow-lg p-4 md:p-6 hover:shadow-xl transition-shadow"
    >
      {/* Logo */}
      <div className="flex-shrink-0 flex items-start justify-center sm:justify-start pt-0.5">
        {entry.logoLabel ? (
          <div className="w-16 h-16 rounded-xl bg-white/60 border border-gray-200 flex items-center justify-center text-gray-400 text-[10px] font-mono text-center leading-tight p-2">
            TEMP: {entry.logoLabel}
          </div>
        ) : (
          <div className="w-16 h-16 rounded-xl bg-white/30 border border-gray-100 flex items-center justify-center text-gray-300 text-[10px] font-mono text-center leading-tight p-2">
            no logo
          </div>
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-800 text-sm md:text-base leading-snug mb-2">
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

export default function Experience() {
  const [showMore, setShowMore] = useState(false);

  return (
    <div>
      <h3 className="text-center mb-4 text-lg font-semibold text-gray-400 uppercase tracking-wide">Experience</h3>

      <div className="flex flex-col gap-4">
        {mainEntries.map((entry, i) => (
          <ExperienceCard key={entry.key} entry={entry} index={i} />
        ))}

        {/* More Experience toggle */}
        <button
          onClick={() => setShowMore((v) => !v)}
          aria-expanded={showMore}
          aria-controls="more-experience"
          className="flex items-center justify-between w-full rounded-2xl bg-white/50 backdrop-blur-md border border-gray-100 shadow-sm px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-white/70 hover:shadow-md transition-all"
        >
          <span>{showMore ? 'Less Experience' : 'More Experience'}</span>
          <motion.span
            animate={{ rotate: showMore ? 180 : 0 }}
            transition={{ duration: 0.25 }}
            className="text-gray-400 text-lg leading-none"
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
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-4"
            >
              {moreEntries.map((entry, i) => (
                <ExperienceCard key={entry.key} entry={entry} index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
