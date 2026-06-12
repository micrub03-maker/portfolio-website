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

export default function DoodleJump({ onClose, inline = false }) {
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

    // Mario blue sky
    ctx.fillStyle = '#5c94fc';
    ctx.fillRect(0, 0, W, H);

    // Clouds scrolling with height
    const cloudPositions = [[30,90],[180,55],[110,180],[265,125],[55,260],[220,310]];
    const cScroll = (s.score * 1.5) % H;
    ctx.fillStyle = 'white';
    for (const [cx, cy] of cloudPositions) {
      const sy = ((cy - cScroll) % H + H) % H;
      ctx.beginPath();
      ctx.ellipse(cx,      sy,      18, 10, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + 18, sy - 7,  14,  9, 0, 0, Math.PI * 2);
      ctx.ellipse(cx - 15, sy - 4,  12,  8, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Skate obstacles
    for (const p of s.platforms) {
      ctx.save();

      if (p.type === 'rail') {
        // Support posts
        ctx.fillStyle = '#475569';
        ctx.fillRect(p.x + 8,          p.y + 3, 4, 12);
        ctx.fillRect(p.x + PLAT_W - 12, p.y + 3, 4, 12);
        // Rail bar
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.roundRect(p.x, p.y, PLAT_W, 5, 2);
        ctx.fill();
        // Shine
        ctx.fillStyle = 'rgba(255,255,255,0.75)';
        ctx.fillRect(p.x + 4, p.y + 1, PLAT_W - 8, 1);
        // End caps
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(p.x + 3,          p.y + 2.5, 3, 0, Math.PI * 2);
        ctx.arc(p.x + PLAT_W - 3, p.y + 2.5, 3, 0, Math.PI * 2);
        ctx.fill();

      } else if (p.type === 'ledge') {
        // Concrete body
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(p.x, p.y, PLAT_W, PLAT_H + 6);
        // Waxed metal edge on top
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(p.x, p.y, PLAT_W, 3);
        // Shadow strip on bottom
        ctx.fillStyle = '#475569';
        ctx.fillRect(p.x, p.y + PLAT_H + 3, PLAT_W, 3);
        // Outline
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.strokeRect(p.x + 0.5, p.y + 0.5, PLAT_W - 1, PLAT_H + 5);

      } else {
        // Kicker — angled wedge below a flat plywood deck
        ctx.fillStyle = '#92400e';
        ctx.beginPath();
        ctx.moveTo(p.x,          p.y + PLAT_H);
        ctx.lineTo(p.x + PLAT_W, p.y + PLAT_H);
        ctx.lineTo(p.x + PLAT_W, p.y + PLAT_H + 16);
        ctx.lineTo(p.x,          p.y + PLAT_H + 3);
        ctx.closePath();
        ctx.fill();
        // Plywood deck
        ctx.fillStyle = '#c2a56b';
        ctx.fillRect(p.x, p.y, PLAT_W, PLAT_H);
        // Deck highlight
        ctx.fillStyle = '#d4b87a';
        ctx.fillRect(p.x, p.y, PLAT_W, 2);
        // Grip tape dots
        ctx.fillStyle = '#78583a';
        for (let gx = p.x + 6; gx < p.x + PLAT_W - 4; gx += 7) {
          ctx.fillRect(gx, p.y + 4, 2, 2);
        }
        // Outline
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1;
        ctx.strokeRect(p.x + 0.5, p.y + 0.5, PLAT_W - 1, PLAT_H - 1);
      }

      ctx.restore();
    }

    // Player
    ctx.save();
    const X = s.px;
    const Y = s.py;
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

    // Black shirt
    ctx.fillStyle = '#111827';
    ctx.beginPath(); ctx.roundRect(X + 7, Y + 14, 22, 13, 3); ctx.fill(); ctx.stroke();

    // Arms
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(X + 9,  Y + 17); ctx.lineTo(X + 0,  Y + 24); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(X + 27, Y + 17); ctx.lineTo(X + 36, Y + 24); ctx.stroke();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.5;

    // Red pants
    ctx.fillStyle = '#dc2626';
    ctx.beginPath(); ctx.roundRect(X + 9,  Y + 26, 8, 8, 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.roundRect(X + 21, Y + 26, 8, 8, 2); ctx.fill(); ctx.stroke();

    // Black shoes
    ctx.fillStyle = '#111827';
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

    // Score — Mario HUD style (white text, black shadow)
    ctx.font = 'bold 16px monospace';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#000';
    ctx.fillText(`★ ${Math.floor(s.score)}`, 12, 12);
    ctx.fillStyle = '#fff';
    ctx.fillText(`★ ${Math.floor(s.score)}`, 11, 11);
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
      className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: '#5c94fc', borderRadius: inline ? 12 : undefined }}
    >
      {/* Clouds */}
      <div className="absolute top-3 left-3 opacity-90">
        <div className="relative w-14 h-7">
          <div className="absolute rounded-full bg-white w-7 h-5 top-2 left-0" />
          <div className="absolute rounded-full bg-white w-10 h-7 top-0 left-3" />
          <div className="absolute rounded-full bg-white w-6 h-5 top-2 left-8" />
        </div>
      </div>
      <div className="absolute top-4 right-4 opacity-90">
        <div className="relative w-12 h-6">
          <div className="absolute rounded-full bg-white w-6 h-5 top-1 left-0" />
          <div className="absolute rounded-full bg-white w-8 h-6 top-0 left-2" />
          <div className="absolute rounded-full bg-white w-5 h-4 top-1 left-7" />
        </div>
      </div>

      {/* Brick strip top */}
      <div className="absolute top-0 left-0 right-0 h-5 flex" style={{ background: '#c0522a', borderBottom: '2px solid #7a2e0e' }}>
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="flex-1 h-full" style={{ borderRight: '2px solid #7a2e0e' }} />
        ))}
      </div>

      {phase === 'start' && (
        <>
          <div className="px-3 py-2 text-center" style={{ background: '#c0522a', border: '3px solid #7a2e0e', borderRadius: 4, boxShadow: '3px 3px 0 #7a2e0e' }}>
            <p className="font-bold text-white leading-tight" style={{ fontFamily: 'monospace', fontSize: 13, textShadow: '1px 1px 0 #7a2e0e' }}>HOW HIGH CAN</p>
            <p className="font-bold text-yellow-300 leading-tight" style={{ fontFamily: 'monospace', fontSize: 13, textShadow: '1px 1px 0 #7a2e0e' }}>YOU OLLIE?</p>
          </div>
          <p className="mt-4 text-white text-center px-4" style={{ fontFamily: 'monospace', fontSize: 10, textShadow: '1px 1px 0 #0008' }}>← → KEYS · TAP TO MOVE</p>
        </>
      )}

      {phase === 'over' && (
        <>
          <div className="px-3 py-2 text-center mb-2" style={{ background: '#c0522a', border: '3px solid #7a2e0e', borderRadius: 4, boxShadow: '3px 3px 0 #7a2e0e' }}>
            <p className="font-bold text-white" style={{ fontFamily: 'monospace', fontSize: 13, textShadow: '1px 1px 0 #7a2e0e' }}>GAME OVER</p>
          </div>
          <p className="text-white font-bold" style={{ fontFamily: 'monospace', fontSize: 11, textShadow: '1px 1px 0 #0008' }}>★ SCORE: {score}</p>
          {best > 0 && <p className="text-yellow-300" style={{ fontFamily: 'monospace', fontSize: 10, textShadow: '1px 1px 0 #0008' }}>BEST: {best}</p>}
        </>
      )}

      <button
        onClick={start}
        className="mt-3 font-bold text-white transition active:translate-y-0.5"
        style={{ fontFamily: 'monospace', fontSize: 12, background: '#e8220a', border: '3px solid #7a0a00', borderRadius: 4, boxShadow: '3px 3px 0 #7a0a00', textShadow: '1px 1px 0 #7a0a00', padding: '6px 18px' }}
      >
        {phase === 'over' ? '▶ TRY AGAIN' : '▶ START'}
      </button>

      {/* Brick strip bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-5 flex" style={{ background: '#c0522a', borderTop: '2px solid #7a2e0e' }}>
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="flex-1 h-full" style={{ borderRight: '2px solid #7a2e0e' }} />
        ))}
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
