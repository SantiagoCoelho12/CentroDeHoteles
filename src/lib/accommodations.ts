import 'server-only';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Accommodation } from '../domain/accommodation';

/** El catálogo lee archivos nuevos sin cambiar imports ni pantallas. */
export async function getAccommodations(): Promise<Accommodation[]> {
  const directory = path.join(process.cwd(), 'data/accommodations');
  const files = (await readdir(directory)).filter(file => file.endsWith('.json'));
  const items = await Promise.all(files.map(async file =>
    JSON.parse(await readFile(path.join(directory, file), 'utf8')) as Accommodation
  ));
  const includeDrafts = process.env.SHOW_DRAFTS === 'true' ||
    (process.env.NODE_ENV === 'development' && process.env.SHOW_DRAFTS !== 'false');
  return items.filter(item => item.active && (item.status === 'published' || includeDrafts))
    .sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
}
