import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// Konami code → toggles a site-wide "engineering / blueprint" skin. The visual
// treatment lives in index.css under `html.blueprint-mode`; this component only
// owns the trigger, the root class toggle, and the on-screen HUD (exit pill +
// engineering-drawing title block). DoodleJump keeps its own 5-click skate
// trigger, so repurposing Konami here doesn't lose that game.
const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

const CYAN = 'rgba(147,197,253,0.9)';
const CYAN_DIM = 'rgba(147,197,253,0.45)';
const LINE = 'rgba(147,197,253,0.4)';

function TitleBlock() {
  const row = (label, value, last) => (
    <div style={{ display: 'flex', borderTop: `1px solid ${LINE}` }}>
      <div style={{ flex: '0 0 88px', padding: '4px 8px', color: CYAN_DIM, borderRight: `1px solid ${LINE}`, letterSpacing: '0.08em' }}>{label}</div>
      <div style={{ flex: 1, padding: '4px 8px', color: CYAN }}>{value}</div>
    </div>
  );
  return (
    <div
      style={{
        position: 'fixed', bottom: 16, right: 16, zIndex: 9999,
        width: 'min(280px, calc(100vw - 32px))',
        fontFamily: 'ui-monospace, "Courier New", monospace',
        fontSize: 11, textTransform: 'uppercase',
        border: `1px solid ${CYAN}`,
        background: 'rgba(8,30,68,0.78)',
        backdropFilter: 'blur(2px)',
        boxShadow: '0 0 0 1px rgba(147,197,253,0.15), 0 8px 30px rgba(0,0,0,0.4)',
        pointerEvents: 'none',
        animation: 'bpFadeIn 0.4s ease both',
      }}
    >
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1, padding: '6px 8px', color: CYAN, fontWeight: 700, letterSpacing: '0.1em' }}>M. RUBIN</div>
        <div style={{ flex: '0 0 70px', padding: '6px 8px', color: CYAN_DIM, borderLeft: `1px solid ${LINE}`, textAlign: 'right' }}>SCALE 1:1</div>
      </div>
      {row('TITLE', 'PORTFOLIO')}
      {row('MATERIAL', 'CAFFEINE')}
      {row('TOLERANCE', '±0.01 MM')}
      <div style={{ display: 'flex', borderTop: `1px solid ${LINE}` }}>
        <div style={{ flex: 1, padding: '4px 8px', color: CYAN_DIM, borderRight: `1px solid ${LINE}` }}>REV A</div>
        <div style={{ flex: 1, padding: '4px 8px', color: CYAN_DIM }}>SHEET 1/1</div>
      </div>
    </div>
  );
}

function Hud({ onExit }) {
  return (
    <>
      {/* Exit pill — the only interactive HUD element */}
      <button
        onClick={onExit}
        style={{
          position: 'fixed', top: 14, left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999,
          fontFamily: 'ui-monospace, "Courier New", monospace',
          fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase',
          color: CYAN,
          padding: '6px 14px',
          border: `1px solid ${CYAN}`,
          borderRadius: 999,
          background: 'rgba(8,30,68,0.78)',
          backdropFilter: 'blur(2px)',
          cursor: 'pointer',
          boxShadow: '0 0 12px rgba(147,197,253,0.25)',
          animation: 'bpFadeIn 0.4s ease both',
        }}
        title="Exit engineering mode"
      >
        ⟟ Engineering mode · ESC to exit
      </button>
      <TitleBlock />
    </>
  );
}

export default function BlueprintMode() {
  const [active, setActive] = useState(false);
  const buffer = useRef([]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setActive(false);
        return;
      }
      buffer.current = [...buffer.current, e.key].slice(-KONAMI.length);
      if (buffer.current.join(',') === KONAMI.join(',')) {
        buffer.current = [];
        setActive((a) => !a);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('blueprint-mode', active);
    return () => root.classList.remove('blueprint-mode');
  }, [active]);

  if (!active) return null;
  return createPortal(<Hud onExit={() => setActive(false)} />, document.body);
}
