import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── helpers ───────────────────────────────────────────────────────────────────

function MediaPlaceholder({ label, tall }) {
  return (
    <div
      className={`w-full ${tall ? 'h-52' : 'h-40'} rounded-xl bg-slate-100 border border-gray-200 flex items-center justify-center my-3 flex-shrink-0`}
    >
      <span className="text-gray-400 text-xs font-mono text-center px-4 leading-relaxed">
        TEMP: {label}
      </span>
    </div>
  );
}

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

function Dropdown({ summaryTitle, summarySubtitle, onOpenChange, children }) {
  const [open, setOpen] = useState(false);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    onOpenChange?.(next);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white/60 overflow-hidden mt-4">
      <button
        onClick={toggle}
        aria-expanded={open}
        className="w-full text-left px-4 py-3 flex items-start justify-between gap-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 text-sm">{summaryTitle}</p>
          <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{summarySubtitle}</p>
        </div>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-gray-400 text-base flex-shrink-0 mt-0.5 leading-none"
        >
          ▾
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
            <div className="px-4 pb-5 pt-1 border-t border-gray-100 space-y-3 cursor-pointer" onClick={toggle}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── slide components ──────────────────────────────────────────────────────────

function IntroSlide() {
  return (
    <div className="p-6 md:p-8">
      <MediaPlaceholder label="Project picture" tall />
      <p className="text-gray-700 text-base md:text-lg leading-relaxed mt-4">
        "I learn the most by building real things, not just solving problem sets. I used to let perfectionism slow me down, but university projects and hands-on teams pushed me to let go of the fear of failing and build cool stuff!"
      </p>
    </div>
  );
}

function LuciSlide({ onDd }) {
  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-xl font-bold text-gray-900">Project LUCI @ MPC Lab</h3>
        <a
          href="https://sites.google.com/berkeley.edu/mpc-lab/home?authuser=0"
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-[11px] text-black bg-white/90 hover:bg-white font-medium px-3 py-0.5 rounded-full transition-colors whitespace-nowrap flex-shrink-0"
        >
          Lab website
        </a>
      </div>
      <MediaPlaceholder label="ONR Luci CAD" tall />
      <p className="text-sm text-gray-700 leading-relaxed mt-3">
        Development of an all-terrain autonomous surveillance rover. Redesigning the 3D-printed chassis to improve structural robustness, manufacturability, and serviceability, while supporting navigation integration and testing for NTRIP GPS and vSLAM-based autonomy.
      </p>
      <div className="mt-3">
        <p className="text-sm font-semibold text-gray-800">Upcoming tasks:</p>
        <Bullets
          items={[
            'Developing a Blender-based vehicle model for BeamNG simulation to better understand wheel-ground interaction and vehicle dynamics.',
            'Exploring controller redesign from scratch as a way to deepen model predictive control experience.',
            'Evaluating design changes needed to scale the platform for a larger battery and additional payloads, including future solar inspection use cases.',
          ]}
        />
      </div>
      <Dropdown
        summaryTitle="An insight into how I start new projects"
        summarySubtitle="TL;DR: I interviewed prior robot users, rebuilt my own rom scratch to identify pain points firsthand, and turned those findings into an assembly guide, wiring diagram, and updated BOM to improve repeatability and remote collaboration"
        onOpenChange={onDd}
      >
        <p className="text-sm text-gray-700 leading-relaxed">
          I began the role by interviewing everyone who had worked with the robot to understand recurring pain points, failure modes, and workflow bottlenecks. To validate those issues firsthand, I rebuilt the rover from scratch and documented every complication, dependency, and time-consuming step along the way.
        </p>
        <MediaPlaceholder label="Luci build" />
        <p className="text-sm text-gray-700 leading-relaxed">
          That process led me to create a detailed assembly guide and a cleaned-up wiring diagram to improve build repeatability, simplify component replacement, and support clearer communication with the NIWC collaborators at a distance.
        </p>
        <MediaPlaceholder label="wiring diagram" />
        <p className="text-sm text-gray-700 leading-relaxed">
          Before making design changes, I always focus on understanding a project's constraints, goals, and system-level issues, which reflects my documentation discipline, attention to detail, and user-centered engineering approach. Having done this for this project, I feel confident I have enough context now, and I have started working on a redesigned mount for the camera: improving strength, including damping and pan/tilt mechanism and controls.
        </p>
        <MediaPlaceholder label="pan/tilt mount CAD" />
        <MediaPlaceholder label="pan/tilt mount video" />
      </Dropdown>
    </div>
  );
}

