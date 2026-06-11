import React, { useEffect, useRef, useState } from 'react';

const GND_OFFSET = 30;
const DINO_X = 32;
const DINO_W = 18;
const DINO_H = 20;
const CAC_W = 11;
const GRAVITY = 0.55;
const JUMP_VEL = -10.5;
const INIT_SPEED = 3.0;

function drawFrame(ctx, s, W, H, groundY) {
  const night = s.score > 200 && Math.floor(s.score / 200) % 2 === 1;
  const bg = night ? '#1a1a2e' : '#fafaf7';
  const fg = night ? '#eee' : '#555';
  const dim = night ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // clouds
  ctx.fillStyle = dim;
  for (const cl of s.clouds) {
    ctx.beginPath();
    ctx.ellipse(cl.x, cl.y, cl.w, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cl.x - cl.w * 0.35, cl.y + 3, cl.w * 0.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cl.x + cl.w * 0.3, cl.y + 3, cl.w * 0.42, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // ground line
  ctx.strokeStyle = night ? '#555' : '#ccc';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(W, groundY);
  ctx.stroke();

  // dino — body
  ctx.fillStyle = fg;
  ctx.fillRect(DINO_X, s.dinoY + 5, DINO_W, DINO_H - 5);
  // head
  ctx.fillRect(DINO_X + DINO_W - 5, s.dinoY, 9, 11);
  // eye
  ctx.fillStyle = bg;
  ctx.fillRect(DINO_X + DINO_W + 1, s.dinoY + 2, 3, 3);
  ctx.fillStyle = '#333';
  ctx.fillRect(DINO_X + DINO_W + 2, s.dinoY + 3, 2, 2);
  // tail
  ctx.fillStyle = fg;
  ctx.fillRect(DINO_X - 6, s.dinoY + 9, 8, 5);
  // legs
  if (s.onGround) {
    const l = Math.floor(s.frame / 5) % 2;
    ctx.fillRect(DINO_X + 2,  s.dinoY + DINO_H, 5, l ? 8 : 4);
    ctx.fillRect(DINO_X + 10, s.dinoY + DINO_H, 5, l ? 4 : 8);
  } else {
    ctx.fillRect(DINO_X + 2,  s.dinoY + DINO_H, 5, 4);
    ctx.fillRect(DINO_X + 10, s.dinoY + DINO_H, 5, 4);
  }

  // cacti
  ctx.fillStyle = night ? '#5aaa6a' : '#4a7c35';
  for (const c of s.cacti) {
    const mid = c.x + Math.floor((CAC_W - 4) / 2);
    // trunk
    ctx.fillRect(mid, groundY - c.h, 4, c.h);
    // left arm + top
    ctx.fillRect(c.x, groundY - Math.round(c.h * 0.6), mid - c.x, 4);
    ctx.fillRect(c.x, groundY - Math.round(c.h * 0.6) - 7, 3, 7);
    // right arm + top
    const rx = mid + 4;
    ctx.fillRect(rx, groundY - Math.round(c.h * 0.5), c.x + CAC_W - rx, 4);
    ctx.fillRect(c.x + CAC_W - 3, groundY - Math.round(c.h * 0.5) - 6, 3, 6);
  }

  // score
  ctx.fillStyle = night ? 'rgba(255,255,255,0.3)' : '#bbb';
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(String(s.score).padStart(5, '0'), W - 8, 15);
}

function makeState(W, H, groundY) {
  return {
    dinoY: groundY - DINO_H,
    dinoVY: 0,
    onGround: true,
    cacti: [],
    clouds: [
      { x: W * 0.25, y: H * 0.18, w: 24 },
      { x: W * 0.7,  y: H * 0.12, w: 18 },
    ],
    speed: INIT_SPEED,
    frame: 0,
    score: 0,
    nextCactus: 110 + Math.random() * 60,
    dead: false,
  };
}

export default function DinoGame({ height = 220, onExit }) {
  const canvasRef = useRef(null);
  const jumpRef   = useRef(null);
  const [dead, setDead]           = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [runKey, setRunKey]       = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const W = canvas.parentElement?.clientWidth || canvas.offsetWidth || 300;
    const H = height;
    canvas.width  = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    const groundY = H - GND_OFFSET;

    const s = makeState(W, H, groundY);

    jumpRef.current = () => {
      if (s.onGround && !s.dead) {
        s.dinoVY = JUMP_VEL;
        s.onGround = false;
      }
    };

    let rafId;
    const tick = () => {
      s.frame++;
      s.speed = Math.min(INIT_SPEED + s.frame * 0.0022, 9);
      s.score = Math.floor(s.frame / 6);

      // physics
      s.dinoVY += GRAVITY;
      s.dinoY  += s.dinoVY;
      if (s.dinoY >= groundY - DINO_H) {
        s.dinoY  = groundY - DINO_H;
        s.dinoVY = 0;
        s.onGround = true;
      }

      // spawn cactus
      s.nextCactus--;
      if (s.nextCactus <= 0) {
        s.cacti.push({ x: W + 8, h: 24 + Math.random() * 18 });
        s.nextCactus = 68 + Math.random() * 88;
      }

      // move cacti
      for (const c of s.cacti) c.x -= s.speed;
      s.cacti = s.cacti.filter(c => c.x > -20);

      // move clouds (slow parallax)
      for (const cl of s.clouds) cl.x -= s.speed * 0.25;
      if (s.clouds[0].x < -50) {
        s.clouds.shift();
        s.clouds.push({ x: W + 20, y: H * (0.08 + Math.random() * 0.22), w: 16 + Math.random() * 22 });
      }

      // collision (tight inner hitbox)
      for (const c of s.cacti) {
        if (
          DINO_X + DINO_W - 3 > c.x + 2 &&
          DINO_X + 3 < c.x + CAC_W - 2 &&
          s.dinoY + DINO_H - 2 > groundY - c.h + 3
        ) {
          s.dead = true;
          setDead(true);
          setFinalScore(s.score);
          drawFrame(ctx, s, W, H, groundY);
          return;
        }
      }

      drawFrame(ctx, s, W, H, groundY);
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [runKey, height]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jumpRef.current?.();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="relative select-none" style={{ height }}>
      <canvas
        ref={canvasRef}
        className="block w-full cursor-pointer"
        style={{ height, touchAction: 'none' }}
        onClick={() => jumpRef.current?.()}
        onTouchStart={(e) => { e.preventDefault(); jumpRef.current?.(); }}
      />
      {dead && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-5 py-4 text-center border border-gray-200 shadow-sm">
            <p className="font-mono text-[10px] text-gray-400 mb-0.5 uppercase tracking-widest">Game Over</p>
            <p className="font-mono text-xl font-bold text-gray-800 mb-3">{String(finalScore).padStart(5, '0')}</p>
            <div className="flex gap-2 justify-center">
              <button
                className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                onClick={() => { setDead(false); setRunKey(k => k + 1); }}
              >
                Restart
              </button>
              <button
                className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider border border-gray-300 rounded hover:bg-gray-50 transition-colors text-gray-400"
                onClick={onExit}
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
