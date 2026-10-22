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
export function contactLinks(item, selected = '', locale = 'es') {
  const type = item.types.find(type => type.id === selected);
  const typeNames = { es: { hotel: 'hotel', cabanas: 'cabañas', bungalows: 'bungalows' }, en: { hotel: 'hotel', cabanas: 'cabins', bungalows: 'bungalows' }, pt: { hotel: 'hotel', cabanas: 'cabanas', bungalows: 'bangalôs' } };
  const typeName = type ? typeNames[locale]?.[type.id] ?? type.id : '';
  const subject = `${locale === 'en' ? 'Enquiry about' : locale === 'pt' ? 'Consulta sobre' : 'Consulta por'} ${item.name}`;
  const message = `${locale === 'en' ? 'Hello, I would like to enquire about' : locale === 'pt' ? 'Olá, gostaria de consultar sobre' : 'Hola, me interesa consultar por'} ${item.name}${type ? ` (${locale === 'es' ? type.id : typeName})` : ''}.`;
  return {
    whatsapp: item.contact.whatsapp && /^[1-9]\d{7,14}$/.test(item.contact.whatsapp) ? `https://wa.me/${item.contact.whatsapp}?text=${encodeURIComponent(message)}` : null,
    email: item.contact.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.contact.email) ? `mailto:${item.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}` : null,
  };
}
