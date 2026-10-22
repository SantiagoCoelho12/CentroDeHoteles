import { readFile, readdir, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const catalogs = JSON.parse(await readFile(path.join(root, 'data/catalogs.json'), 'utf8'));
const directory = path.join(root, 'data/accommodations');
const files = (await readdir(directory)).filter(f => f.endsWith('.json')).sort();
let errors = 0;
let warnings = 0;
const ids = new Set();
const isText = value => typeof value === 'string' && value.trim().length > 0;
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

for (const file of files) {
  const fail = message => { errors++; console.error(`ERROR ${file}: ${message}`); };
  try {
    const item = JSON.parse(await readFile(path.join(directory, file), 'utf8'));
    const strict = item.status === 'published' || (process.argv.includes('--publish') && item.active === true);
    const pending = message => {
      if (strict) fail(message);
      else { warnings++; console.warn(`PENDIENTE ${file}: ${message}`); }
    };
    const localized = (value, label) => {
      if (!value || typeof value !== 'object' || Array.isArray(value) || !isText(value.es)) fail(`${label}: falta texto en español.`);
      else for (const [locale, text] of Object.entries(value)) if (!isText(text)) fail(`${label}.${locale}: texto vacío o inválido.`);
    };
    const list = (value, label) => {
      if (!Array.isArray(value)) { fail(`${label}: debe ser una lista.`); return []; }
      return value;
    };
    const keys = (value, catalog, label) => {
      const entries = list(value, label);
      if (new Set(entries).size !== entries.length) fail(`${label}: claves repetidas.`);
      for (const key of entries) if (!Object.hasOwn(catalog, key)) fail(`${label}: clave desconocida ${key}.`);
    };
    const photo = async (value, label) => {
      if (!value || typeof value !== 'object') { fail(`${label}: foto inválida.`); return; }
      localized(value.alt, `${label}.alt`);
      if (typeof value.src !== 'string' || !value.src.startsWith('/fotos/')) { fail(`${label}: usar una ruta /fotos/.`); return; }
      const publicRoot = path.join(root, 'public');
      const target = path.resolve(publicRoot, value.src.slice(1));
      if (!target.startsWith(publicRoot + path.sep)) { fail(`${label}: ruta fuera de public.`); return; }
      try { await access(target); } catch { fail(`${label}: no existe ${value.src}.`); }
    };
    if (!isText(item.id) || !slug.test(item.id) || file !== `${item.id}.json`) fail('El id debe ser una clave simple y coincidir con el archivo.');
    if (ids.has(item.id)) fail('Identificador repetido.');
    ids.add(item.id);
    if (!isText(item.name)) fail('Falta nombre.');
    if (typeof item.active !== 'boolean') fail('active debe ser booleano.');
    if (!['draft', 'published'].includes(item.status)) fail('status debe ser draft o published.');
    localized(item.summary, 'summary');
    localized(item.description, 'description');
    if (!item.location || typeof item.location !== 'object') fail('Falta location.');
    else {
      if (!isText(item.location.address)) pending('Falta dirección.');
      if (item.location.zone === null) pending('Falta zona.');
      else if (!Object.hasOwn(catalogs.zones, item.location.zone)) fail('Zona desconocida.');
      const point = item.location.coordinates;
      if (point === null) pending('Faltan coordenadas verificadas.');
      else if (!point || !Number.isFinite(point.lat) || !Number.isFinite(point.lng) || Math.abs(point.lat) > 90 || Math.abs(point.lng) > 180) fail('Coordenadas inválidas.');
    }
    if (!item.contact || typeof item.contact !== 'object') fail('Falta contact.');
    else {
      if (item.contact.phone != null && (typeof item.contact.phone !== 'string' || !/^\+?[\d ()-]{7,25}$/.test(item.contact.phone))) fail('phone: formato inválido.');
      for (const [key, pattern] of [['whatsapp', /^[1-9]\d{7,14}$/], ['email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/]]) {
        if (item.contact[key] === null) pending(`Falta ${key}.`);
        else if (typeof item.contact[key] !== 'string' || !pattern.test(item.contact[key])) fail(`${key}: formato inválido.`);
      }
    }
    if (item.cover === null) pending('Falta foto principal.');
    else await photo(item.cover, 'cover');
    for (const image of list(item.photos, 'photos')) await photo(image, 'photos');
    keys(item.sharedServices, catalogs.services, 'sharedServices');
    const types = list(item.types, 'types');
    if (!types.length) fail('Debe existir al menos un tipo.');
    const typeIds = new Set();
    for (const type of types) {
      if (!type || !Object.hasOwn(catalogs.accommodationTypes, type.id)) { fail('Tipo desconocido.'); continue; }
      if (typeIds.has(type.id)) fail(`Tipo repetido: ${type.id}.`);
      typeIds.add(type.id);
      localized(type.description, `${type.id}.description`);
      keys(type.services, catalogs.services, `${type.id}.services`);
      for (const image of list(type.photos, `${type.id}.photos`)) await photo(image, `${type.id}.photos`);
    }
    for (const source of list(item.sources, 'sources')) {
      try { if (!['http:', 'https:'].includes(new URL(source.url).protocol)) throw Error(); }
      catch { fail('URL de fuente inválida.'); }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(source.checkedAt ?? '')) fail('Fecha de fuente inválida.');
      if (!isText(source.notes)) fail('Faltan observaciones de la fuente.');
    }
  } catch (error) { fail(`No se pudo validar: ${error.message}`); }
}
console.log(`${files.length} establecimientos; ${errors} errores; ${warnings} pendientes de borrador.`);
process.exitCode = errors ? 1 : 0;
