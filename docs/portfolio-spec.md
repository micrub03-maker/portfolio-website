# Project Introduction

You are building a personal portfolio website for Michael Rubin based on this example GitHub repository from another portfolio and this markdown specification.

The goal of the website is to:
- Clearly present Michael’s background, education, and experience as a mechanical/controls engineer.
- Show a curated set of projects and case studies, with dropdown sections that reveal more detail on click.
- Include lighter personal content (reading list, world clock, interests) that gives a sense of personality and context.

Implementation requirements:
- Use the components, styles, and structure from the existing GitHub repository as the starting point. Do not introduce a new framework, directly reuse as much code from the repository as possible.
- Treat each top‑level section in this markdown file (Home, Education, Experience, Project Portfolio, Skills, Interests, etc.) as a page or major section in the site.
- Preserve all written content exactly as provided inside `Text: "..."` blocks. You may only:
  - Fix obvious encoding issues (smart quotes, stray backslashes).
  - Normalize whitespace and line breaks for readability.
- For each `Picture: "filename.ext"` or `Video: "filename.ext"`:
  - Assume a file with that exact name will be provided later in the project.
  - If the file is not yet available, insert a clearly marked temporary placeholder (for example, a neutral image with overlaid text like “TEMP: profile-picture.png”).
- For each link label (for example `Link to website:`, `Paper link:`, `Slidedeck link:`) where a URL is not yet specified:
  - Insert a temporary `#` link or dummy URL, and keep the visible link text exactly as written.
  - Structure the code so real URLs can be dropped in by replacing a single variable or configuration entry.

Interaction and layout:
- Implement dropdowns, “learn more” sections, and other interactions exactly where indicated in this markdown file (for example, “Dropdown 1”, “After clicking on dropdown”, “Make the following text an extra dropdown, not visible unless clicked”).
- On desktop, prioritize readability and clear hierarchy (headings, subheadings, bullet lists). On mobile, ensure all sections remain fully usable and scrollable.
- Use a consistent visual style across all pages: same base colors, typography, and spacing as in the repository.

Output expectations:
- Use semantic HTML structure (section, header, main, footer) and clear CSS class names so future engineers can extend the site.
- Keep the codebase organized so that each major section (Home, Education, Experience, Projects, etc.) can be maintained or reordered without rewriting the layout.
- Do not add new content, text, or projects beyond what is defined in this markdown file. Focus on translating this specification into a clean, responsive, and maintainable website.

# Website Portfolio Outline

## INTRODUCTION PAGE

- Layout: A background picture covering the full page, With text centralized"
- Text: "Hey there! I’m Michael"
- Text: "Mechanical/Controls Engineer intern @ MPC lab Berkeley"
- Text: "UC Berkeley MEng Mechanical Engineering ‘26, TU Delft BSc Mechanical Engineering ‘24"
- Text: "Welcome to my portfolio. This is a curated collection of projects and experiences that reflect my interests across engineering, human-centered design and life in general. Ranging from academic and professional work to hobbies and interests; my goal is to give you a clear sense of what drives me, how I learn and solve problems, and the kind of energy I bring to a team. Have fun browsing!
- Text: "Click anywhere to continue"
- Picture: "background picture"

## LANDING PAGE

Structure:
- A) Home
- B) Education
- C) Experience
- D) Project portfolio
- E) Skills
- F) Interests
- G) Get in Touch

## A) HOME

- A.1) Introduction
- A.2) Current & recent reads
- A.3) Project overview
- A.4) World clock
- A.5) Navigation

## A.1) INTRODUCTION

- Layout: Text block with introduction on the  left. On the right of the text block include the profile picture with subtitle and logos underneath. 
- Text: "I’m a Belgian-born, TU Delft and UC Berkeley trained mechanical engineer who likes to understand how things work and where they fail, and I consistently turn my curiosity into hands-on problem solving. Previous projects range from designing a lighting system for a minimally invasive surgical robot, design and manufacturing of a fully functional CNC machine, a low cost easy-to-use autorefractor and manufacturabilty improvement of a multichambered suction cup robotic end effector. After studying and working across several countries and academic systems, I have picked up 5 languages and been exposed to mix of perspectives, teaching me how to connect with very different people and teams."
- Text: "I’m most engaged when I can sit at the intersection of design and controls, turn messy requirements into clear hardware constraints, and build prototypes that move a real problem forward in medical, energy, or other technically demanding applications."
- Picture: "profile picture"
- Text: "Mechanical/Controls Engineer intern @ MPC lab Berkeley"
- Picture: "UC Berkeley logo", "TU Delft logo"
- Text: "From Antwerp, Belgium"
- Hyperlink: "www.linkedin.com/in/-michael-rubin"
- Link to the main part of the website: Text: "Learn more"
- Link to Get in touch section: Text: "Get in touch"

