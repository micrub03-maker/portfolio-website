import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TravelMap from './TravelMap';
import { MediaSlot } from "./MediaSlot";
import DoodleJump from './DoodleJump';
import SpotifyPlaylistsAPI from './SpotifyPlaylistsAPI';
import PhotographyShowcase from './PhotographyShowcase';

const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];

const slides = [
  {
    id: 'photography',
    title: 'Photography',
    mediaLabel: 'TEMP: photography',
    mediaSrc: null,
    description:
      'Attention to detail, different perspectives and patience. Everytime I spend time learning about photography (which is not enough) I always end up appreciating the world around me a little bit more.',
  },
  {
    id: 'skateboarding',
    title: 'Skateboarding',
    mediaLabel: 'TEMP: skateboarding',
    mediaSrc: '/skate-videos.mp4',
    description:
      'Creativity, community, challenging myself and overcoming fear. Skating has been a big part of my life since I was 16 years old.',
  },
  {
    id: 'traveling',
    title: 'Traveling',
    mediaLabel: 'TEMP: traveling',
    mediaSrc: null,
    description:
      'What a blessing to have seen so many places! Every trip has taught me to be more independent, adapt to new environments and endless new ways to have fun.',
  },
  {
    id: 'music',
    title: 'Music',
    mediaLabel: 'TEMP: music',
    mediaSrc: null,
    description:
      'I am a huge festival fan, will boogie to nearly any sound and have recently gotten into guitar. Here is a snapshot of what I listen to.',
  },
  {
    id: 'winter-sports',
    title: 'Winter sports',
    mediaLabel: 'TEMP: winter sports',
    mediaSrc: null,
    description:
      'I spent a whole season teaching kids on the snow, I feel the most free when I’m on the slopes or out touring.',},
  {
    id: 'random-skills',
    title: 'Picking up random new skills',
    mediaLabel: 'TEMP: random skills',
    mediaSrc: null,
    description:
      'From practicing handstand to learning how to juggle, I love setting small goals and challenges to overcome for myself. I do tend to hyperfocus on them for a little bit.',
  },
];

export default function InterestsCarousel({ jumpToTravel = 0 }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showGame, setShowGame] = useState(false);
  const skateClicks = useRef(0);
  const konamiBuffer = useRef([]);
  const sectionRef = useRef(null);

  useEffect(() => {
    if (jumpToTravel === 0) return;
    const idx = slides.findIndex(s => s.id === 'traveling');
    if (idx !== -1) setCurrentIndex(idx);
  }, [jumpToTravel]);

  const openGame = () => {
    const idx = slides.findIndex(s => s.id === 'skateboarding');
    if (idx !== -1) setCurrentIndex(idx);
    setShowGame(true);
    setTimeout(() => {
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  useEffect(() => {
    const handler = (e) => {
      konamiBuffer.current = [...konamiBuffer.current, e.key].slice(-KONAMI.length);
      if (konamiBuffer.current.join(',') === KONAMI.join(',')) {
        openGame();
        konamiBuffer.current = [];
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleSkateClick = () => {
    skateClicks.current += 1;
    if (skateClicks.current >= 5) {
      skateClicks.current = 0;
      openGame();
    }
  };

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
    <section ref={sectionRef}>
      <h2 className="text-center mb-6 text-2xl md:text-3xl font-bold text-gray-400">interests</h2>

      <div
        className="max-w-3xl mx-auto rounded-2xl bg-white/70 backdrop-blur-md border border-gray-100 shadow-lg overflow-hidden"
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
            {active.id === 'photography' ? (
              <>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">{active.title}</h3>
                <p className="mt-3 text-sm md:text-base text-gray-700 leading-relaxed whitespace-pre-line">
                  {active.description}
                </p>
                <PhotographyShowcase />
              </>
            ) : active.id === 'traveling' ? (
              <>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">{active.title}</h3>
                <p className="mt-3 text-sm md:text-base text-gray-700 leading-relaxed whitespace-pre-line">
                  {active.description}
                </p>
                <div className="mt-4 mb-4 w-full">
                  <TravelMap compact />
                </div>
              </>
            ) : active.id === 'music' ? (
              <>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">{active.title}</h3>
                <p className="mt-3 text-sm md:text-base text-gray-700 leading-relaxed whitespace-pre-line">
                  {active.description}
                </p>
                <div className="mt-4 mb-4 w-full">
                  <SpotifyPlaylistsAPI />
                </div>
              </>
            ) : active.mediaSrc ? (
              <div className="flex gap-4 items-start">
                <div
                  className="w-2/5 flex-shrink-0"
                  onClick={active.id === 'skateboarding' && !showGame ? handleSkateClick : undefined}
                  style={active.id === 'skateboarding' && !showGame ? { cursor: 'pointer' } : undefined}
                >
                  {active.id === 'skateboarding' && showGame
                    ? <DoodleJump inline onClose={() => setShowGame(false)} />
                    : <MediaSlot label={active.mediaLabel} src={active.mediaSrc} />
                  }
                </div>
                <div className="flex-1 flex flex-col justify-end pb-2">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900">{active.title}</h3>
                  <p className="mt-2 text-sm md:text-base text-gray-700 leading-relaxed whitespace-pre-line">
                    {active.description}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">{active.title}</h3>
                <MediaSlot label={active.mediaLabel} src={active.mediaSrc} tall />
                <p className="text-sm md:text-base text-gray-700 leading-relaxed whitespace-pre-line">
                  {active.description}
                </p>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

    </section>
  );
}
