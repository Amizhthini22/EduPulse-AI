import React, { createContext, useContext, useState } from 'react';
import { getTranslations, supportedLocales } from './i18n';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [locale, setLocale] = useState(
    () => localStorage.getItem('edupulse_locale') || 'en'
  );

  const t = getTranslations(locale);

  function changeLocale(code) {
    setLocale(code);
    localStorage.setItem('edupulse_locale', code);
    // Update html lang attribute for screen readers
    document.documentElement.lang = code;
  }

  return (
    <LanguageContext.Provider value={{ locale, t, changeLocale, supportedLocales }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
