import React, { useState, useEffect } from "react";
import { useMediaQuery } from "react-responsive";
import { useBackground } from "../contexts/BackgroundContext";
import links from "../config/links";
import TableOfContents from "../components/TableOfContents";
import WorldClock from "../components/WorldClock";
import ProjectOverview from "../components/ProjectOverview";
import AboutMe from "../components/AboutMe";
import Education from "../components/Education";
import Experience from "../components/Experience";
import ProjectPortfolio from "../components/ProjectPortfolio";
import RecentReads from "../components/RecentReads";
import Skills from "../components/Skills";
import InterestsCarousel from "../components/InterestsCarousel";
// Using public directory paths directly for Vite
const profile = "/images/profile.png";
const github = "/images/github.png";
const linkedin = "/images/linkedin.png";
const arrow = "/images/arrow.png";
const r = "/images/r.png";
const python = "/images/python.png";
const cpp = "/images/c++.png";
const rp = "/images/rp.png";
const owlLogo = "/images/owl-logo.png";
const java = "/images/java.png";
const cLogo = "/images/clogo.png";
const jsLogo = "/images/jslogo.png";
const swift = "/images/swift.png";
const php = "/images/php.png";
const sql = "/images/sqllogo.png";
const html = "/images/html.png";
const css = "/images/css.png";
const flask = "/images/flask.png";
const reactLogo = "/images/react.png";
const threejs = "/images/threejs.png";
const tailwind = "/images/tailwind.png";
const mysql = "/images/mysql.png";
const mongodb = "/images/mongodb.svg";
const firebase = "/images/firebase.png";
const ruby = "/images/ruby.png";
const kicad = "/images/kicad.png";
const ros2Logo = "/images/ros2logo.png";
const golang = "/images/golang.png";
const bash = "/images/bash.png";
const nodejs = "/images/nodejs.svg";
const neo4j = "/images/neo4j.png";
const linux = "/images/linux.png";
const azure = "/images/azure.png";
const git = "/images/git.png";
const docker = "/images/docker.png";
const vscode = "/images/vscode.png";
const pytorch = "/images/pytorch.png";
const platformio = "/images/platformio.png";
const rust = "/images/rust.png";
const webScreenshot = "/images/webss.png";
const messageScreenshot = "/images/messagess.png";
const weatherScreenshot = "/images/weatherss.png";
const findUrPartyScreenshot = "/images/findurpartyss.jpg";
const scrabbleScreenshot = "/images/scrabbless.png";
const blackjackScreenshot = "/images/blackjackss.png";
const tuinetScreenshot = "/images/tuinet.jpg";
const kiteScreenshot = "/images/askkite.png";
const berkeley = "/images/ucberkeley.png";
const aiRacingTech = "/images/airacingtech.jpeg";
const ucbEng = "/images/ucb-eng.jpg";
const kite = "/images/kite.png";
const opendr = "/images/opendr.jpg";
const unity = "/images/unity.png";
const cal = "/images/cal.png";
const roc_new = "/images/rochester_new.png";
const calsolLogo = "/images/calsol.png";
const calsolCar = "/images/calsolcar.png";
const roarCar = "/images/roarcar.png";

