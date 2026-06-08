// Central URL registry — replace "#" values with real URLs when available.
// Every link in the site should import from here so updates only touch one file.

const links = {
  // ── Contact & social ────────────────────────────────────────────────────────
  email:    "mailto:_michael_rbn@berkeley.edu",
  linkedin: "https://www.linkedin.com/in/-michael-rubin",

  // ── Internal navigation anchors ─────────────────────────────────────────────
  learnMore:  "#about",
  getInTouch: "#getInTouch",

  // ── Project 1 — LUCI @ MPC Lab ──────────────────────────────────────────────
  mpcLabWebsite: "https://sites.google.com/berkeley.edu/mpc-lab/home?authuser=0",

  // ── Project 2 — Driver Safety Lead @ CALSOL ─────────────────────────────────
  calsolWebsite: "#",

  // ── Project 3 — Optics Lead @ Axiris Autorefractor ──────────────────────────
  axirisSlidedeck: "#",
  axirisPaper:     "#",

  // ── Project 4 — Suction-Cup End-Effector (EDG Capstone) ─────────────────────
  edgWebsite:       "https://edg.berkeley.edu/research/tactile-sensing/",
  suctionCupPaper:  "#",
  suctionCupPoster: "#",

  // ── Honourable Mention 1 — SproutUp ─────────────────────────────────────────
  sproutUpPoster: "#",
  sproutUpPaper:  "#",

  // ── Honourable Mention 2 — MPC Self-Balancing Robot ─────────────────────────
  mpcRobotPaper: "#",

  // ── Honourable Mention 3 — Phase Change Materials / PV Cooling ──────────────
  phaseChangePaper: "#",

  // ── Honourable Mention 4 — BSc Thesis (ADLAP surgical light source) ─────────
  bscThesisSlides:     "#",
  bscThesisDesignPaper: "#",
};

export default links;
