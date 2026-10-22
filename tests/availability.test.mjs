import test from 'node:test';
import assert from 'node:assert/strict';
import { availabilityLink, monthCells, destinationToday } from '../src/domain/availability.mjs';

const item = { name: 'Complejo de prueba', contact: { whatsapp: '59894437534' }, types: [{ id: 'hotel' }, { id: 'cabanas' }] };
const fields = { type: 'cabanas', typeLabel: 'Cabañas', flexible: false, arrival: '2026-11-10', departure: '2026-11-15', adults: 2, children: 1, rooms: 2 };
test('consulta de WhatsApp incluye tipo, rango y todas las cantidades', () => {
  const result = availabilityLink(item, fields, '2026-10-21');
  assert.equal(result.error, null);
  const url = new URL(result.url);
  assert.equal(url.pathname, '/59894437534');
  const text = url.searchParams.get('text');
  for (const part of ['Cabañas', '10/11/2026', '15/11/2026', 'Adultos: 2', 'Niños: 1', 'Habitaciones: 2']) assert.ok(text.includes(part));
});
test('fechas flexibles no requieren ni filtran fechas guardadas', () => {
  const result = availabilityLink(item, { ...fields, type: '', flexible: true, arrival: '', departure: '' });
  const text = new URL(result.url).searchParams.get('text');
  assert.ok(text.includes('Cualquiera')); assert.ok(text.includes('flexibles')); assert.ok(!text.includes('Entrada:'));
});
test('rechaza fechas pasadas, salida anterior, rango incompleto y cantidades inválidas', () => {
  for (const changes of [{ arrival: '2026-10-01' }, { departure: '2026-11-09' }, { departure: '' }, { adults: 0 }, { children: -1 }, { rooms: 0 }, { adults: 1.5 }, { type: 'otro' }]) {
    assert.equal(availabilityLink(item, { ...fields, ...changes }, '2026-10-21').url, null);
  }
});
test('sin WhatsApp no genera un enlace', () => { assert.equal(availabilityLink({ ...item, contact: { whatsapp: null } }, fields).url, null); });
test('calendario comienza en lunes y respeta febrero bisiesto', () => {
  assert.deepEqual(monthCells(2026, 10).slice(0, 7), [null, null, null, null, null, null, '2026-11-01']);
  assert.equal(monthCells(2028, 1).filter(Boolean).length, 29);
});
test('hoy se calcula según el destino, incluso después de medianoche UTC', () => {
  assert.equal(destinationToday(new Date('2026-10-22T01:00:00Z')), '2026-10-21');
});
