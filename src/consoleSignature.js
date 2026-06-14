// Devtools console signature — a styled greeting for anyone who opens the
// console. Recruiters and engineers both peek in here; this leaves them a
// readable card with contact links and a nudge toward the site's easter eggs.
// Imported once from main.jsx; runs on load, guarded so it never throws in a
// non-browser/SSR context.

export function printConsoleSignature() {
  if (typeof window === 'undefined' || !window.console) return;

  // Box built programmatically so the borders always align; bump BOX_W to widen.
  const BOX_W = 52;
  const boxLines = [
    'M I C H A E L   R U B I N',
    'mechanical design · controls',
    'hardware that works in the real world',
  ];
  const row = (text) => '   │' + ('   ' + text).padEnd(BOX_W) + '│';
  const banner = [
    '',
    '   ┌' + '─'.repeat(BOX_W) + '┐',
    ...boxLines.map(row),
    '   └' + '─'.repeat(BOX_W) + '┘',
    '',
  ].join('\n');

  const bannerStyle = [
    'color:#7dd3fc',
    'font-family:ui-monospace,Menlo,Consolas,monospace',
    'font-size:12px',
    'line-height:1.35',
    'font-weight:600',
  ].join(';');

  const labelStyle = 'color:#0b2e63;background:#7dd3fc;padding:2px 6px;border-radius:3px;font-weight:700';
  const dimStyle = 'color:#94a3b8';
  const hintStyle = 'color:#7dd3fc;font-weight:600';

  console.log('%c' + banner, bannerStyle);
  console.log(
    '%c HELLO %c poking around the internals? we\'d probably get along.',
    labelStyle,
    dimStyle
  );
  console.log('%c🎧  bored? run  play()  for a sound check.', dimStyle);
  console.log(
    '%c⚙  psst — try the Konami code for engineering mode:  ↑ ↑ ↓ ↓ ← → ← → B A',
    hintStyle
  );

  // Rickroll — calling play() from the console counts as a user gesture, so the
  // tab opens without tripping the popup blocker. Defined on window so it's
  // reachable from the console prompt.
  window.play = function play() {
    window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank', 'noopener');
    console.log('%c🎵 Never gonna give you up, never gonna let you down…', 'color:#f472b6;font-weight:700');
    return '🕺';
  };
}
