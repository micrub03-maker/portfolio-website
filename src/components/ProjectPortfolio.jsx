import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MediaSlot } from "./MediaSlot";
import AssemblyGuide from "./AssemblyGuide";

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

function SideBySide({ pic, picWidth = 'w-1/2', picLeft = true, textWidth, centered, children }) {
  const imageCol = <div className={`${picWidth} flex-shrink-0`}>{pic}</div>;
  const textCol = textWidth
    ? <div className={`${textWidth} flex-shrink-0 self-start mt-8`}><p className="text-sm text-gray-700 leading-relaxed">{children}</p></div>
    : <p className="text-sm text-gray-700 leading-relaxed mt-8">{children}</p>;
  return (
    <div className={`flex gap-4 items-start${centered ? ' justify-center' : ''}`}>
      {picLeft ? <>{imageCol}{textCol}</> : <>{textCol}{imageCol}</>}
    </div>
  );
}

function Dropdown({ summaryTitle, summarySubtitle, onOpenChange, noClickClose, forceOpenTrigger, scrollTargetId, closeSignal, children }) {
  const [open, setOpen] = useState(() => !!forceOpenTrigger);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!forceOpenTrigger) return;
    setOpen(true);
    onOpenChange?.(true);
  }, [forceOpenTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!closeSignal) return;
    setOpen(false);
    onOpenChange?.(false);
  }, [closeSignal]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (e) => {
    e?.stopPropagation();
    const next = !open;
    setOpen(next);
    onOpenChange?.(next);
    if (!next) {
      setTimeout(() => {
        const target = scrollTargetId ? document.getElementById(scrollTargetId) : buttonRef.current;
        target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 350);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white/60 overflow-hidden mt-4">
      <button
        ref={buttonRef}
        onClick={toggle}
        aria-expanded={open}
        className="w-full text-left px-4 py-3 flex items-start justify-between gap-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 text-sm">{summaryTitle}</p>
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
              className={`px-4 pb-5 pt-1 border-t border-gray-100 space-y-3 ${noClickClose ? '' : 'cursor-pointer'}`}
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
    suctionDropdownRef.current?.querySelectorAll('video').forEach(v => {
      if (v !== assemblyVideoRef.current) v.play();
    });
  };

  const handleAssemblyEnter = () => { if (!isMobile) playAssembly(); };
  const handleAssemblyLeave = () => { if (!isMobile) pauseAssembly(); };
  const handleAssemblyClick = () => { if (isMobile) assemblyPlaying ? pauseAssembly() : playAssembly(); };

  return (
    <div className="px-6 pb-5 pt-3 md:px-8 md:pb-6 md:pt-4">

      {/* ── LUCI ── */}
      <div id="project-luci">
      <Dropdown summaryTitle="All-Terrain Autonomous Vehicle @ Model Predictive Control Lab" onOpenChange={onDd} forceOpenTrigger={autoOpen?.key === 'luci' ? autoOpen.count : 0} scrollTargetId="project-luci" closeSignal={closeSignal}>
        {/* Two-column intro */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          <div className="relative group flex flex-col">
            <MediaSlot
              src={"/images/LUCI-CAD.png"}
              label="ONR Luci CAD"
              fill
            />
            <div className="absolute inset-0 rounded-xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{marginTop: '0.75rem', marginBottom: '0.75rem'}}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-white text-sm font-semibold tracking-wide">Full vehicle CAD</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex justify-end gap-2 flex-wrap">
              <a
                href="https://sites.google.com/berkeley.edu/mpc-lab/home?authuser=0"
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-[11px] text-black bg-white/90 hover:bg-white font-medium px-3 py-0.5 rounded-full transition-colors whitespace-nowrap"
              >
                Lab website
              </a>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              Development of an all-terrain unmanned autonomous reconnaissance rover. 
              Currently redesigning the 3D-printed chassis to improve structural robustness and serviceability, while supporting navigation and autonomy integration
            </p>
            <div>
              <p className="text-sm font-semibold text-gray-800">Upcoming tasks:</p>
              <Bullets
                items={[
                  'Designing a Model Predictive Control (MPC) controller from scratch to compare against the existing PID controller',
                  'Scaling the vehicle up, to use for solar plant inspections',
                ]}
              />
            </div>
          </div>
        </div>
        {/* Full-width case-study dropdown */}
        <Dropdown
          summaryTitle="An insight into how I start new projects"
          summarySubtitle="TL;DR: I interviewed prior users, rebuilt my own from scratch to identify pain points firsthand, and turned those findings into an assembly guide, wiring diagram, and updated BOM to improve remote collaboration"
          onOpenChange={onDd}
          scrollTargetId="project-luci"
        >
          <SideBySide picWidth="w-[45%]" pic={
            <div className="flex justify-center">
            <div className="relative group w-[71%]">
              <div className="[&>div]:h-auto [&_img]:!h-auto [&>div]:rounded-xl [&>div]:overflow-hidden">
                <MediaSlot src={"/assets/29_jetson_3.jpg"} label="Luci build" />
              </div>
              <div className="absolute inset-0 rounded-xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{marginTop: '0.75rem', marginBottom: '0.75rem'}}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white text-sm font-semibold tracking-wide">Re-assembling the rover</p>
                </div>
              </div>
            </div>
            </div>
          }>
            I began by interviewing everyone who had worked with the robot to understand recurring pain points, failure modes, and workflow bottlenecks. To really understand those issues, I rebuilt the rover from scratch and documented every complication, assembly dependency, and time-consuming step along the way.
          </SideBySide>
          <div className="flex gap-4 items-start">
            <p className="text-sm text-gray-700 leading-relaxed mt-8">
              That process led me to create a detailed assembly guide and a cleaned-up wiring diagram to improve build repeatability, simplify component replacement, and support clearer communication with the NIWC collaborators at a distance.
              <br />
              <br /> Before making design changes, I always focus on understanding a project's constraints, goals, and system-level issues. Doing this was the best way to get up to speed quickly!
            </p>
            <div className="w-[55%] flex-shrink-0">
              <AssemblyGuide />
            </div>
          </div>
          <SideBySide picWidth="w-[45%]" pic={
            <div className="relative group">
              <div className="[&>div]:h-[208px]">
                <MediaSlot src={'images/simple-mount-render-2.png'} label="simple mount" />
              </div>
              <div className="absolute inset-0 rounded-xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{marginTop: '0.75rem', marginBottom: '0.75rem'}}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white text-sm font-semibold tracking-wide">Simple adjustable camera mount</p>
                </div>
              </div>
            </div>
          }>
            This reflects my documentation discipline, attention to detail, and user-centered engineering approach.
            After I now feel confident I have enough context to start the fun part! 
            <br />
            <br />
             First solve: I designed a simple mount for the camera improving stability and crash resilience, and am working on including damping and an automated pan/tilt mechanism.
          </SideBySide>
        </Dropdown>
      </Dropdown>
      </div>

      {/* ── CALSOL ── */}
      <div id="project-calsol">
      <Dropdown summaryTitle="Seatbelts Development @ CALSOL" onOpenChange={onDd} forceOpenTrigger={autoOpen?.key === 'calsol' ? autoOpen.count : 0} scrollTargetId="project-calsol" closeSignal={closeSignal}>
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
                className="text-[11px] text-black bg-white/90 hover:bg-white font-medium px-3 py-0.5 rounded-full transition-colors whitespace-nowrap"
              >
                Team website
              </a>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              As Driver Safety Lead for the Berkeley Solar car student team, I owned the design, analysis, and validation of the five-point seatbelt harness mounting system CalSol's for our GenXI solar vehicle. I oversaw the full process from regulation interpretation and design through physical testing and manufacturing handoff. 
              <br /> 
              < br/>
              Our seatbelt system was the first mechanical subsystem to pass scrutineering for the 2026 race cycle.
            </p>
          </div>
        </div>
        {/* Full-width case-study dropdowns */}
        <Dropdown
          summaryTitle="An insight into lap-belt insert design and validation"
          summarySubtitle="TL;DR I designed bonded metal inserts for the lap and sub-belts, validated them analytically and with quasi-static pull-out tests to credibly meet the load requirement on the occupant cell."
          onOpenChange={onDd}
          scrollTargetId="project-calsol"
        >
          <SideBySide picWidth="w-[45%]" pic={
            <div className="relative group">
              <div className="[&>div]:h-[240px]">
                <MediaSlot src={'/images/Calsol-inserts.png'} label="inserts" />
              </div>
              <div className="absolute inset-0 rounded-xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{marginTop: '0.75rem', marginBottom: '0.75rem'}}>
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/30 to-transparent" />
                <div className="absolute top-0 left-0 p-3 -translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white text-sm font-semibold tracking-wide">Inserts flushed in shell</p>
                </div>
              </div>
            </div>
          }>
            To safely anchor the lap- and sub-belts into the thin carbon fiber cell, I designed bonded metal inserts that follow the shell curvature and sit sandwiched within the laminate. The belts clip into eyebolts threaded into these inserts.
            <br />
            <br />
            I translated regulations into explicit load cases and analyzed the primary failure modes: thread stripping and laminate debonding.
          </SideBySide>
          <p className="text-sm text-gray-700 leading-relaxed">
           Without access to dynamic crash equipment, I identified the critical load case analytically and designed a conservative quasi-static pull-out test measuring an average failure load of 6.11 kN across four samples. Which, together with published dynamic CFRP insert data, showed the design could credibly meet the required loads.
          </p>
          <div className="relative group">
            <div className="[&>div]:h-[320px] [&>div]:!p-1 [&>div]:my-0 overflow-hidden rounded-xl shadow-md my-3">
              <MediaSlot
                src={'/images/insert testing jig picture.png'}
                label="Inserts test set up"
                padded
              />
            </div>
            <div className="absolute inset-0 rounded-xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/30 to-transparent" />
              <div className="absolute top-0 left-0 p-3 -translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-gray-800 text-sm font-semibold tracking-wide">insert testing jig</p>
              </div>
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-800 mt-2">Points of improvement:</p>
          <Bullets
            items={[
              'Relying on quasi-static tests and literature to argue dynamic performance is not fully satisfying for a critical part. Next time I would add an extra validation step (e.g. higher-rate testing or an alternate experimental setup directly checking target load).',
              "The insert is still relatively bulky; given the multi-axis machining already required for its manufacturing it's possible to design complex shapes to shed more weight.",
            ]}
          />
        </Dropdown>
        <Dropdown
          summaryTitle="An insight into the topology-optimized shoulder-belt anchorage"
          summarySubtitle='TL;DR I designed a steel shoulder-belt mount holding wrapping bolts, cut mount weight by ~40% via topology optimization.'
          onOpenChange={onDd}
          scrollTargetId="project-calsol"
        >
          <SideBySide picWidth="w-1/2" pic={
            <div className="flex justify-center">
              <div className="relative group w-[73%]">
                <MediaSlot src={'/images/shoulder-mount-calsol.png'} label="shoulder belt anchorage" height="202px" />
                <div className="absolute inset-0 rounded-xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{marginTop: '0.75rem', marginBottom: '0.75rem'}}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white text-sm font-semibold tracking-wide">Shoulder anchorage in car</p>
                  </div>
                </div>
              </div>
            </div>
          }>
            For the shoulder harness, I designed a steel anchorage that bolts through the chassis and supports transverse "wrapping bolts" around which the shoulder belts are looped, eliminating single-point failure by allowing each strap to wrap independently.
          </SideBySide>
          <SideBySide picWidth="w-1/2" picLeft={false} pic={
            <div className="flex justify-center">
              <div className="relative group w-[73%]">
                <MediaSlot src={'/images/shoulder-calcs.png'} label="Shoulder belt calcs" height="202px" />
                <div className="absolute inset-0 rounded-xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{marginTop: '0.75rem', marginBottom: '0.75rem'}}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-[15%] left-0 right-0 p-3 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white text-sm font-semibold tracking-wide">Bolt governing load case</p>
                  </div>
                </div>
              </div>
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
            height="245px"
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
      <Dropdown summaryTitle="Handheld Autorefractor @ Axiris Technologies" onOpenChange={onDd} forceOpenTrigger={autoOpen?.key === 'axiris' ? autoOpen.count : 0} scrollTargetId="project-axiris" closeSignal={closeSignal}>
        {/* Two-column intro */}
        <div className="grid grid-cols-1 md:grid-cols-[53fr_47fr] gap-6 items-start">
          <div className="relative group">
            <MediaSlot
              src={'/images/Axiris-final-design.png'}
              label="Axiris final design"
            />
            <div className="absolute inset-0 rounded-xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{marginTop: '0.75rem', marginBottom: '0.75rem'}}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-0 right-0 p-3 translate-y-1 group-hover:translate-y-0 transition-transform duration-300 text-right">
                <p className="text-white text-sm font-semibold tracking-wide">Axiris current<br />design</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex justify-end gap-2 flex-wrap">
              <a href="/images/Axiris-slides.pdf" target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-[11px] text-black bg-white/90 hover:bg-white font-medium px-3 py-0.5 rounded-full transition-colors">Slidedeck</a>
              <a href="/images/Axiris-paper.pdf" target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-[11px] text-black bg-white/90 hover:bg-white font-medium px-3 py-0.5 rounded-full transition-colors">Paper</a>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              Axiris is a low-cost, handheld autorefractor for vision screening in low-resource settings, where conventional 5,000–30,000-dollar systems are hard to deploy. As optical lead, I chose a Scheiner-disk optical path with an external NIR camera and helped develop a Python image-processing stack to estimate refractive error, iterating through six prototypes over 13 weeks to reach a 574-dollar BOM.
            </p>
          </div>
        </div>
        {/* Full-width case-study dropdowns */}
        <Dropdown
          summaryTitle="An insight into my design process"
          summarySubtitle="TL;DR Stakeholder interviews, concept screening, and expert input allowed me to find the best product format."
          onOpenChange={onDd}
          scrollTargetId="project-axiris"
        >
          <div className="flex flex-row gap-4 items-start">
            <div className="relative group w-[54%] flex-shrink-0">
              <MediaSlot
                src={'/images/Axiris-interviews.png'}
                label="Axiris market research"
                height="227px"
              />
              <div className="absolute inset-0 rounded-xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{marginTop: '0.75rem', marginBottom: '0.75rem'}}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white text-sm font-semibold tracking-wide">Market<br />Research</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed flex-1 mt-8">
              Hundreds of millions of people live with avoidable vision loss, we started with a simple question: why? 
              <br /> 
              <br />
              Through interviews with ophthalmologists, NGO screeners, and engineers, we realized this gap in care comes from current solutions being expensive and requiring clinics, power, and trained staff. This realization led us to ideate 50+ concepts to approach this problem at its root.
            </p>
          </div>
          <div className="flex flex-row gap-4 items-start">
            <p className="text-sm text-gray-700 leading-relaxed flex-[1.1] mt-8">
              Using a Pugh chart and expert feedback, we landed on a handheld device with dual pinholes: two NIR beams pass through the eye, and their spot separation encodes refractive error that we back-calculate to diopters.
              <br />
              <br />
              I then tackled the optical design step by step: selecting an 850 nm source to maximize retinal reflectance, folding the path with collimating optics to keep the device handheld and minimize signal loss through the optical path.
            </p>
            <div className="relative group flex-[0.9]">
              <MediaSlot
                src={'/images/Axiris-optical.png'}
                label="Axiris optical path"
                height="329px"
              />
              <div className="absolute inset-0 rounded-xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{marginTop: '0.75rem', marginBottom: '0.75rem'}}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-gray-600 text-sm font-semibold tracking-wide">Optical<br />Path</p>
                </div>
              </div>
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-800 mt-2">Points of improvement:</p>
          <Bullets
            items={[
              'Today’s design measures sphere only. Future versions should add cylinder and axis so the device can capture astigmatism and higher-order aberrations without losing affordability.',
              'The current prototype has not been tested for durability. I would add accelerated life testing to future iterations.',
            ]}
          />
        </Dropdown>
        <Dropdown
          summaryTitle="An insight into my resilience under tight constraints"
          summarySubtitle="TL;DR We didn't have access to an optics lab, so I proposed and built a modular model eye that gave us a stable, repeatable testbed to calibrate Axiris and de-risk the design before touching human subjects."
          onOpenChange={onDd}
          scrollTargetId="project-axiris"
        >
          <div className="flex flex-row gap-4 items-start">
            <div className="relative group w-[54%] flex-shrink-0">
              <MediaSlot
                src={'/images/Axiris-model-eye.png'}
                label="model eye Axiris"
                height="320px"
              />
              <div className="absolute inset-0 rounded-xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{marginTop: '0.75rem', marginBottom: '0.75rem'}}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white text-sm font-semibold tracking-wide">Modular Model Eye</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed flex-1 mt-8">
              Without a proper optics lab, I designed a modular model eye with an interchangeable lens and several "retina" slots where a mirror can slide in at known positions, each corresponding to a ground-truth refractive state. This allowed us to tune the image-processing pipeline and guide mechanical changes.
              <br />
              <br />
              We kept the Axiris housing compatible with both the model eye and a medical-grade eyecup, so we can swap between bench calibration and real-eye measurements in seconds without disturbing the internal alignment.
            </p>
          </div>
          <p className="text-sm font-semibold text-gray-800 mt-2">Point of improvement:</p>
          <Bullets
            items={[
              'A more realistic model eye would be needed for precise calibration in future. However, the simplicity and high reflectance of the current model eye was intentional, as it was ideal for early, rough validation.',
            ]}
          />
        </Dropdown>
      </Dropdown>
      </div>

      {/* ── SUCTION CUP ── */}
      <div id="project-edg">
      <Dropdown summaryTitle="Tactile End Effector Capstone @ Embodied Dexterity Lab" onOpenChange={onDd} scrollTargetId="project-edg" closeSignal={closeSignal}>
        {/* Two-column intro */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="flex gap-2">
            <div className="flex-1 min-w-0 relative group" style={{filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.28))'}}>
              <MediaSlot
                src={'/images/suction-cup-gif.gif'}
                label="Suction cup overview"
                height = "300px"
              />
              <div className="absolute inset-0 rounded-xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{marginTop: '0.75rem', marginBottom: '0.75rem'}}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-[10%] left-0 right-0 p-3 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white text-sm font-semibold tracking-wide">Haptic following on the suction cup</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex justify-end gap-2 flex-wrap">
              <a href="https://edg.berkeley.edu/research/tactile-sensing/" target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-[11px] text-black bg-white/90 hover:bg-white font-medium px-3 py-0.5 rounded-full transition-colors">Lab website</a>
              <a href="/images/135_report_finaldraft_pdf.pdf" target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-[11px] text-black bg-white/90 hover:bg-white font-medium px-3 py-0.5 rounded-full transition-colors">Paper</a>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              The Smart Suction Cup is a multi-chamber robotic end-effector that enables haptic feedback by sensing internal airflow, helping robots recover when vision-based grasping fails.
              <br />
              <br /> I improved its manufacturability and robustness, standardizing the robot-arm interface, cutting the part count from 32 to 9, reducing setup time from 15 minutes to 1:45, and designing a custom PCB as we scaled from a research prototype to a production-ready run of over 1,000 units.
            </p>
          </div>
        </div>
        {/* Full-width case-study dropdown */}
        <div ref={suctionDropdownRef}>
        <Dropdown
          summaryTitle="An insight into how I design for manufacturability"
          summarySubtitle="TL;DR redesigned the injection mold for the suction cup to achieve higher success rate in production."
          onOpenChange={onDd}
          scrollTargetId="project-edg"
        >
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <p className="text-sm text-gray-700 leading-relaxed md:order-2 md:mt-8">
              An example I led is the silicone suction cup itself. I switched to a three-chamber geometry and redesigned its mold. The new mold uses a five-part, wedged layout that lets one chamber release first and then allows "peeling" the rest of the cup out cleanly. This reduced tearing and increased fabrication success.
            </p>
            <div className="w-full md:w-[57%] md:order-1 min-w-0 flex-shrink-0 relative group">
              <div className="md:hidden">
                <MediaSlot src={'/images/suction-cup-mold-mobile.png'} label="Suction cup mold" padded />
              </div>
              <div className="hidden md:block">
                <MediaSlot src={'/images/suction-cup-mold.png'} label="Suction cup mold" padded />
              </div>
              <div className="absolute inset-0 rounded-xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{marginTop: '0.75rem', marginBottom: '0.75rem'}}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-gray-800 text-sm font-semibold tracking-wide">Suction cup redesign</p>
                </div>
              </div>
            </div>
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
                <video ref={assemblyVideoRef} src="/images/suction-cup-assembly.mp4" className="w-full h-full object-cover" loop muted playsInline />
              </div>
              <div className={`absolute inset-0 rounded-xl overflow-hidden transition-opacity duration-300 pointer-events-none ${assemblyPlaying ? 'opacity-0' : 'opacity-100'}`} style={{marginTop: '0.75rem', marginBottom: '0.75rem'}}>
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
          <SideBySide picWidth="w-1/2" pic={
            <div className="flex gap-2 md:w-4/5 md:mx-auto">
              <div className="flex-1 relative group" style={{filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.28))'}}>
                <MediaSlot src={'/images/suction-cup-grab.mp4'} label="maximum payload suction cup" videoAspect="aspect-[45/64]" />
                <div className="absolute inset-0 rounded-xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{marginTop: '0.75rem', marginBottom: '0.75rem'}}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white text-sm font-semibold tracking-wide">Maximum payload test</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 relative group" style={{filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.28))'}}>
                <MediaSlot src={'/images/suction-cup-grab-2.mp4'} label="transparent & oddly shaped object test" videoAspect="aspect-[45/64]" />
                <div className="absolute inset-0 rounded-xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{marginTop: '0.75rem', marginBottom: '0.75rem'}}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white text-sm font-semibold tracking-wide">Transparent &amp; oddly shaped object test</p>
                  </div>
                </div>
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
    id: 'sproutup',
    title: 'SproutUp: an assistive standing device',
    squareImages: true,
    description: 'An early proof of concept prototype of a wearable assistive seat that senses sit-to-stand motion and provides adaptive force assistance.',
    media: [
      { src: '/images/Sprout-up-wearing.jpg', label: 'wearing sproutup' },
      { src: '/images/Sprout-up-deep-dive.png', label: 'sproutup picture 2', wrapperStyle: { paddingLeft: '2.5rem' } },
    ],
    links: [
      { label: 'Paper', href: '/pdfs/sproutup-paper.pdf' },
      { label: 'Poster', href: '/images/SproutUp-poster.pdf' },
    ],
  },
  {
    id: 'mpc-robot',
    title: 'Model Predictive Torque Control for a Balancing Robot',
    media: [{ src: '/images/MPC-twowheeledrobot.mp4', label: 'MPC two-wheeled robot', videoAspect: 'aspect-[10/7]', fluid: true }],
    sideText: { heading: 'Why not PID?', body: 'We used MPC as a research tool to evaluate whether it could outperform a simpler controller on a self-balancing two-wheeled robot with slope and steering dynamics.' },
    links: [{ label: 'Paper', href: '/pdfs/mpc-robot-paper.pdf' }],
  },
  {
    id: 'pcm',
    title: 'Phase change materials based cooling in photovoltaic cells',
    media: [
      { src: '/images/PCM-results.png', label: 'PCM results' },
      { src: '/images/PCM-schema.png', label: 'PCM schema' },
    ],
    links: [{ label: 'Paper', href: '/pdfs/pcm-paper.pdf' }],
  },
  {
    id: 'adlap',
    title: 'BSc thesis: designing a detachable light module for a robotic surgery system',
    media: [
      { src: '/images/adlap-final-design.jpg', label: 'adlap rendering' },
      { src: '/images/adlap-licht-in-buik.jpg', label: 'Adlap test op buik' },
    ],
    links: [{ label: 'Design paper', href: '/pdfs/adlap-design-paper.pdf' }],
  },
];

function HonoursSlide({ onDd, closeSignal }) {
  return (
    <div className="px-6 pb-5 pt-3 md:px-8 md:pb-6 md:pt-4">
      <p className="text-lg font-bold text-gray-800 mb-2">Honorable mentions:</p>
      {honourItems.map((item) => (
        <Dropdown
          key={item.id}
          summaryTitle={item.title}
          onOpenChange={onDd}
          closeSignal={closeSignal}
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
                  className="text-[11px] text-black bg-white/90 hover:bg-white font-medium px-3 py-0.5 rounded-full transition-colors"
                >
                  {l.label}
                </a>
              ))}
            </div>
          )}
          {item.description && (
            <p className="text-sm text-gray-700 leading-relaxed">{item.description}</p>
          )}
          <div className={`flex gap-4 items-start ${item.sideText ? '' : 'flex-wrap'}`}>
            <div className={`flex gap-2 ${item.sideText ? 'w-1/2 flex-shrink-0' : 'flex-1 min-w-0'}`}>
              {item.media.map((m) => (
                <div key={m.label} className="flex-1 min-w-0" style={m.wrapperStyle}>
                  <MediaSlot src={m.src} label={m.label} square={!!item.squareImages} videoAspect={m.videoAspect} fluid={!!m.fluid} />
                </div>
              ))}
            </div>
            {item.sideText && (
              <div className="flex-1 min-w-0 mt-8">
                <p className="text-sm font-semibold text-gray-800">{item.sideText.heading}</p>
                <p className="text-sm text-gray-700 leading-relaxed mt-1">{item.sideText.body}</p>
              </div>
            )}
          </div>
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

export default function ProjectPortfolio({ initialSlideId, jumpToProject }) {
  const getInitialIndex = () => {
    if (!initialSlideId) return 0;
    const idx = slides.findIndex((s) => s.id === initialSlideId);
    return idx >= 0 ? idx : 0;
  };

  const [currentIndex, setCurrentIndex] = useState(getInitialIndex);
  const [closeSignal, setCloseSignal] = useState(0);
  const touchStartX = useRef(null);

  useEffect(() => {
    if (!jumpToProject?.count) return;
    const projectsIdx = slides.findIndex(s => s.id === 'projects');
    setCurrentIndex(projectsIdx);
    setOpenDropdownCount(0);
    if (jumpToProject.key) {
      setTimeout(() => {
        document.getElementById(`project-${jumpToProject.key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 400);
    }
  }, [jumpToProject]);

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
    if (Math.abs(diff) > 40) diff > 0 ? goNext() : goPrev();
    touchStartX.current = null;
  };

  const slideId = slides[currentIndex].id;

  return (
    <section>
      <h2 className="text-center mb-6 text-2xl md:text-3xl font-bold text-gray-400">
        project portfolio
      </h2>

      <div
        className="rounded-2xl bg-white/70 backdrop-blur-md border border-gray-100 shadow-lg overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Nav bar */}
        <div className="flex items-center justify-between px-4 py-2">
          <button
            onClick={goPrev}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition text-base leading-none"
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
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? 'w-6 bg-gray-600'
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

          <button
            onClick={goNext}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition text-base leading-none"
            aria-label="Next slide"
          >
            {'\u203A'}
          </button>
        </div>

        {/* Slide content */}
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
      </div>
    </section>
  );
}
