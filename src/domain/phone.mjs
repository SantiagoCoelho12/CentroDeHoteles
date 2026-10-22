import { getCountries, getCountryCallingCode, parsePhoneNumberFromString } from 'libphonenumber-js/min';

const names = new Intl.DisplayNames(['es'], { type: 'region' });
const priority = ['AR', 'BR', 'UY'];
export const phoneCountries = getCountries().map(code => ({ code, name: names.of(code) ?? code, dial: `+${getCountryCallingCode(code)}`, flag: [...code].map(letter => String.fromCodePoint(127397 + letter.charCodeAt(0))).join('') }))
  .sort((a, b) => {
    const ai = priority.indexOf(a.code); const bi = priority.indexOf(b.code);
    if (ai !== -1 || bi !== -1) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    return a.name.localeCompare(b.name, 'es');
  });

/** @param {string} number @param {string} country */
export function internationalPhone(number, country) {
  if (!phoneCountries.some(item => item.code === country)) return null;
  const parsed = parsePhoneNumberFromString(number, country);
  return parsed?.isPossible() ? parsed.number : null;
}
