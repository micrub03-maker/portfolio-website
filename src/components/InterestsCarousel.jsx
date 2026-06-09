import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TravelMap from './TravelMap';

const slides = [
  {
    id: 'photography',
    title: 'Photography',
    mediaLabel: 'TEMP: photography',
    description:
      '- Attention to detail, different perspectives, patience.\nIn and out of this but I usually shoot on my old Pentax K-50, very fun!',
  },
  {
    id: 'skateboarding',
    title: 'Skateboarding',
    mediaLabel: 'TEMP: skateboarding',
    description:
      'Creativity, community, challenging myself and overcoming fear and perseverance.',
  },
  {
    id: 'traveling',
    title: 'Traveling',
    mediaLabel: 'TEMP: traveling',
    description:
      '- Exploring other cultures, learning from other people, meeting new people.\nCheck out the map of the world I have already seen: 32 countries! Check them out.',
  },
  {
    id: 'music',
    title: 'Music',
    mediaLabel: 'TEMP: music',
    description:
      '- Trying to learn guitar, will boogie to nearly any sound and understand why music is so awesome!\nCheck out my top artists --> Spotify API.',
  },
  {
    id: 'winter-sports',
    title: 'Winter sports',
    mediaLabel: 'TEMP: winter sports',
    description:
      '- Snowboarding and skiing, spent a whole season teaching on snow.\nAlso overcoming fear and perseverance.',
  },
  {
    id: 'random-skills',
    title: 'Picking up random new skills',
    mediaLabel: 'TEMP: random skills',
    description:
      '- From practicing handstand, to learning how to juggle, I love setting small goals and challenges to overcome for myself and hyperfocusing on them for a little bit haha.',
  },
];

export default function InterestsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const t = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(t);
  }, [isHovered, currentIndex]);

  const touchStartX = useRef(null);

  const goTo = (i) => setCurrentIndex(i);
  const goNext = () => goTo((currentIndex + 1) % slides.length);
  const goPrev = () => goTo((currentIndex - 1 + slides.length) % slides.length);

  const handleTouchStart = (e) => { touchStartX.current = e.targetTouches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? goNext() : goPrev();
    touchStartX.current = null;
  };

  const active = slides[currentIndex];

  return (
    <section>
      <h2 className="text-center mb-6 text-2xl md:text-3xl font-bold text-gray-400">Interests</h2>

      <div
        className="max-w-3xl mx-auto rounded-2xl bg-white/70 backdrop-blur-md border border-gray-100 shadow-lg overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Nav bar — arrows + dots */}
        <div className="flex items-center justify-between px-4 py-2">
          <button
            onClick={goPrev}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition text-base leading-none"
            aria-label="Previous interest"
          >
            ‹
          </button>

          <div className="flex gap-2 items-center">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => goTo(i)}
                aria-label={`Go to ${s.title}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentIndex ? 'w-6 bg-gray-600' : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

          <button
            onClick={goNext}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition text-base leading-none"
            aria-label="Next interest"
          >
            ›
          </button>
        </div>

        {/* Label */}
        <p className="text-center text-xs text-gray-400 uppercase tracking-wide pt-2 px-4">
          What I'm into outside the lab
        </p>

        {/* Slide content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="px-6 pb-5 pt-3 md:px-8 md:pb-6 md:pt-4"
          >
            <h3 className="text-xl md:text-2xl font-bold text-gray-900">{active.title}</h3>

            {active.id === 'traveling' ? (
              <div className="mt-4 mb-4 h-72 w-full rounded-2xl overflow-hidden">
                <TravelMap />
              </div>
            ) : (
              <div className="mt-4 mb-4 h-40 w-full rounded-lg border border-dashed border-slate-300 bg-white/40 flex items-center justify-center text-xs uppercase tracking-wide text-gray-400">
                {active.mediaLabel}
              </div>
            )}

            <p className="text-sm md:text-base text-gray-700 leading-relaxed whitespace-pre-line">
              {active.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
