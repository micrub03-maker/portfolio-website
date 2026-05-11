import React, { useState, useEffect } from "react";
import { useMediaQuery } from "react-responsive";
import { useBackground } from "../contexts/BackgroundContext";
import TableOfContents from "../components/TableOfContents";
import WorldClock from "../components/WorldClock";
import CurrentProjects from "../components/CurrentProjects";
import ProjectSpotlight from "../components/ProjectSpotlight";
import RecentReads from "../components/RecentReads";
// Using public directory paths directly for Vite
const profile = "/images/profile.jpeg";
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
      // Delay background change until after hero fade-in completes
      setTimeout(() => {
        setAboutContentLoaded(true);
      }, 1100); // 1100ms to ensure fade-in is fully complete
    }
  }, [profileLoaded, setAboutContentLoaded]);


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
                <img
                  className="rounded-full border-3 border-white/30 shadow-xl w-24 md:w-40 h-24 md:h-40 object-cover mb-2 md:mb-4"
                  src={profile}
                  alt="profile"
                  onLoad={handleProfileLoad}
                />
                <h1 className="text-xl md:text-3xl font-bold text-white mb-1">Logan Kinajil-Moran</h1>
                <p className="text-white/80 text-sm md:text-lg mb-1">Electrical Engineering & Computer Science</p>
                <p className="text-white/80 text-xs md:text-sm mb-1">University of Rochester '25 | UC Berkeley '26</p>
                <p className="text-white/80 text-sm mb-1"></p>
                <p className="text-white/70 text-xs md:text-sm mb-2 md:mb-4 leading-relaxed">
                  MEng student currently based in Berkeley, California. From New Zealand 🇳🇿 
                </p>
                
                {/* Social Links */}
                <div className="flex gap-1 md:gap-2 w-full mb-2 md:mb-4">
                  <a href="https://github.com/logankm02" className="flex-1 flex items-center justify-center gap-1 md:gap-2 p-1 md:p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all hover:scale-105">
                    <img className="h-4 w-4" src={github} alt="github" />
                    <span className="text-white text-xs font-medium">GitHub</span>
                  </a>
                  <a href="https://www.linkedin.com/in/logan-kinajil-moran/" className="flex-1 flex items-center justify-center gap-1 md:gap-2 p-1 md:p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all hover:scale-105">
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

              {/* Current Projects - Top right widget */}
              <div className="col-span-1 md:col-span-4 row-span-1 md:row-span-3 h-64 md:h-full">
                <CurrentProjects />
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
        <div id="about" className="flex flex-col justify-center h-max w-full md:w-11/12 lg:w-4/5 px-6 md:px-0">
          <h1 className="text-center m-4 md:m-6 text-2xl md:text-3xl font-bold">Education</h1>

          <div className="flex flex-col md:flex-row gap-4">
            {/* University of Rochester - Left */}
            <div className="flex-1 rounded-2xl bg-white/70 backdrop-blur-md border border-gray-100 shadow-lg p-4 md:p-6 hover:scale-105 hover:shadow-xl transition-all">
              <div className="flex items-center gap-4 mb-4">
                <img className="h-10 w-auto object-contain flex-shrink-0" src={roc_new} alt="University of Rochester" />
                <div>
                  <p className="text-sm text-gray-600">BA, Computer Science & Economics</p>
                  <p className="text-sm text-gray-500">Class of 2025 · Rochester, NY</p>
                </div>
              </div>
              <div>
                <p className="text-sm mb-2">• Magna Cum Laude</p>
                <p className="text-sm mb-2">• Phi Beta Kappa, Dean&apos;s Scholar, Provost&apos;s Circle Scholar</p>
                <p className="text-sm mb-2">• NCAA Varsity Athlete (Men&apos;s Soccer), UAA All-Academic</p>
              </div>
            </div>

            {/* UC Berkeley - Right */}
            <div className="flex-1 rounded-2xl bg-white/70 backdrop-blur-md border border-gray-100 shadow-lg p-4 md:p-6 hover:scale-105 hover:shadow-xl transition-all">
              <div className="flex items-center gap-4 mb-4">
                <img className="h-10 w-auto object-contain flex-shrink-0" src={ucbEng} alt="UC Berkeley" />
                <div>
                  <p className="text-sm text-gray-600">MEng, Electrical Engineering and Computer Sciences</p>
                  <p className="text-sm text-gray-500">Class of 2026 · Berkeley, CA</p>
                </div>
              </div>
              <div>
                <p className="text-sm mb-2">• May 2026 Expected Graduation</p>
                <p className="text-sm mb-2">• Fung Excellence Scholarship</p>
                <p className="text-sm mb-2">• UC Berkeley Solar Vehicle Team (CalSol)</p>
              </div>
            </div>
          </div>
        </div>
        <div id="experience" className="flex flex-col justify-center h-max w-full md:w-11/12 lg:w-4/5 px-6 md:px-0">
          <h1 className="text-center m-4 md:m-6 text-2xl md:text-3xl font-bold">Experience</h1>

          {/* AI Racing Tech */}
          <div className="rounded-2xl bg-white/70 backdrop-blur-md border border-gray-100 shadow-lg p-4 md:p-6 mb-4 md:mb-6 hover:scale-105 hover:shadow-xl transition-all">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3 md:gap-0">
              <div className="flex items-center gap-3">
                <img className="w-20 h-20 object-contain" src={aiRacingTech} alt="AI Racing Tech" />
                <div>
                  <h2 className="font-bold text-lg">Software Engineer, Localization</h2>
                  <h3 className="font-semibold text-gray-700">AI Racing Tech (UC Berkeley Capstone)</h3>
                </div>
              </div>
              <div className="text-left md:text-right">
                <p className="text-sm text-gray-600">Sep 2025 – Present</p>
                <p className="text-sm text-gray-500">Berkeley, CA</p>
              </div>
            </div>
            <div className="pl-15 max-w-2xl">
              <p className="text-sm mb-2">• Developing LiDAR-based perception and localization modules in C++, Python, and ROS 2 for the ROAR autonomous racing platform.</p>
              <p className="text-sm mb-2">• Implementing real-time pose estimation and sensor fusion pipelines integrating DLIO and SLAM visualization tools to achieve 100% localization uptime.</p>
            </div>
          </div>

          {/* CalSol */}
          <div className="rounded-2xl bg-white/70 backdrop-blur-md border border-gray-100 shadow-lg p-4 md:p-6 mb-4 md:mb-6 hover:scale-105 hover:shadow-xl transition-all">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3 md:gap-0">
              <div className="flex items-center gap-3">
                <img className="w-20 h-20 object-contain" src={calsolLogo} alt="CalSol" />
                <div>
                  <h2 className="font-bold text-lg">Electrical Engineer</h2>
                  <h3 className="font-semibold text-gray-700">UC Berkeley Solar Vehicle Team (CalSol)</h3>
                </div>
              </div>
              <div className="text-left md:text-right">
                <p className="text-sm text-gray-600">Sep 2025 – Feb 2026</p>
                <p className="text-sm text-gray-500">Berkeley, CA</p>
              </div>
            </div>
            <div className="pl-15 max-w-2xl">
              <p className="text-sm mb-2">• Designing and manufacturing  electrical components for the Gen XI solar car competing in the Summer 2026 American Solar Challenge Race.</p>
            </div>
          </div>

          {/* Founding Engineer */}
          <div className="rounded-2xl bg-white/70 backdrop-blur-md border border-gray-100 shadow-lg p-4 md:p-6 mb-4 md:mb-6 hover:scale-105 hover:shadow-xl transition-all">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3 md:gap-0">
              <div className="flex items-center gap-3">
                <img className="w-20 h-20 object-contain" src={kite} alt="Kite" />
                <div>
                  <h2 className="font-bold text-lg">Founding Engineer</h2>
                  <h3 className="font-semibold text-gray-700">Kite (usekite.app)</h3>
                </div>
              </div>
              <div className="text-left md:text-right">
                <p className="text-sm text-gray-600">May 2025 – Jan 2026</p>
                <p className="text-sm text-gray-500">Berkeley, CA / Wellington, NZ</p>
              </div>
            </div>
            <div className="pl-15 max-w-2xl">
              <p className="text-sm mb-2">• Built an AI-powered Gmail extension with a JavaScript frontend and Flask backend deployed on OVHCloud for intelligent semantic search, summarization, and labeling.</p>
              <p className="text-sm mb-2">• Integrated large language model APIs with Turbopuffer vector search to provide personalized, context-aware email insights.</p>
              <p className="text-sm mb-2">• Gained paying customers, engaged with tier-1 venture capital firms, and placed in the top 10 percent of Y Combinator applicants for Summer 2025.</p>
            </div>
          </div>

          {/* Additional Experience */}
          <div className="rounded-2xl bg-white/70 backdrop-blur-md border border-gray-100 shadow-lg p-4 md:p-6 mb-4 md:mb-6 hover:scale-105 hover:shadow-xl transition-all">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3 md:gap-0">
              <div className="flex items-center gap-3">
                <img className="w-20 h-20 object-contain" src={owlLogo} alt="OWL Integrations" />
                <div>
                  <h2 className="font-bold text-lg">Electronics Engineer Intern</h2>
                  <h3 className="font-semibold text-gray-700">OWL Integrations</h3>
                </div>
              </div>
              <div className="text-left md:text-right">
                <p className="text-sm text-gray-600">Jun 2025 – Aug 2025</p>
                <p className="text-sm text-gray-500">Remote (New York, NY / Wellington, NZ)</p>
              </div>
            </div>
            <div className="pl-15 max-w-2xl">
              <p className="text-sm mb-2">• Prototyped ESP32-based TTGO T-Beam systems integrating GPS, LoRa mesh networking, and low-power operation for remote wildlife monitoring.</p>
              <p className="text-sm mb-2">• Developed firmware and data pipelines for ML-based audio classification and long-range telemetry transmission.</p>
            </div>
          </div>

          {/* Software Engineering Intern */}
          <div className="rounded-2xl bg-white/70 backdrop-blur-md border border-gray-100 shadow-lg p-4 md:p-6 mb-4 md:mb-6 hover:scale-105 hover:shadow-xl transition-all">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3 md:gap-0">
              <div className="flex items-center gap-3">
                <img className="w-20 h-20 object-contain" src={opendr} alt="OpenDR" />
                <div>
                  <h2 className="font-bold text-lg">Software Engineering Intern</h2>
                  <h3 className="font-semibold text-gray-700">OpenDR</h3>
                </div>
              </div>
              <div className="text-left md:text-right">
                <p className="text-sm text-gray-600">Jul 2024 – Feb 2025</p>
                <p className="text-sm text-gray-500">Remote (US)</p>
              </div>
            </div>
            <div className="pl-15 max-w-2xl">
              <p className="text-sm mb-2">• Developed a full-stack demo with a Go and Neo4j backend and React frontend, containerized with Docker for deployment at DEF CON 2024.</p>
              <p className="text-sm mb-2">• Collaborated on API design, database optimization, and release preparation for the Skynet project, later developed into OpenDR.</p>
            </div>
          </div>

          {/* Research Assistant */}
          <div className="rounded-2xl bg-white/70 backdrop-blur-md border border-gray-100 shadow-lg p-4 md:p-6 mb-4 md:mb-6 hover:scale-105 hover:shadow-xl transition-all">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3 md:gap-0">
              <div className="flex items-center gap-3">
                <img className="w-20 h-20 object-contain" src={roc_new} alt="University of Rochester Medical Center" />
                <div>
                  <h2 className="font-bold text-lg">Research Assistant</h2>
                  <h3 className="font-semibold text-gray-700">University of Rochester Medical Center</h3>
                  <p className="text-sm text-gray-600">Department of Neurosurgery</p>
                </div>
              </div>
              <div className="text-left md:text-right">
                <p className="text-sm text-gray-600">Mar 2024 – Oct 2024</p>
                <p className="text-sm text-gray-500">Rochester, New York</p>
              </div>
            </div>
            <div className="pl-15 max-w-2xl">
              <p className="text-sm mb-2">• Prepared, structured, and analyzed clinical datasets covering 114,892 patients to support development of a machine learning predictor of neurosurgical outcomes.</p>
              <p className="text-sm mb-2">• Delivered models that achieved higher accuracy than standard logistic regression approaches used for outcome forecasting.</p>
            </div>
          </div>
        </div>
        <div id="projects" className="flex flex-col justify-center w-full md:w-11/12 lg:w-4/5 px-6 md:px-0 pb-8">
          <h1 className="text-center m-4 md:m-6 text-2xl md:text-3xl font-bold">Projects</h1>
          <ProjectSpotlight />
        </div>
        <div id="skills" className="flex flex-col justify-center w-full md:w-11/12 lg:w-4/5 px-6 md:px-0 mb-10">
          <h1 className="text-center m-4 md:m-6 text-2xl md:text-3xl font-bold">Skills</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Programming Languages */}
            <div className="md:col-span-2 rounded-2xl bg-white/70 backdrop-blur-md border border-gray-100 shadow-lg p-5">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Programming Languages</h2>
              <div className="flex flex-wrap gap-3">
                <div className="skill"><img src={cLogo} alt="c" /><p>C</p></div>
                <div className="skill"><img src={cpp} alt="c++" /><p>C++</p></div>
                <div className="skill"><img src={rust} alt="rust" /><p>Rust</p></div>
                <div className="skill"><img src={golang} alt="golang" /><p>Go</p></div>
                <div className="skill"><img src={python} alt="python" /><p>Python</p></div>
                <div className="skill"><img src={java} alt="java" /><p>Java</p></div>
                <div className="skill"><img src={ruby} alt="ruby" /><p>Ruby</p></div>
                <div className="skill"><img src={swift} alt="swift" /><p>Swift</p></div>
                <div className="skill"><img src={php} alt="php" /><p>PHP</p></div>
                <div className="skill"><img src={bash} alt="bash" /><p>Bash</p></div>
                <div className="skill"><img src={sql} alt="sql" /><p>SQL</p></div>
              </div>
            </div>

            {/* Web Technologies */}
            <div className="rounded-2xl bg-white/70 backdrop-blur-md border border-gray-100 shadow-lg p-5">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Web Technologies</h2>
              <div className="flex flex-wrap gap-3">
                <div className="skill"><img src={jsLogo} alt="js" /><p>JavaScript</p></div>
                <div className="skill"><img src={html} alt="html" /><p>HTML</p></div>
                <div className="skill"><img src={css} alt="css" /><p>CSS</p></div>
                <div className="skill"><img src={reactLogo} alt="react" /><p>React</p></div>
                <div className="skill"><img src={nodejs} alt="nodejs" /><p>Node.js</p></div>
                <div className="skill"><img src={flask} alt="flask" /><p>Flask</p></div>
              </div>
            </div>

            {/* Databases */}
            <div className="rounded-2xl bg-white/70 backdrop-blur-md border border-gray-100 shadow-lg p-5">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Databases</h2>
              <div className="flex flex-wrap gap-3">
                <div className="skill"><img src={mysql} alt="mysql" /><p>MySQL</p></div>
                <div className="skill"><img src={mongodb} alt="mongodb" /><p>MongoDB</p></div>
                <div className="skill"><img src={neo4j} alt="neo4j" /><p>Neo4j</p></div>
                <div className="skill"><img src={firebase} alt="firebase" /><p>Firebase</p></div>
              </div>
            </div>

            {/* Tools & Platforms */}
            <div className="md:col-span-2 rounded-2xl bg-white/70 backdrop-blur-md border border-gray-100 shadow-lg p-5">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Tools & Platforms</h2>
              <div className="flex flex-wrap gap-3">
                <div className="skill"><img src={git} alt="git" /><p>Git</p></div>
                <div className="skill"><img src={docker} alt="docker" /><p>Docker</p></div>
                <div className="skill"><img src={linux} alt="linux" /><p>Linux</p></div>
                <div className="skill"><img src={azure} alt="azure" /><p>Azure</p></div>
                <div className="skill"><img src={vscode} alt="vscode" /><p>VS Code</p></div>
                <div className="skill"><img src={platformio} alt="platformio" /><p>PlatformIO</p></div>
                <div className="skill"><img src={ros2Logo} alt="ros2" /><p>ROS 2</p></div>
                <div className="skill"><img src={rp} alt="raspberry pi" /><p>Raspberry Pi</p></div>
                <div className="skill"><img src={pytorch} alt="pytorch" /><p>PyTorch</p></div>
                <div className="skill"><img src={unity} alt="unity" /><p>Unity</p></div>
              </div>
            </div>

          </div>
        </div>
      </div>
      <div id="getInTouch" className="flex flex-col items-center w-full px-6 md:px-0 mb-16 mt-2">
        <h1 className="text-center mb-8 text-2xl md:text-3xl font-bold">Get in Touch</h1>

        <div className="w-full md:w-11/12 lg:w-4/5 rounded-2xl bg-white/70 backdrop-blur-md border border-gray-100 shadow-lg p-6 md:p-10">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">

            {/* Left — blurb */}
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Let's connect</h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                Feel free to get in touch with me! The best way is by email.
              </p>
              <a
                href="mailto:logankm@berkeley.edu"
                className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all hover:shadow-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                logankm@berkeley.edu
              </a>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px bg-gray-200 self-stretch" />
            <div className="block md:hidden h-px w-full bg-gray-200" />

            {/* Right — links */}
            <div className="flex flex-col gap-3 min-w-[200px]">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Also find me on</p>
              <a
                href="https://www.linkedin.com/in/logan-kinajil-moran/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all"
              >
                <img className="w-5 h-5 object-contain" src="/images/linkedin-blue.png" alt="LinkedIn" />
                <div>
                  <p className="text-sm font-semibold text-gray-800 leading-none mb-0.5">LinkedIn</p>
                  <p className="text-xs text-gray-400">logan-kinajil-moran</p>
                </div>
              </a>
              <a
                href="https://github.com/logankm02"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all"
              >
                <img className="w-5 h-5 object-contain" src="/images/github-black.svg" alt="GitHub" />
                <div>
                  <p className="text-sm font-semibold text-gray-800 leading-none mb-0.5">GitHub</p>
                  <p className="text-xs text-gray-400">logankm02</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
