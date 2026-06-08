import React from 'react';

const cards = [
  {
    key: 'mechanical',
    lines: [
      {
        label: 'Mechanical:',
        rest: ' CAD & Drawing (SolidWorks CSWA certified, OnShape, fusion), FMEA, GD&T (ASME Y14.5-2018), DFx, RCA, V&V, Material Selection (Granta), BOM Management, Motor & Sensor Selection, Thermal optimization, Control Systems (PID, MPC)',
      },
    ],
  },
  {
    key: 'mfg-software',
    lines: [
      {
        label: 'Manufacturing:',
        rest: ' CNC, Additive (FFF, DLP, Cura), Injection Molding, Sheet metal fabrication, Bench Tests, Machine Shop Trained',
      },
      {
        label: 'Software:',
        rest: ' FEA (Abaqus, Ansys, COMSOL), Programming (Python, MATLAB, C++, G-Code),Tools & Platforms (VSCode, Linux, Git, Ros2, Docker, Raspberry Pi), Microsoft Office (VBA, PivotTables)',
      },
    ],
  },
  {
    key: 'languages',
    lines: [
      {
        label: 'Languages & Soft Skills:',
        rest: ' English (near-native, TOEFL 114/120), French (native), Dutch (native), Spanish (fluent), Hebrew (elementary), Adaptability, Reporting & Documentation, Collaboration, Task Prioritization, Creativity',
      },
    ],
  },
];

export default function Skills() {
  return (
    <section>
      <h2 className="text-center mb-6 text-2xl md:text-3xl font-bold text-gray-400">Skills</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.key}
            className="rounded-2xl bg-white/70 backdrop-blur-md border border-gray-100 shadow-lg p-4 md:p-6 space-y-3"
          >
            {card.lines.map((line) => (
              <p key={line.label} className="text-sm text-gray-700 leading-relaxed">
                <span className="font-semibold text-gray-800">{line.label}</span>
                {line.rest}
              </p>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