## A.2) CURRENT AND RECENT READS

- Text: "A book a month keeps the doctor away! (who needs apples anyways)"
- Current:
- Picture: "Apeireigon"
- Text: "Apeireigon, Column McCann"
- Recent:
- Picture: "The ministry of time"
- Text: "The Ministry of Time, Kaliane Bradley"
- Recent:
- Picture: "Island of the missing trees"
- Text: "Island of The Missing Trees, Elif Shafak"
- Recent:
- Picture: "The Poppy War"
- Text: "The Poppy War, R.F Kuang"

## A.3) PROJECT OVERVIEW

- Layout: These projects are in a rotating slideshow, and clicking on them puts you through to the corresponding project slide in D) Project Portfolio section"

Project 1:
- Text: "ONR LUCI @ MPC Lab"
- Video: "ONR Luci intro"
- Text: "Contracted with UC Berkeley’s MPC Lab as a mechanical/control intern to support on the development of an all-terrain autonomous surveillance rover for NIWC Pacific."

Project 2:
- Text: "Driver Safety Lead @ CALSOL"
- Picture: "CALSOL car"
- Text: "Designing, manufacturing and testing chassis parts for our gen XI solar car competing in the American Solar Challenge race this summer"

Project 3:
- Text: "Optics lead @ Axiris autorefractor project"
- Picture: "Axiris logo"
- Text: "Enabling Accessible Vision Screening Through Low-Cost Handheld Autorefraction for Resource-Constrained Settings"

## A.4) WORLD CLOCK

- Include several times and temperatures around the world:
- 1) Berkeley, California
- 2) Antwerp, Belgium

## A.5) NAVIGATION

- Include a click through title for every main section of the website:
- A) Home
- B) Education
- C) Experience
- D) Project portfolio
- E) Skills
- F) Interests
- G) Get in Touch

Include these by adapting the file TableOfContents.jsx

## B) EDUCATION

- Picture: "logo UC Berkeley"
- Text: "MEng mechanical engineer: biomechanics & control"
- Text: "Class of 2026"
- Text:
- "- Awarded scholarship covering full tuition + stipend from the Belgian American Education Foundation
- - UC Berkeley Solar Vehicle Team
- - Balanced leadership and entrepreneurship courses with advanced technical electives, expertise that is directly applied in a year-long Capstone project."

- Picture: "Logo TU Delft"
- Text: "BSc Mechanical Engineer"
- Text: "Class of 2024"
- Text:
- "- Selected for Honours Program; completed 20 additional credits in nominal graduation time
- - Drop Delft Boardsports Association
- - Gained a strong design background, with several hands on projects and a broad technical program"

- Picture: "Logo KLA"
- Text: "Koninklijk Lyceum Antwerpen"
- Text: "Class of 2021"
- Text:
- "- Major in Latin and Mathematics
- - Basketball @Mercurius BB, Jiu Jitsu @ Ikiji Ryu Dojo"

- Picture: "Logo Academie Berchem"
- Text: "Academie Berchem"
- Text: "2008-2021"
- Text: "I was enrolled in the part time graphic arts program, broadening my perspective and developing my creativity. My most valuable hobby growing up!"

## C) EXPERIENCE

- Picture: "MPC logo"
- Text:
- "Mechanical / Controls Engineer – Project LUCI (UC Berkeley MPC Lab) · May 2025 – Present
- - Developing an all-terrain autonomous surveillance rover in collaboration with NIWC Pacific
- - Redesigning 3D-printed chassis for improved structural integrity, manufacturability, and field usability
- - Building and executing validation tests for control architecture; integrating NTRIP GPS and vSLAM navigation"

