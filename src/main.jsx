import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Nested "insight" (level-2) dropdown styling. Flip this one value to restyle every
// project's nested dropdowns: 'A' = inset card (original colours + Option 1 border/shadow),
// 'B' = list disclosure.
export const NESTED_LEVEL2_SOLUTION = 'A';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

// Level-2 dropdown styles. Switch the whole site via NESTED_LEVEL2_SOLUTION above.
// Consumed at render time by ProjectPortfolio's Dropdown, keyed by variant.
// Solution A — original white fill colour (bg-white/30) + Option 1's (inset) border
// colour and inner shadow, matching the level-1 look one step lighter. All variants
// share this one finalized look.
const LEVEL2_A = {
  container: 'rounded-xl ring-1 ring-black/5 bg-white/30 shadow-inner overflow-hidden mt-4',
  toggle: 'hover:bg-white/40',
  divider: 'border-t border-black/5',
};
const LEVEL2_SOLUTION_A = {
  default: LEVEL2_A,
  inset: LEVEL2_A,
  flat: LEVEL2_A,
  stacked: LEVEL2_A,
};
// Solution B — list disclosure: left rule + indent, no card.
const LEVEL2_SOLUTION_B = {
  default: { container: 'border-l-2 border-black/10 pl-3 mt-2', toggle: 'hover:bg-black/[0.03]', divider: 'border-t border-black/5' },
  inset:   { container: 'border-l-2 border-black/10 pl-3 mt-2', toggle: 'hover:bg-black/[0.03]', divider: 'border-t border-black/5' },
  flat:    { container: 'mt-2', toggle: 'hover:bg-white/30', divider: 'border-t border-black/5' },
  stacked: { container: 'border-l-2 border-black/10 pl-3 mt-2', toggle: 'hover:bg-white/40', divider: 'border-t border-black/5' },
};
export const NESTED_LEVEL2_STYLES =
  NESTED_LEVEL2_SOLUTION === 'B' ? LEVEL2_SOLUTION_B : LEVEL2_SOLUTION_A;
