import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { LIFE_STORY_CHAPTERS } from '../data/lifeStory';
import { _pendingReinit } from './TravelMap';

// ── World map projection (Miller cylindrical, jsvectormap world.js constants) ─

const MILL_R = 6381372;
const RAD = Math.PI / 180;
// From: node_modules/jsvectormap/dist/maps/world.js → insets[0].bbox
const BX0 = -20004297.151525836, BX1 = 20026572.39474939;
const BY0 = -12671671.123330014, BY1 = 6930392.025135122;
const NAT_W = 900, NAT_H = 440.70631074413296;

// Convert lat/lng → jsvectormap "natural" coordinate space (0–900 × 0–440).
// This matches Proj.mill() in jsvectormap/src/js/projection.js exactly.
const CENTRAL_MERIDIAN = 11.5;

function toNat(lat, lng) {
  const xp = MILL_R * (lng - CENTRAL_MERIDIAN) * RAD;
  const yp = -MILL_R * Math.log(Math.tan((45 + 0.4 * lat) * RAD)) / 0.8;
  return {
    x: (xp - BX0) / (BX1 - BX0) * NAT_W,
    y: (yp - BY0) / (BY1 - BY0) * NAT_H,
  };
}

// From coordsToPoint.js: screenX = (naturalX + transX) * scale  (inset.left = 0)
function natToScreen(n, map) {
  return { x: (n.x + map.transX) * map.scale, y: (n.y + map.transY) * map.scale };
}

// Center the camera on a natural-coordinate point at a given scale.
function centerOn(nat, scale, map) {
  map.scale = scale;
  map.transX = map._width  / (2 * scale) - nat.x;
  map.transY = map._height / (2 * scale) - nat.y;
  map._applyTransform?.();
}

// ── Route building ─────────────────────────────────────────────────────────────

const TRANSPORT_LABEL = { flight: 'flight', car: 'drive', train: 'rail', roadtrip: 'road trip' };

function buildRoute(chapter) {
  if (!chapter.transport || !chapter.routeFrom) return null;
  const fromNat = toNat(chapter.routeFrom.lat, chapter.routeFrom.lng);
  const toNat_  = toNat(chapter.lat, chapter.lng);

  if (chapter.transport === 'flight') {
    const dist = Math.hypot(toNat_.x - fromNat.x, toNat_.y - fromNat.y);
    return {
      type: 'flight', fromNat, toNat: toNat_,
      midNat: { x: (fromNat.x + toNat_.x) / 2, y: (fromNat.y + toNat_.y) / 2 - dist * 0.35 },
    };
  }

  if (chapter.transport === 'multileg') {
    const allCoords = [
      { lat: chapter.routeFrom.lat, lng: chapter.routeFrom.lng },
      ...(chapter.loopWaypoints ?? []),
      { lat: chapter.lat, lng: chapter.lng },
    ];
    const nats = allCoords.map(c => toNat(c.lat, c.lng));
    const segments = [];
    for (let i = 0; i < nats.length - 1; i++) {
      const from = nats[i], to = nats[i + 1];
      const d = Math.hypot(to.x - from.x, to.y - from.y);
      segments.push({ from, to, mid: { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 - d * 0.3 } });
    }
    return { type: 'multileg', fromNat: nats[0], toNat: nats[nats.length - 1], segments };
  }

  const wps = chapter.trainWaypoints ?? chapter.roadtripWaypoints ?? [];
  return {
    type: chapter.transport, fromNat, toNat: toNat_,
    polyNats: [fromNat, ...wps.map(w => toNat(w.lat, w.lng)), toNat_],
  };
}

// ── Route interpolation ────────────────────────────────────────────────────────

const ease = t => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;

function bezAt(p0, p1, p2, t) {
  const u = 1 - t;
  return { x: u*u*p0.x + 2*u*t*p1.x + t*t*p2.x, y: u*u*p0.y + 2*u*t*p1.y + t*t*p2.y };
}

