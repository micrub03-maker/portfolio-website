import React from 'react';

export default function AboutMe() {
  return (
    <section id="about">
      <h2 className="text-center mb-6 text-2xl md:text-3xl font-bold text-gray-400">About me</h2>

      <div className="rounded-2xl bg-white/70 backdrop-blur-md border border-gray-100 shadow-lg p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)] gap-8 items-start">

          {/* Text */}
          <div className="space-y-4">
            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
              I'm a Belgian-born, TU Delft and UC Berkeley trained mechanical engineer who likes to understand how things work and where they fail, and I consistently turn my curiosity into hands-on problem solving.
            </p>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
              Previous projects range from designing a lighting system for a minimally invasive surgical robot, design and manufacturing of a fully functional CNC machine, a low cost easy-to-use autorefractor and manufacturabilty improvement of a multichambered suction cup robotic end effector. After studying and working across several countries and academic systems, I have picked up 5 languages and been exposed to mix of perspectives, teaching me how to connect with very different people and teams.
            </p>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
              I'm most engaged when I can sit at the intersection of design and controls, turn messy requirements into clear hardware constraints, and build prototypes that move a real problem forward in medical, energy, or other technically demanding applications.
            </p>
          </div>

          {/* Picture placeholder */}
          <div className="w-full h-48 sm:h-64 lg:min-h-[16rem] rounded-xl border border-gray-200 bg-white/60 flex items-center justify-center text-xs uppercase tracking-wide text-gray-400">
            TEMP: about me picture
          </div>

        </div>
      </div>
    </section>
  );
}
