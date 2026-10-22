import test from 'node:test';
import assert from 'node:assert/strict';
import { handleInquiry } from '../src/lib/inquiry.mjs';

const payload = { accommodationId: 'prueba-correo', requestId: '12f00345-1234-4123-8123-123456789abc', name: 'Persona de prueba', email: 'visitante@example.com', phone: '+598 99123456', message: 'Consulta de prueba sin envío real.', website: '' };
const item = { id: 'prueba-correo', name: 'Prueba', contact: { email: 'alojamiento@example.com' }, types: [{ id: 'hotel' }] };
const request = (data = payload, origin = 'http://localhost:3000') => new Request('http://localhost:3000/api/contacto', { method: 'POST', headers: { origin, 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
const options = { getItems: async () => [item], apiKey: 'clave-ficticia', from: 'centro@example.com' };

test('envía únicamente al email del alojamiento, ignorando destinatarios del navegador', async () => {
  let body;
  const response = await handleInquiry(request({ ...payload, to: 'otro@example.com' }), { ...options, send: async (_url, init) => { body = JSON.parse(init.body); return Response.json({ id: 'simulado' }); } });
  assert.equal(response.status, 200);
  assert.deepEqual(body.to, ['alojamiento@example.com']);
  assert.equal(body.reply_to, payload.email);
  assert.ok(body.text.includes(payload.email));
  assert.ok(body.text.includes(payload.phone));
  assert.ok(body.text.includes(payload.message));
});
test('sin configuración no simula éxito ni llama al proveedor', async () => {
  const response = await handleInquiry(request(), { getItems: options.getItems, send: async () => { throw Error('No debe llamarse'); } });
  assert.equal(response.status, 503);
});
test('un alojamiento sin email no puede recibir consultas', async () => {
  const response = await handleInquiry(request(), { ...options, getItems: async () => [{ ...item, contact: { email: null } }] });
  assert.equal(response.status, 409);
});
test('rechaza origen ajeno, mensajes vacíos y números inválidos', async () => {
  assert.equal((await handleInquiry(request({ ...payload, email: 'invalido' }), options)).status, 400);
  assert.equal((await handleInquiry(request({ ...payload, email: '' }), options)).status, 400);
  assert.equal((await handleInquiry(request(payload, 'https://otro.example'), options)).status, 403);
  assert.equal((await handleInquiry(request({ ...payload, message: '' }), options)).status, 400);
  assert.equal((await handleInquiry(request({ ...payload, phone: 'llamame' }), options)).status, 400);
});
test('un rechazo del proveedor no se presenta como envío exitoso', async () => {
  assert.equal((await handleInquiry(request(), { ...options, send: async () => Response.json({ error: 'simulado' }, { status: 422 }) })).status, 502);
});
test('acepta el host público aunque Next use una URL interna distinta', async () => {
  const req = new Request('http://0.0.0.0:3000/api/contacto', { method: 'POST', headers: { host: 'localhost:3000', origin: 'http://localhost:3000', 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  assert.equal((await handleInquiry(req, { getItems: options.getItems })).status, 503);
});
