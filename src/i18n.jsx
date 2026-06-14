import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

// Secret language toggle. Typing one of the two-letter codes (fr / es / nl / he)
// anywhere on the page swaps the main section titles into that language for 10
// seconds. Typing another code within that window overrides it and restarts the
// 10-second countdown. A nod to the polyglot line in the About section.
//
// Section titles opt in by wrapping their text in <T>…</T>; the lookup is keyed
// by the lowercased English title, so unknown text passes through untranslated.

const LANGS = ['fr', 'es', 'nl', 'he'];
const HOLD_MS = 10000;

const TRANSLATIONS = {
  'about me':          { fr: 'à propos',             es: 'sobre mí',                nl: 'over mijzelf',       he: 'עליי' },
  'experience':        { fr: 'expérience',           es: 'experiencia',             nl: 'ervaring',           he: 'ניסיון' },
  'education':         { fr: 'formation',            es: 'educación',               nl: 'opleiding',          he: 'השכלה' },
  'skills':            { fr: 'compétences',          es: 'habilidades',             nl: 'vaardigheden',       he: 'כישורים' },
  'project portfolio': { fr: 'portfolio de projets', es: 'portafolio de proyectos', nl: 'projectenportfolio', he: 'תיק פרויקטים' },
  'resume overview':   { fr: 'aperçu du CV',         es: 'resumen del CV',          nl: 'cv-overzicht',       he: 'סקירת קורות חיים' },
  'interests':         { fr: 'centres d’intérêt',    es: 'intereses',               nl: 'interesses',         he: 'תחומי עניין' },
  'contact':           { fr: 'contact',              es: 'contacto',                nl: 'contact',            he: 'צור קשר' },
};

const LangContext = createContext({ lang: null });

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(null);
  const timerRef = useRef(null);
  const bufRef = useRef('');

  const activate = useCallback((code) => {
    setLang(code);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setLang(null), HOLD_MS);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      // Don't hijack typing in form fields (e.g. the contact form).
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable) return;
      if (e.key.length !== 1 || !/[a-z]/i.test(e.key)) return;
      bufRef.current = (bufRef.current + e.key.toLowerCase()).slice(-2);
      if (LANGS.includes(bufRef.current)) {
        activate(bufRef.current);
        bufRef.current = '';
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [activate]);

  return <LangContext.Provider value={{ lang }}>{children}</LangContext.Provider>;
}

// Translates the wrapped (plain string) title for the active secret language;
// renders the original text when no language is active or no translation exists.
export function T({ children }) {
  const { lang } = useContext(LangContext);
  if (!lang || typeof children !== 'string') return children;
  const entry = TRANSLATIONS[children.trim().toLowerCase()];
  return entry?.[lang] ?? children;
}
