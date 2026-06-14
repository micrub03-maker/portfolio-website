import React, { useCallback, useEffect, useRef, useState } from 'react';
import { fetchHighScore, submitHighScore } from '../lib/leaderboard';

const GAME_ID = 'doodlejump';

const W = 340;
const H = 480;
const PLAT_W = 68;
const PLAT_H = 10;
const P_W = 38;
const P_H = 36;
const ENEMY_W = 30;
const ENEMY_H = 30;
const GRAVITY = 0.35;
const JUMP_V = -11.5;
const MOVE_SPEED = 3.8;
const SCROLL_LINE = H / 3;
const GAP_MIN = 55;
const GAP_MAX = 88;
const TARGET_PLATS = 12;

const PLAT_TYPES = ['rail', 'ledge', 'kicker'];

// Engineering / blueprint mode (Konami code, see BlueprintMode.jsx) re-skins the
// whole site as a cyan-on-navy technical drawing. When it's on we swap the game's
// field, platforms and skater onto that same blueprint palette so it reads as part
// of the drawing rather than a colourful pop-out — mirroring BreakoutGame.
const isBlueprint = () => document.documentElement.classList.contains('blueprint-mode');

// The game now lives behind the DROP (skate committee) logo, so the normal skin is
// built around it: a dark night field with the hand-drawn DROP mark as a watermark
// and white line-art obstacles. Cached module-level so the canvas can draw it.
let _dropLogo = null;
function dropLogoImg() {
  if (!_dropLogo) {
    _dropLogo = new Image();
    _dropLogo.src = '/images/DROP-logo-white.png';
  }
  return _dropLogo;
}

// Decorative twinkling stars for the overlay night sky
const STARS = [
  { left: '14%', top: '10%', s: 3, d: '0s' },
  { left: '32%', top: '18%', s: 2, d: '0.4s' },
  { left: '68%', top: '8%',  s: 3, d: '0.8s' },
  { left: '82%', top: '20%', s: 2, d: '0.2s' },
  { left: '50%', top: '6%',  s: 2, d: '1.1s' },
  { left: '24%', top: '28%', s: 2, d: '0.6s' },
];

// Platforms gain behaviour the higher you climb. `solid` always bounces; `moving`
// slides side to side (a rolling rail); `crumble` (a sketchy curb) gives one bounce
// then breaks away. Probabilities ramp with score and are capped so it stays fair.
function randPlat(y, { score = 0, solid = false } = {}) {
  const p = {
    x: Math.random() * (W - PLAT_W),
    y,
    type: PLAT_TYPES[Math.floor(Math.random() * PLAT_TYPES.length)],
    behavior: 'solid',
  };
  if (solid) return p;

  const movingChance = Math.min(0.12 + score / 4500, 0.30);
  const crumbleChance = Math.min(0.10 + score / 5500, 0.24);
  const r = Math.random();
  if (r < movingChance) {
    p.behavior = 'moving';
    p.type = 'rail';
    p.vx = (Math.random() < 0.5 ? -1 : 1) * (0.7 + Math.random() * 1.0);
  } else if (r < movingChance + crumbleChance) {
    p.behavior = 'crumble';
    p.type = 'ledge';
    p.broken = false;
  }
  return p;
}

// Floating cone hazard. Bounce on top to squash it; touch its side and you bail.
// Spawns only past an early grace height, with a chance that ramps with score.
function maybeSpawnEnemy(s, y) {
  if (s.score < 250) return;
  const chance = Math.min(0.10 + s.score / 6000, 0.24);
  if (Math.random() >= chance) return;
  s.enemies.push({
    x: Math.random() * (W - ENEMY_W),
    y: y - 24,
    vx: (Math.random() < 0.5 ? -1 : 1) * (0.5 + Math.random() * 1.1),
    alive: true,
  });
}

