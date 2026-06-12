import React, { useState, useEffect, useRef } from "react";
import { useMediaQuery } from "react-responsive";
import emailjs from "@emailjs/browser";
import { motion, AnimatePresence } from "framer-motion";
import { useBackground } from "../contexts/BackgroundContext";
import TableOfContents from "../components/TableOfContents";
import TravelMap from "../components/TravelMap";
import ProjectOverview from "../components/ProjectOverview";
import AboutMe from "../components/AboutMe";
import BreakoutGame from "../components/BreakoutGame";
import Education from "../components/Education";
import Experience from "../components/Experience";
import ProjectPortfolio from "../components/ProjectPortfolio";
import RecentReads from "../components/RecentReads";
import Skills from "../components/Skills";
import InterestsCarousel from "../components/InterestsCarousel";
// Using public directory paths directly for Vite
const profile = "/images/profile.png";
const Delft = "/images/tu-delft-logo-black.png"
const github = "/images/github.png";
const linkedin = "/images/linkedin.png";
const arrow = "/images/arrow.png";
const python = "/images/python.png";
const cpp = "/images/c++.png";
const rp = "/images/rp.png";
const java = "/images/java.png";
const cLogo = "/images/clogo.png";
const jsLogo = "/images/jslogo.png";
const html = "/images/html.png";
const reactLogo = "/images/react.png";
const tailwind = "/images/tailwind.png";
const kicad = "/images/kicad.png";
const nodejs = "/images/nodejs.svg";
const linux = "/images/linux.png";
const git = "/images/git.png";
const docker = "/images/docker.png";
const vscode = "/images/vscode.png";
const berkeley = "/images/ucberkeley.png";
const ucbEng = "/images/ucb-eng.jpg";
const cal = "/images/cal.png";
const calsolLogo = "/images/calsol.png";
const calsolCar = "/images/calsolcar.png";
const roarCar = "/images/roarcar.png";
export default function About() {
  const isDesktop = useMediaQuery({ query: "(min-width: 768px)" });
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const { setAboutContentLoaded } = useBackground();

  const [fadeIn, setFadeIn] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [travelJump, setTravelJump] = useState(0);
  const [projectJump, setProjectJump] = useState({ key: null, count: 0 });
  const [breakoutActive, setBreakoutActive] = useState(false);
  const [widgetsHiding, setWidgetsHiding] = useState(false);
  const [widgetRects, setWidgetRects] = useState(null);
  const [widgetSnapshots, setWidgetSnapshots] = useState(null);
  const profileClickCount = useRef(0);
  const profileClickTimer = useRef(null);
  const profileCardRef = useRef(null);
  const travelRef      = useRef(null);
  const projectsRef    = useRef(null);
  const tocRef         = useRef(null);
  const readsRef       = useRef(null);

  const handleProfileClick = () => {
    profileClickCount.current += 1;
    if (profileClickTimer.current) clearTimeout(profileClickTimer.current);
    if (profileClickCount.current >= 5) {
      profileClickCount.current = 0;

      // Capture rects now, while widgets are still in position, so the fly animation knows where to start from.
      setWidgetRects({
        Profile:  profileCardRef.current?.getBoundingClientRect(),
        Travel:   travelRef.current?.getBoundingClientRect(),
        Projects: projectsRef.current?.getBoundingClientRect(),
        Contents: tocRef.current?.getBoundingClientRect(),
        Reads:    readsRef.current?.getBoundingClientRect(),
      });
      setWidgetSnapshots(null);
      setWidgetsHiding(true);
      setTimeout(() => {
        setWidgetsHiding(false);
        setBreakoutActive(true);
      }, 350);

      // Capture pixel snapshots async — game starts immediately and snapshots
      // fill in when ready (typically before phase-2 bricks start flying).
      const TARGETS = [
        ['Profile',  profileCardRef],
        ['Travel',   travelRef],
        ['Projects', projectsRef],
        ['Contents', tocRef],
        ['Reads',    readsRef],
      ];
      (async () => {
        try {
          const html2canvas = await new Promise((resolve, reject) => {
            if (window.html2canvas) { resolve(window.html2canvas); return; }
            const s = document.createElement('script');
            s.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
            s.onload = () => resolve(window.html2canvas);
            s.onerror = reject;
            document.head.appendChild(s);
          });
          const pairs = await Promise.all(
            TARGETS.map(async ([label, ref]) => {
              if (!ref.current) return [label, null];
              try {
                const canvas = await html2canvas(ref.current, {
                  useCORS: true,
                  backgroundColor: null,
                  scale: 1,
                  logging: false,
                });
                return [label, canvas];
              } catch {
                return [label, null];
              }
            })
          );
          setWidgetSnapshots(Object.fromEntries(pairs.filter(([, c]) => c !== null)));
        } catch {
          // html2canvas unavailable — game continues with glass-only bricks
        }
      })();
    } else {
      profileClickTimer.current = setTimeout(() => { profileClickCount.current = 0; }, 1500);
    }
  };

  useEffect(() => {
    if (profileLoaded) {
      setFadeIn(true);
      setTimeout(() => {
        setAboutContentLoaded(true);
      }, 1100);
    }
  }, [profileLoaded, setAboutContentLoaded]);

  // No real profile image to load — trigger fade-in immediately on mount
  useEffect(() => {
    handleProfileLoad();
  }, []);


  const handleProfileLoad = () => {
    setProfileLoaded(true);
  };

  const handleScrollAbout = (e) => {
    e.preventDefault();
    const aboutSection = document.querySelector("#about");
    const yOffset = -10;
    const y = aboutSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({top: y, behavior: 'smooth'});
  };

  const handleScrollGetInTouch = (e) => {
    e.preventDefault();
    const aboutSection = document.querySelector("#getInTouch");
    aboutSection.scrollIntoView({ behavior: "smooth" });
  };

  const handleTravelNavigate = () => {
    setTravelJump(n => n + 1);
    const el = document.getElementById('interests');
    if (el) {
      const y = el.getBoundingClientRect().top + window.pageYOffset - 10;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleProjectsNavigate = (projectKey) => {
    setProjectJump(prev => ({ key: projectKey, count: prev.count + 1 }));
    const el = document.getElementById('projects');
    if (el) {
      const y = el.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const navWeb = (e) => {
    e.preventDefault();
    const url = "https://logankm02.github.io/website2.0/";
    window.open(url, "_blank");
  };


  // --- Contact form ---
  const [noteOpen, setNoteOpen] = useState(false);
  const [formData, setFormData] = useState({ firstName: "", email: "", message: "" });
  const [submitStatus, setSubmitStatus] = useState(null); // null | "sending" | "success" | "error"
  const formRef = useRef(null);

  const allFilled = formData.firstName.trim() && formData.email.trim() && formData.message.trim();

  const handleFormChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allFilled) return;
    setSubmitStatus("sending");
    try {
      // Configure these three values in .env.local:
      //   VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, VITE_EMAILJS_PUBLIC_KEY
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          from_name: formData.firstName,
          from_email: formData.email,
          message: formData.message,
          to_email: "_michael_rbn@berkeley.edu",
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );
      setSubmitStatus("success");
      setFormData({ firstName: "", email: "", message: "" });
    } catch {
      setSubmitStatus("error");
    }
  };

  return (
    <main className="h-auto top-0 left-0">
      <div
        className={`flex flex-col items-center transition-opacity duration-300 ${
          fadeIn ? "opacity-100" : "opacity-0"
        }`}
      >
      <TableOfContents />
        <div
          id="home"
          className="w-full min-h-screen md:h-screen flex flex-col bg-cover bg-center relative overflow-hidden"
          style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url('/sunset.jpg')" }}
        >
          {/* Hero Dashboard - Redesigned */}
          <div className="w-full h-full flex items-center justify-center px-4 md:px-8 py-4 md:py-6">
            <div
              className="w-full max-w-7xl min-h-[90vh] md:h-[75vh] grid grid-cols-1 md:grid-cols-12 grid-rows-auto md:grid-rows-6 gap-2 md:gap-3 transition-opacity duration-300"
              style={{ opacity: widgetsHiding ? 0 : 1 }}
            >
              
              {/* Profile Card - Left side spanning 4 columns, 6 rows */}
              <div ref={profileCardRef} className="col-span-1 md:col-span-4 row-span-1 md:row-span-6 bg-white/10 backdrop-blur-md rounded-2xl p-3 md:p-4 shadow-2xl border border-white/20 flex flex-col items-center justify-center text-center hover:scale-105 transition-all">
                <div
                  className="w-20 h-20 md:w-48 md:h-48 rounded-full overflow-hidden border border-white/20 mb-1 md:mb-4 flex-shrink-0 cursor-pointer select-none"
                  onClick={handleProfileClick}
                >
                  <img
                    src={profile}
                    alt="Portrait of Michael Rubin"
                    className="block w-full h-full object-cover object-top pointer-events-none"
                  />
                </div>
                <h1 className="text-base md:text-3xl font-bold text-white mb-1">Michael Rubin</h1>
                <p className="text-white/80 text-xs md:text-base mb-1">Mechanical/Controls Engineer @ MPC lab Berkeley</p>
                <div className="flex items-center gap-2 mb-1">
                  <img src={berkeley} alt="UC Berkeley" className="h-5 md:h-11 w-auto opacity-80" />
                  <img src={Delft} alt="TU Delft" className="h-5 md:h-11 w-auto opacity-80" />
                </div>
                <p className="text-white/70 text-xs md:text-sm mt-1 mb-1 md:mb-4 leading-relaxed">
                  From Antwerp, Belgium
                </p>

                {/* Social Links */}
                <div className="flex gap-1 md:gap-2 w-full mb-1 md:mb-4">
                  <a href="https://github.com/micrub03-maker" target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-1 md:gap-2 p-1 md:p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all hover:scale-105">
                    <img className="h-4 w-4" src={github} alt="github" />
                    <span className="text-white text-xs font-medium">GitHub</span>
                  </a>
                  <a href="https://www.linkedin.com/in/-michael-rubin" className="flex-1 flex items-center justify-center gap-1 md:gap-2 p-1 md:p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all hover:scale-105">
                    <img className="h-4 w-4" src={linkedin} alt="linkedin" />
                    <span className="text-white text-xs font-medium">LinkedIn</span>
                  </a>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-1 md:gap-2 w-full">
                  <button className="text-black bg-white hover:bg-gray-100 font-semibold rounded-lg px-3 md:px-4 py-1 md:py-2 transition-all hover:scale-105 shadow-lg text-xs md:text-sm"
                    onClick={handleScrollAbout}
                  >
                    Learn More
                  </button>
                  <button 
                    onClick={handleScrollGetInTouch}
                    className="text-white bg-white/20 hover:bg-white/30 font-semibold rounded-lg px-3 md:px-4 py-1 md:py-2 transition-all hover:scale-105 border border-white/30 text-xs md:text-sm"
                  >
                    Get in Touch
                  </button>
                </div>
              </div>

              {/* Travel Map widget — desktop only */}
              {!isMobile && (
                <div ref={travelRef} className="col-span-1 md:col-span-4 row-span-1 md:row-span-3 md:h-full overflow-hidden rounded-2xl hover:scale-105 transition-all">
                  <TravelMap onNavigate={handleTravelNavigate} />
                </div>
              )}

              {/* A.3 Project Overview */}
              <div ref={projectsRef} className="col-span-1 md:col-span-4 row-span-1 md:row-span-3 h-52 md:h-full">
                <ProjectOverview onProjectClick={(key) => console.log('Project overview click:', key)} onNavigate={handleProjectsNavigate} />
              </div>

              {/* Table of Contents - Bottom left widget — desktop only */}
              {!isMobile && (
                <div ref={tocRef} className="col-span-1 md:col-span-4 row-span-1 md:row-span-3 h-48 md:h-full">
                  <TableOfContents isWidget={true} />
                </div>
              )}

              {/* Recent Reads - Bottom right widget — desktop only */}
              {!isMobile && (
                <div ref={readsRef} className="col-span-1 md:col-span-4 row-span-1 md:row-span-3 h-48 md:h-full">
                  <RecentReads />
                </div>
              )}

            </div>
          </div>

          {/* Scroll Arrow */}
          <div className="hidden md:block absolute bottom-1 md:bottom-1 left-1/2 transform -translate-x-1/2">
            <a
              href="#about"
              className="flex justify-center items-center"
              onClick={handleScrollAbout}
            >
              <img className="w-5 md:w-8 opacity-70 p-2" src={arrow} alt="arrow" />
            </a>
          </div>
        </div>
        <div className="flex flex-col justify-center w-full md:w-11/12 lg:w-4/5 px-6 md:px-0 py-6 md:py-10">
          <AboutMe />
        </div>
        <div id="projects" className="flex flex-col justify-center w-full md:w-11/12 lg:w-4/5 px-6 md:px-0 py-6 md:py-10">
          <ProjectPortfolio jumpToProject={projectJump} />
        </div>
        <div id="interests" className="flex flex-col justify-center w-full md:w-11/12 lg:w-4/5 px-6 md:px-0 py-6 md:py-10">
          <InterestsCarousel jumpToTravel={travelJump} />
        </div>
        <div id="resume" className="flex flex-col justify-center h-max w-full md:w-11/12 lg:w-4/5 px-6 md:px-0 py-6 md:py-10">
          <h2 className="text-center mb-8 text-2xl md:text-3xl font-bold text-gray-400">resume overview</h2>
          <div className="flex flex-col gap-10">
            <Skills />
            <Experience />
            <Education />
          </div>
        </div>
        <div id="getInTouch" className="flex flex-col items-center w-full md:w-11/12 lg:w-4/5 px-6 md:px-0 py-6 md:py-10">
          <h2 className="text-center mb-6 text-2xl md:text-3xl font-bold text-gray-400">contact</h2>

          <div className="w-full rounded-2xl bg-white/70 backdrop-blur-md border border-gray-100 shadow-lg p-6 md:p-10">

            {/* Blurb */}
            <p className="text-base md:text-lg text-gray-800 leading-relaxed mb-6">
              Thanks for making it all the way here! Let's get in touch
            </p>

            {/* Contact cards grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">

              {/* Email */}
              <a
                href="mailto:_michael_rbn@berkeley.edu"
                className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all"
              >
                <svg className="w-5 h-5 flex-shrink-0 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 leading-none mb-0.5">Email</p>
                  <p className="text-xs text-gray-400 truncate">_michael_rbn@berkeley.edu</p>
                </div>
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/in/-michael-rubin"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all"
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="#0A66C2">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <div>
                  <p className="text-sm font-semibold text-gray-800 leading-none mb-0.5">LinkedIn</p>
                  <p className="text-xs text-gray-400">-michael-rubin</p>
                </div>
              </a>

              {/* Phone */}
              <a
                href="tel:+19295120901"
                className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all"
              >
                <svg className="w-5 h-5 flex-shrink-0 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-gray-800 leading-none mb-0.5">Phone</p>
                  <p className="text-[11px] sm:text-xs text-gray-400 whitespace-nowrap">+1 (929) 512-0901</p>
                </div>
              </a>

              {/* Resume */}
              <a
                href="/Michael_Rubin_Resume (General).pdf"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all"
              >
                <svg className="w-5 h-5 flex-shrink-0 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-gray-800 leading-none mb-0.5">Resume</p>
                  <p className="text-xs text-gray-400">View / Download</p>
                </div>
              </a>
            </div>

            {/* Drop me a note accordion */}
            <div className="rounded-xl border border-gray-200 bg-white/60 overflow-hidden">
              <button
                onClick={() => { setNoteOpen((o) => !o); setSubmitStatus(null); }}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left"
              >
                <span className="text-sm font-semibold text-gray-800">Drop me a note...</span>
                <motion.span
                  animate={{ rotate: noteOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-gray-400 text-base leading-none"
                >
                  ▾
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {noteOpen && (
                  <motion.div
                    key="note-form"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    style={{ overflow: "hidden" }}
                  >
                    <form
                      ref={formRef}
                      onSubmit={handleSubmit}
                      className="px-4 pb-5 pt-3 border-t border-gray-100 flex flex-col gap-3"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-gray-500">First Name</label>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleFormChange}
                            placeholder="First Name"
                            className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 bg-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-gray-500">Email</label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleFormChange}
                            placeholder="Email"
                            className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 bg-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-500">What's on your mind?</label>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleFormChange}
                          placeholder="What's on your mind?"
                          rows={4}
                          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 bg-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        {submitStatus === "success" && (
                          <p className="text-sm text-green-600 font-medium">Message sent!</p>
                        )}
                        {submitStatus === "error" && (
                          <p className="text-sm text-red-500 font-medium">Something went wrong — try emailing directly.</p>
                        )}
                        {!submitStatus && <span />}
                        <button
                          type="submit"
                          disabled={!allFilled || submitStatus === "sending"}
                          className="ml-auto text-sm font-semibold px-5 py-2 rounded-full bg-gray-900 text-white hover:bg-gray-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {submitStatus === "sending" ? "Sending…" : "Submit"}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Back to top */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="mt-8 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            back to top
          </button>
        </div>
      </div>

      {breakoutActive && (
        <BreakoutGame
          onClose={() => setBreakoutActive(false)}
          widgetRects={widgetRects}
          widgetSnapshots={widgetSnapshots}
        />
      )}
    </main>
  );
}
