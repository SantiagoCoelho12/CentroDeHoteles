'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { es } from '../content/es';
import { translate, translateTree } from '../content/translate.mjs';
import type { LocalizedText } from '../domain/accommodation';

export type Locale = 'es' | 'en' | 'pt';
const intlLocales = { es: 'es-UY', en: 'en-GB', pt: 'pt-BR' };
const LanguageContext = createContext<{
  locale: Locale; intlLocale: string; setLocale: (locale: Locale) => void;
  t: (text: string) => string; localize: (text: LocalizedText) => string; copy: typeof es;
} | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('es');
  useEffect(() => {
    try { const saved = localStorage.getItem('paloma-language'); if (saved === 'es' || saved === 'en' || saved === 'pt') setLocaleState(saved); } catch { /* La elección funciona sin almacenamiento. */ }
  }, []);
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);
  const value = useMemo(() => ({
    locale, intlLocale: intlLocales[locale],
    setLocale: (next: Locale) => { setLocaleState(next); try { localStorage.setItem('paloma-language', next); } catch { /* Sin persistencia. */ } },
    t: (text: string) => translate(text, locale),
    localize: (text: LocalizedText) => text[locale] || translate(text.es, locale),
    copy: translateTree(es, locale) as typeof es,
  }), [locale]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
export function useLanguage() { const value = useContext(LanguageContext); if (!value) throw Error('LanguageProvider missing'); return value; }
export function Text({ children }: { children: string }) { const { t } = useLanguage(); return <>{t(children)}</>; }
export function LanguageButtons() {
  const { locale, setLocale } = useLanguage();
  return <div className="language-buttons" role="group" aria-label="Español / English / Português">{(['es', 'en', 'pt'] as const).map(code => <button key={code} type="button" lang={code} aria-label={{ es: 'Español', en: 'English', pt: 'Português' }[code]} aria-pressed={locale === code} onClick={() => setLocale(code)}>{code.toUpperCase()}</button>)}</div>;
}