- Picture: "calsol logo"
- Text:
- "Chassis Engineer – Driver Safety Lead (CALSOL Solar Vehicle Team) · Sept 2025 – Present
- - Led seatbelt system design to meet ASC and World Solar Challenge safety regulations
- - Reduced belt-mount weight by 15% while validating crash-load performance (FOS 1.6)
- - Simplified shoulder anchor design for efficient in-house manufacturing"

- Picture: "Acurity logo"
- Text:
- "AutoCAD Drawing Engineer (KBC Acurity) · Oct 2022 – June 2025
- - Produced 300+ technical drawings supporting nationwide security camera installations"

- Ski Instructor (Big White Ski Resort, Canada) · Nov 2024 – Apr 2025
- Taught and supervised lessons for children ages 3–12 while training for and achieving CSIA Level 2 certification"

- Interaction: "Make the following text an extra dropdown, not visible unless clicked"
- Text: "More Experience"

## C.2) MORE EXPERIENCE DROPDOWN

- Picture: "CERN logo"
- Text:
- "CERN Science Gateway Summer Program (CERN IdeaSquare) · May 2024 – Aug 2024
- - Visiting student at CERN Ideasquare; Explored innovation and design methods to turn Big Science technologies into real-world applications
- - Part of the Honours program at TU Delft"

- Picture: "LDE logo"
- Text: "LDE Sustainability Program (TU Delft / Leiden / Erasmus) · Sept 2022 – June 2023
- - Applied systems thinking and sustainability principles to Dutch government research on biofuels and heavy-duty vehicle electrification
- - Part of the Honours program at TU Delft; weekly lectures combined with research project"

- Picture: "TU Delft logo"
- Text: "Teaching Assistant – Statics & Mechanics of Materials (TU Delft) · Sept 2022 – Jan 2023
- - Taught two sections of 35 students each, totaling 4 weekly sessions
- - Led discussions/labs with 30% higher attendance/engagement vs prior years"

- Picture: "DROP Delft logo"
- Text: "External Relations Manager – Skate Committee (DROP Delft) · Sept 2021 – June 2022
- - Built partnerships with local shops and brands while organizing weekly training sessions and events"

- Picture: "restaurants logo"
- Text: "Hospitality & Events (Antwerp, Belgium) · July 2019 – July 2025
- - Worked part-time in restaurants and events, handling floor operations, bar service, and customer-facing responsibilities"

- Picture: "Filigranes"
- Text: "Sales Assistant (Filigranes Bookshop, Antwerp) · July 2020 – Aug 2022
- - Part time work during holidays. Supported front-of-house sales, inventory, and customer service in a high-traffic retail environment
- - Books, books, books !! Best first job one could wish for"

## D) PROJECT PORTFOLIO

The "Project Portfolio" section should contain an **auto-rotating slider**.
Inside the slider, cycle through the following projects (one project per slide): Intro slide, project 1 slide, project 2 slide, project 3 slide, project 4 slide, honourable mentions slide
- Interaction: possibility to click through the slideshow manually, and dropdowns stopping the automatic slideshow and expanding into case studies when clicked. These dropdowns close back up when clicked anywhere within their bounds

## Intro slide
- Text: "I learn the most by building real things, not just solving problem sets. I used to let perfectionism slow me down, but university projects and hands-on teams pushed me to let go of the fear of failing and build cool stuff!"
- Picture: "Project picture"

## PROJECT 1

- Text: "Project LUCI @ MPC Lab"
- Video: "ONR Luci CAD"
- Text:
- "Development of an all-terrain autonomous surveillance rover. Redesigning the 3D-printed chassis to improve structural robustness, manufacturability, and serviceability, while supporting navigation integration and testing for NTRIP GPS and vSLAM-based autonomy."
- Text:
- "Upcoming tasks:
- - Developing a Blender-based vehicle model for BeamNG simulation to better understand wheel-ground interaction and vehicle dynamics.
- - Exploring controller redesign from scratch as a way to deepen model predictive control experience.
- - Evaluating design changes needed to scale the platform for a larger battery and additional payloads, including future solar inspection use cases."
- Link to lab website: "https://sites.google.com/berkeley.edu/mpc-lab/home?authuser=0"
- Dropdown 1:

