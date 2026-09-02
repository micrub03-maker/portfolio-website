import React, { useState, useEffect, useRef, useCallback, useMemo, useContext, createContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MediaSlot } from "./MediaSlot";
import AssemblyGuide from "./AssemblyGuide";
import { NESTED_LEVEL2_STYLES } from '../main.jsx';
import { T } from '../i18n';
import { trackPageview } from '../lib/analytics';

// Lets each open Dropdown report when its title button has scrolled out of view,
// so ProjectPortfolio can show a single floating "close" chip for the deepest one.
const ChipContext = createContext(null);
let chipIdCounter = 0;

// -- helpers -------------------------------------------------------------------

function Bullets({ items }) {
  return (
    <ul className="space-y-1 mt-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-sm text-gray-700">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

// Project-level reflection shown after the case-study dropdowns. Labelled and
// styled distinctly from the per-case-study "Points of improvement:" lists so it
// reads as a project-level footer rather than part of any open deep-dive.
function ProjectImprovements({ items }) {
  return (
    <div className="mt-5 pt-4 border-t border-black/10">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Overall room for improvement</p>
      <Bullets items={items} />
    </div>
  );
}

// Small non-interactive pill chips listing the tools/skills used on a project.
// Visual sibling of the paper/link buttons above, minus the hover affordance so
// they don't read as clickable.
function ToolChips({ items, className = 'mt-4' }) {
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {items.map((t) => (
        <span
          key={t}
          className="text-[9px] uppercase tracking-wide text-gray-500 bg-white/40 ring-1 ring-black/[0.06] font-medium px-2 py-0.5 rounded-full whitespace-nowrap"
        >
          {t}
        </span>
      ))}
    </div>
  );
}

function SideBySide({ pic, picWidth = 'w-1/2', picLeft = true, mobileImageBelow = false, children }) {
  // tw: md:w-1/2 md:w-[45%] md:w-[55%]
  const imageOrder = mobileImageBelow && picLeft ? 'order-last md:order-first' : '';
  const textOrder = mobileImageBelow && picLeft ? 'order-first md:order-last' : '';
  const imageCol = <div className={`w-full md:${picWidth} flex-shrink-0 ${imageOrder}`}>{pic}</div>;
  const textCol = <p className={`text-sm text-gray-700 leading-relaxed md:mt-8 ${textOrder}`}>{children}</p>;
  return (
    <div className="flex flex-col md:flex-row gap-4 md:items-start">
      {picLeft ? <>{imageCol}{textCol}</> : <>{textCol}{imageCol}</>}
    </div>
  );
}

// Wraps media with a hover-reveal gradient + caption. The wrapper is its own
// block-formatting context (overflow-hidden) and owns the vertical spacing +
// rounding, so the overlay (a plain inset-0) always matches the media box no
// matter where this sits in the layout. Pass media as children with no vertical
// margin of its own (for MediaSlot, use the `compact` prop).
// tw: bg-gradient-to-t bg-gradient-to-b from-black/80 via-black/30 from-black/60 via-black/20 to-transparent
function HoverMediaOverlay({
  children,
  caption,
  captionColor = 'text-white',
  position = 'bottom',          // 'bottom' | 'top'
  align = 'left',              // 'left' | 'right'
  gradientClassName,          // override the default gradient
  captionClassName,           // override the default caption positioning
  className = '',             // extra wrapper classes (widths, flex-1, …)
  style,                     // wrapper inline style (e.g. drop-shadow filter)
}) {
  const gradient = gradientClassName ?? (position === 'top'
    ? 'bg-gradient-to-b from-black/80 via-black/30 to-transparent'
    : 'bg-gradient-to-t from-black/80 via-black/30 to-transparent');
  const captionPos = captionClassName ?? (position === 'top'
    ? 'absolute top-0 left-0 p-3 -translate-y-1 group-hover:translate-y-0 transition-transform duration-300'
    : `absolute bottom-0 ${align === 'right' ? 'right-0' : 'left-0 right-0'} p-3 translate-y-1 group-hover:translate-y-0 transition-transform duration-300`);
  return (
    <div className={`relative group my-3 rounded-xl overflow-hidden ${className}`} style={style}>
      {children}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className={`absolute inset-0 ${gradient}`} />
        <div className={captionPos}>
          <p className={`${captionColor} ${align === 'right' ? 'text-right' : ''} text-sm font-semibold tracking-wide`}>{caption}</p>
        </div>
      </div>
    </div>
  );
}

// Nested-section style — the style trial is finalized: every project dropdown uses
// one unified look (below). Level-2 ("insight") dropdown styling lives in main.jsx
// (NESTED_LEVEL2_STYLES), keyed by the same variant names.
// Original white fill colours + Option 1's (inset) border colour and inner shadow.
// Per-variant keys are kept so existing `variant` props still resolve, but all map
// to this one look.
const NESTED_LEVEL1 = {
  container: 'rounded-xl ring-1 ring-black/5 bg-white/60 shadow-inner overflow-hidden mt-4',
  toggle: 'hover:bg-gray-50',
  divider: 'border-t border-black/10',
};
const NESTED_VARIANTS = {
  default: { 1: NESTED_LEVEL1 },
  inset: { 1: NESTED_LEVEL1 },
  flat: { 1: NESTED_LEVEL1 },
  stacked: { 1: NESTED_LEVEL1 },
};

// Fix: Issue #20 — default noClickClose to true so body clicks don't collapse the
// dropdown; only the header button toggles it. Pass noClickClose={false} to opt back in.
function Dropdown({ summaryTitle, summaryDate, summarySubtitle, tools, onOpenChange, noClickClose = true, forceOpenTrigger, scrollTargetId, closeSignal, trackPath, variant = 'default', level = 1, children }) {
  const [open, setOpen] = useState(() => !!forceOpenTrigger);
  const buttonRef = useRef(null);
  const containerRef = useRef(null);
  const chip = useContext(ChipContext);
  const idRef = useRef(null);
  if (idRef.current === null) idRef.current = ++chipIdCounter;
  const [titleHidden, setTitleHidden] = useState(false);

  useEffect(() => {
    if (!forceOpenTrigger) return;
    // Fix: Issue #23 — defer one frame so layout settles before any scroll measurement
    const raf = requestAnimationFrame(() => {
      setOpen(true);
      onOpenChange?.(true);
    });
    return () => cancelAnimationFrame(raf);
  }, [forceOpenTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!closeSignal) return;
    setOpen(false);
    onOpenChange?.(false);
  }, [closeSignal]); // eslint-disable-line react-hooks/exhaustive-deps

  // Report opening this dropdown as a virtual pageview, so the Vercel "Pages"
  // dashboard shows which projects / case-study deep-dives visitors actually
  // expand. Fires on every open (Vercel dedupes by visitor); never on close.
  useEffect(() => {
    if (open && trackPath) trackPageview(trackPath);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close + scroll back into view, measured after the collapse settles.
  // Top-level projects (scrollTargetId 'projects') anchor the whole carousel with
  // its bottom at the viewport bottom, so the projects widget ends at the bottom
  // of the screen. Nested case-studies return to their parent project.
  const close = () => {
    setOpen(false);
    onOpenChange?.(false);
    setTimeout(() => {
      const vh = window.innerHeight;
      const carousel = scrollTargetId === 'projects' ? document.getElementById('project-carousel') : null;
      if (carousel) {
        const rect = carousel.getBoundingClientRect();
        const y = rect.bottom + window.pageYOffset - vh + 24;
        window.scrollTo({ top: Math.max(y, 0), behavior: 'smooth' });
        return;
      }
      const target = (scrollTargetId ? document.getElementById(scrollTargetId) : buttonRef.current) || containerRef.current;
      if (target) {
        const rect = target.getBoundingClientRect();
        const top = rect.top + window.pageYOffset;
        const y = rect.height <= vh - 80 ? top + rect.height - vh + 24 : top - 80;
        window.scrollTo({ top: Math.max(y, 0), behavior: 'smooth' });
      }
    }, 350);
  };
  // Keep a live reference so the chip always calls the latest close().
  const closeRef = useRef(close);
  closeRef.current = close;

  const toggle = (e) => {
    e?.stopPropagation();
    if (open) { close(); return; }
    setOpen(true);
    onOpenChange?.(true);
    setTimeout(() => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const navOffset = 80;
      const vh = window.innerHeight;
      const fitsInView = rect.height <= vh - navOffset;
      if (fitsInView) {
        if (rect.bottom > vh) {
          const y = Math.min(
            rect.bottom + window.pageYOffset - vh + 16,
            rect.top + window.pageYOffset - navOffset
          );
          window.scrollTo({ top: y, behavior: 'smooth' });
        } else if (rect.top < navOffset) {
          window.scrollTo({ top: rect.top + window.pageYOffset - navOffset, behavior: 'smooth' });
        }
      } else {
        window.scrollTo({ top: rect.top + window.pageYOffset - navOffset, behavior: 'smooth' });
      }
    }, 350);
  };

  // While open, flag when the title button scrolls above the viewport top.
  useEffect(() => {
    if (!open) { setTitleHidden(false); return; }
    const el = buttonRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setTitleHidden(!entry.isIntersecting && entry.boundingClientRect.bottom <= 0),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [open]);

  // Register with the chip controller while this dropdown's title is hidden.
  useEffect(() => {
    if (!chip || !(open && titleHidden)) return undefined;
    const id = idRef.current;
    chip.register(id, { level, close: () => closeRef.current?.() });
    return () => chip.unregister(id);
  }, [chip, open, titleHidden, level]);

  const group = NESTED_VARIANTS[variant] ?? NESTED_VARIANTS.default;
  const v = level === 2
    ? (NESTED_LEVEL2_STYLES[variant] ?? group[1])
    : (group[level] ?? group[1]);

  // Option 4 — lift the card when open: trade the inset shadow for an elevation and
  // firm up the ring/fill, so an expanded dropdown reads as one raised panel rather
  // than a button stacked on a body. Works for both nesting levels since each
  // variant's container shares the shadow-inner / ring-black / bg-white pattern.
  // tw: shadow-lg ring-black/10 bg-white/80
  const containerClass = open
    ? v.container
        .replace('shadow-inner', 'shadow-lg')
        .replace(/ring-black\/\d+/, 'ring-black/10')
        .replace(/bg-white\/\d+/, 'bg-white/80')
    : v.container;

  return (
    <div ref={containerRef} className={`${containerClass} transition-all duration-300`}>
      <button
        ref={buttonRef}
        onClick={toggle}
        aria-expanded={open}
        className={`w-full text-left px-4 flex justify-between gap-3 ${open ? 'items-center py-2.5 bg-black/[0.02]' : 'items-start py-3'} ${v.toggle} transition-all`}
      >
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-gray-800 ${summaryDate ? 'text-base' : 'text-sm'}`}>
              {summaryTitle}
              {summaryDate && <span className="ml-2 font-normal text-gray-400 text-xs">{summaryDate}</span>}
            </p>
          {/* Option 1 — collapse to a slim bar when open: the subtitle and tool chips
              orient you in the closed state, so drop them once expanded to leave just
              the title + chevron as a light "you're inside this section" header. */}
          {summarySubtitle && !open && (
            <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{summarySubtitle}</p>
          )}
          {tools && !open && <ToolChips items={tools} className="mt-3" />}
        </div>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-gray-400 text-base flex-shrink-0 mt-0.5 leading-none"
        >
          {'\u25BE'}
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="dd-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div
              className={`px-4 pb-5 pt-1 ${v.divider} space-y-3 ${noClickClose ? '' : 'cursor-pointer'}`}
              onClick={noClickClose ? undefined : toggle}
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── slide components ──────────────────────────────────────────────────────────

function FeaturedProjectsSlide({ onDd, autoOpen, closeSignal }) {
  const assemblyVideoRef = useRef(null);
  const suctionDropdownRef = useRef(null);
  const [assemblyPlaying, setAssemblyPlaying] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(hover: none)');
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const playAssembly = () => {
    assemblyVideoRef.current?.play();
    setAssemblyPlaying(true);
    suctionDropdownRef.current?.querySelectorAll('video').forEach(v => {
      if (v !== assemblyVideoRef.current) v.pause();
    });
  };

  const pauseAssembly = () => {
    assemblyVideoRef.current?.pause();
    if (assemblyVideoRef.current) assemblyVideoRef.current.currentTime = 0;
    setAssemblyPlaying(false);
    // Fix: F-9 — never force-play sibling videos for users preferring reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    suctionDropdownRef.current?.querySelectorAll('video').forEach(v => {
      if (v !== assemblyVideoRef.current) v.play();
    });
  };

  const handleAssemblyEnter = () => { if (!isMobile) playAssembly(); };
  const handleAssemblyLeave = () => { if (!isMobile) pauseAssembly(); };
  const handleAssemblyClick = (e) => { e.stopPropagation(); if (isMobile) assemblyPlaying ? pauseAssembly() : playAssembly(); };

  return (
    <div className="px-6 pb-5 pt-3 md:px-8 md:pb-6 md:pt-4">

      {/* ── CALSOL ── */}
      <div id="project-calsol">
      <Dropdown variant="flat" summaryTitle="Seatbelts Development @ CalSol" summaryDate="Sept 2025 – Aug 2026" tools={['SolidWorks', 'Topology Optimization', 'FEA', 'Hand Calculations', 'DFM', 'Physical Testing']} onOpenChange={onDd} forceOpenTrigger={autoOpen?.key === 'calsol' ? autoOpen.count : 0} scrollTargetId="projects" closeSignal={closeSignal} trackPath="/about/projects/calsol">
        {/* Two-column intro */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="relative group">
            <MediaSlot
              src= "/images/calsol-team.jpg"
              label="CALSOL team"
              tall
            />
            <div
              className="absolute pointer-events-none flex flex-col items-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300"
              style={{ left: '61%', top: '38%', transform: 'translate(-50%, -50%)' }}
            >
              <div className="bg-black/70 text-white/90 text-[10px] px-2 py-1 rounded-md border border-white/15 backdrop-blur-sm whitespace-nowrap mb-[-10px]">
                I'm here!
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.6))', transform: 'rotate(90deg)', marginTop: '9px' }}
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="13 6 19 12 13 18" />
              </svg>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex justify-end gap-2 flex-wrap">
              <a
                href="https://calsol.berkeley.edu/"
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-gray-800 bg-white/60 hover:bg-white/90 ring-1 ring-black/10 shadow-sm hover:shadow font-semibold px-3.5 py-1 rounded-full transition-all whitespace-nowrap"
              >
                Team website
              </a>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              Our seatbelt system was the <span className="font-semibold">first mechanical subsystem to pass scrutineering</span> for the 2026 race cycle.
              <br />
              <br />
              As <span className="font-semibold">Driver Safety Lead</span> for the Berkeley Solar car student team, I owned the <span className="font-semibold">five-point seatbelt harness mounting system</span> for CalSol's GenXI solar vehicle end to end, from regulations to physical testing to manufacturing handoff.
            </p>
          </div>
        </div>
        {/* Full-width case-study dropdowns */}
        <Dropdown
          variant="flat"
          level={2}
          summaryTitle="Cutting 40% off the shoulder mount using topology optimization"
          trackPath="/about/projects/calsol/shoulder"
          summarySubtitle='TL;DR I designed a welded 4130 steel shoulder-belt anchorage, optimizing its weight while keeping the geometry waterjet-friendly.'
          onOpenChange={onDd}
          scrollTargetId="project-calsol"
        >
          <SideBySide picWidth="w-1/2" pic={
            <div className="flex justify-center">
              <HoverMediaOverlay className="w-full md:w-[73%]" caption="Shoulder anchorage in car">
                <MediaSlot src={'/images/shoulder-mount-calsol.png'} label="shoulder belt anchorage" compact imageAspect="h-[184px] md:h-[202px]" />
              </HoverMediaOverlay>
            </div>
          }>
            For the shoulder harness, I designed an anchorage that bolts through the chassis and supports transverse "wrapping bolts" the belts loop around, <span className="font-semibold">eliminating single-point failure</span> by letting each strap wrap independently. It's <span className="font-semibold">simple and cheap</span>: just a waterjet cut, a weld, and off-the-shelf hardware.
          </SideBySide>
          <SideBySide picWidth="w-1/2" picLeft={false} pic={
            <div className="flex justify-center">
              <HoverMediaOverlay
                className="w-full md:w-[73%]"
                caption="Bolt bending: the governing load case"
                gradientClassName="bg-gradient-to-t from-black/60 via-black/20 to-transparent"
                captionClassName="absolute bottom-[15%] left-0 right-0 p-3 translate-y-1 group-hover:translate-y-0 transition-transform duration-300"
              >
                <MediaSlot src={'/images/shoulder-calcs.png'} label="Shoulder belt calcs" compact imageAspect="h-[184px] md:h-[240px]" />
              </HoverMediaOverlay>
            </div>
          }>
            I modeled the wrapping bolts as <span className="font-semibold">fixed-fixed beams</span> under the projected distributed load to size them against the governing failure mode, <span className="font-semibold">bending</span>, then designed the rest of the anchorage around them.
          </SideBySide>
          <p className="text-sm text-gray-700 leading-relaxed">
            Since the anchorage is welded, I chose <span className="font-semibold">annealed 4130 steel</span>: it welds cleanly without heat-affected-zone embrittlement and gives the strength and ductile failure a safety-critical load path needs. <span className="font-semibold">Aluminum would have been bulkier</span> at the required strength, negating its weight advantage, so I accepted the added density and clawed weight back through optimization.
            </p>
          <p className="text-sm text-gray-700 leading-relaxed">
            With the baseline clearing all load cases, I ran a SolidWorks <span className="font-semibold">topology optimization</span> to strip non-critical material while keeping it manufacturable (uniform thickness, waterjet-friendly geometry, intact interfaces), <span className="font-semibold">cutting weight by roughly 40%</span> within safety margins.
          </p>
          <MediaSlot
            src={'/images/calsol-topology.png'}
            label="Shoulder belt CAD topology"
            imageAspect="h-auto md:h-[245px]"
          />
          <p className="text-sm font-semibold text-gray-800 mt-2">Points of improvement:</p>
          <Bullets
            items={[
            'The design clears every load case in simulation; the clear next step is a physical pull test to confirm the modeled behavior before race use.',
            ]}
          />
        </Dropdown>
        <Dropdown
          variant="flat"
          level={2}
          summaryTitle="Anchoring belts into thin carbon fiber with bonded inserts"
          trackPath="/about/projects/calsol/inserts"
          summarySubtitle="TL;DR The thin carbon shell can't carry the concentrated belt loads alone, so I bonded in metal inserts to spread the load, validated by analysis and pull-out tests."
          onOpenChange={onDd}
          scrollTargetId="project-calsol"
        >
          <SideBySide picWidth="w-[45%]" pic={
            <HoverMediaOverlay position="top" caption="Inserts sitting flush in the carbon shell">
              <MediaSlot src={'/images/Calsol-inserts.png'} label="inserts" compact imageAspect="aspect-[10/9] h-auto md:aspect-auto md:h-[288px]" />
            </HoverMediaOverlay>
          }>
            To safely anchor the lap- and sub-belts into the thin carbon fiber cell, I designed <span className="font-semibold">bonded metal inserts</span> that follow the shell curvature and sit sandwiched within the laminate. The belts clip into eyebolts threaded into these inserts.
            <br />
            <br />
            I translated regulations into explicit <span className="font-semibold">load cases</span> and analyzed the primary failure modes: <span className="font-semibold">thread stripping</span> and <span className="font-semibold">laminate debonding</span>.
          </SideBySide>
          <p className="text-sm text-gray-700 leading-relaxed">
           Without access to dynamic crash equipment, I identified the critical load case analytically and showed the design <span className="font-semibold">clears the regulated load with margin on paper</span>. To back that up, I designed a conservative <span className="font-semibold">quasi-static pull-out test</span>, measuring an average failure load of about <span className="font-semibold">70% of the regulated load</span> across four samples.
            <br />
            <br />
            That figure is <span className="font-semibold">conservative by design</span>: a slow static pull underestimates real performance, and published data shows bonded CFRP inserts carry substantially more under dynamic crash loading.
            <br />
            <br />
            With the analysis clearing the requirement and the test substantiated by that dynamic data, I'm confident the design credibly meets the load in a real impact.
          </p>
          <HoverMediaOverlay className="shadow-md" position="top" captionColor="text-gray-800" caption="Quasi-static pull-out test jig">
            <div className="[&>div]:h-[128px] md:[&>div]:h-[320px] [&>div]:!p-1 [&>div]:my-0">
              <MediaSlot
                src={'/images/insert testing jig picture.png'}
                label="Inserts test set up"
                padded
              />
            </div>
          </HoverMediaOverlay>
          <SideBySide picWidth="w-[45%]" picLeft={false} pic={
            <HoverMediaOverlay position="top" caption="Finished machined inserts from the vendor">
              <MediaSlot src={'/images/CalSol-finished-inserts.jpg'} label="finished inserts" compact imageAspect="aspect-[10/9] h-auto md:aspect-auto md:h-[288px]" />
            </HoverMediaOverlay>
          }>
            I also took the part through manufacturing. After locking the design, I <span className="font-semibold">handled vendor sourcing</span> and found a machine shop that could hold the tolerances on the multi-axis geometry.
            <br />
            <br />
            I put together the <span className="font-semibold">drawing package</span>, with GD&amp;T, material spec, and finish, sent it over, and received the finished inserts ready to bond into the cell.
          </SideBySide>
          <p className="text-sm font-semibold text-gray-800 mt-2">Points of improvement:</p>
          <Bullets
            items={[
              'The design meets the load in analysis and quasi-static testing; for a safety-critical part, a dynamic crash test would be the ideal final confirmation.',
              "The insert is still bulky; since it already needs multi-axis machining, I could design a more complex shape to shed weight.",
            ]}
          />
        </Dropdown>
        <ProjectImprovements
          items={[
            'Every anchorage has been validated at the component level through analysis and quasi-static tests; a full-harness dynamic sled test would be the ideal end-to-end confirmation before race deployment.',
            "The mounts are tailored to GenXI's chassis geometry; a more parametric design would let the anchorages carry over to future car generations with less rework.",
          ]}
        />
      </Dropdown>
      </div>

      {/* ── AXIRIS ── */}
      <div id="project-axiris">
      <Dropdown variant="stacked" summaryTitle="Handheld Autorefractor @ Axiris Technologies" summaryDate="Jan 2026 – June 2026" tools={['Optical Design', 'NIR Imaging', 'Python', 'Image Processing', 'Product Design', 'Rapid Prototyping']} onOpenChange={onDd} forceOpenTrigger={autoOpen?.key === 'axiris' ? autoOpen.count : 0} scrollTargetId="projects" closeSignal={closeSignal} trackPath="/about/projects/axiris">
        {/* Two-column intro */}
        <div className="grid grid-cols-1 md:grid-cols-[53fr_47fr] gap-6 items-start">
          <HoverMediaOverlay align="right" caption={<>Axiris current<br />design</>}>
            <MediaSlot
              src={'/images/Axiris-final-design.png'}
              label="Axiris final design"
              compact
              imageAspect="h-auto md:h-[184px]"
            />
          </HoverMediaOverlay>
          <div className="flex flex-col gap-3">
            <div className="flex justify-end gap-2 flex-wrap">
              <a href="/images/Axiris-slides.pdf" target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs text-gray-800 bg-white/60 hover:bg-white/90 ring-1 ring-black/10 shadow-sm hover:shadow font-semibold px-3.5 py-1 rounded-full transition-all">Slidedeck</a>
              <a href="/images/Axiris-paper.pdf" target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs text-gray-800 bg-white/60 hover:bg-white/90 ring-1 ring-black/10 shadow-sm hover:shadow font-semibold px-3.5 py-1 rounded-full transition-all">Paper</a>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              Axiris is a <span className="font-semibold">low-cost, handheld autorefractor</span> for vision screening in low-resource settings, where conventional 5,000–30,000-dollar systems are out of reach because they need a clinic, consistent grid power, and trained staff. As <span className="font-semibold">optical lead</span>, I chose a Scheiner-disk optical path with an external NIR camera and helped develop a Python image-processing stack to estimate refractive error, iterating through <span className="font-semibold">six prototypes over 13 weeks</span> to reach a <span className="font-semibold">574-dollar BOM</span>.
            </p>
          </div>
        </div>
        {/* Full-width case-study dropdowns */}
        <Dropdown
          variant="stacked"
          level={2}
          summaryTitle="From 50+ concepts to one device: my product design process"
          trackPath="/about/projects/axiris/process"
          summarySubtitle="TL;DR Stakeholder interviews, concept screening, and expert input allowed me to find the best product format."
          onOpenChange={onDd}
          scrollTargetId="project-axiris"
        >
          <SideBySide pic={
            <HoverMediaOverlay caption={<>Market<br />Research</>}>
              <MediaSlot
                src={'/images/Axiris-interviews.png'}
                label="Axiris market research"
                natural
                compact
              />
            </HoverMediaOverlay>
          }>
            <span className="font-semibold">Hundreds of millions of people</span> live with avoidable vision loss. I started with a simple question: why?
            <br />
            <br />
            Through interviews with ophthalmologists, NGO screeners, and engineers, I realized this gap in care comes from current solutions being expensive and requiring clinics, power, and trained staff. This realization led us to ideate <span className="font-semibold">50+ concepts</span> to approach this problem at its root.
          </SideBySide>
          <SideBySide picLeft={false} pic={
            <HoverMediaOverlay captionColor="text-gray-600" caption={<>Optical<br />Path</>}>
              <MediaSlot
                src={'/images/Axiris-optical.png'}
                label="Axiris optical path"
                natural
                compact
              />
            </HoverMediaOverlay>
          }>
            Using a <span className="font-semibold">Pugh chart</span> and expert feedback, I landed on a <span className="font-semibold">handheld concept based on dual pinholes</span>: two NIR beams pass through the eye, and their spot separation encodes refractive error that we back-calculate to diopters.
            <br />
            <br />
            I then started speccing the optical design step by step: selecting an <span className="font-semibold">850 nm source</span> to maximize retinal reflectance, folding the path with <span className="font-semibold">collimating optics</span> to keep the device handheld and minimize signal loss through the optical path.
          </SideBySide>
          <p className="text-sm font-semibold text-gray-800 mt-2">Points of improvement:</p>
          <Bullets
            items={[
              'Today’s design measures near/farsightedness only. Future versions should capture astigmatism and higher-order aberrations too without losing affordability.',
              'The current prototype has not been tested for durability. I would add accelerated life testing to future iterations.',
            ]}
          />
        </Dropdown>
        <Dropdown
          variant="stacked"
          level={2}
          summaryTitle="Building a model eye to calibrate without an optics lab"
          trackPath="/about/projects/axiris/model-eye"
          summarySubtitle="TL;DR I built a modular model eye with slide-in 'retinas' at known refractive states, giving a repeatable bench testbed to calibrate Axiris and de-risk the design before testing on people."
          onOpenChange={onDd}
          scrollTargetId="project-axiris"
        >
          <SideBySide pic={
            <HoverMediaOverlay caption="Modular Model Eye">
              <MediaSlot
                src={'/images/Axiris-model-eye.png'}
                label="model eye Axiris"
                compact
                imageAspect="h-auto md:h-[320px]"
              />
            </HoverMediaOverlay>
          }>
            Without a proper optics lab, I designed a <span className="font-semibold">modular model eye</span> with an <span className="font-semibold">interchangeable lens</span> and several "retina" slots where a mirror can slide in at known positions, each corresponding to a <span className="font-semibold">ground-truth refractive state</span>. This allowed us to tune the image-processing pipeline and guide mechanical changes.
            <br />
            <br />
            I kept the Axiris housing compatible with both the model eye and a medical-grade eyecup, so we can swap between bench calibration and real-eye measurements in seconds without disturbing the internal alignment.
          </SideBySide>
          <SideBySide picLeft={false} pic={
            <HoverMediaOverlay captionColor="text-white" caption="Image Processing">
              <MediaSlot
                src={'/images/Axiris-Image-Processing.png'}
                label="Axiris image processing issues and solutions"
                natural
                compact
              />
            </HoverMediaOverlay>
          }>
            With a repeatable testbed in hand, the hard part became reading the image. We back-calculate refractive error from the <span className="font-semibold">separation of two pinhole spots</span>, so locating them accurately is everything. Two failure modes dominated: <span className="font-semibold">ghost dots</span> from stray reflections, and <span className="font-semibold">defocus</span> that smeared each spot into a soft blob with no clear center.
            <br />
            <br />
            I fixed the optics first, blocking stray light and locking focus for tight, high-contrast spots (bottom-right). On top of that we built a detection pipeline with swappable spot extractors, including <span className="font-semibold">sub-pixel Gaussian fitting</span> and <span className="font-semibold">blob detection</span>, that rejects ghosts and turns the spot separation into a refractive measurement. Each reading averages many frames with <span className="font-semibold">median + IQR outlier rejection</span> to stay robust across runs.
          </SideBySide>
          <p className="text-sm font-semibold text-gray-800 mt-2">Point of improvement:</p>
          <Bullets
            items={[
              'A more realistic model eye is needed for precise calibration in the future. However, the simplicity and high reflectance of the current model eye was intentional, as it was ideal for early, rough validation.',
            ]}
          />
        </Dropdown>
        <ProjectImprovements
          items={[
            'Validation so far has been on a model eye and bench setup; improving accuracy in a clinical study across real patients and a range of refractive errors is the next step toward a deployable device.',
            'The 574-dollar BOM almost meets the cost target, but the device has not yet been through a design-for-manufacture pass for volume production.',
          ]}
        />
      </Dropdown>
      </div>

      {/* ── SUCTION CUP ── */}
      <div id="project-edg">
      <Dropdown summaryTitle="Tactile End Effector Capstone @ Embodied Dexterity Lab" summaryDate="Sept 2025 – May 2026" tools={['SolidWorks', 'PCB Design', 'Silicone Molding', 'DFM', 'Robotic End-Effectors', 'Design Validation']} onOpenChange={onDd} scrollTargetId="projects" closeSignal={closeSignal} trackPath="/about/projects/edg">
        {/* Two-column intro */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="flex gap-2">
            <div className="flex-1 min-w-0" style={{filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.28))'}}>
              <HoverMediaOverlay
                caption="Haptic following on the suction cup"
                captionClassName="absolute bottom-[10%] left-0 right-0 p-3 translate-y-1 group-hover:translate-y-0 transition-transform duration-300"
              >
                <MediaSlot
                  src={'/images/suction-cup-gif.gif'}
                  label="Suction cup overview"
                  compact
                  height="300px"
                />
              </HoverMediaOverlay>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex justify-end gap-2 flex-wrap">
              <a href="https://edg.berkeley.edu/research/tactile-sensing/" target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs text-gray-800 bg-white/60 hover:bg-white/90 ring-1 ring-black/10 shadow-sm hover:shadow font-semibold px-3.5 py-1 rounded-full transition-all">Lab website</a>
              <a href="/images/135_report_finaldraft_pdf.pdf" target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs text-gray-800 bg-white/60 hover:bg-white/90 ring-1 ring-black/10 shadow-sm hover:shadow font-semibold px-3.5 py-1 rounded-full transition-all">Paper</a>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              The Smart Suction Cup is a multi-chamber, vacuum-based robotic end-effector that enables haptic feedback by sensing internal airflow, helping robots recover when vision-based grasping fails.
              <br />
              <br /> For my graduate capstone, I improved its manufacturability and robustness: designing a custom Printed Circuit Board (PCB), standardizing the robot-arm interface, <span className="font-semibold">cutting the part count from 32 to 9</span> and <span className="font-semibold">reducing setup time from 15 minutes to 1min 45s</span> as we scaled from a research prototype to a production-ready run of <span className="font-semibold">over 1,000 units</span>.
            </p>
          </div>
        </div>
        {/* Full-width case-study dropdown */}
        <div ref={suctionDropdownRef}>
        <Dropdown
          summaryTitle="Raising fabrication success with a five-part peeling mold"
          trackPath="/about/projects/edg/manufacturability"
          summarySubtitle="TL;DR Cups kept tearing during demolding, so I designed a wedged mold that releases one chamber first and peels the rest of the cup out cleanly."
          onOpenChange={onDd}
          scrollTargetId="project-edg"
        >
          <div className="flex flex-col gap-4">
            <HoverMediaOverlay captionColor="text-gray-800" caption="Suction cup redesign">
              <div className="md:hidden">
                <MediaSlot src={'/images/suction-cup-mold-mobile.png'} label="Suction cup mold" padded compact />
              </div>
              <div className="hidden md:block">
                <MediaSlot src={'/images/suction-cup-mold.png'} label="Suction cup mold" padded compact />
              </div>
            </HoverMediaOverlay>
            <p className="text-sm text-gray-700 leading-relaxed">
              An example of improved manufacturability was the silicone suction cup redesign, where I switched to a <span className="font-semibold">three-chamber geometry</span> and improved its mold.
              The new mold uses a <span className="font-semibold">five-part, wedged layout</span> that lets one chamber release first and then allows "peeling" the rest of the cup out cleanly. This <span className="font-semibold">reduced tearing and increased fabrication success</span>.
            </p>
          </div>
          <SideBySide picWidth="w-1/2" picLeft={false} pic={
            <div
              className="relative"
              onMouseEnter={handleAssemblyEnter}
              onMouseLeave={handleAssemblyLeave}
              onClick={handleAssemblyClick}
              style={isMobile ? {cursor: 'pointer'} : undefined}
            >
              <div className="w-full overflow-hidden rounded-xl my-3" style={{aspectRatio: '16/9'}}>
                <video ref={assemblyVideoRef} src="/images/suction-cup-assembly.mp4" className="w-full h-full object-cover" loop muted playsInline preload="auto" />
              </div>
              <div className={`absolute inset-0 rounded-xl overflow-hidden transition-opacity duration-300 pointer-events-none ${assemblyPlaying ? 'opacity-0' : 'opacity-100'}`}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white text-sm font-semibold tracking-wide">
                    {isMobile ? 'Tap to watch assembly' : 'Hover to watch assembly'}
                  </p>
                </div>
              </div>
            </div>
          }>
            The cup also has a strategically placed ridge that interfaces with a compliant clamping mechanism, enabling <span className="font-semibold">toolless mounting</span> for rapid deployment and maintenance.
            <br />
            <br />
            Every design choice was made to <span className="font-semibold">reduce part count, ease handling, and support high-volume manufacturing</span>.
          </SideBySide>
          <SideBySide pic={
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex-1" style={{filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.28))'}}>
                <HoverMediaOverlay caption="Maximum-payload pick-and-place test">
                  <MediaSlot src={'/images/suction-cup-grab.mp4'} label="maximum payload suction cup" videoAspect="aspect-[45/64]" compact />
                </HoverMediaOverlay>
              </div>
              <div className="flex-1" style={{filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.28))'}}>
                <HoverMediaOverlay caption={<>Transparent &amp; oddly shaped object test</>}>
                  <MediaSlot src={'/images/suction-cup-grab-2.mp4'} label="transparent & oddly shaped object test" videoAspect="aspect-[45/64]" compact />
                </HoverMediaOverlay>
              </div>
            </div>
          }>
            After implementing the new geometry, I verified that suction and chamber-level sensing were unchanged, running maximum-payload and varied-object pick-and-place tests on representative items and observing <span className="font-semibold">performance on par with the prior prototype</span>.
          </SideBySide>
          <p className="text-sm font-semibold text-gray-800 mt-2">Points of improvement:</p>
          <Bullets
            items={[
              'I kept the existing silicone formulation of the suction cup; exploring alternative materials could improve yield and durability.',
            ]}
          />
        </Dropdown>
        </div>
        <ProjectImprovements
          items={[
            'The redesign was verified against the prior prototype, but long-run reliability across many grasp cycles (wear and fatigue) has not been characterized and would matter at production scale.',
            'The PCB was optimized for compactness, but currently depends on costly professional assembly; enabling hand-soldering for low-volume production could reduce costs in future iterations.', ]}
        />
      </Dropdown>
      </div>

      {/* ── ADLAP ── */}
      <div id="project-adlap">
      <Dropdown summaryTitle="Light Module for Robotic Surgery System Capstone @ AdLap Lab" summaryDate="Feb 2024 – June 2024" tools={['Thermal Design', 'Mechanism Design', 'Python Simulation', 'CNC Milling', '3D Printing', 'Medical Device Standards']} onOpenChange={onDd} forceOpenTrigger={autoOpen?.key === 'adlap' ? autoOpen.count : 0} scrollTargetId="projects" closeSignal={closeSignal} trackPath="/about/projects/adlap">
        <div className="flex gap-3 items-start">
          <p className="text-sm text-gray-700 leading-relaxed flex-1 min-w-0">
            For my graduating project at TU Delft I developed a <span className="font-semibold">compact, detachable laparoscopic light module</span> for the AdLap system, designed to deliver visible and infrared illumination while meeting strict size, thermal, and mounting constraints. The final prototype reached <span className="font-semibold">42% of a clinical xenon light source</span>, beating our 30% target, while adding infrared the original module never had.
          </p>
          <div className="flex gap-2 flex-wrap flex-shrink-0">
            <a href="/images/adlap-design-paper.pdf" target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs text-gray-800 bg-white/60 hover:bg-white/90 ring-1 ring-black/10 shadow-sm hover:shadow font-semibold px-3.5 py-1 rounded-full transition-all">Paper</a>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <MediaItemCell m={{ src: '/images/adlap-final-design-details.png', label: 'adlap rendering', imageAspect: 'aspect-[16/9] h-auto md:aspect-auto md:h-[258px]' }} />
          <MediaItemCell m={{ src: '/images/adlap-licht-in-buik.jpg', label: 'AdLap light module illuminating tissue', hoverLabel: 'Our light module in action', imageAspect: 'aspect-[16/9] h-auto md:aspect-auto md:h-[258px]' }} />
        </div>

        {/* Insight 1 — switching mechanism */}
        <Dropdown
          summaryTitle="Swapping white and IR light in 0.8s with a single servo"
          summarySubtitle="TL;DR Only one source can face the fibre at a time, so I adapted a rotary pick-and-place mechanism to swap sources on demand."
          trackPath="/about/projects/adlap/switching"
          onOpenChange={onDd}
          scrollTargetId="project-adlap"
        >
          <p className="text-sm text-gray-700 leading-relaxed">
            Surgery lights need two wavelengths: <span className="font-semibold">white light</span> for normal viewing, and <span className="font-semibold">near-infrared</span>, which penetrates deeper and when combined with a fluorescent dye, reveals blood vessels invisible to the naked eye. After researching both and benchmarking against a clinical xenon source, I targeted at least 30% of its output in white light while also emitting IR.
          </p>
          <SideBySide picWidth="w-1/2" picLeft={false} pic={
            <HoverMediaOverlay captionColor="text-gray-800" position="top" caption="Pick-and-place principle (left) adapted into a rotary light-source switch (right)">
              <MediaSlot src={'/images/AdLap-pick-and-place.png'} label="pick and place mechanism" compact imageAspect="aspect-[2/1]" />
            </HoverMediaOverlay>
          }>
            Only one source can face the fibre inlet at a time, so I had a servo based mechanism that rotates the LEDs in place to swap them. To automate it I adapted a <span className="font-semibold">rotational pick-and-place mechanism</span> driven by a single servo, switching sources in about <span className="font-semibold">0.8 seconds</span> mid-operation.
          </SideBySide>
          <SideBySide picWidth="w-1/2" picLeft={true} pic={
            <HoverMediaOverlay captionColor="text-gray-800" position="top" caption="Bench tests comparing connector shapes for light coupling into the endoscope" captionClassName="absolute top-0 left-1/3 right-0 p-3 -translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
              <MediaSlot src={'/images/AdLap-light-testing.png'} label="connector light-coupling testing" compact natural />
            </HoverMediaOverlay>
          }>
            Coupling the LED output into the endoscope's fibre inlet was where most of the light could be lost, so the shape of the connector mattered. I used <span className="font-semibold">ray tracing</span> to model how different connector geometries gathered and redirected light toward the fibre, then ran <span className="font-semibold">simple bench tests</span> to measure the throughput of the most promising shapes. Iterating between simulation and measurement let me converge on the geometry that <span className="font-semibold">minimised light loss</span> at the coupling.
          </SideBySide>
          <p className="text-sm font-semibold text-gray-800 mt-2">Point of improvement:</p>
          <Bullets
            items={[
              'To keep costs down I dropped the optical components and relied on connector geometry alone; adding a collimating lens would have tightened the beam onto the fibre and likely recovered more of the lost light.',
            ]}
          />
        </Dropdown>

        {/* Insight 2 — thermal design */}
        <Dropdown
          summaryTitle="Keeping a 20 W light cool enough to touch with a milled heat spreader"
          summarySubtitle="TL;DR Passive cooling couldn't hold the 41 °C safe-touch limit, so I moved to active cooling, kept sterile-safe by placing the fan behind the sterile line."
          trackPath="/about/projects/adlap/thermal"
          onOpenChange={onDd}
          scrollTargetId="project-adlap"
        >
          <p className="text-sm text-gray-700 leading-relaxed">
            A high-power LED dumps a lot of heat into our sub-241&nbsp;cm³ module, and regulations (DIN&nbsp;EN&nbsp;60601-1) caps any touchable surface at <span className="font-semibold">41 °C</span>. I estimated the heat load and cooling duty, then checked whether <span className="font-semibold">passive fins</span> could cope within the size envelope. They couldn't, so I moved to <span className="font-semibold">active cooling</span>. A small <span className="font-semibold">Python script</span> swept heatsink sizes, fin materials, and airflow rates, and an open-source simulator accounting for conduction and radiation scored each candidate. The example below is one such configuration.
          </p>
          <div className="flex flex-col md:flex-row gap-2 md:items-start">
            <HoverMediaOverlay className="flex-1" captionColor="text-gray-800" position="top" caption="Simulated temperature field for one heatsink + flow configuration">
              <MediaSlot src={'/images/AdLap-heat-sim.png'} label="heatsink thermal simulation" compact natural />
            </HoverMediaOverlay>
            <HoverMediaOverlay className="flex-1" captionColor="text-white" position="top" caption="Rejected sizing: 45×33×30 mm reached 57.8 °C at 2.5 m/s, over the 41 °C limit">
              <MediaSlot src={'/images/AdLap-heat-sink-prototype.png'} label="heat sink prototype trial" compact imageAspect="aspect-[5/4]" />
            </HoverMediaOverlay>
          </div>
          <SideBySide picWidth="w-1/2" picLeft={true} pic={
            <HoverMediaOverlay captionColor="text-gray-800" position="top" caption="Backplate: 3D model and the milled aluminium part">
              <MediaSlot src={'/images/AdLap Backplate.png'} label="aluminium backplate" compact natural />
            </HoverMediaOverlay>
          }>
            To pull heat off the LEDs I designed a <span className="font-semibold">milled aluminium backplate</span> that doubles as a heat spreader: grooves seat both LEDs, and it sits directly against the cooling unit for a short, conductive path from die to heatsink. The fan's own clip system snaps straight on.
          </SideBySide>
          <SideBySide picWidth="w-1/2" picLeft={false} pic={
            <HoverMediaOverlay captionColor="text-gray-800" position="top" caption="Final module: CAD vs printed prototype with the honeycomb cooling case">
              <MediaSlot src={'/images/Adlap-final-design-CAD-and-physical.png'} label="final design with cooling case" compact natural />
            </HoverMediaOverlay>
          }>
            Active cooling posed a regulatory issue: a fan is hard to sterilise and its airflow holes clash with cleaning standards (ISO&nbsp;13485 requires parts to survive chlorine with no deep crevices). Rather than fight it, I <span className="font-semibold">placed the cooling unit and its electronics behind the sterile line</span>, alongside the rest of the AdLap's electronics, so the fan never enters the sterile field, keeping the cleanable part of the module simple.
            <br />
            <br />
            For the exposed side I designed a snap-on case with <span className="font-semibold">honeycomb perforations</span> - enough open area to barely obstruct airflow while stopping anyone from touching the hot heatsink.
          </SideBySide>
          <Bullets
            items={[
              'The backplate is the most manufacturing-intensive part and is currently tied to one specific fan; a more modular interface would simplify both sourcing and fabrication.',
            ]}
          />
        </Dropdown>
          <ProjectImprovements
            items={[
              'The mount only fits a specific endoscope adapter; it is easily adapted but not yet universal.',
              'Laser-diode sources were out of budget but show strong potential for a future, higher-output version.',
            ]}
          />
      </Dropdown>
      </div>

      {/* ── MPC BALANCING ROBOT ── */}
      <div id="project-mpc" className="scroll-mt-32">
      <Dropdown variant="inset" summaryTitle="Model Predictive Torque Control for a Balancing Robot" summaryDate="Sept 2025 – Dec 2025" tools={['Model Predictive Control', 'CasADi', 'MuJoCo', 'Python', 'Dynamics Modeling', 'Embedded (Raspberry Pi)']} onOpenChange={onDd} forceOpenTrigger={autoOpen?.key === 'mpc' ? autoOpen.count : 0} scrollTargetId="projects" closeSignal={closeSignal} trackPath="/about/projects/mpc">
        {/* Two-column intro */}
        <div className="flex flex-col md:flex-row gap-6 md:items-start">
          <div className="w-full md:w-[60%] flex-shrink-0 flex flex-col sm:flex-row gap-2 items-start">
            <HoverMediaOverlay className="flex-1 w-full" caption="Circle-steering test on the robot">
              <MediaSlot src={'/images/MPC-twowheeledrobot.mp4'} label="MPC two-wheeled robot" videoAspect="aspect-[10/7]" fluid compact />
            </HoverMediaOverlay>
            <HoverMediaOverlay className="flex-1 w-full" caption="MuJoCo: perturbation recovery">
              <MediaSlot src={'/images/Mujoco-sim-perturbation-recovery.gif'} label="MuJoCo perturbation recovery" natural compact />
            </HoverMediaOverlay>
          </div>
          <div className="flex flex-col gap-3 flex-1 min-w-0">
            <div className="flex justify-end gap-2 flex-wrap">
              <a href="/images/C231A_project.pdf" target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs text-gray-800 bg-white/60 hover:bg-white/90 ring-1 ring-black/10 shadow-sm hover:shadow font-semibold px-3.5 py-1 rounded-full transition-all">Paper</a>
              <a href="https://www.youtube.com/watch?v=xH82VY5cUp4" target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs text-gray-800 bg-white/60 hover:bg-white/90 ring-1 ring-black/10 shadow-sm hover:shadow font-semibold px-3.5 py-1 rounded-full transition-all">Video</a>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              For my graduate controls course (ME C231A) at Berkeley, I designed and simulated the controller that keeps a <span className="font-semibold">self-balancing two-wheeled robot</span> (think Segway) upright, a system that naturally wants to topple over. The controller, a Model Predictive Controller (MPC), plans the wheel torques a fraction of a second into the future, and I <span className="font-semibold">extended it to stay balanced on slopes and while steering</span>.
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">
          I derived the dynamics, formulated the MPC in <span className="font-semibold">CasADi</span>, and validated it in <span className="font-semibold">MuJoCo</span> across balancing, drive-stop, slope, and circle-steering tests, using each scenario to study how the cost weights and horizon shape the controller's behaviour.
        </p>
        {/* Full-width case-study dropdowns */}
        <Dropdown
          variant="inset"
          level={2}
          summaryTitle="Running real-time MPC on a 6-state robot model"
          trackPath="/about/projects/mpc/architecture"
          summarySubtitle="TL;DR The full dynamics were too heavy to solve every control loop, so I stripped the model down to six states and a few simplifications that keep the controller solving in real time on a Raspberry Pi."
          onOpenChange={onDd}
          scrollTargetId="project-mpc"
        >
          <HoverMediaOverlay captionColor="text-gray-800" caption="Hardware & software architecture">
            <MediaSlot src={'/images/hardware & code architecture.png'} label="MPC hardware and code architecture" natural compact />
          </HoverMediaOverlay>
          <p className="text-sm text-gray-700 leading-relaxed">
            I modeled the robot as a coupled <span className="font-semibold">6-state system</span>, position, pitch, heading and their rates, driven by the two wheel torques, with equation of motion M(q)q̈ = Fu − C − G. To keep it solvable in real time I deliberately <span className="font-semibold">simplified the model</span>: a constant yaw inertia, and neglecting the gyroscopic coupling and wheel inertia. <span className="font-semibold">CasADi</span> then builds the symbolic dynamics the controller solves against.
            <br />
            <br />
            The MPC minimises a <span className="font-semibold">quadratic cost</span> on state error and control effort, with a <span className="font-semibold">terminal cost from the DARE</span> for stability, over a <span className="font-semibold">30-step horizon</span> at a <span className="font-semibold">65 ms sampling time (~15 Hz)</span>. Hard constraints keep the pitch, pitch rate and motor torque within the robot's physical limits, and a <span className="font-semibold">safety cutoff</span> halts all control once the pitch passes 30°.
            <br />
            <br />
            As shown above, the solver runs on a <span className="font-semibold">Raspberry Pi</span> that talks over USB to the <span className="font-semibold">Balboa low-level board</span> handling the IMU, encoders and motors.
          </p>
          <SideBySide pic={
            <HoverMediaOverlay captionColor="text-gray-800" caption="Optimization problem solved at each step">
              <MediaSlot src={'/images/Optimization-problem-solved-at-every-step.png'} label="Receding-horizon optimization problem" natural compact />
            </HoverMediaOverlay>
          }>
            At every control step the MPC <span className="font-semibold">re-solves this finite-horizon problem</span>: minimise the tracking and control-effort cost subject to the linearized dynamics, the measured current state, and the pitch, pitch-rate and torque limits. It then applies only the <span className="font-semibold">first optimal input</span> and repeats the whole optimization at the next step.
          </SideBySide>
          <SideBySide picLeft={false} pic={
            <HoverMediaOverlay captionColor="text-gray-800" caption="Pitch trajectories vs. horizon length">
              <MediaSlot src={'/images/Pitch-horizon-vs-trajectories.png'} label="Pitch trajectories vs horizon length" natural compact />
            </HoverMediaOverlay>
          }>
            Picking the horizon was a direct <span className="font-semibold">trade-off</span>, which I studied by sweeping it against the resulting pitch trajectory. <span className="font-semibold">Short horizons</span> leave the controller too short-sighted to stabilise, so the pitch diverges and the robot falls. <span className="font-semibold">Intermediate horizons</span> recover, but slowly and with oscillation. <span className="font-semibold">Longer horizons</span> converge cleanly, with diminishing returns past a point. Together with a rise-time analysis (~20 samples within the 1.3 s rise), this settled my final choice: a <span className="font-semibold">0.065 s sampling time</span> and a <span className="font-semibold">30-step horizon</span>.
          </SideBySide>
          <p className="text-sm font-semibold text-gray-800 mt-2">Point of improvement:</p>
          <Bullets
            items={[
              'Linearizing online about the current state actually performed worse than a fixed linearization, since the simplified model breaks down when far from upright.',
            ]}
          />
        </Dropdown>
        <Dropdown
          variant="inset"
          level={2}
          summaryTitle="Holding balance on slopes and cutting solve time ~64% with warm-starting"
          trackPath="/about/projects/mpc/tests"
          summarySubtitle="TL;DR On a slope the robot settles at a lean slightly shallower than the ground angle, and in a hard stop it stays well inside its safe pitch band."
          onOpenChange={onDd}
          scrollTargetId="project-mpc"
        >
          <div className="flex flex-col md:flex-row gap-6 md:items-start">
            <div className="w-full md:w-[60%] flex-shrink-0 flex flex-col sm:flex-row gap-2 items-start">
              <HoverMediaOverlay className="flex-1 w-full" captionColor="text-gray-800" caption="Stabilization across slopes">
                <MediaSlot src={'/images/Stabilization on different slopes.png'} label="Stabilization on different slopes" natural compact />
              </HoverMediaOverlay>
              <HoverMediaOverlay className="flex-1 w-full" caption="MuJoCo: slope stabilization">
                <MediaSlot src={'/images/mujoco-sim-slope-stabilization.gif'} label="MuJoCo slope stabilization" natural compact />
              </HoverMediaOverlay>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed flex-1 min-w-0 md:mt-8">
              On an incline the controller has to <span className="font-semibold">hold position against gravity</span>, so I weight position and pitch rate most heavily. The robot settles at a <span className="font-semibold">lean slightly shallower than the slope itself</span> while its velocity returns to zero: to stay put, the wheels must hold an uphill torque that cancels the downhill pull of gravity, which requires leaning a touch further uphill than the ground angle. This settling is <span className="font-semibold">clean and consistent across 5°, 10° and 15° slopes</span>.
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-6 md:items-start mt-3">
            <p className="text-sm text-gray-700 leading-relaxed flex-1 min-w-0 md:mt-8">
              In the drive-stop test the robot drives forward, then halts and re-balances. Here <span className="font-semibold">position and velocity dominate the weights</span>, with pitch kept moderate for lean compensation. The pitch stays comfortably inside the <span className="font-semibold">±10° safe zone</span> throughout, and the prediction tracks the response well while the motion is gradual. The <span className="font-semibold">brief wobble at the driving-to-stopping switch</span> (~5 s) is expected: the MPC cannot anticipate a discrete mode change and has to react to it after the fact.
            </p>
            <div className="w-full md:w-[60%] flex-shrink-0 flex flex-col sm:flex-row gap-2 items-start order-first md:order-last">
              <HoverMediaOverlay className="flex-1 w-full" captionColor="text-gray-800" caption="Drive-stop pitch tracking">
                <MediaSlot src={'/images/Drive stop test.png'} label="Drive-stop test" natural compact />
              </HoverMediaOverlay>
              <HoverMediaOverlay className="flex-1 w-full" caption="MuJoCo: drive-stop test">
                <MediaSlot src={'/images/mujoco-sim-drive-stop-test.gif'} label="MuJoCo drive-stop test" natural compact />
              </HoverMediaOverlay>
            </div>
          </div>
          <SideBySide pic={
            <HoverMediaOverlay captionColor="text-gray-800" caption="Cold vs warm-start solve times" captionClassName="absolute bottom-3 left-0 right-0 p-3 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
              <MediaSlot src={'/images/warm start analysis.png'} label="Warm start solve-time analysis" natural compact />
            </HoverMediaOverlay>
          }>
            Because this controller is meant for a real-time system, the worst-case solve time matters as much as the average. I warm-start each solve by seeding it with the previous step's shifted solution instead of starting from scratch. As the histogram shows, this <span className="font-semibold">cut the worst-case solve time by ~64%</span> and the 99th-percentile by ~20%, keeping every iteration comfortably inside the control loop's time budget.
          </SideBySide>
          <p className="text-sm font-semibold text-gray-800 mt-2">Point of improvement:</p>
          <Bullets
            items={[
              'Circle steering never reached a steady turn despite valid open-loop torque commands, most likely a model-simulation mismatch (unmodeled wheel slip, friction coupling, neglected pitch-yaw cross terms). Modeling those effects to close the gap is the main piece of future work.',
            ]}
          />
        </Dropdown>
        <ProjectImprovements
          items={[
            'On real hardware, an observer such as a Kalman filter is needed for trustworthy state estimates; tuning the MPC has limited value without it.',
            'Validation is in simulation and open-loop on the robot; closing the loop on the physical hardware, with proper state estimation, is the main remaining step.',
          ]}
        />
      </Dropdown>
      </div>

    </div>
  );
}

// ── honours mentions ──────────────────────────────────────────────────────────

const honourItems = [
  {
    id: 'sproutup',
    date: 'Sept 2025 – Dec 2025',
    title: 'SproutUp: An Assistive Standing Device',
    squareImages: true,
    mediaLayout: 'text-above',
    tools: ['Mechatronics', 'Wearables', 'Sensing & Control', 'Prototyping'],
    description: 'An early proof of concept prototype of a wearable assistive seat that senses sit-to-stand motion and provides adaptive force assistance. A bit on the bulky side, because our budget had strong opinions.',
    media: [
      { src: '/images/Sprout-up-wearing.jpg', label: 'wearing sproutup', hoverLabel: 'Wearing SproutUp', imageAspect: 'aspect-[20/19]' },
      { src: '/images/Sprout-up-deep-dive.png', label: 'sproutup picture 2', hoverLabel: 'SproutUp deep dive', natural: true, hoverTextColor: 'text-gray-800' },
    ],
    links: [
      { label: 'Paper', href: '/images/SproutUp-paper.pdf' },
      { label: 'Poster', href: '/images/SproutUp-poster.pdf' },
    ],
  },
  {
    id: 'pcm',
    date: 'Nov 2022 – Jan 2023',
    title: 'Phase Change Materials Based Cooling in Solar Panels',
    mediaLayout: 'text-above',
    tools: ['Python', 'Thermal Modeling', 'Simulation', 'Solar / PV'],
    description: 'Built a Python model of a solar panel system with phase-change material cooling to analyze efficiency trends under varying environmental conditions.',
    media: [
      { src: '/images/PCM-results.png', label: 'PCM results', hoverLabel: 'PV cell efficiency simulation results', hoverPosition: 'top', imageAspect: 'aspect-[10/4.8]', hoverTextColor: 'text-gray-800', outerClassName: 'w-full md:w-[70%] flex-shrink-0' },
      { src: '/images/PCM-schema.png', label: 'PCM schema', hoverLabel: 'PCM-PV cell interactions', natural: true, hoverTextColor: 'text-gray-800', outerClassName: 'w-full md:w-[30%] flex-shrink-0' },
    ],
    links: [{ label: 'Paper', href: '/images/PCM_FINALREPORT.pdf' }],
  },
];

function MediaItemCell({ m, squareImages, outerClassName = 'flex-1 min-w-0' }) {
  const media = (
    <MediaSlot src={m.src} label={m.label} square={!!squareImages} videoAspect={m.videoAspect} imageAspect={m.imageAspect} fluid={!!m.fluid} fit={m.fit} natural={!!m.natural} compact />
  );
  return (
    <div className={outerClassName}>
      {m.hoverLabel ? (
        <HoverMediaOverlay
          caption={m.hoverLabel}
          captionColor={m.hoverTextColor || 'text-white'}
          position={m.hoverPosition === 'top' ? 'top' : 'bottom'}
          align={m.hoverAlign === 'right' ? 'right' : 'left'}
        >
          {media}
        </HoverMediaOverlay>
      ) : (
        <div className="my-3 rounded-xl overflow-hidden">{media}</div>
      )}
    </div>
  );
}

function HonoursSlide({ onDd, autoOpen, closeSignal }) {
  return (
    <div className="px-6 pb-5 pt-3 md:px-8 md:pb-6 md:pt-4">
      <p className="text-lg font-bold text-gray-800 mb-2">Upcoming:</p>

      {/* ── LUCI ── */}
      <div id="project-luci">
      <Dropdown variant="inset" summaryTitle="All-Terrain Autonomous Vehicle @ Model Predictive Control Lab" summaryDate="June 2026 – Aug 2026" tools={['CAD', '3D Printing', 'Robotics', 'Systems Integration', 'Technical Documentation']} onOpenChange={onDd} forceOpenTrigger={autoOpen?.key === 'luci' ? autoOpen.count : 0} scrollTargetId="projects" closeSignal={closeSignal} trackPath="/about/projects/luci">
        {/* Two-column intro */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          <HoverMediaOverlay caption="Full vehicle CAD">
            <MediaSlot
              src={"/images/LUCI-CAD.png"}
              label="ONR Luci CAD"
              compact
              imageAspect="aspect-[16/9] md:aspect-auto md:h-[260px]"
            />
          </HoverMediaOverlay>
          <div className="flex flex-col gap-3">
            <div className="flex justify-end gap-2 flex-wrap">
              <a
                href="https://sites.google.com/berkeley.edu/mpc-lab/home?authuser=0"
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-gray-800 bg-white/60 hover:bg-white/90 ring-1 ring-black/10 shadow-sm hover:shadow font-semibold px-3.5 py-1 rounded-full transition-all whitespace-nowrap"
              >
                Lab website
              </a>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              Development of an <span className="font-semibold">all-terrain unmanned autonomous reconnaissance rover</span>.
              Currently redesigning the 3D-printed chassis to improve structural robustness and serviceability, while supporting navigation and autonomy integration.
            </p>
            <div>
              <p className="text-sm font-semibold text-gray-800">Upcoming tasks:</p>
              <Bullets
                items={[
                  'Designing a Model Predictive Control (MPC) controller from scratch to compare against the existing PID controller.',
                  'Scaling the vehicle up, to use for solar plant inspections.',
                ]}
              />
            </div>
          </div>
        </div>
        {/* Full-width case-study dropdown */}
        <Dropdown
          variant="inset"
          level={2}
          summaryTitle="Rebuilding the rover from scratch to surface every pain point"
          trackPath="/about/projects/luci/process"
          summarySubtitle="TL;DR: I interviewed prior users, then captured every complication firsthand and turned those findings into an assembly guide, wiring diagram, and updated BOM to improve remote collaboration."
          onOpenChange={onDd}
          scrollTargetId="project-luci"
        >
          <SideBySide picWidth="w-[45%]" pic={
            <div className="flex justify-center">
            <HoverMediaOverlay className="w-[71%]" caption="Re-assembling the rover">
              <MediaSlot src={"/assets/29_jetson_3.jpg"} label="Luci build" natural compact />
            </HoverMediaOverlay>
            </div>
          }>
            I began by <span className="font-semibold">interviewing everyone who had worked with the robot</span> to surface recurring pain points, failure modes, and workflow bottlenecks. Then I <span className="font-semibold">rebuilt the rover from scratch</span>, documenting every complication, assembly dependency, and time-consuming step along the way.
          </SideBySide>
          <div className="flex flex-col md:flex-row gap-4 md:items-start">
            <p className="text-sm text-gray-700 leading-relaxed md:mt-8">
              That led me to create a detailed <span className="font-semibold">assembly guide</span> and cleaned-up <span className="font-semibold">wiring diagram</span>, documenting every step so the build is repeatable, components are easy to replace, and NIWC collaborators can follow along remotely.
              <br />
              <br /> Before touching the design, I work to fully understand a project's users, constraints, and system-level issues, the kind of <span className="font-semibold">detail-oriented, user-centered</span> groundwork that ensures later changes solve the right problems.
            </p>
            <div className="w-full md:w-[55%] flex-shrink-0">
              <AssemblyGuide />
            </div>
          </div>
          <SideBySide picWidth="w-[45%]" mobileImageBelow pic={
            <HoverMediaOverlay caption="Simple adjustable camera mount">
              <MediaSlot src={'/images/simple-mount-render-2.png'} label="simple mount" compact imageAspect="aspect-[4/3] h-auto md:aspect-auto md:h-[208px]" />
            </HoverMediaOverlay>
          }>
            Doing all of this was the fastest way to get up to speed, and I now have the context to start making meaningful design changes.
            <br />
            <br />
            First improvement: I designed a <span className="font-semibold">simple camera mount</span> for better stability and crash resilience, and am now adding <span className="font-semibold">damping</span> and an <span className="font-semibold">automated pan/tilt mechanism</span>.
          </SideBySide>
        </Dropdown>
      </Dropdown>
      </div>

      <p className="text-lg font-bold text-gray-800 mb-2 mt-6">Honorable mentions:</p>

      {/* ── CNC ── */}
      <div id="project-cnc">
      <Dropdown variant="inset" summaryTitle="Sophomore Project: Building a CNC Machine" summaryDate="Sept 2022 – Nov 2022" tools={['Mechanical Design', 'Motion Systems', 'Vibration Damping', 'Tolerancing', 'Fabrication']} onOpenChange={onDd} scrollTargetId="projects" closeSignal={closeSignal} trackPath="/about/projects/cnc">
        <p className="text-sm text-gray-700 leading-relaxed">
          I designed and built a fully custom CNC machine from scratch on an <span className="font-semibold">H-bot single-belt architecture</span>. I sharpened motion quality two ways: a modular pre-tensioning system that sets gantry belt tension by repositioning structural mounts, and vibration damping that adds mass to the aluminium frame to push resonant frequencies clear of the operating range. The Z-axis pairs a lead screw with dual guide bars for vertical stiffness and positioning accuracy.
          <br />
          <br />
          In practice it held roughly <span className="font-semibold">±0.25 mm</span> general XY accuracy, tightening to <span className="font-semibold">~±0.13 mm</span> on critical features, with strong repeatability on well-calibrated moves.
        </p>
        <div className="flex flex-col md:flex-row gap-2">
          <MediaItemCell m={{ src: '/images/full CNC render.jpg', label: 'CNC image 1', hoverLabel: 'CNC rendering', hoverPosition: 'top', imageAspect: 'h-[226px] md:h-[260px]', hoverTextColor: 'text-gray-800' }} />
          <MediaItemCell m={{ src: '/images/full CNC physical.jpg', label: 'CNC image 2', hoverLabel: 'CNC fully assembled', imageAspect: 'h-[260px]' }} />
          <MediaItemCell m={{ src: '/images/CNC video.mp4', label: 'CNC video', hoverLabel: 'The "Aron 3000" (our machine’s nickname) in action', fluid: true, videoAspect: 'aspect-[8/9]' }} />
        </div>
      </Dropdown>
      </div>

      {honourItems.map((item) => (
        <Dropdown
          key={item.id}
          summaryTitle={item.title}
          summaryDate={item.date}
          tools={item.tools}
          onOpenChange={onDd}
          scrollTargetId="projects"
          closeSignal={closeSignal}
          trackPath={`/about/projects/honours/${item.id}`}
        >
          {item.links.length > 0 && (
            <div className="flex justify-end gap-2 flex-wrap">
              {item.links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs text-gray-800 bg-white/60 hover:bg-white/90 ring-1 ring-black/10 shadow-sm hover:shadow font-semibold px-3.5 py-1 rounded-full transition-all"
                >
                  {l.label}
                </a>
              ))}
            </div>
          )}
          {item.mediaLayout === 'text-above' ? (
            <>
              {item.description && <p className="text-sm text-gray-700 leading-relaxed">{item.description}</p>}
              <div className="flex flex-col md:flex-row gap-2">
                {item.media.map((m) => (
                  <MediaItemCell key={m.label} m={m} squareImages={item.squareImages} outerClassName={m.outerClassName} />
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col md:flex-row gap-4 md:items-start">
              <div className="w-full md:w-1/2 flex-shrink-0 flex flex-col gap-2">
                {item.media.map((m) => (
                  <MediaItemCell key={m.label} m={m} squareImages={item.squareImages} />
                ))}
              </div>
              <div className="text-sm text-gray-700 leading-relaxed md:mt-8">
                {item.description && <p>{item.description}</p>}
                {item.sideText && (
                  <div className={item.description ? 'mt-2' : undefined}>
                    <p className="font-semibold text-gray-800">{item.sideText.heading}</p>
                    <p className="mt-1">{item.sideText.body}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </Dropdown>
      ))}
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

const slides = [
  { id: 'projects', label: 'Projects' },
  { id: 'honours', label: 'Honours' },
];

export default function ProjectPortfolio({ initialSlideId, jumpToProject, closeAllSignal }) {
  const getInitialIndex = () => {
    if (!initialSlideId) return 0;
    const idx = slides.findIndex((s) => s.id === initialSlideId);
    return idx >= 0 ? idx : 0;
  };

  const [currentIndex, setCurrentIndex] = useState(getInitialIndex);
  const [closeSignal, setCloseSignal] = useState(0);

  // Registry of open dropdowns whose title has scrolled out of view. The chip
  // targets the deepest one (highest level), so closing cascades inward-out.
  const chipRegistry = useRef(new Map());
  const chipOrder = useRef(0);
  const [activeChip, setActiveChip] = useState(null);
  // The close chip is only useful while the Projects section is on screen; once
  // the whole section scrolls out of view it has nothing to act on, so hide it.
  const sectionRef = useRef(null);
  const [sectionVisible, setSectionVisible] = useState(true);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setSectionVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const recomputeChip = useCallback(() => {
    let best = null;
    for (const entry of chipRegistry.current.values()) {
      // Deepest dropdown wins; ties go to the most recently scrolled past.
      if (!best || entry.level > best.level || (entry.level === best.level && entry.order > best.order)) best = entry;
    }
    setActiveChip(best);
  }, []);
  const chipController = useMemo(() => ({
    register: (id, data) => { chipRegistry.current.set(id, { id, order: ++chipOrder.current, ...data }); recomputeChip(); },
    unregister: (id) => { chipRegistry.current.delete(id); recomputeChip(); },
  }), [recomputeChip]);

  useEffect(() => {
    // Fix: Issue #21 — track appended preload links and remove them on unmount
    const links = [];
    [
      '/images/suction-cup-assembly.mp4',
      '/images/suction-cup-grab.mp4',
      '/images/suction-cup-grab-2.mp4',
      '/images/CNC video.mp4',
      '/images/MPC-twowheeledrobot.mp4',
    ].forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'video';
      link.href = url;
      document.head.appendChild(link);
      links.push(link);
    });
    return () => links.forEach(l => l.remove());
  }, []);

  useEffect(() => {
    if (!jumpToProject?.count) return;
    // LUCI and CNC live on the Honours slide; everything else on the Projects slide.
    const targetSlideId = jumpToProject.key === 'luci' || jumpToProject.key === 'cnc' ? 'honours' : 'projects';
    const targetIdx = slides.findIndex(s => s.id === targetSlideId);
    setCurrentIndex(targetIdx >= 0 ? targetIdx : 0);
    if (jumpToProject.key) {
      setTimeout(() => {
        document.getElementById(`project-${jumpToProject.key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 400);
    }
  }, [jumpToProject]);

  useEffect(() => {
    if (!closeAllSignal) return;
    setCloseSignal((s) => s + 1);
  }, [closeAllSignal]);

  useEffect(() => {
    if (slides[currentIndex].id === 'honours') trackPageview('/about/projects/honours');
  }, [currentIndex]);

  const goTo = (idx) => {
    setCurrentIndex(idx);
    setCloseSignal((s) => s + 1);
  };
  const goNext = () => goTo((currentIndex + 1) % slides.length);
  const goPrev = () => goTo((currentIndex - 1 + slides.length) % slides.length);

  const slideId = slides[currentIndex].id;

  return (
    <section ref={sectionRef}>
      <h2 className="text-center mb-6 text-2xl md:text-3xl font-bold text-gray-400">
        <T>project portfolio</T>
      </h2>

      <div id="project-carousel" className="rounded-2xl bg-white/70 backdrop-blur-md ring-1 ring-black/5 shadow-xl overflow-hidden">
        {/* Nav bar */}
        <div className="flex items-center justify-between px-4 py-2">
          <button
            onClick={goPrev}
            className="carousel-arrow w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition text-base leading-none"
            aria-label="Previous slide"
          >
            {'\u2039'}
          </button>

          <div className="flex gap-2 items-center">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => goTo(i)}
                title={s.label}
                aria-label={`Go to ${s.label}`}
                className={`carousel-dot h-2 rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? 'carousel-dot-active w-6 bg-gray-600'
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

          <button
            onClick={goNext}
            className="carousel-arrow w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition text-base leading-none"
            aria-label="Next slide"
          >
            {'\u203A'}
          </button>
        </div>

        {/* Slide content */}
        <ChipContext.Provider value={chipController}>
          <AnimatePresence mode="wait">
            <motion.div
              key={slideId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {slideId === 'projects' && <FeaturedProjectsSlide autoOpen={jumpToProject} closeSignal={closeSignal} />}
              {slideId === 'honours' && <HonoursSlide autoOpen={jumpToProject} closeSignal={closeSignal} />}
            </motion.div>
          </AnimatePresence>
        </ChipContext.Provider>
      </div>

      {/* Floating close chip — appears when the open dropdown's title scrolls out
          of frame; closes the deepest such dropdown via its own close behaviour. */}
      <AnimatePresence>
        {activeChip && sectionVisible && (
          <motion.button
            key="project-close-chip"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            onClick={() => activeChip.close()}
            aria-label="Close section"
            className="fixed bottom-4 left-4 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/50 backdrop-blur-md border border-white/20 shadow-2xl text-white/80 hover:text-white text-xs font-medium uppercase tracking-wide transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            close
          </motion.button>
        )}
      </AnimatePresence>
    </section>
  );
}
