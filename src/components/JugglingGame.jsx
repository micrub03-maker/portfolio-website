import React, { useCallback, useEffect, useRef, useState } from 'react';
import { fetchHighScore, submitHighScore } from '../lib/leaderboard';

const GAME_ID = 'juggling';

const R = 20;               // ball radius (px)
const GRAVITY = 10;         // m/s² — earthlike
const PX_PER_M = 80;        // pixels per meter
const TOSS_V = -9.2;        // m/s, upward, given on launch / catch
const CATCH_RADIUS = 40;    // generous hit area for tap/click (px)
const LAUNCH_GAP = 450;     // ms between each ball's launch

// Same trio as the rest of the site: blue · gold · salmon
const COLORS = ['#3b6fd4', '#FFD700', '#FF7E5F'];

export default function JugglingGame({ onClose }) {
  const canvasRef = useRef(null);
  const balls = useRef(null);
  const raf = useRef(null);
  const lastTime = useRef(0);
  const dims = useRef({ w: window.innerWidth, h: window.innerHeight });
  const [phase, setPhase] = useState('play');
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [isNewBest, setIsNewBest] = useState(false);
  const scoreRef = useRef(0);
  const bestRef = useRef(0);
  // Global record to beat, shown in the corner to drive competition.
  const [globalBest, setGlobalBest] = useState(0);
  const globalBestRef = useRef(0);
  const configuredRef = useRef(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { w, h } = dims.current;
    ctx.clearRect(0, 0, w, h);

    for (const b of balls.current) {
      // Motion trail
      for (let i = 0; i < b.trail.length; i++) {
        const t = b.trail[i];
        ctx.fillStyle = b.color;
        ctx.globalAlpha = (i / b.trail.length) * 0.22;
        ctx.beginPath();
        ctx.arc(t.x, t.y, R * (0.5 + (i / b.trail.length) * 0.5), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Ball with a soft radial shade for volume
      const grad = ctx.createRadialGradient(b.x - 6, b.y - 7, 2, b.x, b.y, R);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.28, b.color);
      grad.addColorStop(1, b.color);
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.25)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 4;
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(b.x, b.y, R, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }, []);

  const tick = useCallback(() => {
    const list = balls.current;
    if (!list) return;
    const { w, h } = dims.current;

    const now = performance.now();
    // Real delta-time so gravity is in true m/s²; clamp to avoid jumps on tab switches
    let dt = Math.min((now - lastTime.current) / 1000, 0.05);
    lastTime.current = now;
    // Nudge the pace up a little every 20 catches (caps so it stays playable)
    dt *= Math.min(1 + Math.floor(scoreRef.current / 20) * 0.08, 1.8);

    for (const b of list) {
      // Hold each ball at rest until its staggered launch time
      if (!b.launched) {
        if (now >= b.launchAt) {
          b.launched = true;
          b.vy = TOSS_V;
          b.vx = (w / 2 - b.x) / w * 1.5; // gentle drift toward center
        } else {
          continue;
        }
      }

      b.trail.push({ x: b.x, y: b.y });
      if (b.trail.length > 7) b.trail.shift();

      b.vy += GRAVITY * dt;
      b.x += b.vx * PX_PER_M * dt;
      b.y += b.vy * PX_PER_M * dt;

      // Bounce off the side walls so balls stay reachable
      if (b.x < R) { b.x = R; b.vx = Math.abs(b.vx); }
      else if (b.x > w - R) { b.x = w - R; b.vx = -Math.abs(b.vx); }

      // A ball that drops fully past the bottom ends the run
      if (b.y - R > h) {
        const final = scoreRef.current;
        const beaten = final > bestRef.current && final > 0;
        setScore(final);
        setIsNewBest(beaten);
        if (final > bestRef.current) { bestRef.current = final; setBest(final); }
        // Beat the world record? Push it (anonymously) and update the corner.
        if (configuredRef.current && final > globalBestRef.current) {
          submitHighScore(GAME_ID, final).then(high => {
            if (high != null) { globalBestRef.current = high; setGlobalBest(high); }
          });
        }
        setPhase('over');
        return;
      }
    }

    draw();
    raf.current = requestAnimationFrame(tick);
  }, [draw]);

  const toss = useCallback((px, py) => {
    const list = balls.current;
    if (!list) return;
    const { w } = dims.current;
    // Catch the nearest already-launched ball in range and throw it back up.
    let target = null;
    let bestD = CATCH_RADIUS + R;
    for (const b of list) {
      if (!b.launched) continue;
      const d = Math.hypot(b.x - px, b.y - py);
      if (d < bestD) { bestD = d; target = b; }
    }
    if (!target) return;
    target.vy = TOSS_V - Math.random() * 1.2;
    // Nudge back toward center so it doesn't drift off-screen
    target.vx += (w / 2 - target.x) / w * 2 + (Math.random() - 0.5) * 0.8;
    target.vx = Math.max(-3.5, Math.min(3.5, target.vx));
    scoreRef.current += 1;
    setScore(scoreRef.current);
  }, []);

  const start = useCallback(() => {
    const { w, h } = dims.current;
    const now = performance.now();
    // Balls rest near the bottom-center, then launch one by one.
    balls.current = COLORS.map((color, i) => ({
      x: w / 2 + (i - 1) * 70,
      y: h - 70,
      vx: 0,
      vy: 0,
      color,
      trail: [],
      launched: false,
      launchAt: now + i * LAUNCH_GAP,
    }));
    lastTime.current = now;
    scoreRef.current = 0;
    setScore(0);
    setPhase('play');
  }, []);

  // Begin juggling as soon as the overlay mounts
  useEffect(() => { start(); }, [start]);

  // Pull the global record once on mount (degrades to 0 / hidden with no backend).
  useEffect(() => {
    fetchHighScore(GAME_ID).then(({ high, configured }) => {
      configuredRef.current = configured;
      globalBestRef.current = high;
      setGlobalBest(high);
    });
  }, []);

  // Keep the canvas matched to the viewport
  useEffect(() => {
    const onResize = () => { dims.current = { w: window.innerWidth, h: window.innerHeight }; };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Game loop
  useEffect(() => {
    if (phase !== 'play') return;
    lastTime.current = performance.now();
    draw();
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [phase, tick, draw]);

  // Pointer / touch input across the whole page
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || phase !== 'play') return;
    const onPointer = (e) => toss(e.clientX, e.clientY);
    const onTouch = (e) => {
      e.preventDefault();
      const t = e.touches[0] || e.changedTouches[0];
      if (t) toss(t.clientX, t.clientY);
    };
    canvas.addEventListener('mousedown', onPointer);
    canvas.addEventListener('touchstart', onTouch, { passive: false });
    return () => {
      canvas.removeEventListener('mousedown', onPointer);
      canvas.removeEventListener('touchstart', onTouch);
    };
  }, [phase, toss]);

  // Escape to close
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Transparent play surface over the live page */}
      <canvas
        ref={canvasRef}
        width={dims.current.w}
        height={dims.current.h}
        className="absolute inset-0 w-full h-full pointer-events-auto"
        style={{ touchAction: 'none', cursor: phase === 'play' ? 'pointer' : 'default' }}
      />

      {/* Score + hint, top-left */}
      {phase === 'play' && (
        <div className="absolute top-4 left-4 pointer-events-none select-none">
          <div className="text-2xl font-bold text-gray-900 drop-shadow-sm">{score}</div>
          {globalBest > 0 && (
            <div className="mt-0.5 text-xs font-semibold text-amber-500 drop-shadow-sm">★ World record {globalBest}</div>
          )}
          <div className="mt-0.5 text-xs text-gray-600 drop-shadow-sm">Tap to keep them up · Esc to stop</div>
        </div>
      )}

      {/* Close, top-right */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 pointer-events-auto rounded-full bg-white/70 backdrop-blur-md px-3 py-1 text-sm font-medium text-gray-700 shadow ring-1 ring-black/5 hover:bg-white/90 transition"
      >
        ✕ close
      </button>

      {/* Game-over toast */}
      {phase === 'over' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto rounded-2xl bg-white/80 backdrop-blur-md ring-1 ring-black/5 shadow-xl px-6 py-5 text-center">
            <h3 className="text-lg font-bold text-gray-900">Dropped it!</h3>
            {isNewBest ? (
              <p className="best-pop mt-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
                ★ New best! {score} catches
              </p>
            ) : (
              <>
                <p className="mt-2 text-sm text-gray-700">
                  You made <span className="font-semibold text-gray-900">{score} catches</span>
                </p>
                {best > 0 && <p className="text-xs text-gray-500">Best {best}</p>}
              </>
            )}
            {globalBest > 0 && (
              <p className="text-xs text-gray-500">
                {score >= globalBest ? '★ World record!' : `World record ${globalBest}`}
              </p>
            )}
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={start}
                className="cta-glow px-5 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold shadow-md transition active:translate-y-0.5"
              >
                Try again
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
