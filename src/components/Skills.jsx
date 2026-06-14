import React from 'react';
import { T } from '../i18n';

const cards = [
  {
    key: 'mechanical',
    lines: [
      {
        label: 'Mechanical:',
        rest: ' CAD & Drawing (SolidWorks CSWA certified, OnShape, Fusion), FMEA, GD&T (ASME Y14.5-2018), DFx, Root Cause Analysis, Validation & Verification, Material Selection (Granta), BOM Management, Motor & Sensor Selection, Thermal Optimization, Control Systems (PID, MPC)',
      },
    ],
  },
  {
    key: 'software',
    lines: [
      {
        label: 'Software:',
        rest: ' FEA (Abaqus, Ansys, COMSOL), Programming (Python, MATLAB, C++, G-Code), Tools & Platforms (VSCode, Linux, Git, Ros2, Docker, Raspberry Pi), Microsoft Office (VBA, PivotTables)',
      },
    ],
  },
  {
    key: 'manufacturing',
    lines: [
      {
        label: 'Manufacturing:',
        rest: ' CNC, Additive (FFF, DLP — including Bambu Lab P1S operator, 100+ print-hours), Injection Molding, Sheet Metal Fabrication, Bench Tests (Instron, Thermal, Calibration), Machine Shop & Lab Equipment Trained', // Fix: Issue #50
      },
    ]
  },
  {
    key: 'languages',
    lines: [
      {
        label: 'Languages & Soft Skills:',
        rest: ' English (Near-Native, TOEFL 114/120), Dutch (Native), French (Native), Spanish (Fluent), Hebrew (Elementary), Adaptability, Reporting & Documentation, Collaboration, Task Prioritization, Creativity',
      },
    ],
  },
];

export default function Skills() {
  return (
    <div>
      <h3 className="text-center mb-4 text-lg font-semibold text-gray-400 uppercase tracking-wide"><T>Skills</T></h3>

      {/* Row 1: Mechanical + Manufacturing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {cards.filter(c => ['mechanical', 'manufacturing'].includes(c.key)).map((card) => (
          <div
            key={card.key}
            className="rounded-2xl bg-white/70 backdrop-blur-md ring-1 ring-black/5 shadow-xl p-4 md:p-6 space-y-3"
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

      {/* Row 2: Software + Languages & Soft Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.filter(c => ['software', 'languages'].includes(c.key)).map((card) => (
          <div
            key={card.key}
            className="rounded-2xl bg-white/70 backdrop-blur-md ring-1 ring-black/5 shadow-xl p-4 md:p-6 space-y-3"
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
    </div>
  );
}
