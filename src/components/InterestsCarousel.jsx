import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TravelMap from './TravelMap';
import { MediaSlot } from "./MediaSlot";
import JugglingGame from './JugglingGame';
import SpotifyPlaylistsAPI from './SpotifyPlaylistsAPI';
import SpotifyPlaylists from './SpotifyPlaylists';
import PhotographyShowcase from './PhotographyShowcase';
import { outdoorsPhotos } from '../data/outdoorsManifest';

const hasSpotifyCredentials =
    !!import.meta.env?.VITE_SPOTIFY_CLIENT_ID &&
    !!import.meta.env?.VITE_SPOTIFY_CLIENT_SECRET;
const SpotifyWidget = hasSpotifyCredentials ? SpotifyPlaylistsAPI : SpotifyPlaylists;

const slides = [
  {
    id: 'skateboarding',
    title: 'Skateboarding',
    mediaLabel: 'TEMP: skateboarding',
    mediaSrc: '/skate-videos.mp4',
    description:
      "Creativity, community, challenging myself, and overcoming fear. Skating has been a big part of my life since I was 16, and it’s shaped how I approach growth. \n \n I love having something to work toward, whether it’s practicing handstands or learning how to juggle, any small challenge I set for myself is satisfying, and skating has been a big driver behind that motivation.",
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
      'I’m a huge festival fan, will boogie to nearly any sound and have recently gotten into playing guitar. Here is a snapshot of what I listen to.',
  },
  {
    id: 'winter-sports',
    title: 'Outdoors & Winter Sports',
    mediaLabel: 'TEMP: outdoors',
    mediaSrc: null,
    description:
      "From hiking to scubadiving to snowboarding to running, I try to spend as much time as possible outdoors. Especially in the winter, because I feel the best when I’m on the slopes.",
  },
  {
    id: 'photography',
    title: 'Photography',
    mediaLabel: 'TEMP: photography',
    mediaSrc: null,
    description:
      'Attention to detail, different perspectives and patience. Everytime I spend time learning about photography (which is not often enough) I end up appreciating the world around me a little bit more.',
  },
];

export default function InterestsCarousel({ jumpToTravel = 0 }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showJuggle, setShowJuggle] = useState(false);

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'video';
    link.href = '/skate-videos.mp4';
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    if (jumpToTravel === 0) return;
    const idx = slides.findIndex(s => s.id === 'traveling');
    if (idx !== -1) setCurrentIndex(idx);
  }, [jumpToTravel]);

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

  // On the skateboarding slide, "juggle" is a hidden trigger for the juggling game.
  const renderPara = (text) => {
    if (active.id !== 'skateboarding') return text;
    const idx = text.toLowerCase().indexOf('juggle');
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span
          onClick={() => setShowJuggle(true)}
          className="cursor-pointer"
        >
          {text.slice(idx, idx + 6)}
        </span>
        {text.slice(idx + 6)}
      </>
    );
  };

  return (
    <section>
      <div
        className="max-w-5xl mx-auto rounded-2xl bg-white/70 backdrop-blur-md ring-1 ring-black/5 shadow-xl overflow-hidden"
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
                  <SpotifyWidget />
                </div>
              </>
            ) : active.id === 'winter-sports' ? (
              <>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">{active.title}</h3>
                <p className="mt-3 text-sm md:text-base text-gray-700 leading-relaxed whitespace-pre-line">
                  {active.description}
                </p>
                <PhotographyShowcase photos={outdoorsPhotos} />
              </>
            ) : active.mediaSrc ? (
              <div className="flex flex-col min-[480px]:flex-row gap-3 min-[480px]:gap-4 items-start">
                {/* Fix: Issue #28 — stack video + text below 480px so neither column is cramped */}
                <div className="w-full min-[480px]:w-2/5 flex-shrink-0">
                  <div className="select-none">
                    {/* Skate clip is portrait — keep 9/16 explicitly now that MediaImage defaults to landscape (Issue #39) */}
                    <MediaSlot label={active.mediaLabel} src={active.mediaSrc} videoAspect="aspect-[9/16]" />
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-end pb-2">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900">{active.title}</h3>
                  {active.description.split('\n \n').map((para, i) => (
                    <p key={i} className={`mt-2 text-sm md:text-base text-gray-700 leading-relaxed${i > 0 ? ' hidden md:block' : ''}`}>
                      {renderPara(para.trim())}
                    </p>
                  ))}
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

      {showJuggle && <JugglingGame onClose={() => setShowJuggle(false)} />}
    </section>
  );
}
