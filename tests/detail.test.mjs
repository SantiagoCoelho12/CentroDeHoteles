import test from 'node:test';
import assert from 'node:assert/strict';
import { galleryFor, contactLinks } from '../src/domain/detail.mjs';

// Datos sintéticos exclusivos de pruebas; no forman parte del catálogo.
const image = src => ({ src, alt: { es: src } });
const mixed = {
  name: 'Establecimiento de prueba',
  contact: { whatsapp: null, email: null },
  cover: image('/cover.jpg'),
  photos: [image('/piscina.jpg')],
  types: [{ id: 'hotel', photos: [image('/habitacion.jpg'), image('/piscina.jpg')] }, { id: 'cabanas', photos: [image('/cabana.jpg')] }],
};

test('cabañas incluye generales y excluye imágenes exclusivas del hotel', () => {
  assert.deepEqual(galleryFor(mixed, 'cabanas').map(p => p.src), ['/piscina.jpg', '/cabana.jpg']);
});
test('Todo elimina duplicados y mantiene categoría general para fotos compartidas', () => {
  const photos = galleryFor(mixed);
  assert.deepEqual(photos.map(p => p.src), ['/piscina.jpg', '/habitacion.jpg', '/cabana.jpg']);
  assert.equal(photos[0].category, 'general');
});
test('cover no agrega una foto sin clasificar a la galería', () => {
  assert.equal(galleryFor({ ...mixed, photos: [], types: [] }).length, 0);
});
test('no genera enlaces de contacto ausentes o mal formados', () => {
  assert.deepEqual(contactLinks(mixed), { whatsapp: null, email: null });
  assert.deepEqual(contactLinks({ ...mixed, contact: { whatsapp: '+598 000', email: 'invalido' } }), { whatsapp: null, email: null });
});
test('contactos comparten destinatario y mensaje incluye tipo seleccionado', () => {
  const links = contactLinks({ ...mixed, contact: { whatsapp: '59899123456', email: 'consulta@example.com' } }, 'cabanas');
  assert.ok(links.whatsapp.startsWith('https://wa.me/59899123456?'));
  assert.ok(decodeURIComponent(links.whatsapp).includes('(cabanas)'));
  assert.ok(links.email.startsWith('mailto:consulta@example.com?'));
});
