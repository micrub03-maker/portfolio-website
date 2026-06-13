import React from 'react';
import { motion } from 'framer-motion';

const entries = [
  {
    key: 'berkeley',
    logoLabel: 'logo UC Berkeley',
    logoSrc: '/images/berkeley.png',
    title: 'MEng mechanical engineer: biomechanics & control',
    period: 'Class of 2026',
    bullets: [
      'Awarded scholarship covering full tuition + stipend by the Belgian American Education Foundation',
      'UC Berkeley Solar Vehicle Team',
      'Balanced leadership and entrepreneurship courses with advanced technical electives, expertise that was directly applied in a year-long Capstone project',
    ],
  },
  {
    key: 'tudelft',
    logoLabel: 'Logo TU Delft',
    logoSrc: '/images/TU-Delft-emblem.png',
    logoPad: 'p-0',
    title: 'BSc Mechanical Engineer',
    period: 'Class of 2024',
    bullets: [
      'Selected for Honours Program; completed 20 additional credits in nominal graduation time',
      'Drop Delft Boardsports Association',
      'Gained a strong design background, through several hands on projects and a broad technical program',
    ],
  },
  {
    key: 'kla',
    logoLabel: 'Logo KLA',
    logoSrc: '/images/KLA-logo.jpg',
    logoPad: 'p-0',
    logoFit: 'object-contain',
    title: 'Koninklijk Lyceum Antwerpen',
    period: 'Class of 2021',
    bullets: [
      'Major in Latin and Mathematics',
      'Basketball @Mercurius BB, Jiu Jitsu @ Ikiji Ryu Dojo',
      'Delegated class clown'
    ],
  },
  {
    key: 'academie',
    logoLabel: 'Logo Academie Berchem',
    logoSrc: '/images/academie-berchem-logo.jpg',
    logoPad: 'p-0',
    logoFit: 'object-cover',
    logoScale: 'scale-[1.03]',
    noWidget: true,
    title: 'Academie Berchem',
    period: '2008-2021',
    bullets: [
    'Part time graphic arts program graduate',
    'Hands down my most valuable hobby growing up!',
    'Broadened my perspective and developed my creativity'
  ],
  },
];

export default function Education() {
  return (
    <div>
      <h3 className="text-center mb-4 text-lg font-semibold text-gray-400 uppercase tracking-wide">Education</h3>
      <div className="flex flex-col gap-4">
        {entries.map((entry, i) => (
          <motion.div
            key={entry.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="flex flex-col sm:flex-row gap-4 rounded-2xl bg-white/70 backdrop-blur-md ring-1 ring-black/5 shadow-xl p-4 md:p-6 hover:shadow-2xl transition-shadow"
          >
            {/* Logo */}
            <div className="flex-shrink-0 flex items-start justify-center sm:justify-start">
              <div className={`w-40 h-40 rounded-xl overflow-hidden flex items-center justify-center ${entry.logoPad ?? 'p-2'} ${entry.noWidget ? '' : 'bg-white border border-gray-100 shadow-sm'}`}>
                {entry.logoSrc
                  ? <img src={entry.logoSrc} alt={entry.logoLabel} className={`w-full h-full ${entry.logoFit ?? 'object-contain'} ${entry.logoScale ?? ''}`} />
                  : <span className="text-gray-300 text-xs font-mono text-center leading-tight">{entry.logoLabel}</span>
                }
              </div>
            </div>

            {/* Text content */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 text-sm md:text-base leading-snug text-center sm:text-left">
                {entry.title}
              </p>
              <p className="text-gray-500 text-xs md:text-sm mt-0.5 mb-2 text-center sm:text-left">
                {entry.period}
              </p>

              {entry.bullets && (
                <ul className="space-y-1">
                  {entry.bullets.map((b, j) => (
                    <li key={j} className="flex gap-2 text-sm text-gray-800">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}

              {entry.body && (
                <ul className="space-y-1">
                  <li className="flex gap-2 text-sm text-gray-800">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                    <span>{entry.body}</span>
                  </li>
                </ul>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
