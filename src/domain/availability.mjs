/** Fecha local del destino, independiente de la zona horaria del dispositivo. */
export function destinationToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en', { timeZone: 'America/Montevideo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const part = key => parts.find(part => part.type === key).value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}
export function isoDay(year, month, day) { return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`; }
export function monthCells(year, month) {
  const offset = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
  const count = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return [...Array(offset).fill(null), ...Array.from({ length: count }, (_, i) => isoDay(year, month, i + 1))];
}
const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;

/** @param {import('./accommodation').Accommodation} item
 * @param {{type: string, typeLabel: string, flexible: boolean, arrival: string, departure: string, adults: number, children: number, rooms: number}} fields
 */
export function availabilityLink(item, fields, today = destinationToday(), locale = 'es') {
  if (!item.contact.whatsapp || !/^[1-9]\d{7,14}$/.test(item.contact.whatsapp)) return { error: 'El WhatsApp de este alojamiento está pendiente de confirmar.', url: null };
  if (fields.type && !item.types.some(type => type.id === fields.type)) return { error: 'Elegí un tipo de alojamiento válido.', url: null };
  for (const [value, min] of [[fields.adults, 1], [fields.children, 0], [fields.rooms, 1]]) {
    if (!Number.isInteger(value) || value < min || value > 99) return { error: 'Revisá las cantidades de personas y habitaciones.', url: null };
  }
  if (!fields.flexible && (!validDate(fields.arrival) || !validDate(fields.departure) || fields.arrival < today || fields.departure <= fields.arrival)) return { error: 'Seleccioná entrada y salida. La salida debe ser posterior a la entrada.', url: null };
  const words = {
    es: { intl: 'es-UY', intro: 'Hola, quisiera consultar fechas disponibles en', type: 'Tipo de alojamiento', any: 'Cualquiera', flexible: 'Fechas: flexibles, a coordinar.', arrival: 'Entrada', departure: 'Salida', adults: 'Adultos', children: 'Niños', rooms: 'Habitaciones', end: '¿Tienen disponibilidad? Gracias.' },
    en: { intl: 'en-GB', intro: 'Hello, I would like to enquire about available dates at', type: 'Accommodation type', any: 'Any', flexible: 'Dates: flexible, to be arranged.', arrival: 'Check-in', departure: 'Check-out', adults: 'Adults', children: 'Children', rooms: 'Rooms', end: 'Do you have availability? Thank you.' },
    pt: { intl: 'pt-BR', intro: 'Olá, gostaria de consultar datas disponíveis em', type: 'Tipo de hospedagem', any: 'Qualquer um', flexible: 'Datas: flexíveis, a combinar.', arrival: 'Entrada', departure: 'Saída', adults: 'Adultos', children: 'Crianças', rooms: 'Quartos', end: 'Vocês têm disponibilidade? Obrigado.' },
  }[locale] ?? null;
  const w = words ?? { intl: 'es-UY', intro: 'Hola, quisiera consultar fechas disponibles en', type: 'Tipo de alojamiento', any: 'Cualquiera', flexible: 'Fechas: flexibles, a coordinar.', arrival: 'Entrada', departure: 'Salida', adults: 'Adultos', children: 'Niños', rooms: 'Habitaciones', end: '¿Tienen disponibilidad? Gracias.' };
  const format = date => new Intl.DateTimeFormat(w.intl, { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(`${date}T12:00:00Z`));
  const dates = fields.flexible ? w.flexible : `${w.arrival}: ${format(fields.arrival)}\n${w.departure}: ${format(fields.departure)}`;
  const message = `${w.intro} ${item.name}.\n${w.type}: ${fields.type ? fields.typeLabel : w.any}.\n${dates}\n${w.adults}: ${fields.adults}\n${w.children}: ${fields.children}\n${w.rooms}: ${fields.rooms}\n${w.end}`;
  return { error: null, url: `https://wa.me/${item.contact.whatsapp}?text=${encodeURIComponent(message)}` };
}
