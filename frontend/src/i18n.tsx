import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Locale = "zh-CN" | "en";

type LocaleContextValue = {
  locale: Locale;
  isEnglish: boolean;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);
const STORAGE_KEY = "openxyos.locale";

function initialLocale(): Locale {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "en" || saved === "zh-CN") return saved;
  return navigator.language.toLowerCase().startsWith("zh") ? "zh-CN" : "en";
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const setLocale = (next: Locale) => setLocaleState(next);
  const toggleLocale = () => setLocaleState(current => current === "zh-CN" ? "en" : "zh-CN");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo(() => ({ locale, isEnglish: locale === "en", setLocale, toggleLocale }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("useLocale must be used inside LocaleProvider");
  return value;
}

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useLocale();
  return <div className={`inline-flex items-center rounded border border-border bg-bg-card p-0.5 text-xs ${className}`} aria-label="Language">
    <button type="button" onClick={() => setLocale("zh-CN")} className={`rounded px-2 py-1 transition-colors ${locale === "zh-CN" ? "bg-primary text-white" : "text-text-muted hover:text-text"}`}>中文</button>
    <button type="button" onClick={() => setLocale("en")} className={`rounded px-2 py-1 transition-colors ${locale === "en" ? "bg-primary text-white" : "text-text-muted hover:text-text"}`}>EN</button>
  </div>;
}