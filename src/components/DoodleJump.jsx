import React, { useCallback, useEffect, useRef, useState } from 'react';

const W = 340;
const H = 480;
const PLAT_W = 68;
const PLAT_H = 10;
const P_W = 38;
const P_H = 36;
const GRAVITY = 0.35;
const JUMP_V = -11.5;
const MOVE_SPEED = 3.8;
const SCROLL_LINE = H / 3;
const GAP_MIN = 55;
const GAP_MAX = 88;
const TARGET_PLATS = 12;

const PLAT_TYPES = ['rail', 'ledge', 'kicker'];

// Decorative twinkling stars for the overlay sky (near the purple top)
const STARS = [
  { left: '14%', top: '10%', s: 3, d: '0s' },
  { left: '32%', top: '18%', s: 2, d: '0.4s' },
  { left: '68%', top: '8%',  s: 3, d: '0.8s' },
  { left: '82%', top: '20%', s: 2, d: '0.2s' },
  { left: '50%', top: '6%',  s: 2, d: '1.1s' },
  { left: '24%', top: '28%', s: 2, d: '0.6s' },
];

function randPlat(y) {
  return {
    x: Math.random() * (W - PLAT_W),
    y,
    type: PLAT_TYPES[Math.floor(Math.random() * PLAT_TYPES.length)],
  };
}