## PROJECT 1: DROPDOWN 1

- Visible before activating dropdown:
- Text: "An insight into how I start new projects"
- Text: "TL;DR: I interviewed prior robot users, rebuilt my own rom scratch to identify pain points firsthand, and turned those findings into an assembly guide, wiring diagram, and updated BOM to improve repeatability and remote collaboration"
- Visible after clicking:
- Text: "I began the role by interviewing everyone who had worked with the robot to understand recurring pain points, failure modes, and workflow bottlenecks. To validate those issues firsthand, I rebuilt the rover from scratch and documented every complication, dependency, and time-consuming step along the way."
- Picture: "Luci build"
- Text: "That process led me to create a detailed assembly guide and a cleaned-up wiring diagram to improve build repeatability, simplify component replacement, and support clearer communication with the NIWC collaborators at a distance."
- Picture: "wiring diagram"
- Text: "Before making design changes, I always focus on understanding a project’s constraints, goals, and system-level issues, which reflects my documentation discipline, attention to detail, and user-centered engineering approach. Having done this for this project, I feel confident I have enough context now, and I have started working on a redesigned mount for the camera: improving strength, including damping and pan/tilt mechanism and controls."
- Picture: "pan/tilt mount CAD"
- Video: "pan/tilt mount video"

## PROJECT 2

- Text: "Driver Safety Lead @ CALSOL"
- Picture: "CALSOL car"
- Text: "As Driver Safety Lead for CalSol’s GenXI solar vehicle, I owned the design, analysis, and validation of the five-point seatbelt harness mounting system, from regulation interpretation through physical testing and manufacturing handoff. Our seatbelt system was the first mechanical subsystem to pass scrutineering for the 2026 race cycle."
- Link to website:
- Dropdown 1:
- Dropdown 2:

## PROJECT 2: DROPDOWN 1

- Visible before activating dropdown:
- Text: "An insight into lap-belt insert design and validation"
- Text: "TL;DR I designed bonded metal inserts for the lap and sub-belts, validated them analytically and with quasi-static pull-out tests to credibly meet the load requirement on the occupant cell."
- Visible after clicking:
- Text: "To safely anchor the lap and anti-submarine belts into a thin carbon fiber occupant cell, I designed bonded metal inserts that follow the shell curvature while maintaining proper belt geometry and load paths. The inserts are sandwiched within the laminate, with belts attaching via clips to eyebolts threaded into the inserts."
- Picture: "inserts"
- Text: "I translated regulation requirements into explicit load cases and analyzed two primary failure modes: thread stripping at the insert and debonding or pull-through at the laminate. Through analytical validation I found high safety factors for the threads and a more limiting FOS of 1.3 at the bonded interface."
- Picture: "inserts calcs and sketch"
- Text: "To validate the concept without access to dynamic crash equipment, I developed a conservative quasi-static pull-out test using in-house fabricated flat inserts embedded in CFRP panels. Four samples averaged failure at 6.11 kN, combined with published dynamic CFRP insert data, this supported that the final design could credibly meet the regulated requirement with an estimated dynamic FOS of about 1.15."
- Picture: "Inserts test set up"
- Text:
- "Points of improvement:
- - Relying on quasi-static tests and literature to argue dynamic performance is not fully satisfying for a critical part. Next time I would add an extra validation step (e.g. higher-rate testing or an alternate experimental setup directly checking target load)
- - The insert is still relatively bulky; given the multi-axis machining already required for its manufacturing it's possible to design complex shapes to shed more weight."

## PROJECT 2: DROPDOWN 2

