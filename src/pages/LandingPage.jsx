import React from "react";
import links from "../config/links";

export default function LandingPage() {
  return (
    <div className="w-full min-h-screen bg-gray-800 text-white">

      {/* ── A.1 Introduction ─────────────────────────────────────────────────── */}
      <section
        id="home"
        className="min-h-screen flex items-center px-6 md:px-16 py-16"
      >
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">

          {/* Left — bio text */}
          <div className="flex flex-col gap-6">
            <p className="text-base md:text-lg text-white/80 leading-relaxed">
              I'm a Belgian-born, TU Delft and UC Berkeley trained mechanical
              engineer who likes to understand how things work and where they
              fail, and I consistently turn my curiosity into hands-on problem
              solving. Previous projects range from designing a lighting system
              for a minimally invasive surgical robot, design and manufacturing
              of a fully functional CNC machine, a low cost easy-to-use
              autorefractor and manufacturabilty improvement of a multichambered
              suction cup robotic end effector. After studying and working across
              several countries and academic systems, I have picked up 5
              languages and been exposed to mix of perspectives, teaching me how
              to connect with very different people and teams.
            </p>
            <p className="text-base md:text-lg text-white/80 leading-relaxed">
              I'm most engaged when I can sit at the intersection of design and
              controls, turn messy requirements into clear hardware constraints,
              and build prototypes that move a real problem forward in medical,
              energy, or other technically demanding applications.
            </p>
          </div>

          {/* Right — profile picture, subtitle, logos, links */}
          <div className="flex flex-col items-center gap-5">

            {/* TODO: TEMP placeholder for "profile picture" */}
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center">
              <span className="text-white/30 text-xs font-mono text-center px-4">
                TEMP: profile-picture
              </span>
            </div>

            <p className="text-base md:text-lg font-medium text-center text-white">
              Mechanical/Controls Engineer intern @ MPC lab Berkeley
            </p>

            {/* University logos */}
            <div className="flex gap-6 items-center">
              {/* TODO: TEMP placeholder for "UC Berkeley logo" */}
              <div className="w-16 h-16 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                <span className="text-white/30 text-[10px] font-mono text-center leading-tight px-1">
                  TEMP:<br />UCB logo
                </span>
              </div>
              {/* TODO: TEMP placeholder for "TU Delft logo" */}
              <div className="w-16 h-16 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                <span className="text-white/30 text-[10px] font-mono text-center leading-tight px-1">
                  TEMP:<br />TUD logo
                </span>
              </div>
            </div>

            <p className="text-white/70 text-sm">From Antwerp, Belgium</p>

            <a
              href={links.linkedin}
              target="_blank"
              rel="noreferrer"
              className="text-white/70 hover:text-white text-sm underline underline-offset-2 transition-colors"
            >
              www.linkedin.com/in/-michael-rubin
            </a>

            {/* Action buttons */}
            <div className="flex gap-3 mt-1">
              <a
                href="#"
                className="px-6 py-2 bg-white text-gray-900 font-semibold rounded-full text-sm hover:bg-white/90 transition-colors"
              >
                Learn more
              </a>
              <a
                href="#"
                className="px-6 py-2 bg-white/10 text-white font-semibold rounded-full text-sm border border-white/20 hover:bg-white/20 transition-colors"
              >
                Get in touch
              </a>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
