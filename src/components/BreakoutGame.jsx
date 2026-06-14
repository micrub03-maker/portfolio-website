import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { fetchLeaderboard, submitScore } from '../lib/leaderboard';

const GAME_ID = 'breakout';
const BOARD_SIZE = 5;

// ISO-3166 alpha-2 country code → flag emoji (regional indicator letters).
function countryFlag(cc) {
  if (!cc || cc.length !== 2 || !/^[A-Za-z]{2}$/.test(cc)) return '';
  return String.fromCodePoint(...[...cc.toUpperCase()].map(c => 0x1f1e6 + c.charCodeAt(0) - 65));
}

// "📍 San Francisco, US" style hint from the server-stamped geo fields.
function locationLabel(row) {
  const place = row.city || row.region || '';
  const flag  = countryFlag(row.country);
  if (place && flag) return `${flag} ${place}`;
  if (place)         return place;
  if (row.country)   return `${flag} ${row.country}`.trim();
  return '';
}

const WIDGET_AREAS = [
  { label: 'Profile',  color: '#818cf8', colStart: 0, rowStart: 0, colSpan: 4, rowSpan: 6 },
  { label: 'Contents', color: '#a78bfa', colStart: 4, rowStart: 0, colSpan: 4, rowSpan: 3 },
  { label: 'Projects', color: '#fb923c', colStart: 8, rowStart: 0, colSpan: 4, rowSpan: 3 },
  { label: 'Travel',   color: '#34d399', colStart: 4, rowStart: 3, colSpan: 4, rowSpan: 3 },
  { label: 'Reads',    color: '#f472b6', colStart: 8, rowStart: 3, colSpan: 4, rowSpan: 3 },
];

const GRID_COLS = 12;
const GRID_ROWS = 6;
const PAD = 3;                 // resting gap between bricks once they're in the grid
const START_INSET = 9;         // wider gap the tiles hold at launch, so the "cut" reads clearly

const FLY_STAGGER = 100;  // ms between each widget's bricks starting flight
const FLY_DUR     = 650;  // ms for each brick's flight
const FADE_DUR    = 300;  // ms: the widget fades in as a seamless whole
const CUT_DUR     = 280;  // ms: gaps open up, slicing the widget into its brick grid
const ANIM_TOTAL  = FADE_DUR + CUT_DUR + (WIDGET_AREAS.length - 1) * FLY_STAGGER + FLY_DUR;

function getWidget(col, row) {
  return WIDGET_AREAS.find(
    w => col >= w.colStart && col < w.colStart + w.colSpan &&
         row >= w.rowStart && row < w.rowStart + w.rowSpan
  ) ?? null;
}

function hexToRgb(hex) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function easeInCubic(t)  { return t * t * t; }
function lerp(a, b, t)   { return a + (b - a) * t; }

// Implicit heart curve (y up): (x²+y²−1)³ ≤ x²y³ → filled.
function heartMask(nx, ny) {
  const x = (nx - 0.5) * 2.8;
  const y = (0.5 - ny) * 2.8;
  const v = x * x + y * y - 1;
  return v * v * v - x * x * y * y * y <= 0;
}

// Cell-occupancy masks over a normalized grid (nx, ny = cell centre in [0,1],
// c/r = integer cell indices). After the first cleared board the bricks are
// rebuilt into one of these silhouettes — square cells, so shapes aren't squished.
const SHAPES = [
  { name: 'DIAMOND', cols: 13, rows: 11, mask: (nx, ny) => Math.abs(nx - 0.5) + Math.abs(ny - 0.5) <= 0.5 },
  { name: 'CIRCLE',  cols: 13, rows: 11, mask: (nx, ny) => ((nx - 0.5) * 2) ** 2 + ((ny - 0.5) * 2) ** 2 <= 1 },
  { name: 'HEART',   cols: 15, rows: 13, mask: heartMask },
  { name: 'PYRAMID', cols: 13, rows: 10, mask: (nx, ny) => Math.abs(nx - 0.5) <= ny * 0.5 + 0.03 },
  { name: 'CROSS',   cols: 11, rows: 11, mask: (nx, ny) => Math.abs(nx - 0.5) < 0.17 || Math.abs(ny - 0.5) < 0.17 },
  { name: 'RINGS',   cols: 13, rows: 11, mask: (nx, ny) => { const d = Math.hypot((nx - 0.5) * 2, (ny - 0.5) * 2); return d <= 1 && (d < 0.4 || d > 0.7); } },
  { name: 'CHECKER', cols: 12, rows: 8,  mask: (nx, ny, c, r) => (c + r) % 2 === 0 },
];

