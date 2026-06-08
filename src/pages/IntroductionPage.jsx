import React from "react";

// TODO: once "background picture" is provided, add bg-[url('/images/background-picture.jpg')]
//       to the outer div and remove the TEMP placeholder below.

export default function IntroductionPage() {
  return (
    <div className="relative w-full h-screen bg-gray-800 bg-cover bg-center flex items-center justify-center">

      {/* TODO: TEMP placeholder for "background picture" */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-white/20 text-sm font-mono">TEMP: background-picture</span>
      </div>

      {/* Dark overlay for text legibility */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Centered content */}
      <div className="relative z-10 flex flex-col items-center text-center text-white px-6 max-w-2xl md:max-w-6xl mx-auto gap-4">
        <h1 className="text-5xl md:text-8xl font-bold md:whitespace-nowrap">Hey there! I'm Michael</h1>

        <p className="text-xl md:text-3xl font-medium md:whitespace-nowrap">
          Mechanical/Controls Engineer intern @ MPC lab Berkeley
        </p>

        <p className="text-lg md:text-2xl text-white/80 md:whitespace-nowrap">
          UC Berkeley MEng Mechanical Engineering '26, TU Delft BSc Mechanical Engineering '24
        </p>

        <p className="text-sm md:text-base text-white/70 leading-relaxed max-w-xl mx-auto">
          Welcome to my portfolio 
          <br />This is a curated collection of projects and experiences that
          reflect my interests across engineering, human-centered design and life in general.
          <br />My goal is to give
          you a clear sense of what drives me, how I learn and solve problems, and the kind of
          energy I bring to a team.
            <br />Have fun browsing!
        </p>

        <p className="text-sm text-white/50 mt-4 tracking-widest uppercase">
          Click anywhere to continue
        </p>
      </div>
    </div>
  );
}