function initPlatforms() {
  const plats = [{ x: W / 2 - PLAT_W / 2, y: H - 80, type: 'ledge', behavior: 'solid' }];
  let y = H - 80;
  while (plats.length < TARGET_PLATS) {
    y -= GAP_MIN + Math.random() * (GAP_MAX - GAP_MIN);
    // Keep the first few steps solid so the launch is never a trap.
    plats.push(randPlat(y, { solid: plats.length < 4 }));
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
    enemies: [],
    alive: true,
  };
}

// Shared skater sprite — drawn at top-left (X, Y) in a 38×42 box. Pass `mono`
// ({ ink, fill }) to render him as a single-colour line drawing for blueprint mode.
function drawSkater(ctx, X, Y, mono) {
  if (mono) { drawSkaterMono(ctx, X, Y, mono); return; }
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

// Same skater geometry, drawn as a cyan line drawing (hollow fills) so he sits
// inside the blueprint without colour. `ink` = line colour, `fill` = field colour.
function drawSkaterMono(ctx, X, Y, { ink, fill }) {
  ctx.save();
  ctx.strokeStyle = ink;
  ctx.fillStyle = fill;
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  const outline = (path) => { path(); ctx.fill(); ctx.stroke(); };

  // Head + hair cap
  outline(() => { ctx.beginPath(); ctx.arc(X + 19, Y + 8, 6, 0, Math.PI * 2); });
  outline(() => { ctx.beginPath(); ctx.arc(X + 19, Y + 5, 6.5, Math.PI, 0, false); ctx.closePath(); });

  // Eyes — solid ink dots
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.arc(X + 16, Y + 7, 1.2, 0, Math.PI * 2);
  ctx.arc(X + 22, Y + 7, 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = fill;

  // Shirt
  outline(() => { ctx.beginPath(); ctx.roundRect(X + 7, Y + 14, 22, 13, 3); });

  // Arms
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(X + 9,  Y + 17); ctx.lineTo(X + 0,  Y + 24); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(X + 27, Y + 17); ctx.lineTo(X + 36, Y + 24); ctx.stroke();
  ctx.lineWidth = 1.5;

  // Pants + shoes
  outline(() => { ctx.beginPath(); ctx.roundRect(X + 9,  Y + 26, 8, 8, 2); });
  outline(() => { ctx.beginPath(); ctx.roundRect(X + 21, Y + 26, 8, 8, 2); });
  outline(() => { ctx.beginPath(); ctx.roundRect(X + 6,  Y + 32, 11, 3, 1); });
  outline(() => { ctx.beginPath(); ctx.roundRect(X + 21, Y + 32, 11, 3, 1); });

  // Skateboard deck + wheels
  outline(() => { ctx.beginPath(); ctx.roundRect(X - 2, Y + 34, P_W + 4, 5, 3); });
  outline(() => { ctx.beginPath(); ctx.arc(X + 6,       Y + 41, 3, 0, Math.PI * 2); });
  outline(() => { ctx.beginPath(); ctx.arc(X + P_W - 6, Y + 41, 3, 0, Math.PI * 2); });

  ctx.restore();
}

// Traffic-cone hazard. Orange with a reflective stripe in the DROP skin, cyan
// line-art in blueprint so it sits inside the drawing like everything else.
function drawCone(ctx, e, blueprint) {
  const cx = e.x + ENEMY_W / 2;
  const baseY = e.y + ENEMY_H;
  ctx.save();
  ctx.lineWidth = 1.5;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = blueprint ? '#7dd3fc' : '#7c2d12';
  ctx.fillStyle = blueprint ? 'rgba(11,46,99,0.6)' : '#fb923c';

  // Base
  ctx.beginPath();
  ctx.roundRect(e.x + 1, baseY - 5, ENEMY_W - 2, 5, 2);
  ctx.fill(); ctx.stroke();

  // Cone body
  ctx.beginPath();
  ctx.moveTo(cx, e.y + 1);
  ctx.lineTo(cx + ENEMY_W * 0.30, baseY - 4);
  ctx.lineTo(cx - ENEMY_W * 0.30, baseY - 4);
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  // Reflective stripe
  ctx.fillStyle = blueprint ? '#7dd3fc' : '#ffffff';
  ctx.beginPath();
  ctx.moveTo(cx - ENEMY_W * 0.17, e.y + ENEMY_H * 0.40);
  ctx.lineTo(cx + ENEMY_W * 0.17, e.y + ENEMY_H * 0.40);
  ctx.lineTo(cx + ENEMY_W * 0.22, e.y + ENEMY_H * 0.55);
  ctx.lineTo(cx - ENEMY_W * 0.22, e.y + ENEMY_H * 0.55);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

// Static skater sprite for the overlay — drawn in a 48×52 box (skater at 4,3).
function SkaterSprite({ bailed = false, mono }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);
    drawSkater(ctx, 4, 3, mono);
  }, [mono]);
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
  // Global record to beat, shown in the corner. Mirrored into a ref so the canvas
  // draw loop (deps []) can read it without re-subscribing.
  const [globalBest, setGlobalBest] = useState(0);
  const globalBestRef = useRef(0);
  const configuredRef = useRef(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const s = g.current;

    ctx.clearRect(0, 0, W, H);

    const blueprint = isBlueprint();

    // Field. Engineering mode = flat blueprint navy; normal = dark DROP night.
    if (blueprint) {
      ctx.fillStyle = '#0b2e63';
      ctx.fillRect(0, 0, W, H);
    } else {
      const night = ctx.createLinearGradient(0, 0, 0, H);
      night.addColorStop(0, '#15171c');
      night.addColorStop(1, '#2b2f37');
      ctx.fillStyle = night;
      ctx.fillRect(0, 0, W, H);
    }

    // Scrolling graph-paper grid — gives the climb its sense of motion (replaces
    // the old sunset clouds) and reads as drafting paper in both skins.
    const GRID = 34;
    const gOff = (s.score * 1.5) % GRID;
    ctx.strokeStyle = blueprint ? 'rgba(125,211,252,0.13)' : 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let gx = 0; gx <= W; gx += GRID) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
    }
    for (let gy = -GRID + gOff; gy <= H; gy += GRID) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
    }

    // DROP logo watermark, centred behind the play field
    const logo = dropLogoImg();
    if (logo.complete && logo.naturalWidth) {
      const lw = W * 0.72;
      const lh = lw * (logo.naturalHeight / logo.naturalWidth);
      ctx.globalAlpha = blueprint ? 0.20 : 0.16;
      ctx.drawImage(logo, (W - lw) / 2, H * 0.40 - lh / 2, lw, lh);
      ctx.globalAlpha = 1;
    }

    // Skate obstacles as line-art so they sit inside the drawing. One accent for
    // both skins — cyan ink for blueprint, white chalk for DROP — over the shared
    // rule: translucent fill, soft ring, one bright top edge (the grindable surface).
    const PT = blueprint
      ? { glow: 'rgba(125,211,252,0.45)', fill: 'rgba(125,211,252,0.12)', edge: '#7dd3fc', ring: 'rgba(125,211,252,0.55)' }
      : { glow: 'rgba(255,255,255,0.28)', fill: 'rgba(255,255,255,0.14)', edge: '#ffffff', ring: 'rgba(255,255,255,0.5)' };
    for (const p of s.platforms) {
      ctx.save();

      // A breaking curb fades out as it tumbles away after its one bounce.
      if (p.broken) ctx.globalAlpha = Math.max(0, 1 - (p.vy || 0) / 9);

      // Soft underglow shared by every platform
      ctx.shadowColor = PT.glow;
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 2;

      if (p.type === 'rail') {
        // Posts
        ctx.fillStyle = PT.fill;
        ctx.fillRect(p.x + 8,           p.y + 3, 3, 12);
        ctx.fillRect(p.x + PLAT_W - 11, p.y + 3, 3, 12);
        // Bar with rounded caps
        ctx.beginPath();
        ctx.roundRect(p.x, p.y, PLAT_W, 6, 3);
        ctx.fill();
        ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
        // Bright grind highlight along the top
        ctx.fillStyle = PT.edge;
        ctx.beginPath();
        ctx.roundRect(p.x + 3, p.y + 0.5, PLAT_W - 6, 1.5, 1);
        ctx.fill();
        // Soft ring
        ctx.strokeStyle = PT.ring;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(p.x + 0.5, p.y + 0.5, PLAT_W - 1, 5, 3);
        ctx.stroke();

      } else if (p.type === 'ledge') {
        // Body
        ctx.fillStyle = PT.fill;
        ctx.beginPath();
        ctx.roundRect(p.x, p.y, PLAT_W, PLAT_H + 6, 4);
        ctx.fill();
        ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
        // Waxed coping = bright top edge (shared highlight rule)
        ctx.fillStyle = PT.edge;
        ctx.beginPath();
        ctx.roundRect(p.x, p.y, PLAT_W, 3, 2);
        ctx.fill();
        // Soft ring
        ctx.strokeStyle = PT.ring;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(p.x + 0.5, p.y + 0.5, PLAT_W - 1, PLAT_H + 5, 4);
        ctx.stroke();

      } else {
        // Kicker — wedge under a flat deck (slope = identity)
        ctx.fillStyle = PT.fill;
        ctx.beginPath();
        ctx.moveTo(p.x,          p.y + PLAT_H);
        ctx.lineTo(p.x + PLAT_W, p.y + PLAT_H);
        ctx.lineTo(p.x + PLAT_W, p.y + PLAT_H + 16);
        ctx.lineTo(p.x,          p.y + PLAT_H + 3);
        ctx.closePath();
        ctx.fill();
        // Deck
        ctx.beginPath();
        ctx.roundRect(p.x, p.y, PLAT_W, PLAT_H, 3);
        ctx.fill();
        ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
        // Faint grip dots along the deck surface
        ctx.fillStyle = PT.edge;
        ctx.globalAlpha = 0.7;
        for (let gx = p.x + 6; gx < p.x + PLAT_W - 4; gx += 7) {
          ctx.fillRect(gx, p.y + 4, 2, 2);
        }
        ctx.globalAlpha = 1;
        // Soft ring
        ctx.strokeStyle = PT.ring;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(p.x + 0.5, p.y + 0.5, PLAT_W - 1, PLAT_H - 1, 3);
        ctx.stroke();
      }

      // Behaviour cues so moving / breaking platforms read at a glance.
      if (p.behavior === 'moving') {
        // Little wheels — it rolls.
        ctx.fillStyle = PT.edge;
        ctx.beginPath(); ctx.arc(p.x + 13, p.y + PLAT_H + 2, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(p.x + PLAT_W - 13, p.y + PLAT_H + 2, 2.5, 0, Math.PI * 2); ctx.fill();
      } else if (p.behavior === 'crumble') {
        // Cracks — it won't hold.
        ctx.strokeStyle = PT.ring;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(p.x + PLAT_W * 0.34, p.y + 1); ctx.lineTo(p.x + PLAT_W * 0.46, p.y + PLAT_H);
        ctx.moveTo(p.x + PLAT_W * 0.62, p.y + 1); ctx.lineTo(p.x + PLAT_W * 0.52, p.y + PLAT_H);
        ctx.stroke();
      }

      ctx.restore();
    }

    // Cone hazards
    for (const e of s.enemies) {
      if (e.alive) drawCone(ctx, e, blueprint);
    }

    // Player — cyan line-art in blueprint mode, full colour otherwise
    drawSkater(ctx, s.px, s.py, blueprint ? { ink: '#7dd3fc', fill: 'rgba(11,46,99,0.65)' } : undefined);

    // Score — Lexend, white with soft shadow
    ctx.font = '600 18px Lexend, sans-serif';
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 1;
    ctx.fillStyle = '#fff';
    ctx.fillText(`${Math.floor(s.score)}`, 14, 12);

    // Global record — top-right, the number to beat. Gold in the DROP skin, cyan
    // in blueprint so it stays inside the drawing.
    const gb = globalBestRef.current;
    if (gb > 0) {
      ctx.font = '700 13px Lexend, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillStyle = blueprint ? '#7dd3fc' : '#FFD700';
      ctx.fillText(`★ ${gb} ft`, W - 14, 15);
      ctx.textAlign = 'left'; // restore default for next frame's score
    }
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

    // Move sliding platforms; let broken curbs tumble away.
    for (const p of s.platforms) {
      if (p.behavior === 'moving' && !p.broken) {
        p.x += p.vx;
        if (p.x < 0) { p.x = 0; p.vx *= -1; }
        else if (p.x > W - PLAT_W) { p.x = W - PLAT_W; p.vx *= -1; }
      }
      if (p.broken) { p.vy = (p.vy || 0) + 0.4; p.y += p.vy; }
    }

    // Drift the cones side to side.
    for (const e of s.enemies) {
      if (!e.alive) continue;
      e.x += e.vx;
      if (e.x < 0) { e.x = 0; e.vx *= -1; }
      else if (e.x > W - ENEMY_W) { e.x = W - ENEMY_W; e.vx *= -1; }
    }

    // Platform bounce (only while falling)
    if (s.vy > 0) {
      for (const p of s.platforms) {
        if (p.broken) continue;
        const prevBottom = s.py + P_H - s.vy;
        if (
          prevBottom <= p.y + 2 &&
          s.py + P_H >= p.y &&
          s.px + P_W > p.x + 4 &&
          s.px < p.x + PLAT_W - 4
        ) {
          s.vy = JUMP_V;
          // A crumble curb gives this one bounce, then breaks away.
          if (p.behavior === 'crumble') { p.broken = true; p.vy = 1; }
          break;
        }
      }
    }

    // Cone collisions — ollie onto the top to squash, clip the side and you bail.
    for (const e of s.enemies) {
      if (!e.alive) continue;
      const hit =
        s.px + P_W > e.x + 4 &&
        s.px < e.x + ENEMY_W - 4 &&
        s.py + P_H > e.y + 4 &&
        s.py < e.y + ENEMY_H - 2;
      if (!hit) continue;
      const prevBottom = s.py + P_H - s.vy;
      if (s.vy > 0 && prevBottom <= e.y + 10) {
        e.alive = false;
        s.vy = JUMP_V;
      } else {
        s.alive = false;
      }
    }

    // Scroll camera up when player crosses threshold
    if (s.py < SCROLL_LINE) {
      const shift = SCROLL_LINE - s.py;
      s.py = SCROLL_LINE;
      s.score += shift * 0.12;
      for (const p of s.platforms) p.y += shift;
      for (const e of s.enemies) e.y += shift;

      s.platforms = s.platforms.filter(p => p.y < H + 20);
      s.enemies = s.enemies.filter(e => e.alive && e.y < H + 20);

      while (s.platforms.length < TARGET_PLATS) {
        const topY = Math.min(...s.platforms.map(p => p.y));
        const ny = topY - GAP_MIN - Math.random() * (GAP_MAX - GAP_MIN);
        s.platforms.push(randPlat(ny, { score: s.score }));
        maybeSpawnEnemy(s, ny);
      }
    }

    // Death (fell off the bottom, or clipped a cone)
    if (s.py > H || !s.alive) {
      s.alive = false;
      const final = Math.floor(s.score);
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

  // Pull the global record once on mount (degrades to 0 / hidden with no backend).
  useEffect(() => {
    fetchHighScore(GAME_ID).then(({ high, configured }) => {
      configuredRef.current = configured;
      globalBestRef.current = high;
      setGlobalBest(high);
    });
  }, []);

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

  // Theme to match the canvas: blueprint navy + cyan in engineering mode, dark
  // DROP night otherwise. The skater on the overlay mirrors the in-game player.
  const blueprint = isBlueprint();
  const skaterMono = blueprint ? { ink: '#7dd3fc', fill: 'rgba(11,46,99,0.65)' } : undefined;
  const ui = blueprint
    ? {
        bg: '#0b2e63',
        panel: 'bg-[#0b2e63]/80 ring-1 ring-sky-300/30',
        title: 'text-sky-100', sub: 'text-sky-300/80', body: 'text-sky-200', strong: 'text-white',
        btn: 'bg-sky-400 hover:bg-sky-300 text-[#0b2e63]',
      }
    : {
        bg: 'linear-gradient(180deg, #15171c 0%, #2b2f37 100%)',
        panel: 'bg-white/70 ring-1 ring-black/5',
        title: 'text-gray-900', sub: 'text-gray-500', body: 'text-gray-700', strong: 'text-gray-900',
        btn: 'bg-blue-500 hover:bg-blue-600 text-white',
      };

  const overlay = phase !== 'play' && (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden p-5"
      style={{
        background: ui.bg,
        borderRadius: inline ? 12 : 16,
      }}
    >
      {/* DROP mark watermark behind everything */}
      <img
        src="/images/DROP-logo-white.png"
        alt=""
        aria-hidden="true"
        className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 w-[72%] max-w-none pointer-events-none select-none"
        style={{ opacity: blueprint ? 0.2 : 0.16 }}
      />

      {/* Soft drifting glow; twinkling stars only in the DROP night sky */}
      <div className="widget-gradient" />
      {!blueprint && STARS.map((st, i) => (
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
        <SkaterSprite bailed={phase === 'over'} mono={skaterMono} />
        {phase === 'over' && (
          <span className="best-pop absolute left-full top-1/2 -translate-y-1/2 ml-1 whitespace-nowrap rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-bold text-rose-600 shadow-md ring-1 ring-black/5 -rotate-6">
            Bailed!
          </span>
        )}
      </div>

      {/* Frosted glass panel */}
      <div className={`relative z-10 rounded-2xl ${ui.panel} backdrop-blur-md shadow-xl px-6 py-5 text-center max-w-[85%]`}>
        {/* Altitude track (game over only) */}
        {phase === 'over' && (
          <div className="absolute left-2.5 top-4 bottom-4 w-1 rounded-full bg-black/10 overflow-hidden">
            <div
              className="absolute bottom-0 left-0 w-full rounded-full transition-[height] duration-700 ease-out"
              style={{
                height: `${trackFill * 100}%`,
                background: blueprint
                  ? 'linear-gradient(180deg, #7dd3fc 0%, #38bdf8 100%)'
                  : 'linear-gradient(180deg, #84A4FC 0%, #FFD700 100%)',
              }}
            />
          </div>
        )}

        {phase === 'start' && (
          <>
            <h3 className={`text-lg font-bold ${ui.title} leading-tight`}>How high can you ollie?</h3>
            <p className={`mt-1.5 text-xs ${ui.sub} flex items-center justify-center gap-1.5`}>
              <span className="nudge-left inline-block">←</span>
              <span className="nudge-right inline-block">→</span>
              keys · tap to move
            </p>
            <p className={`mt-1 text-[11px] ${ui.sub}`}>ollie cones, watch for breaking ledges</p>
          </>
        )}

        {phase === 'over' && (
          <>
            <h3 className={`text-lg font-bold ${ui.title}`}>Game over</h3>
            {isNewBest ? (
              <p className="best-pop mt-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
                ★ New best! {score} ft
              </p>
            ) : (
              <>
                <p className={`mt-2 text-sm ${ui.body}`}>You reached <span className={`font-semibold ${ui.strong}`}>{score} ft</span></p>
                {best > 0 && <p className={`text-xs ${ui.sub}`}>Best {best} ft</p>}
              </>
            )}
            {globalBest > 0 && (
              <p className={`mt-1 text-xs ${ui.sub}`}>
                {score >= globalBest ? '★ World record!' : `World record ${globalBest} ft`}
              </p>
            )}
          </>
        )}

        <div className="mt-4">
          <button
            onClick={start}
            className={`cta-glow px-5 py-2 rounded-full ${ui.btn} text-sm font-semibold shadow-md transition active:translate-y-0.5`}
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