function polyAt(pts, t) {
  const lens = [0];
  for (let i = 1; i < pts.length; i++)
    lens.push(lens[i-1] + Math.hypot(pts[i].x - pts[i-1].x, pts[i].y - pts[i-1].y));
  const total = lens[lens.length - 1];
  if (!total) return { ...pts[0] };
  const tgt = t * total;
  for (let i = 1; i < pts.length; i++) {
    if (lens[i] >= tgt - 1e-9) {
      const s = (tgt - lens[i-1]) / (lens[i] - lens[i-1]);
      return { x: pts[i-1].x + (pts[i].x - pts[i-1].x) * s, y: pts[i-1].y + (pts[i].y - pts[i-1].y) * s };
    }
  }
  return { ...pts[pts.length - 1] };
}

function vehicleAt(route, t) {
  if (route.type === 'flight') return bezAt(route.fromNat, route.midNat, route.toNat, t);
  if (route.type === 'car')    return { x: route.fromNat.x + (route.toNat.x - route.fromNat.x) * t, y: route.fromNat.y + (route.toNat.y - route.fromNat.y) * t };
  if (route.type === 'multileg') {
    const n = route.segments.length;
    const tScaled = t * n;
    const segIdx = Math.min(Math.floor(tScaled), n - 1);
    const seg = route.segments[segIdx];
    return bezAt(seg.from, seg.mid, seg.to, tScaled - segIdx);
  }
  return polyAt(route.polyNats, t);
}

// ── Canvas drawing ─────────────────────────────────────────────────────────────

