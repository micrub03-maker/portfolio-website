import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { photos as ALL_PHOTOS } from '../data/photoManifest';

// ─── RANDOM SELECTION ────────────────────────────────────────────────────────
function pickPhotos(pool, count, excludeIds) {
  const available = excludeIds?.size ? pool.filter(p => !excludeIds.has(p.id)) : pool;
  const source = available.length >= count ? available : pool;
  return [...source].sort(() => Math.random() - 0.5).slice(0, count);
}

function nextFrame(prevLayoutId, prevPhotoIds) {
  const candidates = LAYOUTS.filter(l => l.id !== prevLayoutId);
  const layout = candidates[Math.floor(Math.random() * candidates.length)];
  const range = layout.maxPhotos - layout.minPhotos;
  const count = layout.minPhotos + (range > 0 ? Math.floor(Math.random() * (range + 1)) : 0);
  const photos = pickPhotos(ALL_PHOTOS, count, prevPhotoIds);
  return { layout, photos };
}

// ─── UNCROPPED IMAGE CELL ─────────────────────────────────────────────────────
// object-contain ensures the full image is always visible — never cropped.
function Cell({ photo, className = '', style = {} }) {
  return (
    <div
      className={`bg-slate-100 border border-slate-200/60 rounded-lg overflow-hidden flex items-center justify-center ${className}`}
      style={style}
    >
      <img
        src={photo.src}
        alt={photo.alt}
        className="w-full h-full object-contain"
        draggable={false}
        loading="lazy"
      />
    </div>
  );
}

// ─── LAYOUTS ─────────────────────────────────────────────────────────────────
// Each layout: { id, minPhotos, maxPhotos, render(photos, reducedMotion) }
// All paths use object-contain — zero cropping guaranteed.
const LAYOUTS = [
  {
    // 1 large hero left + 2–4 stacked right
    id: 'mosaic',
    minPhotos: 4,
    maxPhotos: 5,
    render(photos) {
      const [hero, ...stack] = photos;
      return (
        <div className="h-full grid gap-1.5" style={{ gridTemplateColumns: '3fr 2fr' }}>
          <Cell photo={hero} />
          <div
            className="grid gap-1.5"
            style={{ gridTemplateRows: `repeat(${stack.length}, 1fr)` }}
          >
            {stack.map(p => <Cell key={p.id} photo={p} />)}
          </div>
        </div>
      );
    },
  },
  {
    // 2 stacked left + 1 tall right
    id: 'asymmetric',
    minPhotos: 3,
    maxPhotos: 3,
    render(photos) {
      const [a, b, hero] = photos;
      return (
        <div className="h-full grid gap-1.5" style={{ gridTemplateColumns: '2fr 3fr' }}>
          <div className="grid gap-1.5" style={{ gridTemplateRows: '1fr 1fr' }}>
            <Cell photo={a} />
            <Cell photo={b} />
          </div>
          <Cell photo={hero} />
        </div>
      );
    },
  },
  {
    // Narrow | Wide | Narrow horizontal strip
    id: 'strip',
    minPhotos: 3,
    maxPhotos: 3,
    render(photos) {
      const [a, b, c] = photos;
      return (
        <div className="h-full grid gap-1.5" style={{ gridTemplateColumns: '1fr 2fr 1fr' }}>
          <Cell photo={a} />
          <Cell photo={b} />
          <Cell photo={c} />
        </div>
      );
    },
  },
  {
    // Polaroid fan — rotated cards with white borders
    id: 'postcard',
    minPhotos: 3,
    maxPhotos: 4,
    render(photos, reduced) {
      const rotations = reduced ? [0, 0, 0, 0] : [-6, 4, -3, 7];
      const yOffsets  = reduced ? [0, 0, 0, 0] : [-8, 6, -5, 8];
      const maxW = photos.length <= 3 ? '32%' : '26%';
      return (
        <div className="h-full flex items-center justify-center gap-2 px-3">
          {photos.map((p, i) => (
            <div
              key={p.id}
              className="bg-white shadow-md flex flex-col flex-shrink-0 rounded-lg overflow-hidden"
              style={{
                transform: `rotate(${rotations[i]}deg) translateY(${yOffsets[i]}px)`,
                padding: '5px 5px 18px',
                width: maxW,
                height: '80%',
              }}
            >
              <img
                src={p.src}
                alt={p.alt}
                style={{ flex: 1, minHeight: 0, objectFit: 'contain', width: '100%' }}
                draggable={false}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      );
    },
  },
  {
    // Equal 2×2 grid
    id: 'grid',
    minPhotos: 4,
    maxPhotos: 4,
    render(photos) {
      return (
        <div className="h-full grid grid-cols-2 grid-rows-2 gap-1.5">
          {photos.map(p => <Cell key={p.id} photo={p} />)}
        </div>
      );
    },
  },
  {
    // Wide hero on top + smaller images in a bottom row
    id: 'featured-strip',
    minPhotos: 3,
    maxPhotos: 5,
    render(photos) {
      const [hero, ...rest] = photos;
      return (
        <div className="h-full flex flex-col gap-1.5">
          <div style={{ flex: 2 }}>
            <Cell photo={hero} style={{ height: '100%', width: '100%' }} />
          </div>
          <div className="flex gap-1.5" style={{ flex: 1 }}>
            {rest.map(p => (
              <Cell key={p.id} photo={p} className="flex-1" style={{ height: '100%' }} />
            ))}
          </div>
        </div>
      );
    },
  },
];

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export default function PhotographyShowcase() {
  const reduced = useReducedMotion();

  const [frame, setFrame] = useState(() => {
    const initial = nextFrame(null, new Set());
    return { ...initial, tick: 0 };
  });

  useEffect(() => {
    const id = setInterval(() => {
      setFrame(prev => {
        const next = nextFrame(
          prev.layout.id,
          new Set(prev.photos.map(p => p.id))
        );
        return { ...next, tick: prev.tick + 1 };
      });
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="w-full rounded-xl overflow-hidden my-3"
      style={{ height: '240px' }}
      role="img"
      aria-label="Photography showcase — rotating photo collage"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={frame.tick}
          className="h-full w-full"
          initial={{ opacity: 0, scale: reduced ? 1 : 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: reduced ? 1 : 0.97 }}
          transition={{ duration: reduced ? 0.12 : 0.32 }}
        >
          {frame.layout.render(frame.photos, !!reduced)}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
