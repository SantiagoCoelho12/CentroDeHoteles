import translations from './translations.mjs';

export const supportedLocales = ['es', 'en', 'pt'];
const dictionaries = { en: new Map(translations.map(row => [row[0], row[1]])), pt: new Map(translations.map(row => [row[0], row[2]])) };
export function translate(text, locale) {
  if (locale === 'es' || !dictionaries[locale]) return text;
  const trimmed = text.trim();
  const value = dictionaries[locale].get(trimmed);
  if (value) return text.replace(trimmed, value);
  return text;
}
export function translateTree(value, locale) {
  if (typeof value === 'string') return translate(value, locale);
  if (Array.isArray(value)) return value.map(item => translateTree(item, locale));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, translateTree(item, locale)]));
  return value;
}