function CalsolSlide({ onDd }) {
  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-xl font-bold text-gray-900">Driver Safety Lead @ CALSOL</h3>
        <a
          href="https://calsol.berkeley.edu/"
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-[11px] text-black bg-white/90 hover:bg-white font-medium px-3 py-0.5 rounded-full transition-colors whitespace-nowrap flex-shrink-0"
        >
          Team website
        </a>
      </div>
      <MediaPlaceholder label="CALSOL car" tall />
      <p className="text-sm text-gray-700 leading-relaxed mt-3">
        As Driver Safety Lead for CalSol's GenXI solar vehicle, I owned the design, analysis, and validation of the five-point seatbelt harness mounting system, from regulation interpretation through physical testing and manufacturing handoff. Our seatbelt system was the first mechanical subsystem to pass scrutineering for the 2026 race cycle.
      </p>
      <Dropdown
        summaryTitle="An insight into lap-belt insert design and validation"
        summarySubtitle="TL;DR I designed bonded metal inserts for the lap and sub-belts, validated them analytically and with quasi-static pull-out tests to credibly meet the load requirement on the occupant cell."
        onOpenChange={onDd}
      >
        <p className="text-sm text-gray-700 leading-relaxed">
          To safely anchor the lap and anti-submarine belts into a thin carbon fiber occupant cell, I designed bonded metal inserts that follow the shell curvature while maintaining proper belt geometry and load paths. The inserts are sandwiched within the laminate, with belts attaching via clips to eyebolts threaded into the inserts.
        </p>
        <MediaPlaceholder label="inserts" />
        <p className="text-sm text-gray-700 leading-relaxed">
          I translated regulation requirements into explicit load cases and analyzed two primary failure modes: thread stripping at the insert and debonding or pull-through at the laminate. Through analytical validation I found high safety factors for the threads and a more limiting FOS of 1.3 at the bonded interface.
        </p>
        <MediaPlaceholder label="inserts calcs and sketch" />
        <p className="text-sm text-gray-700 leading-relaxed">
          To validate the concept without access to dynamic crash equipment, I developed a conservative quasi-static pull-out test using in-house fabricated flat inserts embedded in CFRP panels. Four samples averaged failure at 6.11 kN, combined with published dynamic CFRP insert data, this supported that the final design could credibly meet the regulated requirement with an estimated dynamic FOS of about 1.15.
        </p>
        <MediaPlaceholder label="Inserts test set up" />
        <p className="text-sm font-semibold text-gray-800 mt-2">Points of improvement:</p>
        <Bullets
          items={[
            'Relying on quasi-static tests and literature to argue dynamic performance is not fully satisfying for a critical part. Next time I would add an extra validation step (e.g. higher-rate testing or an alternate experimental setup directly checking target load)',
            'The insert is still relatively bulky; given the multi-axis machining already required for its manufacturing it\'s possible to design complex shapes to shed more weight.',
          ]}
        />
      </Dropdown>
      <Dropdown
        summaryTitle="An insight into topology-optimized shoulder-belt anchorage"
        summarySubtitle='TL;DR I designed a steel shoulder-belt mount holding wrapping bolts, cut mount weight by ~40% via topology optimization.'
        onOpenChange={onDd}
      >
        <p className="text-sm text-gray-700 leading-relaxed">
          For the shoulder harness, I designed a steel backplate that bolts through the chassis and supports transverse "wrapping bolts" around which the shoulder belts are looped, eliminating single-point failure by allowing each strap to wrap independently.
        </p>
        <MediaPlaceholder label="shoulder belt anchorage" />
        <p className="text-sm text-gray-700 leading-relaxed">
          I modeled the wrapping bolts as fixed-fixed beams under the projected distributed load to size them for the governing failure mode: bending, since shear and tension are easily satisfied. A 9/16 inch grade 8.8 is the smallest size bolt that keeps peak bending stress safely below it's flexural strength of 640 MPa, and the rest of the part was designed around these wrapping bolts.
        </p>
        <MediaPlaceholder label="Shoulder belt calcs" />
        <p className="text-sm text-gray-700 leading-relaxed">
          Once the baseline design cleared all load cases, I ran a SolidWorks topology optimization on the backplate to strip non-critical material while preserving manufacturability (uniform thickness, waterjet-friendly geometry, intact interfaces), ultimately cutting weight by roughly 40% while maintaining acceptable safety margins.
        </p>
        <MediaPlaceholder label="Shoulder belt CAD topology" />
        <p className="text-sm font-semibold text-gray-800 mt-2">Points of improvement:</p>
        <Bullets
          items={[
            'This design is simple, reliable and cheap to manufacture; but there is likely more weight to be saved by exploring a single hollow wrap-around tube concept.',
            'Validation of this design relies entirely on simulation; physical testing should be added to confirm the modeled behavior.',
          ]}
        />
      </Dropdown>
    </div>
  );
}

