import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import pt from '@/i18n/pt';
import en from '@/i18n/en';
import fr from '@/i18n/fr';

type Locale = 'pt' | 'en' | 'fr';

const dictionaries: Record<Locale, Record<string, string>> = { pt, en, fr };

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem('kivara-locale');
    if (saved === 'en' || saved === 'pt' || saved === 'fr') return saved;
    return 'pt';
  });

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('kivara-locale', l);
  }, []);

  const t = useCallback(
    (key: string) => dictionaries[locale][key] ?? dictionaries.pt[key] ?? key,
    [locale]
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}

export function useT() {
  return useLanguage().t;
}