- Visible before activating dropdown:
- Text: "An insight into topology-optimized shoulder-belt anchorage"
- Text: "TL;DR I designed a steel shoulder-belt mount holding wrapping bolts, cut mount weight by ~40% via topology optimization."
- Visible after clicking:
- Text: "For the shoulder harness, I designed a steel backplate that bolts through the chassis and supports transverse \"wrapping bolts\" around which the shoulder belts are looped, eliminating single-point failure by allowing each strap to wrap independently."
- Picture: "shoulder belt anchorage"
- Text: "I modeled the wrapping bolts as fixed-fixed beams under the projected distributed load to size them for the governing failure mode: bending, since shear and tension are easily satisfied. A 9/16 inch grade 8.8 is the smallest size bolt that keeps peak bending stress safely below it's flexural strength of 640 MPa, and the rest of the part was designed around these wrapping bolts."
- Picture: "Shoulder belt calcs"
- Text: "Once the baseline design cleared all load cases, I ran a SolidWorks topology optimization on the backplate to strip non-critical material while preserving manufacturability (uniform thickness, waterjet-friendly geometry, intact interfaces), ultimately cutting weight by roughly 40% while maintaining acceptable safety margins."
- Picture: "Shoulder belt CAD topology"
- Text:
- "Points of improvement:
- - This design is simple, reliable and cheap to manufacture; but there is likely more weight to be saved by exploring a single hollow wrap-around tube concept.
- - Validation of this design relies entirely on simulation; physical testing should be added to confirm the modeled behavior."

## AXIRIS

- Text: "Optics lead @ Axiris autorefractor project"
- Picture: "Axiris logo"
- Text: "Axiris is a low-cost, handheld autorefractor for vision screening in low-resource settings, where conventional 5,000–30,000-dollar clinical systems are difficult to deploy. It uses a Scheiner-disk optical path with 850 nm near-infrared illumination, an external NIR camera, and a Python image-processing stack to estimate refractive error from −10 to +10 diopter. Over a 13-week development cycle, we iterated through six prototypes ending up at a 574-dollar BOM."
- Slidedeck link: "..."
- Paper link: "..."
- Dropdown 1:
- Dropdown 2:

## PROJECT 3: DROPDOWN 1

- Visible before activating dropdown:
- Text: "An insight into my design process"
- Text: "TL;DR Using stakeholder interviews, concept screening, and expert input allowed I found the best product format and designed a low-cost solution for vision screening."
- Visible after dropdown:
- Text: "Hundreds of millions of people live with avoidable vision loss, We started with a simple question: why? Through interviewing ophthalmologists, NGO screeners, and engineers, we realized this gap in care is due to current solution being expensive and requiring clinics, power, and trained staff. This realization led us to ideate 50+ concepts to approach this problem before narrowing to ten concrete product formats."
- Picture: "Axiris concept sketches"
- Text: "Using a Pugh chart and expert feedback, we landed on a handheld device with dual pinholes: two NIR beams pass through the eye, and their spot separation encodes refractive error that we back-calculate to diopters."
- Picture: "Axiris optical path"
- Text: "I then tackled the optical design step by step: selecting an 850 nm source to maximize retinal reflectance, folding the path with collimating optics to keep the device handheld and minimize signal loss through the optical path."
- Picture: "Axiris final product"
- Text:
- "Points of improvement:
- - The current architecture only measures sphere; future iterations should extend to multi-pinhole or Shack-Hartmann-style sensing to capture astigmatism and higher-order aberrations without sacrificing affordability.
- - The design also depends on relatively expensive optical catalog parts; a follow-on phase should explore custom or lower-cost components and tighter integration with the housing to reduce BOM cost at scale."

## PROJECT 3: DROPDOWN 2

- Visible before activating dropdown:
- Text: "An insight into my resilience under tight constraints"
- Text: "TL;DR We didn't have access to an optics lab, so I proposed and built a modular model eye that gave us a stable, repeatable testbed to calibrate Axiris and de-risk the design before touching human subjects."
- Visible after dropdown:
- Text: "We started from a bulky V1 assembly with light leaks and awkward ergonomics and iterated through six major versions before we had something both functional and presentable as a product."
- Picture: "iterations Axiris"
- Text: "Without a proper optics lab, I designed a modular model eye with an interchangeable lens and several \"retina\" slots where a mirror can slide in at known positions, each corresponding to a ground-truth refractive state for tuning the image-processing pipeline and guiding mechanical changes."
- Picture: "model eye Axiris"
- Text: "We kept the Axiris housing compatible with both the model eye and a medical-grade eyecup, so we can swap between bench calibration and real-eye measurements in seconds without disturbing the internal alignment, and the final V6 housing is fully light-tight, uses only eight mechanical parts, and assembles in about two minutes."
- Text:
- "Point of improvement:
- - A more realistic model eye would be needed for precise calibration in future. However, the simplicity and high reflectance of the current model eye was intentional, as it was ideal for early, rough validation."

