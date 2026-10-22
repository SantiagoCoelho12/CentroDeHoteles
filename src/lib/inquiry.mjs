const attempts = new Map();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const result = (status, error) => Response.json({ error }, { status });

/**
 * @param {Request} request
 * @param {{getItems: () => Promise<import('../domain/accommodation').Accommodation[]>, apiKey?: string, from?: string, send?: typeof fetch}} options
 */
export async function handleInquiry(request, { getItems, apiKey, from, send = fetch }) {
  try {
    const origin = new URL(request.headers.get('origin') ?? '');
    // Next puede usar 0.0.0.0 internamente aunque el navegador use localhost.
    const host = request.headers.get('host') ?? new URL(request.url).host;
    if (!['http:', 'https:'].includes(origin.protocol) || origin.host !== host) return result(403, 'Solicitud no permitida.');
  } catch { return result(403, 'Solicitud no permitida.'); }
  if (!request.headers.get('content-type')?.includes('application/json')) return result(415, 'Formato de solicitud no válido.');
  let input;
  try {
    const reader = request.body?.getReader();
    if (!reader) return result(400, 'Completá los datos del formulario.');
    const chunks = []; let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 16384) { await reader.cancel(); return result(413, 'El mensaje es demasiado largo.'); }
      chunks.push(value);
    }
    input = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch { return result(400, 'No se pudo leer el formulario.'); }
  if (!input || typeof input !== 'object' || Array.isArray(input)) return result(400, 'Formulario no válido.');
  if (input.website) return result(400, 'Solicitud no válida.');
  const { accommodationId, requestId } = input;
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  const phone = typeof input.phone === 'string' ? input.phone.trim() : '';
  const message = typeof input.message === 'string' ? input.message.trim() : '';
  if (typeof accommodationId !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(accommodationId) || typeof requestId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) return result(400, 'Solicitud no válida. Recargá el formulario.');
  if (name.length < 2 || name.length > 100 || /[\r\n]/.test(name)) return result(400, 'Ingresá un nombre válido de entre 2 y 100 caracteres.');
  if (!/^\+?[\d ()-]{7,30}$/.test(phone) || phone.replace(/\D/g, '').length < 7) return result(400, 'Ingresá un teléfono válido con código de país.');
  if (message.length < 10 || message.length > 4000) return result(400, 'El mensaje debe tener entre 10 y 4000 caracteres.');
  const item = (await getItems()).find(item => item.id === accommodationId);
  if (!item) return result(404, 'El alojamiento no está disponible.');
  if (!item.contact.email || !emailPattern.test(item.contact.email)) return result(409, 'El correo de este alojamiento está pendiente de confirmar. Todavía no podemos enviar tu consulta.');
  if (!apiKey || !from || /[\r\n]/.test(from)) return result(503, 'El envío de correos todavía no está habilitado. Intentá nuevamente más tarde.');
  const now = Date.now();
  for (const [key, entry] of attempts) if (entry.until <= now) attempts.delete(key);
  const limit = attempts.get(item.id) ?? { count: 0, until: now + 60000 };
  if (limit.count >= 5) return result(429, 'Hay varias consultas en curso. Esperá un minuto antes de volver a intentar.');
  limit.count++; attempts.set(item.id, limit);
  const type = typeof input.type === 'string' && item.types.some(type => type.id === input.type) ? input.type : '';
  try {
    const response = await send('https://api.resend.com/emails', {
      method: 'POST', signal: AbortSignal.timeout(15000),
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': `inquiry-${item.id}-${requestId}` },
      body: JSON.stringify({
        from, to: [item.contact.email], subject: `Consulta desde el Centro de Hoteles: ${item.name}`,
        text: [`Consulta para ${item.name}`, type ? `Tipo de alojamiento: ${type}` : '', `Nombre: ${name}`, `Teléfono: ${phone}`, '', 'Mensaje:', message].filter(line => line !== '').join('\n'),
      }),
    });
    if (!response.ok) return result(502, 'No se pudo enviar el correo. Intentá nuevamente en unos minutos.');
    const delivery = await response.json();
    if (!delivery.id) return result(502, 'No se pudo confirmar el envío. Intentá nuevamente.');
    return Response.json({ ok: true });
  } catch { return result(502, 'No se pudo confirmar el envío. Intentá nuevamente en unos minutos.'); }
}
