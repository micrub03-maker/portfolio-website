import React, { useEffect, useLayoutEffect, useRef } from 'react';

const WIDGET_AREAS = [
  { label: 'Profile',  color: '#818cf8', colStart: 0, rowStart: 0, colSpan: 4, rowSpan: 6 },
  { label: 'Travel',   color: '#34d399', colStart: 4, rowStart: 0, colSpan: 4, rowSpan: 3 },
  { label: 'Projects', color: '#fb923c', colStart: 8, rowStart: 0, colSpan: 4, rowSpan: 3 },
  { label: 'Contents', color: '#a78bfa', colStart: 4, rowStart: 3, colSpan: 4, rowSpan: 3 },
  { label: 'Reads',    color: '#f472b6', colStart: 8, rowStart: 3, colSpan: 4, rowSpan: 3 },
];

const GRID_COLS = 12;
const GRID_ROWS = 6;
const PAD = 3;

const FLY_STAGGER = 100;  // ms between each widget's bricks starting flight
const FLY_DUR     = 650;  // ms for each brick's flight
const FLY_START   = 500;  // ms pause so the background settles before bricks move
const ANIM_TOTAL  = FLY_START + (WIDGET_AREAS.length - 1) * FLY_STAGGER + FLY_DUR;

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

export default function BreakoutGame({ onClose, widgetRects, widgetSnapshots }) {
  const canvasRef         = useRef(null);
  const snapshotsRef      = useRef(widgetSnapshots);
  const onCloseRef        = useRef(onClose);
  const widgetRectsRef    = useRef(widgetRects);
  // Survives StrictMode's simulated unmount/remount so the intro plays exactly once per open.
  const hasPlayedIntroRef = useRef(false);

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

    // ── initGame ──────────────────────────────────────────────────────────────
    function initGame(skipAnimation = false) {
      const W = canvas.width;
      const H = canvas.height;

      const areaTop   = H * 0.10;
      const areaH     = H * 0.45;
      const areaLeft  = W * 0.04;
      const areaRight = W * 0.96;
      const bW = (areaRight - areaLeft) / GRID_COLS;
      const bH = areaH / GRID_ROWS;

      bricks = [];
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

          const srcRect = widgetRectsRef.current?.[widget.label];
          let startX = finalX, startY = finalY, startW = finalW, startH = finalH;
          if (srcRect && srcRect.width > 0 && srcRect.height > 0) {
            startX = srcRect.left + (colInWidget / widget.colSpan) * srcRect.width  + PAD;
            startY = srcRect.top  + (rowInWidget / widget.rowSpan) * srcRect.height + PAD;
            startW = srcRect.width  / widget.colSpan - PAD * 2;
            startH = srcRect.height / widget.rowSpan - PAD * 2;
          }

          bricks.push({
            x: finalX, y: finalY, w: finalW, h: finalH,
            startX, startY, startW, startH,
            color: widget.color,
            label: (isCenterCol && isCenterRow) ? widget.label : null,
            widgetIdx,
            widgetLabel: widget.label,
            snapRatioX: colInWidget / widget.colSpan,
            snapRatioY: rowInWidget / widget.rowSpan,
            snapRatioW: 1 / widget.colSpan,
            snapRatioH: 1 / widget.rowSpan,
            flyDelay: FLY_START + widgetIdx * FLY_STAGGER,
            alive: true,
          });
        }
      }

      const speed = Math.max(W, H) * 0.003;
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

      // hasPlayedIntroRef persists across StrictMode remounts; once true, skip intro on re-runs.
      const shouldAnimate = !hasPlayedIntroRef.current && !skipAnimation && !!widgetRectsRef.current;
      if (shouldAnimate) hasPlayedIntroRef.current = true;

      if (shouldAnimate) {
        status    = 'animating';
        animStart = Date.now();
      } else {
        status    = 'playing';
        startTime = Date.now();
      }
    }

    // ── update ────────────────────────────────────────────────────────────────
    function update() {
      if (status === 'animating') {
        if (Date.now() - animStart >= ANIM_TOTAL) {
          status    = 'playing';
          startTime = Date.now();
        }
        return;
      }
      if (status !== 'playing') return;

      const W = canvas.width;
      const H = canvas.height;

      paddle.x = Math.max(0, Math.min(W - paddle.w, mouseX - paddle.w / 2));
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

      if (ball.y - ball.r > H) { status = 'lost'; return; }

      for (const b of bricks) {
        if (!b.alive) continue;
        if (ball.x + ball.r > b.x && ball.x - ball.r < b.x + b.w &&
            ball.y + ball.r > b.y && ball.y - ball.r < b.y + b.h) {
          b.alive = false;
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

      if (bricks.every(b => !b.alive)) status = 'won';
    }

    // ── draw helpers ──────────────────────────────────────────────────────────
    function paintBrick(b, dx, dy, dw, dh, alpha = 1) {
      if (dw <= 0 || dh <= 0 || alpha <= 0) return;
      const { r, g, b: bl } = hexToRgb(b.color);
      const radius = Math.min(8, dh * 0.25);

      ctx.save();
      ctx.globalAlpha = alpha;

      rrect(ctx, dx, dy, dw, dh, radius);
      ctx.clip();

      const snapshot = snapshotsRef.current?.[b.widgetLabel];

      if (snapshot && snapshot.width > 0) {
        const sx = b.snapRatioX * snapshot.width;
        const sy = b.snapRatioY * snapshot.height;
        const sw = b.snapRatioW * snapshot.width;
        const sh = b.snapRatioH * snapshot.height;
        ctx.drawImage(snapshot, sx, sy, sw, sh, dx, dy, dw, dh);
        ctx.fillStyle = `rgba(${r}, ${g}, ${bl}, 0.18)`;
        ctx.fillRect(dx, dy, dw, dh);
      } else {
        ctx.fillStyle = `rgba(${r}, ${g}, ${bl}, 0.18)`;
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

      ctx.strokeStyle = `rgba(${r}, ${g}, ${bl}, 0.45)`;
      ctx.lineWidth   = 0.75;
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

    // ── draw ──────────────────────────────────────────────────────────────────
    function draw() {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const elapsed = Date.now() - animStart;

      if (status === 'animating') {
        for (const b of bricks) {
          if (!b.alive) continue;
          const bElapsed = elapsed - b.flyDelay;
          if (bElapsed > 0) {
            // Bricks accelerate into the grid — no slow settle at the end.
            const t = easeInCubic(Math.min(1, bElapsed / FLY_DUR));
            paintBrick(b,
              lerp(b.startX, b.x, t),
              lerp(b.startY, b.y, t),
              lerp(b.startW, b.w, t),
              lerp(b.startH, b.h, t),
            );
          } else {
            // Fade in at the widget's old position before flying.
            const alpha = easeOutCubic(Math.min(1, elapsed / 380));
            if (alpha > 0.01) paintBrick(b, b.startX, b.startY, b.startW, b.startH, alpha);
          }
        }
        return;
      }

      // Playing / won / lost — draw bricks at final game positions.
      for (const b of bricks) {
        if (!b.alive) continue;
        paintBrick(b, b.x, b.y, b.w, b.h);
      }

      if (status === 'playing') {
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

        if (Date.now() - startTime < 3000) {
          ctx.fillStyle    = 'rgba(255,255,255,0.45)';
          ctx.font         = `${Math.min(13, W * 0.018)}px monospace`;
          ctx.textAlign    = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText('move your mouse to control the paddle', W / 2, paddle.y - 16);
        }
      }

      if (status === 'won' || status === 'lost') {
        ctx.fillStyle = 'rgba(0,0,0,0.52)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle    = 'rgba(255,255,255,0.65)';
        ctx.font         = `${Math.min(18, W * 0.025)}px monospace`;
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('press R or click to replay  ·  ESC to close', W / 2, H / 2);
      }
    }

    function loop() { update(); draw(); animId = requestAnimationFrame(loop); }

    // ── event handlers ────────────────────────────────────────────────────────
    const onMouseMove = e => { mouseX = e.clientX - canvas.getBoundingClientRect().left; };
    const onTouchMove = e => {
      e.preventDefault();
      mouseX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
    };
    const onKey = e => {
      if (e.key === 'Escape') onCloseRef.current();
      if ((e.key === 'r' || e.key === 'R') && status !== 'animating') initGame(true);
    };
    const onClick = () => {
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
  return (
    <>
      <div
        className="fixed inset-0 z-[49] pointer-events-none"
        style={{
          backgroundColor: '#111',
          backgroundImage: "linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url('/sunset.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
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
      </div>
    </>
  );
}
