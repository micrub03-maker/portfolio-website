# AI Implementation Guidelines

You are rebuilding the personal portfolio website for Michael Rubin by replacing
the content of this forked repository with the content defined in
`docs/portfolio-spec.md` while keeping its structure and components where possible.

Use this file together with `docs/portfolio-spec.md` as a guideline and rulebook.
`portfolio-spec.md` defines the content and layout.
This file defines implementation rules and constraints.

Repository: https://github.com/micrub03-maker/portfolio-website
Forked from: logankm02/website2.0

---

## Stack — do not change

| Layer        | Technology                                        |
|--------------|---------------------------------------------------|
| Bundler      | Vite 7 (`npm run dev` / `vite build`)             |
| UI framework | React 18 + JSX                                    |
| Routing      | react-router-dom v6                               |
| Styling      | Tailwind CSS v3 + PostCSS + Autoprefixer          |
| Animation    | Framer Motion v12                                 |
| 3D           | @react-three/fiber + @react-three/drei + Three.js |
| Email        | EmailJS (@emailjs/browser)                        |
| Deploy       | gh-pages → `dist/`                                |

- Do NOT introduce new frameworks, UI libraries, or CSS methodologies.
- Do NOT upgrade or downgrade any dependency versions.
- Do NOT modify `vite.config.js`, `postcss.config.js`, `tailwind.config.js`,
  `.babelrc`, or `package.json` unless explicitly requested.

---

## File and folder conventions

- src/
- - assets/ ← static images, videos, icons
- - components/ ← reusable UI pieces (one component per file)
- - contexts/ ← React contexts (e.g. BackgroundContext)
- - models/ ← 3D model files / loaders
- - pages/ ← top-level route pages (Home.jsx, About.jsx, …)
- - App.jsx ← router + layout wrapper
- - index.css ← Tailwind directives + @layer component styles
- - main.jsx ← React DOM entry point
- docs/
- - portfolio-spec.md ← content source of truth
- - Claude-instructions.md ← this file
- public/ ← files served as-is (favicon, og-image, etc.)


- Place new page-level components in `src/pages/`.
- Place new reusable components in `src/components/`.
- Add new routes in `src/App.jsx` following the existing
  `<Route path="…" element={<Component />} />` pattern.
- Add new Tailwind component classes in `src/index.css` under `@layer components`.
- Never put business logic inside `index.css` or styling inside `main.jsx`.

---

## Source of truth

- Treat `docs/portfolio-spec.md` as the single source of truth for:
  - Page structure (Home, Education, Experience, Project Portfolio, Skills, Interests).
  - Section names, dropdown locations, and interaction descriptions.
  - All text in `Text: "..."` blocks.
- Do **not** invent new sections or rewrite the content.

---

## Text and content rules

- Keep all `Text: "..."` content **semantically unchanged**.
- Allowed edits:
  - Normalize quotes (`"`, `'`) and dashes.
  - Fix obvious broken line breaks / spacing.
  - Fix clear encoding artefacts (e.g. stray backslashes).
- Do **not** shorten, rephrase, or "improve" the writing.

---

## Media and links

- For each `Picture: "filename.ext"` or `Video: "filename.ext"` in the spec:
  - Assume a file with that name will exist later.
  - If it is not present in the repo, use a **clearly marked placeholder** component
    with the alt text: `TEMP: filename.ext`.
- For each link label (e.g. `Link to website:`, `Paper link:`):
  - If no URL is given, use 
### Pictures and videos
- For every `Picture: "filename.ext"` or `Video: "filename.ext"` in the spec:
  - Expect the file to appear later in `src/assets/` with that exact filename.
  - If the file is not yet present, render a placeholder:
    ```jsx
    <div className="w-full h-48 bg-gray-700 flex items-center justify-center
                    text-gray-400 text-sm rounded-lg">
      TEMP: filename.ext
    </div>
    ```
  - Add a clearly commented TODO so the file can be swapped in later:
    ```jsx
    {/* TODO: replace with src/assets/filename.ext when available */}
    ```

### Links
- Centralize all URLs in `src/config/links.js`:
  ```js
  // src/config/links.js
  export const LINKS = {
    github:        "https://github.com/micrub03-maker",
    linkedin:      "#",           // TODO: add real URL
    resume:        "#",           // TODO: add real URL
    projectPaper1: "#",           // TODO: add real URL
    // … add one entry per link label found in the spec
  };
  ```
- Import from this file everywhere a link is used. Never hard-code URLs inline.
- For each link label (e.g. `Link to website:`, `Paper link:`, `Slidedeck link:`)
  where no URL is specified, use `href="#"` as a temporary target.
- Keep the visible link text exactly as written in the spec.

---

## Routing

Current routes — keep these working:
- `/`      → `src/pages/Home.jsx`
- `/about` → `src/pages/About.jsx`

Add new routes for each major section in the spec (Education, Experience,
Projects, Skills, Interests) as additional `<Route>` entries in `App.jsx`,
or implement them as scrollable sections within existing pages — whichever
better matches the navigation described in the spec.

---

## Interactions and layout

Implement every interaction described in the spec exactly where indicated:

- **Dropdowns / "learn more" sections**: use a local `useState` boolean toggle
  with a Framer Motion `<AnimatePresence>` + `motion.div` for smooth expand/
  collapse. Do not use a third-party accordion library.
- **"After clicking on dropdown"** content: render inside the same toggle block,
  hidden by default.
- **Navigation**: follow the existing `react-router-dom` link pattern.
- **Back to top**: a button that calls `window.scrollTo({ top: 0, behavior: "smooth" })`.
- **Desktop**: prioritize readability and clear visual hierarchy
  (headings, subheadings, bullet lists).
- **Mobile**: every section must be fully scrollable and tappable.
  Avoid hover-only interactions; pair with `onClick` fallbacks.

---

## Styling guidelines

- Use Tailwind utility classes as the primary styling method.
- For repeated multi-class patterns, add a named class in `src/index.css`
  under `@layer components` (as already done for `.skill`, `.project`,
  `.slow-bounce`, etc.).
- Keep the existing dark-mode / glass-card aesthetic from the original template.
- Maintain consistent spacing, font sizes, and color tokens already in use.
  Do not introduce new color values unless the spec explicitly requires them.

---

## Working style

1. **Plan before editing**: briefly state which files you will touch and why.
2. **Show full file contents or clear diffs** for every file you change.
3. **One feature at a time**: implement one spec section per working block,
   confirm it runs (`npm run dev`) before moving on.
4. **Commit message format**: `feat: implement [Section Name] section`
5. Do NOT modify build config, deployment setup, or ESLint rules unless
   explicitly asked.
6. Do NOT add placeholder filler text (Lorem ipsum, etc.) — use only content
   from `docs/portfolio-spec.md`.