function drawRoute(ctx, route, progress, alpha, map) {
  ctx.save();
  ctx.globalAlpha = alpha;

  if (route.type === 'flight') {
    const STEPS = 64;
    const end = Math.round(progress * STEPS);
    ctx.beginPath();
    for (let i = 0; i <= end; i++) {
      const n = bezAt(route.fromNat, route.midNat, route.toNat, i / STEPS);
      const s = natToScreen(n, map);
      i === 0 ? ctx.moveTo(s.x, s.y) : ctx.lineTo(s.x, s.y);
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

  } else if (route.type === 'car') {
    const from = natToScreen(route.fromNat, map);
    const to   = natToScreen(route.toNat, map);
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(from.x + (to.x - from.x) * progress, from.y + (to.y - from.y) * progress);
    ctx.strokeStyle = 'rgba(251,191,36,0.9)';
    ctx.lineWidth = 2;
    ctx.stroke();

  } else if (route.type === 'multileg') {
    const n = route.segments.length;
    const tScaled = progress * n;
    for (let i = 0; i < n; i++) {
      const segProgress = Math.max(0, Math.min(1, tScaled - i));
      if (segProgress <= 0) break;
      const seg = route.segments[i];
      const STEPS = 48;
      const end = Math.round(segProgress * STEPS);
      ctx.beginPath();
      for (let j = 0; j <= end; j++) {
        const pt = bezAt(seg.from, seg.mid, seg.to, j / STEPS);
        const s = natToScreen(pt, map);
        j === 0 ? ctx.moveTo(s.x, s.y) : ctx.lineTo(s.x, s.y);
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  } else {
    // train or roadtrip — polyline up to progress
    const color = route.type === 'train' ? 'rgba(167,243,208,0.9)' : 'rgba(251,191,36,0.7)';
    const dash  = route.type === 'train' ? [4, 3] : [2, 4];
    const pts   = route.polyNats;

    const lens = [0];
    for (let i = 1; i < pts.length; i++)
      lens.push(lens[i-1] + Math.hypot(pts[i].x - pts[i-1].x, pts[i].y - pts[i-1].y));
    const total  = lens[lens.length - 1];
    const tgtLen = progress * total;

    const p0 = natToScreen(pts[0], map);
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    for (let i = 1; i < pts.length; i++) {
      if (lens[i] <= tgtLen) {
        const s = natToScreen(pts[i], map);
        ctx.lineTo(s.x, s.y);
      } else if (lens[i-1] < tgtLen) {
        const seg = (tgtLen - lens[i-1]) / (lens[i] - lens[i-1]);
        const n = { x: pts[i-1].x + (pts[i].x - pts[i-1].x) * seg, y: pts[i-1].y + (pts[i].y - pts[i-1].y) * seg };
        const s = natToScreen(n, map);
        ctx.lineTo(s.x, s.y);
        break;
      }
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.setLineDash(dash);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.restore();
}

function drawVehicle(ctx, nat, map) {
  const s = natToScreen(nat, map);
  ctx.save();
  ctx.shadowColor = '#7dffb2';
  ctx.shadowBlur = 22;
  ctx.beginPath();
  ctx.arc(s.x, s.y, 5, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.97)';
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawAvatar(ctx, nat, map) {
  const s = natToScreen(nat, map);
  ctx.save();
  ctx.shadowColor = 'rgba(255,255,255,0.95)';
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.arc(s.x, s.y, 6, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.fill();
  ctx.restore();
}

// Repaint everything in static (non-animating) state.
function repaint(canvas, map, accRoutes, avatarNat) {
  if (!canvas || !map) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const r of accRoutes) drawRoute(ctx, r, 1, 0.35, map);
  if (avatarNat) drawAvatar(ctx, avatarNat, map);
}

// ── Chapter card ───────────────────────────────────────────────────────────────

function ChapterCard({ chapter, chapterIndex, total, onNext, onPrev, onClose }) {
  return (
    <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', width: 'min(420px, 90vw)', zIndex: 10, pointerEvents: 'auto' }}>
      <div style={{ background: 'rgba(10,14,20,0.88)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, padding: '16px 20px', backdropFilter: 'blur(12px)', boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}>
        {/* Progress */}
        <div style={{ display: 'flex', gap: 3, marginBottom: 12 }}>
          {LIFE_STORY_CHAPTERS.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 2, borderRadius: 2, background: i <= chapterIndex ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.15)', transition: 'background 0.4s' }} />
          ))}
        </div>
        {/* Year + transport */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'monospace' }}>{chapter.year}</span>
          {chapter.transport && (
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'monospace', background: 'rgba(255,255,255,0.07)', padding: '1px 5px', borderRadius: 3, border: '1px solid rgba(255,255,255,0.1)' }}>
              {TRANSPORT_LABEL[chapter.transport] ?? chapter.transport}
            </span>
          )}
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginLeft: 'auto', fontFamily: 'monospace' }}>{chapterIndex + 1} / {total}</span>
        </div>
        <p style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.95)', margin: '0 0 6px', lineHeight: 1.3 }}>{chapter.title}</p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: '0 0 14px', lineHeight: 1.55 }}>{chapter.caption}</p>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={onPrev} disabled={chapterIndex === 0} style={{ flex: 1, padding: '7px 0', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: chapterIndex === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.08)', color: chapterIndex === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)', fontSize: 12, cursor: chapterIndex === 0 ? 'default' : 'pointer', fontFamily: 'monospace' }}>← prev</button>
          {chapterIndex < total - 1 ? (
            <button onClick={onNext} style={{ flex: 2, padding: '7px 0', borderRadius: 8, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 600 }}>next →</button>
          ) : (
            <button onClick={onClose} style={{ flex: 2, padding: '7px 0', borderRadius: 8, border: '1px solid rgba(85,128,113,0.6)', background: 'rgba(85,128,113,0.25)', color: 'rgba(255,255,255,0.9)', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 600 }}>close ✦</button>
          )}
          <button onClick={onClose} aria-label="Close" style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✕</button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function LifeStoryEasterEgg({ onClose }) {
  const overlayMapRef  = useRef(null);
  const mountRef       = useRef(null);
  const containerRef   = useRef(null);
  const canvasRef      = useRef(null);
  const cancelRef      = useRef(null);   // cancel fn for current animation rAF
  const accRoutesRef   = useRef([]);     // completed routes, in forward-visit order
  const chIdxRef       = useRef(0);      // sync copy of chapterIndex for closures

  const [mapReady,      setMapReady]      = useState(false);
  const [chapterIndex,  setChapterIndex]  = useState(0);

  // ── Map init ───────────────────────────────────────────────────────────────

  useEffect(() => {
    let destroyed = false;
    const init = async () => {
      try {
        const { default: JsVectorMap } = await import('jsvectormap');
        await import('jsvectormap/dist/maps/world.js');
        await new Promise(r => requestAnimationFrame(r));
        if (destroyed || !mountRef.current) return;

        const map = new JsVectorMap({
          selector: mountRef.current,
          map: 'world',
          draggable: false, regionsSelectable: false,
          zoomOnScroll: false, zoomButtons: false, showTooltip: false,
          zoomMin: 0.5, zoomMax: 12,
          series: { regions: [{ values: (() => { const v = {}; ['BE','KH','CA','CN','CO','HR','CZ','DK','FR','DE','GR','HK','HU','IL','IT','LU','MO','MA','NL','NO','PS','PL','PT','KR','ES','SE','CH','TZ','TH','GB','US','VA','VN'].forEach(c => { v[c] = 'visited'; }); return v; })(), attribute: 'fill', scale: { visited: '#558071' } }] },
          regionStyle: { initial: { fill: 'rgba(255,255,255,0.2)', stroke: 'rgba(0,0,0,0.25)', strokeWidth: 1.5 }, hover: { fill: 'rgba(255,255,255,0.2)' }, selected: { fill: 'rgba(255,255,255,0.2)' } },
          onRegionClick: e => e.preventDefault(),
        });

        if (destroyed) { try { map.destroy(); } catch {} return; }
        overlayMapRef.current = map;
        setMapReady(true);
      } catch (err) { console.error('LifeStoryEasterEgg map init:', err); }
    };
    init();
    return () => {
      destroyed = true;
      cancelRef.current?.();
      const survivors = new Set(_pendingReinit);
      try { overlayMapRef.current?.destroy?.(); } catch {}
      overlayMapRef.current = null;
      if (mountRef.current) { mountRef.current.innerHTML = ''; mountRef.current.classList.remove('jvm-container'); }
      if (survivors.size > 0) {
        setTimeout(() => survivors.forEach(fn => fn()), 0);
      }
    };
  }, []);

  // ── Canvas size sync ───────────────────────────────────────────────────────

  useEffect(() => {
    const el = containerRef.current;
    const canvas = canvasRef.current;
    if (!el || !canvas) return;
    const sync = () => {
      canvas.width  = el.offsetWidth;
      canvas.height = el.offsetHeight;
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, [mapReady]);

  // ── Navigation ─────────────────────────────────────────────────────────────

  const goToChapter = useCallback((index) => {
    const map    = overlayMapRef.current;
    const canvas = canvasRef.current;
    if (!map || !canvas) return;

    cancelRef.current?.();
    cancelRef.current = null;

    const chapter     = LIFE_STORY_CHAPTERS[index];
    const destNat     = toNat(chapter.lat, chapter.lng);
    const destScale   = chapter.zoom * (map._baseScale ?? 1);
    const isForward   = index > chIdxRef.current;
    const route       = isForward ? buildRoute(chapter) : null;

    // Trim accumulated routes: keep only those for chapters before `index`.
    // (slice(0, index) keeps routes for chapters 1..index, since accRoutes[i]
    //  holds the route that arrived at chapter i+1 and has length = chapterIndex)
    accRoutesRef.current = accRoutesRef.current.slice(0, index);
    chIdxRef.current     = index;
    setChapterIndex(index);

    if (route) {
      // ── Journey: vehicle travels, camera follows ──────────────────────────
      const dist = route.type === 'flight'
        ? Math.hypot(route.toNat.x - route.fromNat.x, route.toNat.y - route.fromNat.y)
        : route.type === 'multileg'
          ? route.segments.reduce((s, seg) => s + Math.hypot(seg.to.x - seg.from.x, seg.to.y - seg.from.y), 0)
          : route.polyNats.reduce((s, p, i) => i === 0 ? 0 : s + Math.hypot(p.x - route.polyNats[i-1].x, p.y - route.polyNats[i-1].y), 0);
      const isCarLike  = route.type === 'car' || route.type === 'roadtrip';
      const isMultileg = route.type === 'multileg';
      const isTrain    = route.type === 'train';
      const duration   = isMultileg
        ? Math.max(6000, Math.min(11000, dist * 12))
        : isTrain
          ? Math.max(7000, Math.min(14000, dist * 35))
          : Math.max(isCarLike ? 5000 : 1800, Math.min(isCarLike ? 9000 : 4000, dist * (isCarLike ? 40 : 12)));

      const fromScale = map.scale;
      const startTime = performance.now();
      let rafId;

      const frame = now => {
        const t = Math.min((now - startTime) / duration, 1);
        const e = ease(t);

        // Vehicle position in natural coords at eased t
        const vNat       = vehicleAt(route, e);
        const curScale   = fromScale + (destScale - fromScale) * e;

        // Camera follows vehicle
        centerOn(vNat, curScale, map);

        // Draw
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const r of accRoutesRef.current) drawRoute(ctx, r, 1, 0.35, map);
        drawRoute(ctx, route, e, 1, map);
        drawVehicle(ctx, vNat, map);

        if (t < 1) {
          rafId = requestAnimationFrame(frame);
        } else {
          accRoutesRef.current = [...accRoutesRef.current, route];
          repaint(canvas, map, accRoutesRef.current, destNat);
          cancelRef.current = null;
        }
      };

      cancelRef.current = () => cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(frame);

    } else {
      // ── Simple camera pan (no route / going backward) ─────────────────────
      const fromScale  = map.scale;
      const fromTransX = map.transX;
      const fromTransY = map.transY;
      const tgtTransX  = map._width  / (2 * destScale) - destNat.x;
      const tgtTransY  = map._height / (2 * destScale) - destNat.y;
      const duration   = 650;
      const startTime  = performance.now();
      let rafId;

      const frame = now => {
        const t = Math.min((now - startTime) / duration, 1);
        const e = ease(t);
        map.scale  = fromScale  + (destScale  - fromScale)  * e;
        map.transX = fromTransX + (tgtTransX  - fromTransX) * e;
        map.transY = fromTransY + (tgtTransY  - fromTransY) * e;
        map._applyTransform?.();
        repaint(canvas, map, accRoutesRef.current, t === 1 ? destNat : null);
        if (t < 1) rafId = requestAnimationFrame(frame);
        else cancelRef.current = null;
      };

      cancelRef.current = () => cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(frame);
    }
  }, []);

  // Start at chapter 0 once map is ready
  useEffect(() => {
    if (!mapReady) return;
    goToChapter(0);
  }, [mapReady]); // eslint-disable-line react-hooks/exhaustive-deps

  // ESC
  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  const chapter = LIFE_STORY_CHAPTERS[chapterIndex];

  return createPortal(
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9998, display: 'flex', flexDirection: 'column', background: 'rgba(6,10,16,0.96)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: 'monospace' }}>life story</span>
        <button onClick={onClose} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: 'rgba(255,255,255,0.45)', fontSize: 13, cursor: 'pointer', padding: '4px 10px', fontFamily: 'monospace' }}>ESC</button>
      </div>

      {/* Map + canvas overlay */}
      <div ref={containerRef} style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />

        {mapReady && (
          <ChapterCard
            chapter={chapter}
            chapterIndex={chapterIndex}
            total={LIFE_STORY_CHAPTERS.length}
            onNext={() => goToChapter(Math.min(chapterIndex + 1, LIFE_STORY_CHAPTERS.length - 1))}
            onPrev={() => goToChapter(Math.max(chapterIndex - 1, 0))}
            onClose={onClose}
          />
        )}

        {!mapReady && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 12, fontFamily: 'monospace' }}>
            loading map…
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
