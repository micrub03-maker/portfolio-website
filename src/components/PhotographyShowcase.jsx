import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { photos as DEFAULT_PHOTOS } from '../data/photoManifest';

const GAP = 6;
const MAX_H = 420;
const MIN_H = 180;
const MIN_TWO_ROW_H = 140;
const DEFAULT_W = 520;

// ─── PHOTO SELECTION ──────────────────────────────────────────────────────────
function pickPhotos(pool, count, excludeIds) {
  const available = excludeIds?.size ? pool.filter(p => !excludeIds.has(p.id)) : pool;
  const source = available.length >= count ? available : pool;
  return [...source].sort(() => Math.random() - 0.5).slice(0, count);
}

// ─── LAYOUT SELECTION ─────────────────────────────────────────────────────────
// Called after photos are chosen. Returns 'row' | 'two-row' | 'mosaic'.
//
// row:     single flex row; each cell width = h * ar, h uniform.
//          Natural h = (w - gaps) / Σar. Valid when MIN_H ≤ natural_h ≤ MAX_H.
//          When natural_h > MAX_H the row shrinks and centers (portrait-heavy sets).
//
// two-row: two independent rows, each capped at half MAX_H. Good for many/wide photos.
//
// mosaic:  portrait hero | stacked column. Column width derived so both sides share
//          exactly the same height with no empty space anywhere.
function chooseLayout(photos, w) {
  const n = photos.length;
  const sumAr = photos.reduce((s, p) => s + p.ar, 0);
  const rowH = (w - GAP * (n - 1)) / sumAr;
  const avgAr = sumAr / n;
  const hasPortrait = photos.some(p => p.ar < 0.9);

  const opts = [];
  if (rowH >= MIN_H) opts.push('row');

  // Two-row: verify each actual sub-row will be tall enough
  if ((n >= 4 || rowH < MIN_H) && avgAr > 0.85) {
    const mid = Math.round(n / 2);
    const maxRowH = Math.floor((MAX_H - GAP) / 2);
    const h1 = Math.min(maxRowH, (w - GAP * (mid - 1)) / photos.slice(0, mid).reduce((s, p) => s + p.ar, 0));
    const h2 = Math.min(maxRowH, (w - GAP * (n - mid - 1)) / photos.slice(mid).reduce((s, p) => s + p.ar, 0));
    if (Math.min(h1, h2) >= MIN_TWO_ROW_H) opts.push('two-row');
  }

  // Mosaic: cap at 4 photos (1 hero + max 3 sidebar) and verify sidebar cells are big enough
  if (n >= 3 && n <= 4 && hasPortrait) {
    const heroIdx = photos.reduce((mi, p, i) => (p.ar < photos[mi].ar ? i : mi), 0);
    const hero = photos[heroIdx];
    const rest = photos.filter((_, i) => i !== heroIdx);
    const nR = rest.length;
    const sumInvAr = rest.reduce((s, p) => s + 1 / p.ar, 0);
    const H = Math.min(MAX_H, (w - GAP + GAP * (nR - 1) / sumInvAr) / (hero.ar + 1 / sumInvAr));
    const sideW = (H - GAP * (nR - 1)) / sumInvAr;
    const minCellH = Math.min(...rest.map(p => sideW / p.ar));
    if (minCellH >= MIN_TWO_ROW_H) opts.push('mosaic');
  }
  if (opts.length === 0) opts.push('row');
  return opts[Math.floor(Math.random() * opts.length)];
}

// ─── CELL ─────────────────────────────────────────────────────────────────────
// width and height are pre-computed to exactly match the photo's aspect ratio,
// so no objectFit trick is needed — the image fills the cell with zero distortion.
function ImgCell({ photo, width, height }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 8,
        overflow: 'hidden',
        flexShrink: 0,
        backgroundColor: '#e2e8f0',
      }}
    >
      <img
        src={photo.src}
        alt={photo.alt}
        style={{ width: '100%', height: '100%', display: 'block' }}
        draggable={false}
        loading="lazy"
      />
    </div>
  );
}

// ─── LAYOUT RENDERERS ─────────────────────────────────────────────────────────

// Single proportional row. h = min(MAX_H, (w - gaps) / Σar).
// When h < natural, row is narrower than container and centers itself.
function RowLayout({ photos, maxH, minH = MIN_H, w }) {
  const n = photos.length;
  const sumAr = photos.reduce((s, p) => s + p.ar, 0);
  const naturalH = (w - GAP * (n - 1)) / sumAr;
  // Don't enforce minH when it would push images wider than the container
  const h = naturalH < minH ? naturalH : Math.min(maxH, naturalH);
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ display: 'flex', gap: GAP }}>
        {photos.map(p => (
          <ImgCell key={p.id} photo={p} width={h * p.ar} height={h} />
        ))}
      </div>
    </div>
  );
}