// Engineering / blueprint mode (Konami code, see BlueprintMode.jsx) flattens the
// whole site to a single blueprint-blue field with no colour. When it's active we
// drop the sunset photo and collapse every widget colour onto one blueprint cyan,
// so the game reads as part of the drawing rather than a colourful pop-out.
const BLUEPRINT_FIELD = '#0b2e63';
const BLUEPRINT_BRICK = '#7dd3fc';
const isBlueprint = () => document.documentElement.classList.contains('blueprint-mode');

export default function BreakoutGame({ onClose, widgetRects, widgetSnapshots }) {
  const canvasRef         = useRef(null);
  const snapshotsRef      = useRef(widgetSnapshots);
  const onCloseRef        = useRef(onClose);
  const widgetRectsRef    = useRef(widgetRects);
  // Persists the intro's start time across StrictMode's mount/cleanup/mount so the
  // surviving mount *continues* the same animation instead of skipping it. (A boolean
  // here would let the first, immediately-cancelled mount "use up" the intro, leaving
  // the real mount to render bricks already in their final grid spots.)
  const introStartRef = useRef(null);

  // Game-over → React bridge. The canvas loop sets `result` when a round ends; the
  // overlay below then fetches the global board and (if the score qualifies) lets the
  // player log their initials. `initGameRef` lets the overlay's Replay button reach
  // back into the canvas loop, and `overlayOpenRef` tells the loop's key/click
  // handlers to stand down while the overlay owns the screen.
  const [result, setResult]   = useState(null); // { status: 'won' | 'lost', score } | null
  const initGameRef           = useRef(null);
  const overlayOpenRef        = useRef(false);

  // Keep refs current without re-running the canvas effect.
  useEffect(() => { snapshotsRef.current   = widgetSnapshots; }, [widgetSnapshots]);
  useEffect(() => { onCloseRef.current     = onClose;         }, [onClose]);
  useEffect(() => { widgetRectsRef.current = widgetRects;     }, [widgetRects]);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    let animId   = null;

    let bricks    = [];
    let ball      = { x: 0, y: 0, vx: 0, vy: 0, r: 8 };
    let paddle    = { x: 0, y: 0, w: 120, h: 10 };
    let mouseX    = 0;
    let status    = 'playing';
    let animStart = 0;
    let startTime = 0;
    let particles = [];          // transient debris from brick breaks
    let popups    = [];          // floating "+10" score labels
    let score     = 0;
    let round     = 1;           // clearing the board scrambles the image + speeds up the next round
    let banner    = null;        // big centre flash, e.g. "ROUND 2 / SCRAMBLED"
    const blueprint = isBlueprint();
    const isTouch   = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // A widget area with no captured source rect isn't on the page at this layout
    // (the hero only renders Profile + Projects on mobile; Travel/Contents/Reads
    // are desktop-only). Their bricks have no widget imagery to show, so we paint
    // them as plain glassy black rather than flashing the section colours.
    const isGhostWidget = (label) => {
      const r = widgetRectsRef.current?.[label];
      return !(r && r.width > 0 && r.height > 0);
    };

    // Ball speed grows ~16% per cleared round.
    const roundSpeed = () => Math.max(canvas.width, canvas.height) * 0.003 * Math.pow(1.16, round - 1);

    // ── particle / popup helpers ────────────────────────────────────────────────
    function spawnParticles(cx, cy, color, count, speed) {
      for (let i = 0; i < count; i++) {
        const a    = Math.random() * Math.PI * 2;
        const s    = speed * (0.35 + Math.random() * 0.9);
        const life = 28 + Math.random() * 22;
        particles.push({
          x: cx, y: cy,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s - speed * 0.4,  // slight upward bias
          life, maxLife: life,
          size: 1.5 + Math.random() * 2.5,
          color,
        });
      }
    }
    function spawnPopup(cx, cy, text) {
      popups.push({ x: cx, y: cy, text, vy: -0.9, life: 48, maxLife: 48 });
    }

    // A random tile of a random widget's imagery — used to scramble the photos
    // across whatever shape the next round rebuilds the bricks into.
    function randomSample() {
      const w   = WIDGET_AREAS[Math.floor(Math.random() * WIDGET_AREAS.length)];
      const tx  = Math.floor(Math.random() * w.colSpan);
      const ty  = Math.floor(Math.random() * w.rowSpan);
      return {
        color:       blueprint ? BLUEPRINT_BRICK : w.color,
        label:       null,
        widgetIdx:   WIDGET_AREAS.indexOf(w),
        widgetLabel: w.label,
        snapRatioX:  tx / w.colSpan,
        snapRatioY:  ty / w.rowSpan,
        snapRatioW:  1 / w.colSpan,
        snapRatioH:  1 / w.rowSpan,
      };
    }

    // Rebuild the bricks as a silhouette: square cells fit to the vertical band,
    // centred, keeping the chosen shape's aspect ratio undistorted.
    function makeShapeBricks(shape) {
      const W = canvas.width;
      const H = canvas.height;
      const bandTop = H * 0.08;
      const bandH   = H * 0.46;
      const maxW    = W * 0.92;
      let cell = bandH / shape.rows;
      if (shape.cols * cell > maxW) cell = maxW / shape.cols;
      const gridW = shape.cols * cell;
      const gridH = shape.rows * cell;
      const left  = (W - gridW) / 2;
      const top   = bandTop + (bandH - gridH) / 2;

      const out = [];
      for (let r = 0; r < shape.rows; r++) {
        for (let c = 0; c < shape.cols; c++) {
          if (!shape.mask((c + 0.5) / shape.cols, (r + 0.5) / shape.rows, c, r)) continue;
          out.push({
            x: left + c * cell + PAD,
            y: top  + r * cell + PAD,
            w: cell - PAD * 2,
            h: cell - PAD * 2,
            alive: true,
            ...randomSample(),
          });
        }
      }
      return out;
    }

    // ── initGame ──────────────────────────────────────────────────────────────
    function initGame(skipAnimation = false) {
      setResult(null);
      overlayOpenRef.current = false;
      const W = canvas.width;
      const H = canvas.height;

      const areaTop   = H * 0.10;
      const areaH     = H * 0.45;
      const areaLeft  = W * 0.04;
      const areaRight = W * 0.96;
      const bW = (areaRight - areaLeft) / GRID_COLS;
      const bH = areaH / GRID_ROWS;

      bricks    = [];
      particles = [];
      popups    = [];
      score     = 0;
      round     = 1;
      banner    = null;
      for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
          const widget = getWidget(col, row);
          if (!widget) continue;

          const widgetIdx   = WIDGET_AREAS.findIndex(w => w.label === widget.label);
          const isCenterCol = col === Math.floor(widget.colStart + widget.colSpan / 2);
          const isCenterRow = row === Math.floor(widget.rowStart + widget.rowSpan / 2);
          const colInWidget = col - widget.colStart;
          const rowInWidget = row - widget.rowStart;

          const finalX = areaLeft + col * bW + PAD;
          const finalY = areaTop  + row * bH + PAD;
          const finalW = bW - PAD * 2;
          const finalH = bH - PAD * 2;

          // Launch tiles sit with a wider gap (START_INSET) than their resting grid
          // gap (PAD), so the moment the widget is "cut" into bricks reads clearly.
          const srcRect = widgetRectsRef.current?.[widget.label];
          let startX = finalX, startY = finalY, startW = finalW, startH = finalH;
          if (srcRect && srcRect.width > 0 && srcRect.height > 0) {
            startX = srcRect.left + (colInWidget / widget.colSpan) * srcRect.width  + START_INSET;
            startY = srcRect.top  + (rowInWidget / widget.rowSpan) * srcRect.height + START_INSET;
            startW = srcRect.width  / widget.colSpan - START_INSET * 2;
            startH = srcRect.height / widget.rowSpan - START_INSET * 2;
          }

          bricks.push({
            x: finalX, y: finalY, w: finalW, h: finalH,
            startX, startY, startW, startH,
            color: blueprint ? BLUEPRINT_BRICK : widget.color,
            label: (isCenterCol && isCenterRow) ? widget.label : null,
            widgetIdx,
            widgetLabel: widget.label,
            snapRatioX: colInWidget / widget.colSpan,
            snapRatioY: rowInWidget / widget.rowSpan,
            snapRatioW: 1 / widget.colSpan,
            snapRatioH: 1 / widget.rowSpan,
            flyDelay: FADE_DUR + CUT_DUR + widgetIdx * FLY_STAGGER,
            alive: true,
          });
        }
      }

      const speed = roundSpeed();
      ball.r  = Math.max(6, Math.min(10, W * 0.009));
      ball.x  = W / 2;
      ball.y  = H * 0.72;
      ball.vx = speed * (Math.random() > 0.5 ? 0.8 : -0.8);
      ball.vy = -speed;

      paddle.w = Math.max(80, W * 0.12);
      paddle.h = Math.max(8, H * 0.014);
      paddle.x = W / 2 - paddle.w / 2;
      paddle.y = H * 0.88;
      mouseX   = W / 2;

      // Intro plays once per open, anchored to a persisted start time so a
      // StrictMode remount resumes mid-animation rather than re-running or skipping it.
      const canAnimate = !skipAnimation && !!widgetRectsRef.current;
      if (canAnimate) {
        if (introStartRef.current == null) introStartRef.current = Date.now();
        animStart = introStartRef.current;
      }

      if (canAnimate && Date.now() - animStart < ANIM_TOTAL) {
        status = 'animating';
      } else {
        status = 'ready';
      }
    }

    // The ball sits parked on the paddle after the intro; the first click or key
    // press launches it (its velocity was already set in initGame / nextRound).
    function launch() {
      if (status !== 'ready') return;
      status    = 'playing';
      startTime = Date.now();
    }

    // ── nextRound ───────────────────────────────────────────────────────────────
    // Clearing the board doesn't end the run: the bricks come back rebuilt into a
    // fresh silhouette (diamond, heart, rings…) with the widget photos scrambled
    // across the cells. Score carries over and the ball relaunches faster each round.
    function nextRound() {
      round += 1;
      const shape = SHAPES[(round - 2) % SHAPES.length];
      bricks = makeShapeBricks(shape);

      const W = canvas.width;
      const H = canvas.height;
      const speed = roundSpeed();
      ball.x  = W / 2;
      ball.y  = H * 0.72;
      ball.vx = speed * (Math.random() > 0.5 ? 0.8 : -0.8);
      ball.vy = -speed;
      paddle.x = W / 2 - paddle.w / 2;

      banner = { text: `ROUND ${round}`, sub: shape.name, life: 90, maxLife: 90 };
      status = 'playing';
    }

    // ── update ────────────────────────────────────────────────────────────────
    function update() {
      // Effects advance every frame, whatever the status.
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        p.vy += 0.12;          // gravity
        p.vx *= 0.99;
        p.life--;
      }
      if (particles.length) particles = particles.filter(p => p.life > 0);
      for (const q of popups) { q.y += q.vy; q.life--; }
      if (popups.length) popups = popups.filter(q => q.life > 0);
      if (banner) { banner.life--; if (banner.life <= 0) banner = null; }

      if (status === 'animating') {
        if (Date.now() - animStart >= ANIM_TOTAL) status = 'ready';
        return;
      }

      const W = canvas.width;
      const H = canvas.height;

      if (status === 'ready' || status === 'playing') {
        paddle.x = Math.max(0, Math.min(W - paddle.w, mouseX - paddle.w / 2));
      }

      // Ball rides on the paddle until the player clicks / presses to launch.
      if (status === 'ready') {
        ball.x = paddle.x + paddle.w / 2;
        ball.y = paddle.y - ball.r - 2;
        return;
      }

      if (status !== 'playing') return;

      ball.x += ball.vx;
      ball.y += ball.vy;

      if (ball.x - ball.r < 0)  { ball.x = ball.r;     ball.vx =  Math.abs(ball.vx); }
      if (ball.x + ball.r > W)  { ball.x = W - ball.r; ball.vx = -Math.abs(ball.vx); }
      if (ball.y - ball.r < 0)  { ball.y = ball.r;     ball.vy =  Math.abs(ball.vy); }

      if (ball.vy > 0 &&
          ball.y + ball.r >= paddle.y &&
          ball.y - ball.r <= paddle.y + paddle.h &&
          ball.x >= paddle.x - ball.r &&
          ball.x <= paddle.x + paddle.w + ball.r) {
        const hit   = (ball.x - paddle.x) / paddle.w;
        const angle = (hit - 0.5) * Math.PI * 0.65;
        const speed = Math.hypot(ball.vx, ball.vy);
        ball.vx = Math.sin(angle) * speed;
        ball.vy = -Math.abs(Math.cos(angle) * speed);
        ball.y  = paddle.y - ball.r;
      }

      if (ball.y - ball.r > H) {
        status = 'lost';
        overlayOpenRef.current = true;
        setResult({ status: 'lost', score });
        return;
      }

      for (const b of bricks) {
        if (!b.alive) continue;
        if (ball.x + ball.r > b.x && ball.x - ball.r < b.x + b.w &&
            ball.y + ball.r > b.y && ball.y - ball.r < b.y + b.h) {
          b.alive = false;
          score += 10;
          const cx = b.x + b.w / 2;
          const cy = b.y + b.h / 2;
          // Ghost (missing-section) bricks shatter as dark glass, matching their fill.
          spawnParticles(cx, cy, isGhostWidget(b.widgetLabel) ? '#0a0a0c' : b.color, 12, 3.5);
          spawnPopup(cx, cy, '+10');
          const overL = ball.x + ball.r - b.x;
          const overR = b.x + b.w - (ball.x - ball.r);
          const overT = ball.y + ball.r - b.y;
          const overB = b.y + b.h - (ball.y - ball.r);
          const min   = Math.min(overL, overR, overT, overB);
          if (min === overT || min === overB) ball.vy *= -1;
          else ball.vx *= -1;
          break;
        }
      }

      // Board cleared → scramble the bricks back in and play on, faster, same score.
      if (bricks.every(b => !b.alive)) nextRound();
    }

    // ── draw helpers ──────────────────────────────────────────────────────────
    function paintBrick(b, dx, dy, dw, dh, alpha = 1) {
      if (dw <= 0 || dh <= 0 || alpha <= 0) return;
      const radius = Math.min(8, dh * 0.25);

      ctx.save();
      ctx.globalAlpha = alpha;

      rrect(ctx, dx, dy, dw, dh, radius);
      ctx.clip();

      const snapshot = snapshotsRef.current?.[b.widgetLabel];

      if (snapshot && snapshot.width > 0) {
        // Draw the real widget imagery untinted, so the bricks read as the widget.
        const sx = b.snapRatioX * snapshot.width;
        const sy = b.snapRatioY * snapshot.height;
        const sw = b.snapRatioW * snapshot.width;
        const sh = b.snapRatioH * snapshot.height;
        ctx.drawImage(snapshot, sx, sy, sw, sh, dx, dy, dw, dh);
      } else if (isGhostWidget(b.widgetLabel)) {
        // Section that doesn't exist at this layout (e.g. Travel/Contents/Reads on
        // mobile): glassy black, so the missing widgets read as empty dark panes
        // rather than their section colours.
        ctx.fillStyle = 'rgba(10, 10, 12, 0.32)';
        ctx.fillRect(dx, dy, dw, dh);
      } else {
        // No snapshot yet (slow/failed capture): fall back to a neutral glass tint,
        // never the section colour — the widgets dropped their colours, so the bricks
        // must read as plain glass rather than flashing the old section palette.
        ctx.fillStyle = 'rgba(255, 255, 255, 0.10)';
        ctx.fillRect(dx, dy, dw, dh);
      }

      const shine = ctx.createLinearGradient(dx, dy, dx, dy + dh * 0.55);
      shine.addColorStop(0, 'rgba(255,255,255,0.18)');
      shine.addColorStop(1, 'rgba(255,255,255,0.0)');
      ctx.fillStyle = shine;
      ctx.fillRect(dx, dy, dw, dh);

      ctx.restore();

      ctx.globalAlpha = alpha;
      ctx.strokeStyle = 'rgba(255,255,255,0.22)';
      ctx.lineWidth   = 1;
      rrect(ctx, dx, dy, dw, dh, radius);
      ctx.stroke();

      if (b.label && !snapshot) {
        const fs = Math.max(9, Math.min(14, dh * 0.45));
        ctx.fillStyle    = 'rgba(255,255,255,0.80)';
        ctx.font         = `bold ${fs}px monospace`;
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(b.label, dx + dw / 2, dy + dh / 2);
      }

      ctx.globalAlpha = 1;
    }

    function drawParticles() {
      for (const p of particles) {
        const { r, g, b: bl } = hexToRgb(p.color);
        ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
        ctx.fillStyle   = `rgb(${r}, ${g}, ${bl})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function drawPopups(W) {
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.font         = `bold ${Math.min(16, W * 0.022)}px monospace`;
      for (const q of popups) {
        ctx.globalAlpha = Math.max(0, q.life / q.maxLife);
        ctx.fillStyle   = '#fff';
        ctx.fillText(q.text, q.x, q.y);
      }
      ctx.globalAlpha = 1;
    }

    function drawScore(W) {
      ctx.font         = `bold ${Math.min(18, W * 0.024)}px monospace`;
      ctx.textBaseline = 'top';
      ctx.fillStyle    = 'rgba(255,255,255,0.85)';
      ctx.textAlign    = 'left';
      ctx.fillText(`SCORE ${score}`, W * 0.04, W * 0.02);
      ctx.textAlign    = 'right';
      ctx.fillText(`ROUND ${round}`, W * 0.96, W * 0.02);
    }

    // Big centre flash announcing a freshly scrambled round; fades out over its life.
    function drawBanner(W, H) {
      if (!banner) return;
      const t = banner.life / banner.maxLife;
      ctx.globalAlpha  = Math.min(1, t * 2);   // hold, then fade in the final stretch
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle    = 'rgba(255,255,255,0.95)';
      ctx.font         = `bold ${Math.min(40, W * 0.05)}px monospace`;
      ctx.fillText(banner.text, W / 2, H * 0.32);
      ctx.fillStyle    = 'rgba(255,255,255,0.6)';
      ctx.font         = `bold ${Math.min(16, W * 0.02)}px monospace`;
      ctx.fillText(banner.sub, W / 2, H * 0.32 + Math.min(34, W * 0.042));
      ctx.globalAlpha  = 1;
    }

    // ── draw ──────────────────────────────────────────────────────────────────
    function draw() {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Round over: the React GameOverPanel owns the screen. Leave the canvas blank
      // behind it, otherwise surviving bricks bleed through the overlay as filled squares.
      if (status === 'lost' || status === 'won') return;

      const elapsed = Date.now() - animStart;

      if (status === 'animating') {
        for (const b of bricks) {
          if (!b.alive) continue;
          const bElapsed = elapsed - b.flyDelay;
          if (bElapsed > 0) {
            // Phase 2: fully-opaque bricks accelerate into the grid.
            const t = easeInCubic(Math.min(1, bElapsed / FLY_DUR));
            paintBrick(b,
              lerp(b.startX, b.x, t),
              lerp(b.startY, b.y, t),
              lerp(b.startW, b.w, t),
              lerp(b.startH, b.h, t),
            );
          } else {
            // Phase 1a (fade): the widget reassembles as a seamless whole, tiles
            // edge-to-edge, reconstructing the real widget image.
            // Phase 1b (cut): gaps open from zero to START_INSET, slicing it into
            // the brick grid, then it holds there until this widget's flight begins.
            const alpha = easeOutCubic(Math.min(1, elapsed / FADE_DUR));
            const cut   = easeOutCubic(Math.min(1, Math.max(0, (elapsed - FADE_DUR) / CUT_DUR)));
            if (alpha > 0.01) {
              paintBrick(b,
                lerp(b.startX - START_INSET,     b.startX, cut),
                lerp(b.startY - START_INSET,     b.startY, cut),
                lerp(b.startW + START_INSET * 2, b.startW, cut),
                lerp(b.startH + START_INSET * 2, b.startH, cut),
                alpha,
              );
            }
          }
        }
        return;
      }

      // Playing / won / lost: draw bricks at final game positions.
      for (const b of bricks) {
        if (!b.alive) continue;
        paintBrick(b, b.x, b.y, b.w, b.h);
      }
      drawParticles();
      drawPopups(W);
      drawScore(W);
      drawBanner(W, H);

      if (status === 'playing' || status === 'ready') {
        ctx.fillStyle = 'rgba(255,255,255,0.92)';
        rrect(ctx, paddle.x, paddle.y, paddle.w, paddle.h, 5);
        ctx.fill();

        ctx.shadowColor = 'rgba(255,255,255,0.8)';
        ctx.shadowBlur  = 10;
        ctx.fillStyle   = '#fff';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (status === 'ready') {
          // Pulsing prompt while the ball waits on the paddle to be served.
          ctx.globalAlpha  = 0.55 + 0.35 * Math.sin(Date.now() / 280);
          ctx.fillStyle    = 'rgba(255,255,255,0.95)';
          ctx.font         = `bold ${Math.min(22, W * 0.03)}px monospace`;
          ctx.textAlign    = 'center';
          ctx.textBaseline = 'middle';
          const prompt = (isTouch || W < 768) ? 'tap to start' : 'click or press space to start';
          ctx.fillText(prompt, W / 2, H * 0.66);
          ctx.globalAlpha  = 1;
        } else if (Date.now() - startTime < 3000) {
          ctx.fillStyle    = 'rgba(255,255,255,0.45)';
          ctx.font         = `${Math.min(13, W * 0.018)}px monospace`;
          ctx.textAlign    = 'center';
          ctx.textBaseline = 'bottom';
          const hint = isTouch ? 'move finger to play' : 'move mouse to play';
          ctx.fillText(hint, W / 2, paddle.y - 16);
        }
      }

      // The won/lost screen (score, global leaderboard, initials entry) is a React
      // overlay rendered below (see GameOverPanel), so nothing is drawn here.
    }

    function loop() { update(); draw(); animId = requestAnimationFrame(loop); }

    // ── event handlers ────────────────────────────────────────────────────────
    const onMouseMove = e => { mouseX = e.clientX - canvas.getBoundingClientRect().left; };
    const onTouchMove = e => {
      e.preventDefault();
      mouseX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
    };
    initGameRef.current = initGame;

    const onKey = e => {
      if (e.key === 'Escape') { onCloseRef.current(); return; }
      // Parked ball waiting to be served: Space / Enter launches it.
      if (status === 'ready') {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); launch(); }
        return;
      }
      // While the game-over overlay is up, Replay lives on a real button so 'r'
      // doesn't fire mid-keystroke when someone is typing their initials.
      if ((e.key === 'r' || e.key === 'R') && status !== 'animating' && !overlayOpenRef.current) {
        initGame(true);
      }
    };
    const onClick = () => {
      if (overlayOpenRef.current) return;
      if (status === 'ready') { launch(); return; }
      if (status !== 'playing' && status !== 'animating') initGame(true);
    };
    const onResize = () => {
      canvas.width  = canvas.offsetWidth  || window.innerWidth;
      canvas.height = canvas.offsetHeight || window.innerHeight;
      initGame(true);
    };

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('click', onClick);
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);

    canvas.width  = canvas.offsetWidth  || window.innerWidth;
    canvas.height = canvas.offsetHeight || window.innerHeight;
    initGame();
    draw();
    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('click', onClick);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, []); // game loop is self-contained; all props accessed via refs

  // ── render ────────────────────────────────────────────────────────────────
  // In engineering mode, drop the sunset photo for a flat blueprint-blue field.
  const blueprint = isBlueprint();
  return (
    <>
      <div
        className="fixed inset-0 z-[49] pointer-events-none"
        style={
          blueprint
            ? { backgroundColor: BLUEPRINT_FIELD }
            : {
                backgroundColor: '#111',
                backgroundImage: "linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url('/sunset.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
        }
      />
      <div className="fixed inset-0 z-50">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-white/60 hover:text-white text-xl font-bold bg-black/30 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
          aria-label="Close game"
        >
          ✕
        </button>
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
          style={{ background: 'transparent', cursor: 'none' }}
        />
        {result && (
          <GameOverPanel
            result={result}
            blueprint={blueprint}
            onReplay={() => initGameRef.current?.(true)}
            onClose={onClose}
          />
        )}
      </div>
    </>
  );
}

// ── game-over overlay ─────────────────────────────────────────────────────────
// Shown when a round ends: final score, the global top-5, and, when the score
// cracks the top-5 and the backend is live, a "claim your spot" form (name +
// optional company). Location is stamped server-side from edge geo headers. All
// network calls degrade silently (see ../lib/leaderboard), so with no backend the
// panel just shows score + Replay/Close.
function GameOverPanel({ result, blueprint, onReplay, onClose }) {
  const { status, score } = result;
  const [scores, setScores]     = useState([]);
  const [configured, setConfig] = useState(false);
  const [loading, setLoading]   = useState(true);
  const [form, setForm]         = useState({ name: '', company: '' });
  const [phase, setPhase]       = useState('idle'); // 'idle' | 'submitting' | 'submitted'
  const inputRef = useRef(null);

  // Score cracks the visible top-5 → offer to claim a spot with name + company.
  const madeBoard = score > 0 &&
    (scores.length < BOARD_SIZE || score > scores[scores.length - 1].score);
  const showForm = configured && madeBoard && phase !== 'submitted';
  const canSubmit = !!form.name.trim();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchLeaderboard(GAME_ID).then(({ scores: s, configured: c }) => {
      if (cancelled) return;
      setScores(s);
      setConfig(c);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => { if (showForm) inputRef.current?.focus(); }, [showForm]);

  const setField = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e?.preventDefault();
    if (phase === 'submitting' || !canSubmit) return;
    setPhase('submitting');
    const updated = await submitScore(GAME_ID, score, form);
    setScores(updated ?? (await fetchLeaderboard(GAME_ID)).scores);
    setPhase('submitted');
  }

  // Match the hero dashboard's widget language: frosted slate card, sans-serif,
  // white primary action + translucent secondary (like "Learn More" / "Get in Touch").
  const accent  = blueprint ? 'text-sky-300' : 'text-amber-200';
  const panelBg = blueprint ? 'bg-[#0b2e63]/70 border-sky-300/25' : 'bg-slate-900/55 border-white/20';
  const field   = 'w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 transition-colors focus:border-white/50';
  const submittedName = form.name.trim() || 'Anonymous';

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/55 backdrop-blur-sm text-white">
      <div className={`max-h-[92vh] w-[min(94vw,440px)] overflow-y-auto rounded-2xl border ${panelBg} px-7 py-6 shadow-2xl backdrop-blur-md`}>
        <div className="text-center">
          <div className="text-xs font-medium uppercase tracking-wider text-white/50">
            {status === 'won' ? 'Cleared' : 'Game Over'}
          </div>
          <div className="mt-1 text-5xl font-bold tracking-tight">{score}</div>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mt-5 space-y-2">
            <div className="text-center text-xs text-white/60">
              {`Top ${BOARD_SIZE} score — claim your spot`}
            </div>
            <input
              ref={inputRef}
              value={form.name}
              onChange={setField('name')}
              maxLength={24}
              placeholder="Name"
              className={field}
            />
            <input
              value={form.company}
              onChange={setField('company')}
              maxLength={40}
              placeholder="Company (optional)"
              className={field}
            />
            <button
              type="submit"
              disabled={!canSubmit || phase === 'submitting'}
              className="w-full rounded-lg border border-white/40 bg-white/75 py-2 text-sm font-semibold text-slate-900 shadow transition-all hover:bg-white/90 active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100"
            >
              {phase === 'submitting' ? 'Saving…' : 'Save my score'}
            </button>
            <p className="text-center text-[10px] leading-tight text-white/35">
              Location is added from your region.
            </p>
          </form>
        )}

        {phase === 'submitted' && (
          <div className="mt-5 text-center text-sm text-white/70">
            Saved to the board 🎉
          </div>
        )}

        <div className="mt-5">
          <div className="mb-2 text-center text-xs font-medium uppercase tracking-wider text-white/40">
            Global Top {BOARD_SIZE}
          </div>
          {loading ? (
            <div className="py-4 text-center text-sm text-white/40">loading…</div>
          ) : scores.length === 0 ? (
            <div className="py-4 text-center text-sm text-white/40">
              {configured ? 'be the first to make the board' : 'leaderboard offline'}
            </div>
          ) : (
            <ol className="space-y-1 text-sm">
              {scores.map((row, i) => {
                const mine = phase === 'submitted' && row.score === score && row.name === submittedName;
                const place = locationLabel(row);
                return (
                  <li
                    key={i}
                    className={`flex items-baseline gap-2 rounded-lg px-2 py-1 ${mine ? 'border border-white/20 bg-white/15' : ''}`}
                  >
                    <span className="w-4 shrink-0 text-white/40">{i + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate ${mine ? 'font-semibold' : ''}`}>
                        {row.name}
                        {row.company && <span className="text-white/50"> · {row.company}</span>}
                      </span>
                      {place && <span className="block truncate text-[11px] text-white/40">{place}</span>}
                    </span>
                    <span className={`shrink-0 tabular-nums ${mine ? `font-bold ${accent}` : 'text-white/90'}`}>
                      {row.score}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={onReplay}
            className="rounded-lg border border-white/40 bg-white/75 px-5 py-2 text-sm font-semibold text-slate-900 shadow transition-all hover:bg-white/90 active:scale-[0.98]"
          >
            Replay
          </button>
          <button
            onClick={onClose}
            className="rounded-lg border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-white/20 active:scale-[0.98]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
