import test from 'node:test';
import assert from 'node:assert/strict';
import { translate, translateTree, supportedLocales } from '../src/content/translate.mjs';
import translations from '../src/content/translations.mjs';
import { availabilityLink } from '../src/domain/availability.mjs';
import { contactLinks } from '../src/domain/detail.mjs';

test('ofrece español, inglés y portugués con traducciones completas y sin claves repetidas', () => {
  assert.deepEqual(supportedLocales, ['es', 'en', 'pt']);
  assert.equal(new Set(translations.map(row => row[0])).size, translations.length);
  for (const row of translations) for (const text of row) assert.ok(typeof text === 'string' && text.trim());
  assert.equal(translate('Alojamientos', 'en'), 'Places to stay');
  assert.equal(translate('Alojamientos', 'pt'), 'Hospedagens');
  assert.equal(translate('Alojamientos', 'es'), 'Alojamientos');
});
test('traduce estructuras y conserva el original cuando falta una traducción', () => {
  assert.deepEqual(translateTree({ label: 'Entrada', list: ['Niños'] }, 'en'), { label: 'Check-in', list: ['Children'] });
  assert.equal(translate('Hotel con nombre propio', 'pt'), 'Hotel con nombre propio');
});
test('las consultas de WhatsApp respetan el idioma y conservan el destinatario', () => {
  const item = { name: 'Test', contact: { whatsapp: '59894437534' }, types: [{ id: 'hotel' }] };
  for (const [locale, expected] of [['en', 'Adults: 2'], ['pt', 'Quartos: 1']]) {
    const result = availabilityLink(item, { type: '', typeLabel: '', flexible: true, arrival: '', departure: '', adults: 2, children: 0, rooms: 1 }, '2026-10-21', locale);
    assert.equal(new URL(result.url).pathname, '/59894437534');
    assert.ok(new URL(result.url).searchParams.get('text').includes(expected));
  }
  assert.ok(new URL(contactLinks(item, 'hotel', 'en').whatsapp).searchParams.get('text').startsWith('Hello'));
});
