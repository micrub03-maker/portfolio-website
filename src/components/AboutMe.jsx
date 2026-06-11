import React from 'react';

export default function AboutMe() {
  return (
    <section id="about">
      <h2 className="text-center mb-6 text-2xl md:text-3xl font-bold text-gray-400">
        about me
      </h2>

      <div className="rounded-2xl bg-white/70 backdrop-blur-md border border-gray-100 shadow-lg p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          {/* Picture */}
          <div className="order-1 h-full">
            <div className="w-full h-64 sm:h-80 lg:h-full rounded-xl overflow-hidden">
              <img
                src="/images/About-me.JPG"
                alt="About me"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Text */}
          <div className="order-2 space-y-6 text-sm text-gray-700 leading-relaxed">
            <p>
              I’m a Belgian-born mechanical engineer trained at TU Delft and UC Berkeley and I like to understand how things work, where they fail, and how to turn that curiosity into hands-on problem solving.
            </p>
            <p>
             My previous projects range from designing a light module for a surgical robot to building a fully functional CNC machine. After studying and working across several countries and academic systems, I’ve picked up five languages and a mix of perspectives that make it easier for me to connect with very different people and teams.
            </p>
            <p>
            I’m most engaged at the intersection of design and controls, where working with people helps me turn messy requirements into clear hardware constraints and I can make complex systems robust and manufacturable.  My goal is to move real problems forward in medical, energy, or other technically demanding applications. 
            When I’m not researching or debugging something, you'll find me outdoors!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}