function initPlatforms() {
  const plats = [{ x: W / 2 - PLAT_W / 2, y: H - 80, type: 'ledge' }];
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

// Shared skater sprite — drawn at top-left (X, Y) in a 38×42 box.
function drawSkater(ctx, X, Y) {
  ctx.save();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';

  // Head
  ctx.fillStyle = '#f5c5a0';
  ctx.beginPath(); ctx.arc(X + 19, Y + 8, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

  // Brown hair cap
  ctx.fillStyle = '#7B4F2E';
  ctx.beginPath(); ctx.arc(X + 19, Y + 5, 6.5, Math.PI, 0, false); ctx.closePath(); ctx.fill(); ctx.stroke();

  // Eyes
  ctx.fillStyle = '#2d1b00';
  ctx.beginPath();
  ctx.arc(X + 16, Y + 7, 1.5, 0, Math.PI * 2);
  ctx.arc(X + 22, Y + 7, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Blue shirt
  ctx.fillStyle = '#3b6fd4';
  ctx.beginPath(); ctx.roundRect(X + 7, Y + 14, 22, 13, 3); ctx.fill(); ctx.stroke();

  // Arms
  ctx.strokeStyle = '#3b6fd4';
  ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(X + 9,  Y + 17); ctx.lineTo(X + 0,  Y + 24); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(X + 27, Y + 17); ctx.lineTo(X + 36, Y + 24); ctx.stroke();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1.5;

  // Cream pants
  ctx.fillStyle = '#FFFDD0';
  ctx.beginPath(); ctx.roundRect(X + 9,  Y + 26, 8, 8, 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.roundRect(X + 21, Y + 26, 8, 8, 2); ctx.fill(); ctx.stroke();

  // Navy shoes
  ctx.fillStyle = '#1e293b';
  ctx.beginPath(); ctx.roundRect(X + 6,  Y + 32, 11, 3, 1); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.roundRect(X + 21, Y + 32, 11, 3, 1); ctx.fill(); ctx.stroke();

  // Skateboard deck
  ctx.fillStyle = '#c8a055';
  ctx.beginPath(); ctx.roundRect(X - 2, Y + 34, P_W + 4, 5, 3); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#111827';
  ctx.fillRect(X, Y + 34, P_W, 2);

  // Trucks
  ctx.fillStyle = '#9ca3af';
  ctx.fillRect(X + 2,        Y + 38, 9, 2);
  ctx.fillRect(X + P_W - 11, Y + 38, 9, 2);

  // Wheels
  ctx.fillStyle = '#374151';
  ctx.beginPath(); ctx.arc(X + 6,        Y + 41, 3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(X + P_W - 6,  Y + 41, 3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

  ctx.restore();
}

// Static skater sprite for the overlay — drawn in a 48×52 box (skater at 4,3).
function SkaterSprite({ bailed = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);
    drawSkater(ctx, 4, 3);
  }, []);
  return (
    <canvas
      ref={ref}
      width={48}
      height={52}
      className={`w-full h-full${bailed ? ' rotate-180' : ''}`}
    />
  );
}

export default function DoodleJump({ onClose, inline = false }) {
  const canvasRef = useRef(null);
  const g = useRef(null);
  const raf = useRef(null);
  const keys = useRef({ left: false, right: false });
  const gamma = useRef(0);
  const [phase, setPhase] = useState('start');
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [isNewBest, setIsNewBest] = useState(false);
  const [trackFill, setTrackFill] = useState(0);
  const bestRef = useRef(0);
  const [tiltEnabled, setTiltEnabled] = useState(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const s = g.current;

    ctx.clearRect(0, 0, W, H);

    // Sunset sky — site gradient #551764 → #FFA07A
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#551764');
    sky.addColorStop(1, '#FFA07A');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // Soft translucent cloud-glow blobs scrolling with height
    const cloudPositions = [[30,90],[180,55],[110,180],[265,125],[55,260],[220,310]];
    const cScroll = (s.score * 1.5) % H;
    for (const [cx, cy] of cloudPositions) {
      const sy = ((cy - cScroll) % H + H) % H;
      const glow = ctx.createRadialGradient(cx, sy, 0, cx, sy, 34);
      glow.addColorStop(0, 'rgba(255,255,255,0.32)');
      glow.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.ellipse(cx, sy, 34, 20, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Skate obstacles — frosted-glass-at-sunset family.
    // Shared rule: translucent fill, soft ring, one bright top edge
    // (the grindable surface), and a soft blue underglow.
    const BLUE = '#84A4FC';
    for (const p of s.platforms) {
      ctx.save();

      // Soft blue underglow shared by every platform
      ctx.shadowColor = 'rgba(59,130,246,0.5)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 2;

      if (p.type === 'rail') {
        // Translucent posts
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        ctx.fillRect(p.x + 8,           p.y + 3, 3, 12);
        ctx.fillRect(p.x + PLAT_W - 11, p.y + 3, 3, 12);
        // Frosted glass bar with rounded caps
        ctx.fillStyle = 'rgba(255,255,255,0.62)';
        ctx.beginPath();
        ctx.roundRect(p.x, p.y, PLAT_W, 6, 3);
        ctx.fill();
        ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
        // Bright blue grind highlight along the top
        ctx.fillStyle = BLUE;
        ctx.beginPath();
        ctx.roundRect(p.x + 3, p.y + 0.5, PLAT_W - 6, 1.5, 1);
        ctx.fill();
        // Soft ring
        ctx.strokeStyle = 'rgba(0,0,0,0.06)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(p.x + 0.5, p.y + 0.5, PLAT_W - 1, 5, 3);
        ctx.stroke();

      } else if (p.type === 'ledge') {
        // Frosted translucent body
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.beginPath();
        ctx.roundRect(p.x, p.y, PLAT_W, PLAT_H + 6, 4);
        ctx.fill();
        ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
        // Waxed coping = blue top edge (shared highlight rule)
        ctx.fillStyle = BLUE;
        ctx.beginPath();
        ctx.roundRect(p.x, p.y, PLAT_W, 3, 2);
        ctx.fill();
        // Soft ring
        ctx.strokeStyle = 'rgba(0,0,0,0.06)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(p.x + 0.5, p.y + 0.5, PLAT_W - 1, PLAT_H + 5, 4);
        ctx.stroke();

      } else {
        // Kicker — warm sunset wedge under a flat deck (slope = identity)
        const warm = ctx.createLinearGradient(p.x, p.y, p.x, p.y + PLAT_H + 16);
        warm.addColorStop(0, 'rgba(255,215,0,0.55)');   // gold deck side
        warm.addColorStop(1, 'rgba(255,160,122,0.45)'); // salmon base
        ctx.fillStyle = warm;
        ctx.beginPath();
        ctx.moveTo(p.x,          p.y + PLAT_H);
        ctx.lineTo(p.x + PLAT_W, p.y + PLAT_H);
        ctx.lineTo(p.x + PLAT_W, p.y + PLAT_H + 16);
        ctx.lineTo(p.x,          p.y + PLAT_H + 3);
        ctx.closePath();
        ctx.fill();
        // Frosted deck
        ctx.fillStyle = 'rgba(255,253,208,0.6)'; // cream
        ctx.beginPath();
        ctx.roundRect(p.x, p.y, PLAT_W, PLAT_H, 3);
        ctx.fill();
        ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
        // Faint gold grip line on the deck surface
        ctx.fillStyle = 'rgba(255,215,0,0.85)';
        for (let gx = p.x + 6; gx < p.x + PLAT_W - 4; gx += 7) {
          ctx.fillRect(gx, p.y + 4, 2, 2);
        }
        // Soft ring
        ctx.strokeStyle = 'rgba(0,0,0,0.06)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(p.x + 0.5, p.y + 0.5, PLAT_W - 1, PLAT_H - 1, 3);
        ctx.stroke();
      }

      ctx.restore();
    }

    // Player
    drawSkater(ctx, s.px, s.py);

    // Score — Lexend, white with soft shadow
    ctx.font = '600 18px Lexend, sans-serif';
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 1;
    ctx.fillStyle = '#fff';
    ctx.fillText(`${Math.floor(s.score)}`, 14, 12);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  }, []);

  const tick = useCallback(() => {
    const s = g.current;
    if (!s || !s.alive) return;

    // Horizontal
    let dx = 0;
    if (keys.current.left) dx -= MOVE_SPEED;
    if (keys.current.right) dx += MOVE_SPEED;
    if (Math.abs(gamma.current) > 4) dx += gamma.current * 0.22;
    const newPx = s.px + dx;
    if (newPx > W) s.px = -P_W;
    else if (newPx < -P_W) s.px = W;
    else s.px = newPx;

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
      const beaten = final > bestRef.current && final > 0;
      setScore(final);
      setIsNewBest(beaten);
      if (final > bestRef.current) { bestRef.current = final; setBest(final); }
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
    } else if (typeof DeviceOrientationEvent !== 'undefined' && navigator.maxTouchPoints > 0) {
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

  // Altitude track — animate the marker up to this run's height on game over
  useEffect(() => {
    if (phase !== 'over') { setTrackFill(0); return; }
    const target = best > 0 ? Math.min(score / best, 1) : (score > 0 ? 1 : 0);
    setTrackFill(0);
    let id2;
    const id1 = requestAnimationFrame(() => { id2 = requestAnimationFrame(() => setTrackFill(target)); });
    return () => { cancelAnimationFrame(id1); cancelAnimationFrame(id2); };
  }, [phase, score, best]);

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

  const overlay = phase !== 'play' && (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden p-5"
      style={{
        background: 'linear-gradient(180deg, #551764 0%, #FFA07A 100%)',
        borderRadius: inline ? 12 : 16,
      }}
    >
      {/* Living sunset — drifting glow + blinking stars */}
      <div className="widget-gradient" />
      {STARS.map((st, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white animate-blink"
          style={{ left: st.left, top: st.top, width: st.s, height: st.s, animationDelay: st.d, opacity: 0.8 }}
        />
      ))}

      {/* Skater placed exactly where the game spawns him, for a seamless start */}
      <div
        className="absolute z-10"
        style={{
          left: `${((W / 2 - P_W / 2 - 4) / W) * 100}%`,
          top: `${((H - 130 - 3) / H) * 100}%`,
          width: `${(48 / W) * 100}%`,
          height: `${(52 / H) * 100}%`,
        }}
      >
        <SkaterSprite bailed={phase === 'over'} />
        {phase === 'over' && (
          <span className="best-pop absolute left-full top-1/2 -translate-y-1/2 ml-1 whitespace-nowrap rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-bold text-rose-600 shadow-md ring-1 ring-black/5 -rotate-6">
            Bailed!
          </span>
        )}
      </div>

      {/* Frosted glass panel */}
      <div className="relative z-10 rounded-2xl bg-white/70 backdrop-blur-md ring-1 ring-black/5 shadow-xl px-6 py-5 text-center max-w-[85%]">
        {/* Altitude track (game over only) */}
        {phase === 'over' && (
          <div className="absolute left-2.5 top-4 bottom-4 w-1 rounded-full bg-black/10 overflow-hidden">
            <div
              className="absolute bottom-0 left-0 w-full rounded-full transition-[height] duration-700 ease-out"
              style={{
                height: `${trackFill * 100}%`,
                background: 'linear-gradient(180deg, #84A4FC 0%, #FFD700 100%)',
              }}
            />
          </div>
        )}

        {phase === 'start' && (
          <>
            <h3 className="text-lg font-bold text-gray-900 leading-tight">How high can you ollie?</h3>
            <p className="mt-1.5 text-xs text-gray-500 flex items-center justify-center gap-1.5">
              <span className="nudge-left inline-block">←</span>
              <span className="nudge-right inline-block">→</span>
              keys · tap to move
            </p>
          </>
        )}

        {phase === 'over' && (
          <>
            <h3 className="text-lg font-bold text-gray-900">Game over</h3>
            {isNewBest ? (
              <p className="best-pop mt-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
                ★ New best! {score} ft
              </p>
            ) : (
              <>
                <p className="mt-2 text-sm text-gray-700">You reached <span className="font-semibold text-gray-900">{score} ft</span></p>
                {best > 0 && <p className="text-xs text-gray-500">Best {best} ft</p>}
              </>
            )}
          </>
        )}

        <div className="mt-4">
          <button
            onClick={start}
            className="cta-glow px-5 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold shadow-md transition active:translate-y-0.5"
          >
            {phase === 'over' ? 'Try again' : 'Start'}
          </button>
        </div>
      </div>
    </div>
  );

  if (inline) {
    return (
      <div className="relative w-full rounded-xl overflow-hidden" style={{ aspectRatio: `${W}/${H}` }}>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="absolute inset-0 w-full h-full"
          style={{ touchAction: 'none' }}
        />
        {overlay}
        <button
          onClick={onClose}
          className="absolute top-1 right-1 z-10 text-white/80 hover:text-white leading-none"
          style={{ fontFamily: 'monospace', fontSize: 10, background: 'rgba(0,0,0,0.4)', borderRadius: 3, padding: '2px 5px' }}
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-7 right-0 text-white/80 hover:text-white text-sm font-medium">
          ✕ close
        </button>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="block rounded-2xl shadow-2xl"
          style={{ touchAction: 'none' }}
        />
        {overlay}
      </div>
    </div>
  );
}
