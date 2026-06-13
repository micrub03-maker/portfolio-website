import React from 'react';

export default function AboutMe() {
  return (
    <section id="about">
      <h2 className="text-center mb-6 text-2xl md:text-3xl font-bold text-gray-400">
        about me
      </h2>

      <div className="rounded-2xl bg-white/70 backdrop-blur-md ring-1 ring-black/5 shadow-xl p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-stretch">
          {/* Picture */}
          <div className="order-1 lg:col-span-2 h-full">
            <div className="w-full h-64 sm:h-80 lg:h-full rounded-xl overflow-hidden">
              {/* NOTE: rename public/images/About-me.JPG → public/images/about-me.jpg on disk */}
              <img
                src="/images/about-me.jpg" // Fix: Issue #14 — lowercase, case-safe path
                alt="About me"
                className="w-full h-full object-cover object-top" // Fix: Issue #15 — keep subject in frame on portrait crops
                loading="lazy" // Fix: Issue #16 — image is well below the fold
              />
            </div>
          </div>

          {/* Text */}
          <div className="order-2 lg:col-span-3 space-y-6 text-sm md:text-base text-gray-700 leading-relaxed">
            <p>
              I'm a mechanical engineer trained at TU Delft and UC Berkeley who builds hardware that works in the real world, with projects ranging from a low-cost autorefractor to a CNC machine I designed and built end to end.
            </p>
            <p>
              I work best at the intersection of mechanical design and controls, taking systems from analysis to functional hardware under tight timelines.
            </p>
            <p>
              Belgian-born and fluent in five languages, I’m comfortable in fast-paced, multidisciplinary teams across different engineering cultures. I’m looking to do that kind of work on hard problems in medical devices, energy, or other technically demanding fields.
              <br />
              When I'm not designing or debugging something, I'm outdoors.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}