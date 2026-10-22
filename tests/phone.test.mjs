import test from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { phoneCountries, internationalPhone } from '../src/domain/phone.mjs';

test('prioriza Argentina, Brasil y Uruguay y ofrece el catálogo internacional', () => {
  assert.deepEqual(phoneCountries.slice(0, 3).map(item => item.code), ['AR', 'BR', 'UY']);
  assert.ok(phoneCountries.length > 200);
  assert.equal(phoneCountries.find(item => item.code === 'AR').dial, '+54');
  assert.equal(phoneCountries.find(item => item.code === 'BR').dial, '+55');
  assert.equal(phoneCountries.find(item => item.code === 'UY').dial, '+598');
  assert.equal(new Set(phoneCountries.map(item => item.code)).size, phoneCountries.length);
});
test('convierte teléfonos nacionales a internacionales sin duplicar prefijos', () => {
  assert.equal(internationalPhone('099123456', 'UY'), '+59899123456');
  assert.equal(internationalPhone('+59899123456', 'UY'), '+59899123456');
  assert.equal(internationalPhone('1134567890', 'AR'), '+541134567890');
  assert.equal(internationalPhone('11987654321', 'BR'), '+5511987654321');
  assert.equal(internationalPhone('123', 'UY'), null);
  assert.equal(internationalPhone('99123456', 'XX'), null);
});
test('todos los países tienen una bandera SVG local', async () => {
  await Promise.all(phoneCountries.map(country => access(new URL(`../public/banderas/${country.code}.svg`, import.meta.url))));
});