function AxirisSlide({ onDd }) {
  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-xl font-bold text-gray-900">Optics lead @ Axiris autorefractor project</h3>
        <div className="flex gap-2 flex-shrink-0">
          <a href="#" onClick={(e) => e.stopPropagation()} className="text-[11px] text-black bg-white/90 hover:bg-white font-medium px-3 py-0.5 rounded-full transition-colors">Slidedeck</a>
          <a href="#" onClick={(e) => e.stopPropagation()} className="text-[11px] text-black bg-white/90 hover:bg-white font-medium px-3 py-0.5 rounded-full transition-colors">Paper</a>
        </div>
      </div>
      <MediaPlaceholder label="Axiris logo" />
      <p className="text-sm text-gray-700 leading-relaxed mt-3">
        Axiris is a low-cost, handheld autorefractor for vision screening in low-resource settings, where conventional 5,000–30,000-dollar clinical systems are difficult to deploy. It uses a Scheiner-disk optical path with 850 nm near-infrared illumination, an external NIR camera, and a Python image-processing stack to estimate refractive error from −10 to +10 diopter. Over a 13-week development cycle, we iterated through six prototypes ending up at a 574-dollar BOM.
      </p>
      <Dropdown
        summaryTitle="An insight into my design process"
        summarySubtitle="TL;DR Using stakeholder interviews, concept screening, and expert input allowed I found the best product format and designed a low-cost solution for vision screening."
        onOpenChange={onDd}
      >
        <p className="text-sm text-gray-700 leading-relaxed">
          Hundreds of millions of people live with avoidable vision loss, We started with a simple question: why? Through interviewing ophthalmologists, NGO screeners, and engineers, we realized this gap in care is due to current solution being expensive and requiring clinics, power, and trained staff. This realization led us to ideate 50+ concepts to approach this problem before narrowing to ten concrete product formats.
        </p>
        <MediaPlaceholder label="Axiris concept sketches" />
        <p className="text-sm text-gray-700 leading-relaxed">
          Using a Pugh chart and expert feedback, we landed on a handheld device with dual pinholes: two NIR beams pass through the eye, and their spot separation encodes refractive error that we back-calculate to diopters.
        </p>
        <MediaPlaceholder label="Axiris optical path" />
        <p className="text-sm text-gray-700 leading-relaxed">
          I then tackled the optical design step by step: selecting an 850 nm source to maximize retinal reflectance, folding the path with collimating optics to keep the device handheld and minimize signal loss through the optical path.
        </p>
        <MediaPlaceholder label="Axiris final product" />
        <p className="text-sm font-semibold text-gray-800 mt-2">Points of improvement:</p>
        <Bullets
          items={[
            'The current architecture only measures sphere; future iterations should extend to multi-pinhole or Shack-Hartmann-style sensing to capture astigmatism and higher-order aberrations without sacrificing affordability.',
            'The design also depends on relatively expensive optical catalog parts; a follow-on phase should explore custom or lower-cost components and tighter integration with the housing to reduce BOM cost at scale.',
          ]}
        />
      </Dropdown>
      <Dropdown
        summaryTitle="An insight into my resilience under tight constraints"
        summarySubtitle="TL;DR We didn't have access to an optics lab, so I proposed and built a modular model eye that gave us a stable, repeatable testbed to calibrate Axiris and de-risk the design before touching human subjects."
        onOpenChange={onDd}
      >
        <p className="text-sm text-gray-700 leading-relaxed">
          We started from a bulky V1 assembly with light leaks and awkward ergonomics and iterated through six major versions before we had something both functional and presentable as a product.
        </p>
        <MediaPlaceholder label="iterations Axiris" />
        <p className="text-sm text-gray-700 leading-relaxed">
          Without a proper optics lab, I designed a modular model eye with an interchangeable lens and several "retina" slots where a mirror can slide in at known positions, each corresponding to a ground-truth refractive state for tuning the image-processing pipeline and guiding mechanical changes.
        </p>
        <MediaPlaceholder label="model eye Axiris" />
        <p className="text-sm text-gray-700 leading-relaxed">
          We kept the Axiris housing compatible with both the model eye and a medical-grade eyecup, so we can swap between bench calibration and real-eye measurements in seconds without disturbing the internal alignment, and the final V6 housing is fully light-tight, uses only eight mechanical parts, and assembles in about two minutes.
        </p>
        <p className="text-sm font-semibold text-gray-800 mt-2">Point of improvement:</p>
        <Bullets
          items={[
            'A more realistic model eye would be needed for precise calibration in future. However, the simplicity and high reflectance of the current model eye was intentional, as it was ideal for early, rough validation.',
          ]}
        />
      </Dropdown>
    </div>
  );
}

