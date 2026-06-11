import React, { useCallback, useEffect, useRef, useState } from 'react';

const W = 340;
const H = 480;
const PLAT_W = 68;
const PLAT_H = 10;
const P_W = 38;
const P_H = 28;
const GRAVITY = 0.35;
const JUMP_V = -11.5;
const MOVE_SPEED = 3.8;
const SCROLL_LINE = H / 3;
const GAP_MIN = 55;
const GAP_MAX = 88;
const TARGET_PLATS = 12;

function randPlat(y) {
  return { x: Math.random() * (W - PLAT_W), y };
}

function initPlatforms() {
  const plats = [{ x: W / 2 - PLAT_W / 2, y: H - 80 }];
  let y = H - 80;
  while (plats.length < TARGET_PLATS) {
    y -= GAP_MIN + Math.random() * (GAP_MAX - GAP_MIN);
    plats.push(randPlat(y));
  }
  return plats;
}

function initGame() {
  return {
    px: W / 2 - P_W / 2,
    py: H - 130,
    vy: JUMP_V,
    score: 0,
    platforms: initPlatforms(),
    alive: true,
  };
}

export default function DoodleJump({ onClose }) {
  const canvasRef = useRef(null);
  const g = useRef(null);
  const raf = useRef(null);
  const keys = useRef({ left: false, right: false });
  const gamma = useRef(0);
  const [phase, setPhase] = useState('start');
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [tiltEnabled, setTiltEnabled] = useState(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const s = g.current;

    ctx.clearRect(0, 0, W, H);

    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#e0f2fe');
    grad.addColorStop(1, '#f0fdf4');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Platforms
    for (const p of s.platforms) {
      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.roundRect(p.x, p.y, PLAT_W, PLAT_H, 5);
      ctx.fill();
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(p.x + 4, p.y, PLAT_W - 8, 3);
    }

    // Player body
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.roundRect(s.px, s.py, P_W, P_H, 7);
    ctx.fill();

    // Eyes
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.ellipse(s.px + 10, s.py + 11, 5, 6, 0, 0, Math.PI * 2);
    ctx.ellipse(s.px + 28, s.py + 11, 5, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.arc(s.px + 11, s.py + 11, 2.5, 0, Math.PI * 2);
    ctx.arc(s.px + 29, s.py + 11, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Score
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.textBaseline = 'top';
    ctx.fillText(`${Math.floor(s.score)}`, 10, 10);
  }, []);

  const tick = useCallback(() => {
    const s = g.current;
    if (!s || !s.alive) return;

    // Horizontal
    let dx = 0;
    if (keys.current.left) dx -= MOVE_SPEED;
    if (keys.current.right) dx += MOVE_SPEED;
    dx += gamma.current * 0.22;
    s.px = ((s.px + dx) + W + P_W) % (W + P_W) - P_W;

    // Vertical
    s.vy += GRAVITY;
    s.py += s.vy;

    // Platform bounce (only while falling)
    if (s.vy > 0) {
      for (const p of s.platforms) {
        const prevBottom = s.py + P_H - s.vy;
        if (
          prevBottom <= p.y + 2 &&
          s.py + P_H >= p.y &&
          s.px + P_W > p.x + 4 &&
          s.px < p.x + PLAT_W - 4
        ) {
          s.vy = JUMP_V;
          break;
        }
      }
    }

    // Scroll camera up when player crosses threshold
    if (s.py < SCROLL_LINE) {
      const shift = SCROLL_LINE - s.py;
      s.py = SCROLL_LINE;
      s.score += shift * 0.12;
      for (const p of s.platforms) p.y += shift;

      s.platforms = s.platforms.filter(p => p.y < H + 20);

      while (s.platforms.length < TARGET_PLATS) {
        const topY = Math.min(...s.platforms.map(p => p.y));
        s.platforms.push(randPlat(topY - GAP_MIN - Math.random() * (GAP_MAX - GAP_MIN)));
      }
    }

    // Death
    if (s.py > H) {
      s.alive = false;
      const final = Math.floor(s.score);
      setScore(final);
      setBest(prev => Math.max(prev, final));
      setPhase('over');
      return;
    }

    draw();
    raf.current = requestAnimationFrame(tick);
  }, [draw]);

  const start = useCallback(async () => {
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function'
    ) {
      try {
        const perm = await DeviceOrientationEvent.requestPermission();
        if (perm === 'granted') setTiltEnabled(true);
      } catch {}
    } else if (typeof DeviceOrientationEvent !== 'undefined') {
      setTiltEnabled(true);
    }
    g.current = initGame();
    setPhase('play');
  }, []);

  // Game loop
  useEffect(() => {
    if (phase !== 'play') return;
    draw();
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [phase, tick, draw]);

  // Keyboard
  useEffect(() => {
    const kd = (e) => {
      if (e.key === 'ArrowLeft') { keys.current.left = true; e.preventDefault(); }
      if (e.key === 'ArrowRight') { keys.current.right = true; e.preventDefault(); }
      if (e.key === 'Escape') onClose();
    };
    const ku = (e) => {
      if (e.key === 'ArrowLeft') keys.current.left = false;
      if (e.key === 'ArrowRight') keys.current.right = false;
    };
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    return () => {
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
    };
  }, [onClose]);

  // Touch controls on canvas (left/right half)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onStart = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      keys.current.left = x < W / 2;
      keys.current.right = x >= W / 2;
    };
    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      keys.current.left = x < W / 2;
      keys.current.right = x >= W / 2;
    };
    const onEnd = () => {
      keys.current.left = false;
      keys.current.right = false;
    };
    canvas.addEventListener('touchstart', onStart, { passive: true });
    canvas.addEventListener('touchmove', onMove, { passive: true });
    canvas.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      canvas.removeEventListener('touchstart', onStart);
      canvas.removeEventListener('touchmove', onMove);
      canvas.removeEventListener('touchend', onEnd);
    };
  }, [phase]);

  // Tilt
  useEffect(() => {
    if (!tiltEnabled) return;
    const handler = (e) => { gamma.current = e.gamma ?? 0; };
    window.addEventListener('deviceorientation', handler);
    return () => window.removeEventListener('deviceorientation', handler);
  }, [tiltEnabled]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative" onClick={e => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-7 right-0 text-white/80 hover:text-white text-sm font-medium"
        >
          ✕ close
        </button>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="block rounded-2xl shadow-2xl"
          style={{ touchAction: 'none' }}
        />
        {phase !== 'play' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-white/85 backdrop-blur-sm">
            {phase === 'over' && (
              <>
                <p className="text-2xl font-bold text-gray-800 mb-1">Game Over!</p>
                <p className="text-gray-600 mb-1">Score: <span className="font-semibold">{score}</span></p>
                {best > 0 && <p className="text-gray-400 text-sm mb-5">Best: {best}</p>}
              </>
            )}
            {phase === 'start' && (
              <>
                <p className="text-3xl font-bold text-gray-800 mb-2">Doodle Jump</p>
                <p className="text-gray-500 text-sm mb-1 text-center px-6">← → keys to move</p>
                <p className="text-gray-400 text-xs mb-6 text-center px-6">tap left/right on mobile · tilt if allowed</p>
              </>
            )}
            <button
              onClick={start}
              className="px-8 py-3 bg-green-400 hover:bg-green-500 text-white font-semibold rounded-full shadow-md transition"
            >
              {phase === 'over' ? 'Try Again' : 'Start'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
