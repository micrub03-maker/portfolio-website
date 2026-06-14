import React, { useEffect, useRef, useState } from 'react';
import { fetchHighScore, submitHighScore } from '../lib/leaderboard';

const GAME_ID = 'dino';

// Engineering / blueprint mode (Konami code, see BlueprintMode.jsx) re-skins the
// whole site as a cyan-on-navy technical drawing. When it's on we swap the runner's
// field, ground, dino and cacti onto that same blueprint palette so it reads as part
// of the drawing rather than the stock white runner — mirroring the other games.
const isBlueprint = () => document.documentElement.classList.contains('blueprint-mode');
const BP_FIELD = '#0b2e63';
const BP_INK   = '#7dd3fc';

const GND_OFFSET = 30;
const DINO_X = 32;
const DINO_W = 18;
const DINO_H = 20;
const CAC_W = 11;
const GRAVITY = 0.55;
const JUMP_VEL = -10.5;
const INIT_SPEED = 3.0;

function drawFrame(ctx, s, W, H, groundY) {
  const blueprint = isBlueprint();
  // Engineering mode wins over the day/night cycle: flat navy field, cyan ink.
  const night = !blueprint && s.score > 200 && Math.floor(s.score / 200) % 2 === 1;
  const bg = blueprint ? BP_FIELD : night ? '#1a1a2e' : '#fafaf7';
  const fg = blueprint ? BP_INK  : night ? '#eee'     : '#555';
  const dim = blueprint ? 'rgba(125,211,252,0.12)' : night ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Drafting-paper grid — only in blueprint, scrolling left with the run so it
  // reads as motion over the page rather than a static backdrop.
  if (blueprint) {
    const GRID = 28;
    const gOff = (s.frame * 0.6) % GRID;
    ctx.strokeStyle = 'rgba(125,211,252,0.13)';
    ctx.lineWidth = 1;
    for (let gx = -gOff; gx <= W; gx += GRID) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
    }
    for (let gy = 0; gy <= H; gy += GRID) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
    }
  }

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
  ctx.strokeStyle = blueprint ? 'rgba(125,211,252,0.5)' : night ? '#555' : '#ccc';
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
  ctx.fillStyle = blueprint ? BP_INK : '#333';
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
  ctx.fillStyle = blueprint ? BP_INK : night ? '#5aaa6a' : '#4a7c35';
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

  // score — with the global record shown as "HI <best>", like the real runner.
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'right';
  if (s.globalBest > 0) {
    ctx.fillStyle = blueprint ? 'rgba(125,211,252,0.45)' : night ? 'rgba(255,255,255,0.22)' : '#cfcfcf';
    ctx.fillText(`HI ${String(s.globalBest).padStart(5, '0')}`, W - 70, 15);
  }
  ctx.fillStyle = blueprint ? 'rgba(125,211,252,0.7)' : night ? 'rgba(255,255,255,0.3)' : '#bbb';
  ctx.fillText(String(s.score).padStart(5, '0'), W - 8, 15);
  ctx.textAlign = 'left'; // restore default
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
    globalBest: 0, // synced from the ref each frame so drawFrame can show "HI <best>"
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
  // Global record to beat, shown as "HI <best>". Held in refs so the rAF loop can
  // read/update them without restarting; mirrored to state for the game-over panel.
  const [globalBest, setGlobalBest] = useState(0);
  const globalBestRef = useRef(0);
  const configuredRef = useRef(false);

  // Pull the global record once on mount (degrades to 0 / hidden with no backend).
  useEffect(() => {
    fetchHighScore(GAME_ID).then(({ high, configured }) => {
      configuredRef.current = configured;
      globalBestRef.current = high;
      setGlobalBest(high);
    });
  }, []);

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
      s.globalBest = globalBestRef.current;

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
          // Beat the world record? Push it (anonymously) and update the corner.
          if (configuredRef.current && s.score > globalBestRef.current) {
            submitHighScore(GAME_ID, s.score).then(high => {
              if (high != null) { globalBestRef.current = high; setGlobalBest(high); }
            });
          }
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

  // Match the game-over panel to the canvas: navy + cyan in engineering mode.
  const blueprint = isBlueprint();
  const panel = blueprint
    ? { box: 'bg-[#0b2e63]/85 border-sky-300/30', label: 'text-sky-300/70', score: 'text-sky-100',
        rec: 'text-sky-300/70', btn: 'border-sky-300/40 text-sky-100 hover:bg-sky-300/10', btnDim: 'text-sky-300/50' }
    : { box: 'bg-white/90 border-gray-200', label: 'text-gray-400', score: 'text-gray-800',
        rec: 'text-gray-400', btn: 'border-gray-300 text-gray-700 hover:bg-gray-50', btnDim: 'text-gray-400' };
  const beatRecord = globalBest > 0 && finalScore >= globalBest;

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
          <div className={`${panel.box} backdrop-blur-sm rounded-lg px-5 py-4 text-center border shadow-sm`}>
            <p className={`font-mono text-[10px] ${panel.label} mb-0.5 uppercase tracking-widest`}>Game Over</p>
            <p className={`font-mono text-xl font-bold ${panel.score} mb-1`}>{String(finalScore).padStart(5, '0')}</p>
            {globalBest > 0 && (
              <p className={`font-mono text-[10px] ${panel.rec} mb-3 uppercase tracking-widest`}>
                {beatRecord ? '★ World record!' : `HI ${String(globalBest).padStart(5, '0')}`}
              </p>
            )}
            {globalBest <= 0 && <div className="mb-3" />}
            <div className="flex gap-2 justify-center">
              <button
                className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider border rounded transition-colors ${panel.btn}`}
                onClick={() => { setDead(false); setRunKey(k => k + 1); }}
              >
                Restart
              </button>
              <button
                className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider border rounded transition-colors ${panel.btn} ${panel.btnDim}`}
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