export default function About() {
  const isDesktop = useMediaQuery({ query: "(min-width: 768px)" });
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const { setAboutContentLoaded } = useBackground();

  const [fadeIn, setFadeIn] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

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
    const yOffset = -80; // Offset to not scroll too far
    const y = aboutSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({top: y, behavior: 'smooth'});
  };

  const handleScrollGetInTouch = (e) => {
    e.preventDefault();
    const aboutSection = document.querySelector("#getInTouch");
    aboutSection.scrollIntoView({ behavior: "smooth" });
  };

  const navWeb = (e) => {
    e.preventDefault();
    const url = "https://logankm02.github.io/website2.0/";
    window.open(url, "_blank");
  };

  const msgWeb = (e) => {
    e.preventDefault();
    const url = "https://logankm02.github.io/Message-App/";
    window.open(url, "_blank");
  };

  const trvlWeb = (e) => {
    e.preventDefault();
    const url = "https://logankm02.github.io/travel-helper/";
    window.open(url, "_blank");
  };

  const scrabbleWeb = (e) => {
    e.preventDefault();
    const url = "https://logankm02.github.io/scrabble-bot/";
    window.open(url, "_blank");
  };
  const BlackjackWeb = (e) => {
    e.preventDefault();
    const url = "https://logankm02.github.io/blackjack/";
    window.open(url, "_blank");
  };

  const kiteWeb = (e) => {
    e.preventDefault();
    const url = "https://usekite.app";
    window.open(url, "_blank");
  };

  const findUrPartyAppStore = (e) => {
    e.preventDefault();
    const url = "https://apps.apple.com/app/id6465749219";
    window.open(url, "_blank");
  };

  const tuinetWeb = (e) => {
    e.preventDefault();
    const url = "https://medium.com/project-owl/project-t%C5%AB%C4%ABnet-tools-for-native-wildlife-conservation-5551211158fe";
    window.open(url, "_blank");
  };

  return (
    <main className="h-auto top-0 left-0">
      <TableOfContents />

      <div
        className={`flex flex-col items-center mx-4 md:mx-10 transition-opacity duration-1000 ${
          fadeIn ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          id="home"
          className="w-screen min-h-screen md:h-screen flex flex-col bg-banner bg-cover bg-center relative overflow-hidden"
        >
          {/* Hero Dashboard - Redesigned */}
          <div className="w-full h-full flex items-center justify-center px-4 md:px-8 py-4 md:py-6">
            <div className="w-full max-w-7xl min-h-[90vh] md:h-[75vh] grid grid-cols-1 md:grid-cols-12 grid-rows-auto md:grid-rows-6 gap-2 md:gap-3">
              
              {/* Profile Card - Left side spanning 4 columns, 6 rows */}
              <div className="col-span-1 md:col-span-4 row-span-1 md:row-span-6 bg-white/10 backdrop-blur-md rounded-2xl p-3 md:p-4 shadow-2xl border border-white/20 flex flex-col items-center justify-center text-center">
                {/* TODO: TEMP placeholder for "profile-picture" */}
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border border-white/20 mb-2 md:mb-4 flex-shrink-0">
                  <img
                    src={profile}
                    alt="Portrait of Michael Rubin"
                    className="block w-full h-full object-cover object-top"
                  />
                </div>
                <h1 className="text-xl md:text-3xl font-bold text-white mb-1">Michael Rubin</h1>
                <p className="text-white/80 text-sm md:text-lg mb-1">Mechanical/Controls Engineer intern @ MPC lab Berkeley</p>
                <p className="text-white/80 text-xs md:text-sm mb-1">UC Berkeley MEng '26 · TU Delft BSc '24</p>
                <p className="text-white/70 text-xs md:text-sm mb-2 md:mb-4 leading-relaxed">
                  From Antwerp, Belgium
                </p>

                {/* Social Links */}
                <div className="flex gap-1 md:gap-2 w-full mb-2 md:mb-4">
                  <a href={links.github} className="flex-1 flex items-center justify-center gap-1 md:gap-2 p-1 md:p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all hover:scale-105">
                    <img className="h-4 w-4" src={github} alt="github" />
                    <span className="text-white text-xs font-medium">GitHub</span>
                  </a>
                  <a href={links.linkedin} className="flex-1 flex items-center justify-center gap-1 md:gap-2 p-1 md:p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all hover:scale-105">
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
                    className="text-white bg-white/20 hover:bg-white/30 font-semibold rounded-lg px-3 md:px-4 py-1 md:py-2 transition-all hover:scale-105 backdrop-blur-sm border border-white/30 text-xs md:text-sm"
                  >
                    Get in Touch
                  </button>
                </div>
              </div>

              {/* Recent Reads - Top left widget */}
              <div className="col-span-1 md:col-span-4 row-span-1 md:row-span-3 h-48 md:h-full">
                <RecentReads />
              </div>

              {/* A.3 Project Overview */}
              <div className="col-span-1 md:col-span-4 row-span-1 md:row-span-3 h-64 md:h-full">
                <ProjectOverview onProjectClick={(key) => console.log('Project overview click:', key)} />
              </div>

              {/* World Clock - Bottom left widget */}
              <div className="col-span-1 md:col-span-4 row-span-1 md:row-span-3 h-48 md:h-full">
                <WorldClock />
              </div>

              {/* Table of Contents - Bottom right widget */}
              <div className="col-span-1 md:col-span-4 row-span-1 md:row-span-3 h-48 md:h-full">
                <TableOfContents isWidget={true} />
              </div>

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
        <div id="education" className="flex flex-col justify-center h-max w-full md:w-11/12 lg:w-4/5 px-6 md:px-0 py-6 md:py-10">
          <Education />
        </div>
        <div id="experience" className="flex flex-col justify-center h-max w-full md:w-11/12 lg:w-4/5 px-6 md:px-0 py-6 md:py-10">
          <Experience />
        </div>
        <div id="projects" className="flex flex-col justify-center w-full md:w-11/12 lg:w-4/5 px-6 md:px-0 py-6 md:py-10">
          <ProjectPortfolio />
        </div>
        <div id="skills" className="flex flex-col justify-center w-full md:w-11/12 lg:w-4/5 px-6 md:px-0 py-6 md:py-10">
          <Skills />
        </div>
        <div id="interests" className="flex flex-col justify-center w-full md:w-11/12 lg:w-4/5 px-6 md:px-0 py-6 md:py-10">
          <InterestsCarousel />
        </div>
        <div id="getInTouch" className="flex flex-col items-center w-full md:w-11/12 lg:w-4/5 px-6 md:px-0 py-6 md:py-10">
          <h2 className="text-center mb-6 text-2xl md:text-3xl font-bold text-gray-400">Contact</h2>

        <div className="w-full rounded-2xl bg-white/70 backdrop-blur-md border border-gray-100 shadow-lg p-6 md:p-10">
          <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">

            {/* Left — blurb + email */}
            <div className="flex-1">
              <p className="text-base md:text-lg text-gray-800 leading-relaxed mb-5">
                Thanks for making it all the way here! Let's get in touch
              </p>
              <a
                href="mailto:_michael_rbn@berkeley.edu"
                className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all hover:shadow-lg"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                _michael_rbn@berkeley.edu
              </a>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px bg-gray-200 self-stretch" />
            <div className="block md:hidden h-px w-full bg-gray-200" />

            {/* Right — LinkedIn */}
            <div className="flex flex-col gap-3 min-w-[200px]">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Also find me on</p>
              <a
                href="https://www.linkedin.com/in/-michael-rubin"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all"
              >
                {/* LinkedIn wordmark SVG — no external image needed */}
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="#0A66C2">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <div>
                  <p className="text-sm font-semibold text-gray-800 leading-none mb-0.5">LinkedIn</p>
                  <p className="text-xs text-gray-400">-michael-rubin</p>
                </div>
              </a>
            </div>
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
          Back to top
        </button>
        </div>
      </div>
    </main>
  );
}