// Two independent rows. Each row gets half the available height.
function TwoRowLayout({ photos, w }) {
  const mid = Math.round(photos.length / 2);
  const rowMaxH = Math.floor((MAX_H - GAP) / 2);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
      <RowLayout photos={photos.slice(0, mid)} maxH={rowMaxH} minH={MIN_TWO_ROW_H} w={w} />
      <RowLayout photos={photos.slice(mid)} maxH={rowMaxH} minH={MIN_TWO_ROW_H} w={w} />
    </div>
  );
}

// Portrait hero left + stacked column right.
// Math: hero occupies heroW = H * hero.ar.
// Sidebar: each cell width = sideW, height = sideW / ar_i.
// For sidebar total height = H:  sideW * Σ(1/ar_i) + GAP*(n-1) = H
//                                sideW = (H - GAP*(n-1)) / Σ(1/ar_i)
// For heroW + sideW + GAP = w:  H is solved from the combined equation.
// When H_raw > MAX_H the layout is narrower than w and centers.
function MosaicLayout({ photos, w }) {
  const heroIdx = photos.reduce((mi, p, i) => (p.ar < photos[mi].ar ? i : mi), 0);
  const hero = photos[heroIdx];
  const rest = photos.filter((_, i) => i !== heroIdx);
  const nR = rest.length;
  const sumInvAr = rest.reduce((s, p) => s + 1 / p.ar, 0);

  const H_raw = (w - GAP + GAP * (nR - 1) / sumInvAr) / (hero.ar + 1 / sumInvAr);
  // Don't enforce MIN_H when it would push total width beyond container
  const H = H_raw < MIN_H ? H_raw : Math.min(MAX_H, H_raw);
  const heroW = H * hero.ar;
  const sideW = Math.max(40, (H - GAP * (nR - 1)) / sumInvAr);

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ display: 'flex', gap: GAP }}>
        <ImgCell photo={hero} width={heroW} height={H} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
          {rest.map(p => (
            <ImgCell key={p.id} photo={p} width={sideW} height={sideW / p.ar} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────
function pickCount(w) {
  return w < 500 ? 2 + Math.floor(Math.random() * 2) : 3 + Math.floor(Math.random() * 3);
}

export default function PhotographyShowcase({ photos: photoProp }) {
  const pool = photoProp ?? DEFAULT_PHOTOS;
  const reduced = useReducedMotion();
  const containerRef = useRef(null);
  const wRef = useRef(DEFAULT_W);
  const [containerW, setContainerW] = useState(DEFAULT_W);
  const isFirstPhotoPropRun = useRef(true);

  const [frame, setFrame] = useState(() => {
    const photos = pickPhotos(pool, pickCount(DEFAULT_W), new Set());
    return { photos, layoutType: chooseLayout(photos, DEFAULT_W), tick: 0 };
  });

  // Measure container width and keep it current
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const sync = (w) => { wRef.current = w; setContainerW(w); };
    const obs = new ResizeObserver(([e]) => sync(e.contentRect.width));
    obs.observe(el);
    const initial = el.getBoundingClientRect().width;
    if (initial > 0) sync(initial);
    return () => obs.disconnect();
  }, []);

  // Reset when the photo pool prop changes (skip first mount)
  useEffect(() => {
    if (isFirstPhotoPropRun.current) { isFirstPhotoPropRun.current = false; return; }
    const photos = pickPhotos(pool, pickCount(wRef.current), new Set());
    setFrame({ photos, layoutType: chooseLayout(photos, wRef.current), tick: 0 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoProp]);

  // Rotation interval
  useEffect(() => {
    const id = setInterval(() => {
      setFrame(prev => {
        const photos = pickPhotos(pool, pickCount(wRef.current), new Set(prev.photos.map(p => p.id)));
        return { photos, layoutType: chooseLayout(photos, wRef.current), tick: prev.tick + 1 };
      });
    }, 5000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoProp]);

  const w = Math.max(containerW, 200);

  return (
    <div
      ref={containerRef}
      className="w-full my-3"
      role="img"
      aria-label="Photography showcase — rotating photo collage"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={frame.tick}
          initial={{ opacity: 0, scale: reduced ? 1 : 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: reduced ? 1 : 0.97 }}
          transition={{ duration: reduced ? 0.12 : 0.32 }}
        >
          {frame.layoutType === 'two-row' && (
            <TwoRowLayout photos={frame.photos} w={w} />
          )}
          {frame.layoutType === 'mosaic' && (
            <MosaicLayout photos={frame.photos} w={w} />
          )}
          {frame.layoutType === 'row' && (
            <RowLayout photos={frame.photos} maxH={MAX_H} w={w} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