function SuctionCupSlide({ onDd }) {
  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-xl font-bold text-gray-900">Tactile suction cup – Capstone @ EDG</h3>
        <div className="flex gap-2 flex-shrink-0">
          <a href="https://edg.berkeley.edu/research/tactile-sensing/" target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-[11px] text-black bg-white/90 hover:bg-white font-medium px-3 py-0.5 rounded-full transition-colors">EDG website</a>
          <a href="#" onClick={(e) => e.stopPropagation()} className="text-[11px] text-black bg-white/90 hover:bg-white font-medium px-3 py-0.5 rounded-full transition-colors">Paper</a>
          <a href="#" onClick={(e) => e.stopPropagation()} className="text-[11px] text-black bg-white/90 hover:bg-white font-medium px-3 py-0.5 rounded-full transition-colors">Poster</a>
        </div>
      </div>
      <Dropdown
        summaryTitle="An insight into how I design for manufacturability"
        summarySubtitle="TL;DR I consolidated electronics into a custom PCB and redesigned the injection mold to achieve higher success rate in production"
        onOpenChange={onDd}
      >
        <p className="text-sm text-gray-700 leading-relaxed">
          The team started by defining system requirements and mapping the full production and assembly workflow to expose bottlenecks in fabrication, wiring, and maintenance. I then led a complete electrical and mechanical redesign to improve manufacturability and robustness at scale without losing the original functionality of the system.
        </p>
        <MediaPlaceholder label="Requirements Suction Cup" />
        <p className="text-sm text-gray-700 leading-relaxed">
          An example I led is the silicone suction cup redesign. I switched from a four to a three-chamber geometry and redesigned its mold for better demolding. The new mold uses a four-part, wedged layout that lets one chamber release first and then allows "peeling" the rest of the cup out cleanly. This reduced tearing and increased fabrication success compared to the original mold.
        </p>
        <MediaPlaceholder label="Suction cup mold" />
        <p className="text-sm text-gray-700 leading-relaxed">
          After implementing the new geometry, I worked with the PhD students on the project leading control to verify that suction performance and chamber-level sensing were unchanged with the new design. We ran maximum payload and varied object pick-and-place tests on representative items and observed similar performance to the prior prototype.
        </p>
        <MediaPlaceholder label="maximum payload suction cup" />
        <p className="text-sm font-semibold text-gray-800 mt-2">Points of improvement:</p>
        <Bullets
          items={[
            'We kept the existing silicone formulation of the suction cup; exploring alternative mold materials could further improve yield and durability.',
          ]}
        />
      </Dropdown>
    </div>
  );
}

// ── honours mentions sub-slider ───────────────────────────────────────────────

const honourItems = [
  {
    id: 'sproutup',
    title: 'SproutUp: An Assistive standing device',
    media: ['wearing sproutup'],
    links: [
      { label: 'Poster', href: '#' },
      { label: 'Paper', href: '#' },
    ],
  },
  {
    id: 'mpc-robot',
    title: 'Incline steering of a self balancing robot using Model predictive control',
    media: [],
    links: [{ label: 'Paper', href: '#' }],
  },
  {
    id: 'pcm',
    title: 'Phase change Materials based cooling in Photovoltaic cells',
    media: [],
    links: [{ label: 'Paper', href: '#' }],
  },
  {
    id: 'adlap',
    title: 'BSc Thesis: Designing a detachable light source for a robotic surgery system',
    media: ['Adlap rendering', 'Adlap test op buik'],
    links: [
      { label: 'Slides', href: '#' },
      { label: 'Design paper', href: '#' },
    ],
  },
];

