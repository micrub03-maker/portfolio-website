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
function Dropdown({ summaryTitle, summaryDate, summarySubtitle, onOpenChange, noClickClose = true, forceOpenTrigger, scrollTargetId, closeSignal, trackPath, variant = 'default', level = 1, children }) {
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

  // Close + scroll back to the target — the exact behaviour of the title button.
  const close = () => {
    setOpen(false);
    onOpenChange?.(false);
    setTimeout(() => {
      const target = scrollTargetId ? document.getElementById(scrollTargetId) : buttonRef.current;
      if (target) {
        const y = target.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top: y, behavior: 'smooth' });
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

  return (
    <div ref={containerRef} className={v.container}>
      <button
        ref={buttonRef}
        onClick={toggle}
        aria-expanded={open}
        className={`w-full text-left px-4 py-3 flex items-start justify-between gap-3 ${v.toggle} transition-colors`}
      >
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 text-sm">
              {summaryTitle}
              {summaryDate && <span className="ml-2 font-normal text-gray-400 text-xs">{summaryDate}</span>}
            </p>
          {summarySubtitle && (
            <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{summarySubtitle}</p>
          )}
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

      {/* ── LUCI ── */}
      <div id="project-luci">
      <Dropdown variant="inset" summaryTitle="All-Terrain Autonomous Vehicle @ Model Predictive Control Lab" summaryDate="May 2026 – Present" onOpenChange={onDd} forceOpenTrigger={autoOpen?.key === 'luci' ? autoOpen.count : 0} scrollTargetId="projects" closeSignal={closeSignal} trackPath="/about/projects/luci">
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
              Development of an all-terrain unmanned autonomous reconnaissance rover. 
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
          summaryTitle="An insight into how I start new projects"
          trackPath="/about/projects/luci/process"
          summarySubtitle="TL;DR: I interviewed prior users, rebuilt my own robot from scratch to identify pain points firsthand, and turned those findings into an assembly guide, wiring diagram, and updated BOM to improve remote collaboration."
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
            I began by interviewing everyone who had worked with the robot to understand recurring pain points, failure modes, and workflow bottlenecks. To really understand these issues, I rebuilt the rover from scratch and documented every complication, assembly dependency, and time-consuming step along the way.
          </SideBySide>
          <div className="flex flex-col md:flex-row gap-4 md:items-start">
            <p className="text-sm text-gray-700 leading-relaxed md:mt-8">
              That process led me to create a detailed assembly guide and a cleaned-up wiring diagram to improve build repeatability, simplify component replacement, and support clearer communication with the NIWC collaborators at a distance.
              <br />
              <br /> Before making design changes, I always focus on understanding a project's constraints, goals, and system-level issues. This reflects my documentation discipline, attention to detail, and user-centered engineering approach.
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
            Doing all of this was the best way to get up to speed quickly. I now feel confident I have enough context to start the fun part! 
            <br />
            <br />
            First solve: I designed a simple mount for the camera improving stability and crash resilience, and am working on including damping and an automated pan/tilt mechanism.
          </SideBySide>
        </Dropdown>
      </Dropdown>
      </div>

      {/* ── CALSOL ── */}
      <div id="project-calsol">
      <Dropdown variant="flat" summaryTitle="Seatbelts Development @ CalSol" summaryDate="Sept 2025 – Present" onOpenChange={onDd} forceOpenTrigger={autoOpen?.key === 'calsol' ? autoOpen.count : 0} scrollTargetId="projects" closeSignal={closeSignal} trackPath="/about/projects/calsol">
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
              As Driver Safety Lead for the Berkeley Solar car student team, I owned the design, analysis, and validation of the five-point seatbelt harness mounting system for CalSol's GenXI solar vehicle. I oversaw the full process from regulation interpretation and design through physical testing and manufacturing handoff. 
              <br /> 
              < br/>
              Our seatbelt system was the first mechanical subsystem to pass scrutineering for the 2026 race cycle.
            </p>
          </div>
        </div>
        {/* Full-width case-study dropdowns */}
        <Dropdown
          variant="flat"
          level={2}
          summaryTitle="An insight into lap-belt insert design and validation"
          trackPath="/about/projects/calsol/inserts"
          summarySubtitle="TL;DR I designed bonded metal inserts, validated them analytically and with quasi-static pull-out tests to credibly meet the load requirement on the occupant cell."
          onOpenChange={onDd}
          scrollTargetId="project-calsol"
        >
          <SideBySide picWidth="w-[45%]" pic={
            <HoverMediaOverlay position="top" caption="Inserts flushed in shell">
              <MediaSlot src={'/images/Calsol-inserts.png'} label="inserts" compact imageAspect="aspect-[10/9] h-auto md:aspect-auto md:h-[288px]" />
            </HoverMediaOverlay>
          }>
            To safely anchor the lap- and sub-belts into the thin carbon fiber cell, I designed bonded metal inserts that follow the shell curvature and sit sandwiched within the laminate. The belts clip into eyebolts threaded into these inserts.
            <br />
            <br />
            I translated regulations into explicit load cases and analyzed the primary failure modes: thread stripping and laminate debonding.
          </SideBySide>
          <p className="text-sm text-gray-700 leading-relaxed">
           Without access to dynamic crash equipment, I identified the critical load case analytically and designed a conservative quasi-static pull-out test measuring an average failure load of 6.11 kN across four samples. Which, together with published dynamic CFRP insert data, showed the design could credibly meet the required loads.
          </p>
          <HoverMediaOverlay className="shadow-md" position="top" captionColor="text-gray-800" caption="insert testing jig">
            <div className="[&>div]:h-[128px] md:[&>div]:h-[320px] [&>div]:!p-1 [&>div]:my-0">
              <MediaSlot
                src={'/images/insert testing jig picture.png'}
                label="Inserts test set up"
                padded
              />
            </div>
          </HoverMediaOverlay>
          <p className="text-sm font-semibold text-gray-800 mt-2">Points of improvement:</p>
          <Bullets
            items={[
              'Relying on quasi-static tests and literature to argue dynamic performance is not fully satisfying for a critical part. Next time I would add an extra validation step (e.g. higher-rate testing or an alternate experimental setup directly checking target load).',
              "The insert is still relatively bulky; given the multi-axis machining already required for its manufacturing it's possible to design complex shapes to shed more weight.",
            ]}
          />
        </Dropdown>
        <Dropdown
          variant="flat"
          level={2}
          summaryTitle="An insight into the topology-optimized shoulder-belt anchorage"
          trackPath="/about/projects/calsol/shoulder"
          summarySubtitle='TL;DR I designed a steel shoulder-belt mount holding wrapping bolts, cut mount weight by ~40% via topology optimization.'
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
            For the shoulder harness, I designed a steel anchorage that bolts through the chassis and supports transverse "wrapping bolts" around which the shoulder belts are looped, eliminating single-point failure by allowing each strap to wrap independently.
          </SideBySide>
          <SideBySide picWidth="w-1/2" picLeft={false} pic={
            <div className="flex justify-center">
              <HoverMediaOverlay
                className="w-full md:w-[73%]"
                caption="Bolt governing load case"
                gradientClassName="bg-gradient-to-t from-black/60 via-black/20 to-transparent"
                captionClassName="absolute bottom-[15%] left-0 right-0 p-3 translate-y-1 group-hover:translate-y-0 transition-transform duration-300"
              >
                <MediaSlot src={'/images/shoulder-calcs.png'} label="Shoulder belt calcs" compact imageAspect="h-[184px] md:h-[240px]" />
              </HoverMediaOverlay>
            </div>
          }>
            I modeled the wrapping bolts as fixed-fixed beams under the projected distributed load to size them for the governing failure mode: bending. The rest of the anchorage was designed around these choices.
          </SideBySide>
          <p className="text-sm text-gray-700 leading-relaxed">
            Once the baseline design cleared all load cases, I ran a SolidWorks topology optimization on the backplate to strip non-critical material while preserving manufacturability (uniform thickness, waterjet-friendly geometry, intact interfaces), ultimately cutting weight by roughly 40% while maintaining acceptable safety margins.
          </p>
          <MediaSlot
            src={'/images/calsol-topology.png'}
            label="Shoulder belt CAD topology"
            imageAspect="h-auto md:h-[245px]"
          />
          <p className="text-sm font-semibold text-gray-800 mt-2">Points of improvement:</p>
          <Bullets
            items={[
            'Validation of this design relies entirely on simulation; physical testing should be added to confirm the modeled behavior.',
            ]}
          />
        </Dropdown>
      </Dropdown>
      </div>

      {/* ── AXIRIS ── */}
      <div id="project-axiris">
      <Dropdown variant="stacked" summaryTitle="Handheld Autorefractor @ Axiris Technologies" summaryDate="Jan 2026 – Present" onOpenChange={onDd} forceOpenTrigger={autoOpen?.key === 'axiris' ? autoOpen.count : 0} scrollTargetId="projects" closeSignal={closeSignal} trackPath="/about/projects/axiris">
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
              Axiris is a low-cost, handheld autorefractor for vision screening in low-resource settings, where conventional 5,000–30,000-dollar systems are hard to deploy. As optical lead, I chose a Scheiner-disk optical path with an external NIR camera and helped develop a Python image-processing stack to estimate refractive error, iterating through six prototypes over 13 weeks to reach a 574-dollar BOM.
            </p>
          </div>
        </div>
        {/* Full-width case-study dropdowns */}
        <Dropdown
          variant="stacked"
          level={2}
          summaryTitle="An insight into my design process"
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
            Hundreds of millions of people live with avoidable vision loss, we started with a simple question: why?
            <br />
            <br />
            Through interviews with ophthalmologists, NGO screeners, and engineers, we realized this gap in care comes from current solutions being expensive and requiring clinics, power, and trained staff. This realization led us to ideate 50+ concepts to approach this problem at its root.
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
            Using a Pugh chart and expert feedback, we landed on a handheld concept based on dual pinholes: two NIR beams pass through the eye, and their spot separation encodes refractive error that we back-calculate to diopters.
            <br />
            <br />
            I then started speccing the optical design step by step: selecting an 850 nm source to maximize retinal reflectance, folding the path with collimating optics to keep the device handheld and minimize signal loss through the optical path.
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
          summaryTitle="An insight into my resilience under tight constraints"
          trackPath="/about/projects/axiris/model-eye"
          summarySubtitle="TL;DR We didn't have access to an optics lab, so I proposed and built a modular model eye that gave us a stable, repeatable testbed to calibrate Axiris and de-risk the design before touching human subjects."
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
            Without a proper optics lab, I designed a modular model eye with an interchangeable lens and several "retina" slots where a mirror can slide in at known positions, each corresponding to a ground-truth refractive state. This allowed us to tune the image-processing pipeline and guide mechanical changes.
            <br />
            <br />
            We kept the Axiris housing compatible with both the model eye and a medical-grade eyecup, so we can swap between bench calibration and real-eye measurements in seconds without disturbing the internal alignment.
          </SideBySide>
          <p className="text-sm font-semibold text-gray-800 mt-2">Point of improvement:</p>
          <Bullets
            items={[
              'A more realistic model eye is needed for precise calibration in future. However, the simplicity and high reflectance of the current model eye was intentional, as it was ideal for early, rough validation.',
            ]}
          />
        </Dropdown>
      </Dropdown>
      </div>

      {/* ── SUCTION CUP ── */}
      <div id="project-edg">
      <Dropdown summaryTitle="Tactile End Effector Capstone @ Embodied Dexterity Lab" summaryDate="Sept 2025 – May 2026" onOpenChange={onDd} scrollTargetId="projects" closeSignal={closeSignal} trackPath="/about/projects/edg">
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
              <br /> For my graduate capstone, I improved its manufacturability and robustness:designing a custom PCB, standardizing the robot-arm interface, cutting the part count from 32 to 9 and reducing setup time from 15 minutes to 1:45 as we scaled from a research prototype to a production-ready run of over 1,000 units.
            </p>
          </div>
        </div>
        {/* Full-width case-study dropdown */}
        <div ref={suctionDropdownRef}>
        <Dropdown
          summaryTitle="An insight into how I design for manufacturability"
          trackPath="/about/projects/edg/manufacturability"
          summarySubtitle="TL;DR I redesigned the injection mold for the suction cup to achieve higher success rate in production."
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
              To improve the manufacturability of the silicone suction cup, I switched to a three-chamber geometry and redesigned its mold.
              <br/>
              <br />
              The new mold uses a five-part, wedged layout that lets one chamber release first and then allows "peeling" the rest of the cup out cleanly. This reduced tearing and increased fabrication success.
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
            Additionally, the new suction cup has a strategically designed ridge. This interfaces with a compliant clamping mechanism, enabling toolless cup mounting for rapid deployment and maintenance.
            <br />
            <br />
            Overall, design choices were made to reduce part count, enable easier handling and with high volume manufacturing in mind.
          </SideBySide>
          <SideBySide pic={
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex-1" style={{filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.28))'}}>
                <HoverMediaOverlay caption="Maximum payload test">
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
            After implementing the new geometry, I verified that suction performance and chamber-level sensing were unchanged. I ran maximum payload and varied object pick-and-place tests on representative items and observed similar performance to the prior prototype.
          </SideBySide>
          <p className="text-sm font-semibold text-gray-800 mt-2">Points of improvement:</p>
          <Bullets
            items={[
              'We kept the existing silicone formulation of the suction cup; exploring alternative materials could improve yield and durability.',
            ]}
          />
        </Dropdown>
        </div>
      </Dropdown>
      </div>

    </div>
  );
}

// ── honours mentions ──────────────────────────────────────────────────────────

const honourItems = [
  {
    id: 'mpc-robot',
    date: 'Sept 2025 – Dec 2025',
    title: 'Model Predictive Torque Control for a Balancing Robot',
    media: [{ src: '/images/MPC-twowheeledrobot.mp4', label: 'MPC two-wheeled robot', videoAspect: 'aspect-[10/7]', fluid: true, hoverLabel: 'Circle steering control on robot' }],
    sideText: { heading: 'Why not PID?', body: 'We used MPC as a research tool to evaluate whether it could outperform a simpler controller on a self-balancing two-wheeled robot with slope and steering dynamics.' },
    links: [
      { label: 'Paper', href: '/images/C231A_project.pdf' },
      { label: 'Video', href: 'https://www.youtube.com/watch?v=xH82VY5cUp4' },
    ],
  },
  {
    id: 'sproutup',
    date: 'Sept 2025 – Dec 2025',
    title: 'SproutUp: An Assistive Standing Device',
    squareImages: true,
    mediaLayout: 'text-above',
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
    id: 'adlap',
    date: 'Feb 2024 – June 2024',
    title: 'Capstone: A Light Module for a Robotic Surgery System',
    mediaLayout: 'text-above',
    media: [
      { src: '/images/adlap-final-design-details.png', label: 'adlap rendering', imageAspect: 'aspect-[16/9] h-auto md:aspect-auto md:h-[258px]' },
      { src: '/images/adlap-licht-in-buik.jpg', label: 'Adlap test op buik', hoverLabel: 'Our light module in action', imageAspect: 'aspect-[16/9] h-auto md:aspect-auto md:h-[258px]' },
    ],
    description: 'For my graduating project at TU Delft I developed a compact, detachable laparoscopic light module for the AdLap system, designed to deliver visible and infrared illumination while meeting strict size, thermal, and mounting constraints.',
    links: [{ label: 'Paper', href: '/images/adlap-design-paper.pdf' }],
  },
  {
    id: 'pcm',
    date: 'Nov 2022 – Jan 2023',
    title: 'Phase Change Materials Based Cooling in Solar Panels',
    mediaLayout: 'text-above',
    description: 'Built a Python model of a solar panel system with phase-change material cooling to analyze efficiency trends under varying environmental conditions.',
    media: [
      { src: '/images/PCM-results.png', label: 'PCM results', hoverLabel: 'PV cell efficiency simulation results', imageAspect: 'aspect-[10/4.8]', hoverTextColor: 'text-gray-800', outerClassName: 'w-full md:w-[70%] flex-shrink-0' },
      { src: '/images/PCM-schema.png', label: 'PCM schema', hoverLabel: 'PCM-PV cell interactions', natural: true, hoverTextColor: 'text-gray-800', outerClassName: 'w-full md:w-[30%] flex-shrink-0' },
    ],
    links: [{ label: 'Paper', href: '/images/PCM_FINALREPORT.pdf' }],
  },
  {
    id: 'cnc',
    date: 'Sept 2022 – Nov 2022',
    title: 'Sophomore Project: Building a CNC Machine',
    description: 'In a team of 5, we designed and built a CNC machine using an H-bot single-belt architecture, with cleverly integrated belt pre-tensioning and vibration damping. This is one of the coolest project from my undergrad!',
    media: [
      { src: '/images/full CNC render.jpg', label: 'CNC image 1', hoverLabel: 'CNC rendering', imageAspect: 'h-[226px] md:h-[260px]', hoverTextColor: 'text-gray-800' },
      { src: '/images/full CNC physical.jpg', label: 'CNC image 2', hoverLabel: 'CNC fully assembled', imageAspect: 'h-[260px]' },
      { src: '/images/CNC video.mp4', label: 'CNC video', hoverLabel: 'Aron 3000 in action', fluid: true, videoAspect: 'aspect-[8/9]' },
    ],
    mediaLayout: 'text-above',
    links: [],
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

function HonoursSlide({ onDd, closeSignal }) {
  return (
    <div className="px-6 pb-5 pt-3 md:px-8 md:pb-6 md:pt-4">
      <p className="text-lg font-bold text-gray-800 mb-2">Honorable mentions:</p>
      {honourItems.map((item) => (
        <Dropdown
          key={item.id}
          summaryTitle={item.title}
          summaryDate={item.date}
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
  const touchStartX = useRef(null);

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
    const projectsIdx = slides.findIndex(s => s.id === 'projects');
    setCurrentIndex(projectsIdx);
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

  // Report viewing the Honours slide as a virtual pageview. The Projects slide
  // is already covered by the /about/projects section view (App.jsx), so we only
  // need the second carousel slide here.
  useEffect(() => {
    if (slides[currentIndex].id === 'honours') trackPageview('/about/projects/honours');
  }, [currentIndex]);

  const goTo = (idx) => {
    setCurrentIndex(idx);
    setCloseSignal((s) => s + 1);
  };
  const goNext = () => goTo((currentIndex + 1) % slides.length);
  const goPrev = () => goTo((currentIndex - 1 + slides.length) % slides.length);

  const handleTouchStart = (e) => { touchStartX.current = e.targetTouches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      diff > 0 ? goNext() : goPrev();
      // Fix: Issue #22 — only re-anchor to #projects if it isn't already in view
      const el = document.getElementById('projects');
      if (el) {
        const rect = el.getBoundingClientRect();
        const inView = rect.top >= 0 && rect.top <= window.innerHeight * 0.5;
        if (!inView) {
          setTimeout(() => {
            const y = rect.top + window.pageYOffset - 80;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }, 50);
        }
      }
    }
    touchStartX.current = null;
  };

  const slideId = slides[currentIndex].id;

  return (
    <section ref={sectionRef}>
      <h2 className="text-center mb-6 text-2xl md:text-3xl font-bold text-gray-400">
        <T>project portfolio</T>
      </h2>

      <div
        className="rounded-2xl bg-white/70 backdrop-blur-md ring-1 ring-black/5 shadow-xl overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
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
              {slideId === 'honours' && <HonoursSlide closeSignal={closeSignal} />}
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