## PROJECT 4

- Text: "For my graduate capstone with the Embodied Dexterity Group, I took a multi-chamber suction-cup end-effector that enables haptic feedback and pushed it from a research prototype to production-ready hardware for 1,000+ units."
- EDG website link: "https://edg.berkeley.edu/research/tactile-sensing/"
- Paper link: "..."
- Poster link: "..."
- Dropdown 1:

## PROJECT 4: DROPDOWN 1

- Visible before activating dropdown:
- Text: "An insight into how I design for manufacturability"
- Text: "TL;DR I consolidated electronics into a custom PCB and redesigned the injection mold to achieve higher success rate in production"
- Visible after dropdown:
- Text: "The team started by defining system requirements and mapping the full production and assembly workflow to expose bottlenecks in fabrication, wiring, and maintenance. I then led a complete electrical and mechanical redesign to improve manufacturability and robustness at scale without losing the original functionality of the system."
- Picture: "Requirements Suction Cup"
- Text: "An example I led is the silicone suction cup redesign. I switched from a four to a three-chamber geometry and redesigned its mold for better demolding. The new mold uses a four-part, wedged layout that lets one chamber release first and then allows \"peeling\" the rest of the cup out cleanly. This reduced tearing and increased fabrication success compared to the original mold."
- Picture: "Suction cup mold"
- Text: "After implementing the new geometry, I worked with the PhD students on the project leading control to verify that suction performance and chamber-level sensing were unchanged with the new design. We ran maximum payload and varied object pick-and-place tests on representative items and observed similar performance to the prior prototype."
- Picture: "maximum payload suction cup"
- Text: 
"Points of improvement:
- We kept the existing silicone formulation of the suction cup; exploring alternative mold materials could further improve yield and durability."

## PROJECTS HONOURABLE MENTIONS

- Layout: - The "Honorable mentions" section should contain an **auto-rotating slider**.
- The static heading text **"Honorable mentions:"** remains visible at all times.

- Inside the slider, cycle through the following projects (one project per slide): 

- Project 1:
- Text: "SproutUp: An Assistive standing device"
- Picture: "wearing sproutup"
- Link to poster: "..."
- Link to paper: "..."

- Project 2:
- Text: "Incline steering of a self balancing robot using Model predictive control"
- Link to paper: "..."

- Project 3:
- Text: "Phase change Materials based cooling in Photovoltaic cells"
- Link to paper: "..."

- Project 4:
- Text: "BSc Thesis: Designing a detachable light source for a robotic surgery system"
- Link to slides: "..."
- Link to design paper: "..."
- Picture: "Adlap rendering"
- Picture: "Adlap test op buik"

## E) Skills
- Layout: Separate each textbox visually, as it holds a different subset of skills 
- Text: 
"Mechanical: CAD & Drawing (SolidWorks CSWA certified, OnShape, fusion), FMEA, GD&T (ASME Y14.5-2018), DFx, RCA, V&V, Material Selection (Granta), BOM Management, Motor & Sensor Selection, Thermal optimization, Control Systems (PID, MPC)"

- Text:
"Manufacturing: CNC, Additive (FFF, DLP, Cura), Injection Molding, Sheet metal fabrication, Bench Tests, Machine Shop Trained"
Text: "Software: FEA (Abaqus, Ansys, COMSOL), Programming (Python, MATLAB, C++, G-Code),Tools & Platforms (VSCode, Linux, Git, Ros2, Docker, Raspberry Pi), Microsoft Office (VBA, PivotTables)"

- Text: "Languages & Soft Skills: English (near-native, TOEFL 114/120), French (native), Dutch (native), Spanish (fluent), Hebrew (elementary), Adaptability, Reporting & Documentation, Collaboration, Task Prioritization, Creativity"

## F) INTERESTS

- leave blank for now

## GET IN TOUCH

- Text: "Thanks for making it all the way here! Let's get in touch"
- Link: _michael_rbn@berkeley.edu
- Link: "www.linkedin.com/in/-michael-rubin"

- Layout: Include a back to top button that says, Text: "Back to top"
