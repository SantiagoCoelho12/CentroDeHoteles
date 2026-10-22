/** @param {import('./accommodation').Accommodation} item @param {string} selected */
export function galleryFor(item, selected = '') {
  const entries = [
    ...item.photos.map(photo => ({ ...photo, category: 'general' })),
    ...item.types.filter(type => !selected || type.id === selected).flatMap(type => type.photos.map(photo => ({ ...photo, category: type.id }))),
  ];
  // cover elige portada, no clasifica una imagen. No incluirla automáticamente.
  return entries.filter((photo, index) => entries.findIndex(other => other.src === photo.src) === index);
}

/** @param {import('./accommodation').Accommodation} item @param {string} selected */
export function contactLinks(item, selected = '') {
  const type = item.types.find(type => type.id === selected);
  const subject = `Consulta por ${item.name}`;
  const message = `Hola, me interesa consultar por ${item.name}${type ? ` (${type.id})` : ''}.`;
  return {
    whatsapp: item.contact.whatsapp && /^[1-9]\d{7,14}$/.test(item.contact.whatsapp) ? `https://wa.me/${item.contact.whatsapp}?text=${encodeURIComponent(message)}` : null,
    email: item.contact.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.contact.email) ? `mailto:${item.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}` : null,
  };
}
