import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import DinoGame from './DinoGame';

const TITLE_H = 36;

function OsCursor({ clicking }) {
  return (
    <svg
      width="14" height="18" viewBox="0 0 14 18" fill="none"
      style={{
        filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.6))',
        transform: clicking ? 'scale(0.72)' : 'scale(1)',
        transition: 'transform 0.1s ease',
      }}
    >
      <path
        d="M1.5 1 L1.5 14 L4.8 10.8 L7.2 16.5 L9.2 15.6 L6.8 9.9 L11 9.9 Z"
        fill="white" stroke="#111" strokeWidth="1" strokeLinejoin="round"
      />
    </svg>
  );
}

function DesktopIcon({ emoji, label, highlighted }) {
  return (
    <div className="flex flex-col items-center gap-1 w-14 select-none">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-all duration-200
        ${highlighted ? 'bg-blue-500/50 ring-2 ring-blue-300/80 scale-105' : 'bg-white/10'}`}
      >
        {emoji}
      </div>
      <span className={`text-[9px] font-medium text-center leading-tight px-1 rounded transition-colors duration-200
        ${highlighted ? 'text-white bg-blue-500/70' : 'text-white/50'}`}
      >
        {label}
      </span>
    </div>
  );
}

const MD_COMPONENTS = {
  h1:     ({ children }) => <h1     className="text-sm font-bold text-gray-800 mt-3 mb-1 first:mt-0">{children}</h1>,
  h2:     ({ children }) => <h2     className="text-xs font-bold text-gray-700 mt-2 mb-1 uppercase tracking-wide">{children}</h2>,
  h3:     ({ children }) => <h3     className="text-xs font-semibold text-gray-600 mt-2 mb-0.5">{children}</h3>,
  p:      ({ children }) => <p      className="text-xs text-gray-600 leading-relaxed mb-1">{children}</p>,
  ul:     ({ children }) => <ul     className="list-disc list-inside space-y-0.5 mb-1">{children}</ul>,
  ol:     ({ children }) => <ol     className="list-decimal list-inside space-y-0.5 mb-1">{children}</ol>,
  li:     ({ children }) => <li     className="text-xs text-gray-600 leading-relaxed [&>p]:inline [&>p]:m-0">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-gray-800">{children}</strong>,
  code:   ({ children }) => <code   className="bg-gray-200 text-gray-700 text-[10px] px-1 rounded font-mono">{children}</code>,
  hr:     ()             => <hr     className="border-gray-200 my-2" />,
  img: ({ src, alt }) => (
    <img src={src} alt={alt} className="w-full rounded-lg my-1.5 border border-gray-200" />
  ),
};

export default function AssemblyGuide({ src = '/assembly-guide.md' }) {
  const [content,       setContent]       = useState('');
  const [mode,          setMode]          = useState('doc');   // 'doc' | 'desktop' | 'game'
  const [showError,     setShowError]     = useState(false);
  const [expanded,      setExpanded]      = useState(false);

  // 'launch' = yellow button (doc → game), 'exit' = exit button (game → doc)
  const desktopIntent = useRef('launch');

  // desktop animation
  const [cursorPos,      setCursorPos]      = useState({ x: 22, y: 68 });
  const [clicking,       setClicking]       = useState(false);
  const [highlightedIcon, setHighlightedIcon] = useState(null); // null | 'dino' | 'projects'
  const [fading,         setFading]         = useState(false);

  useEffect(() => {
    fetch(src)
      .then(r => r.text())
      .then(setContent)
      .catch(() => setContent('_Could not load assembly guide._'));
  }, [src]);

  // desktop cursor sequence — branches on desktopIntent.current
  useEffect(() => {
    if (mode !== 'desktop') return;

    const isExit   = desktopIntent.current === 'exit';
    const startPos = isExit ? { x: 58, y: 62 } : { x: 22, y: 68 };
    const endPos   = isExit ? { x: 21, y: 40 } : { x: 65, y: 42 };
    const icon     = isExit ? 'projects' : 'dino';
    const after    = isExit ? () => { setMode('doc'); setExpanded(false); } : () => setMode('game');

    setCursorPos(startPos);
    setClicking(false);
    setHighlightedIcon(null);
    setFading(false);

    const t1 = setTimeout(() => setCursorPos(endPos),                             350);
    const t2 = setTimeout(() => setClicking(true),                               1600);
    const t3 = setTimeout(() => { setClicking(false); setHighlightedIcon(icon); }, 1820);
    const t4 = setTimeout(() => setFading(true),                                 2100);
    const t5 = setTimeout(after,                                                  2550);

    return () => [t1, t2, t3, t4, t5].forEach(clearTimeout);
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const containerHeight = mode === 'game'
    ? (expanded ? 400 : 320)
    : (expanded ? 420 : 260);

  const titleLabel =
    mode === 'game'    ? 'dino-runner.exe'  :
    mode === 'desktop' ? '~/Desktop'        :
    'assembly-guide.md';

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden my-3 flex flex-col"
      style={{ height: containerHeight, transition: 'height 0.35s ease' }}
      onClick={e => e.stopPropagation()}
    >
      {/* ── title bar ── */}
      <div
        className="flex items-center gap-2 px-3 border-b border-gray-200 bg-white/80 flex-shrink-0"
        style={{ height: TITLE_H }}
      >
        <div className="flex gap-1.5">
          {/* red — error */}
          <button
            aria-label="Close"
            className="w-2.5 h-2.5 rounded-full bg-red-400/70 hover:bg-red-500/80 transition-colors focus:outline-none"
            onClick={() => setShowError(true)}
          />
          {/* yellow — desktop easter egg */}
          <button
            aria-label="Minimize"
            className="w-2.5 h-2.5 rounded-full bg-yellow-400/70 hover:bg-yellow-500/80 transition-colors focus:outline-none"
            onClick={() => {
              if (mode === 'doc') { desktopIntent.current = 'launch'; setMode('desktop'); }
              else                { setMode('doc'); }
            }}
          />
          {/* green — expand */}
          <button
            aria-label="Expand"
            className="w-2.5 h-2.5 rounded-full bg-green-400/70 hover:bg-green-500/80 transition-colors focus:outline-none"
            onClick={() => setExpanded(e => !e)}
          />
        </div>
        <span className="text-[10px] text-gray-400 font-mono">{titleLabel}</span>
      </div>

      {/* ── content ── */}
      <div className="relative flex-1 min-h-0">

        {/* error dialog overlay */}
        {showError && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
            <div className="bg-white rounded-lg border border-gray-200 shadow-xl p-4 text-center w-48">
              <div className="text-2xl mb-2">🚫</div>
              <p className="text-xs font-semibold text-gray-800 mb-1">Cannot close document</p>
              <p className="text-[10px] text-gray-400 mb-3 leading-relaxed">
                A rebuild is still<br />in progress.
              </p>
              <button
                className="px-4 py-1 text-[10px] font-mono uppercase tracking-wider bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded transition-colors"
                onClick={() => setShowError(false)}
              >
                OK
              </button>
            </div>
          </div>
        )}

        {/* doc */}
        {mode === 'doc' && (
          <div className="overflow-y-auto px-4 py-3 h-full">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={MD_COMPONENTS}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}

        {/* desktop */}
        {mode === 'desktop' && (
          <div
            className="relative w-full h-full overflow-hidden"
            style={{
              background: 'radial-gradient(ellipse at 35% 50%, #1e3a5f 0%, #0d1b2a 100%)',
              opacity: fading ? 0 : 1,
              transition: 'opacity 0.45s ease',
            }}
          >
            {/* dot-grid wallpaper */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
                backgroundSize: '18px 18px',
              }}
            />

            {/* icons */}
            <div className="absolute" style={{ left: '20%', top: '40%', transform: 'translate(-50%,-50%)' }}>
              <DesktopIcon emoji="📂" label="Projects" highlighted={highlightedIcon === 'projects'} />
            </div>
            <div className="absolute" style={{ left: '64%', top: '42%', transform: 'translate(-50%,-50%)' }}>
              <DesktopIcon emoji="🦕" label="T-Rex Runner" highlighted={highlightedIcon === 'dino'} />
            </div>

            {/* slim taskbar */}
            <div className="absolute bottom-0 left-0 right-0 h-5 flex items-center px-3 gap-1.5"
                 style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}>
              <div className="w-2.5 h-2.5 rounded bg-white/20" />
              <div className="flex-1" />
              <span className="text-[8px] text-white/30 font-mono">12:00</span>
            </div>

            {/* animated cursor */}
            <div
              style={{
                position: 'absolute',
                left: `${cursorPos.x}%`,
                top:  `${cursorPos.y}%`,
                transition: 'left 1.25s cubic-bezier(0.25,0.1,0.25,1), top 1.25s cubic-bezier(0.25,0.1,0.25,1)',
                pointerEvents: 'none',
                zIndex: 10,
              }}
            >
              <OsCursor clicking={clicking} />
            </div>
          </div>
        )}

        {/* game */}
        {mode === 'game' && (
          <DinoGame
            height={containerHeight - TITLE_H}
            onExit={() => { desktopIntent.current = 'exit'; setMode('desktop'); }}
          />
        )}
      </div>
    </div>
  );
}
