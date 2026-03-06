import type React from "react";
import { createContext, useCallback, useContext, useState } from "react";
import {
  type Language,
  type TranslationKey,
  translations,
} from "../i18n/translations";

const STORAGE_KEY = "appLanguage";

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getInitialLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (
      stored === "en" ||
      stored === "hi" ||
      stored === "mr" ||
      stored === "kn"
    ) {
      return stored;
    }
  } catch {
    // ignore
  }
  return "en";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      return (
        (translations[language] as Record<string, string>)[key] ??
        (translations.en as Record<string, string>)[key] ??
        key
      );
    },
    [language],
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