function HonoursSlide() {
  const [subIdx, setSubIdx] = useState(0);
  const [isSubPaused, setIsSubPaused] = useState(false);

  useEffect(() => {
    if (isSubPaused) return;
    const t = setInterval(() => {
      setSubIdx((prev) => (prev + 1) % honourItems.length);
    }, 5000);
    return () => clearInterval(t);
  }, [isSubPaused, subIdx]);

  const active = honourItems[subIdx];

  const subPrev = () => setSubIdx((prev) => (prev - 1 + honourItems.length) % honourItems.length);
  const subNext = () => setSubIdx((prev) => (prev + 1) % honourItems.length);

  return (
    <div className="p-6 md:p-8">
      <p className="text-lg font-bold text-gray-800 mb-4">Honorable mentions:</p>

      <div
        className="rounded-xl border border-gray-200 bg-white/50 overflow-hidden"
        onMouseEnter={() => setIsSubPaused(true)}
        onMouseLeave={() => setIsSubPaused(false)}
      >
        {/* Sub-slider nav bar */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
          <button
            onClick={subPrev}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition text-sm leading-none"
          >
            ‹
          </button>
          <div className="flex gap-1.5 items-center">
            {honourItems.map((_, i) => (
              <button
                key={i}
                onClick={() => setSubIdx(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === subIdx ? 'w-4 bg-gray-500' : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
          <button
            onClick={subNext}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition text-sm leading-none"
          >
            ›
          </button>
        </div>

        {/* Sub-slide content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="p-4"
          >
            <p className="font-semibold text-gray-800 text-sm mb-2">{active.title}</p>
            {active.media.map((m) => (
              <MediaPlaceholder key={m} label={m} />
            ))}
            <div className="flex justify-end gap-2 mt-3 flex-wrap">
              {active.links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={(e) => e.stopPropagation()}
                  className="text-[11px] text-black bg-white/90 hover:bg-white font-medium px-3 py-0.5 rounded-full transition-colors"
                >
                  {l.label}
                </a>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

const slides = [
  { id: 'intro', label: 'Intro' },
  { id: 'luci', label: 'LUCI' },
  { id: 'calsol', label: 'CALSOL' },
  { id: 'axiris', label: 'Axiris' },
  { id: 'suctionCup', label: 'EDG' },
  { id: 'honours', label: 'Honours' },
];

export default function ProjectPortfolio({ initialSlideId }) {
  const getInitialIndex = () => {
    if (!initialSlideId) return 0;
    const idx = slides.findIndex((s) => s.id === initialSlideId);
    return idx >= 0 ? idx : 0;
  };

  const [currentIndex, setCurrentIndex] = useState(getInitialIndex);
  const [isHovered, setIsHovered] = useState(false);
  const [openDropdownCount, setOpenDropdownCount] = useState(0);

  const isPaused = isHovered || openDropdownCount > 0;

  const goTo = (idx) => {
    setCurrentIndex(idx);
    setOpenDropdownCount(0);
  };
  const goNext = () => goTo((currentIndex + 1) % slides.length);
  const goPrev = () => goTo((currentIndex - 1 + slides.length) % slides.length);

  useEffect(() => {
    if (isPaused) return;
    const t = setInterval(goNext, 8000);
    return () => clearInterval(t);
  }, [isPaused, currentIndex]);

  const handleDd = (isOpening) => {
    setOpenDropdownCount((prev) => (isOpening ? prev + 1 : Math.max(0, prev - 1)));
  };

  const slideId = slides[currentIndex].id;

  return (
    <section>
      <h2 className="text-center mb-6 text-2xl md:text-3xl font-bold text-gray-400">
        Project portfolio
      </h2>

      <div
        className="rounded-2xl bg-white/70 backdrop-blur-md border border-gray-100 shadow-lg overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Nav bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <button
            onClick={goPrev}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition text-base leading-none"
            aria-label="Previous slide"
          >
            ‹
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
            ›
          </button>
        </div>

        {/* Slide content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={slideId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {slideId === 'intro' && <IntroSlide />}
            {slideId === 'luci' && <LuciSlide onDd={handleDd} />}
            {slideId === 'calsol' && <CalsolSlide onDd={handleDd} />}
            {slideId === 'axiris' && <AxirisSlide onDd={handleDd} />}
            {slideId === 'suctionCup' && <SuctionCupSlide onDd={handleDd} />}
            {slideId === 'honours' && <HonoursSlide />}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
