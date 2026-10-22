'use client';

import { useRef, useState, type FormEvent } from 'react';
import type { Accommodation } from '../domain/accommodation';
import { contactLinks } from '../domain/detail.mjs';
import { assetPath } from '../lib/paths';

export function AccommodationContact({ item, selected }: { item: Accommodation; selected: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const requestId = useRef('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const links = contactLinks(item, selected);
  const phone = item.contact.phone;
  const phoneHref = phone && /^\+?[\d ()-]{7,25}$/.test(phone) ? `tel:${phone.replace(/[^+\d]/g, '')}` : null;

  function open() {
    setError(''); setSent(false); requestId.current = crypto.randomUUID();
    form.current?.reset(); dialog.current?.showModal();
    form.current?.querySelector<HTMLInputElement>('[name="name"]')?.focus();
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (process.env.NEXT_PUBLIC_STATIC_DEMO === 'true') { setError('Esta versión de prueba no envía correos. El formulario permite probar el diseño y la validación.'); return; }
    if (pending) return;
    setPending(true); setError('');
    const values = new FormData(event.currentTarget);
    try {
      const response = await fetch(assetPath('/api/contacto'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accommodationId: item.id, type: selected, requestId: requestId.current, name: values.get('name'), phone: values.get('phone'), message: values.get('message'), website: values.get('website') }),
      });
      const result = await response.json();
      if (!response.ok) { setError(result.error || 'No se pudo enviar. Intentá nuevamente.'); return; }
      setSent(true); form.current?.reset();
    } catch { setError('No se pudo conectar. Revisá tu conexión e intentá nuevamente.'); }
    finally { setPending(false); }
  }

  return <aside className="detail-contact" aria-labelledby="contact-title">
    <h2 id="contact-title">Contacto directo</h2>
    <div className="contact-rows">
      <div className="contact-row"><span className="contact-label">Teléfono</span>{phoneHref ? <a className="phone-link" href={phoneHref}>{phone}</a> : <span className="contact-missing">Pendiente de confirmar</span>}</div>
      <div className="contact-row"><span className="contact-label">WhatsApp</span>{links.whatsapp ? <a className="whatsapp-chat" href={links.whatsapp} target="_blank" rel="noopener noreferrer"><WhatsAppIcon />Chatear por WhatsApp</a> : <span className="contact-missing whatsapp-unavailable"><WhatsAppIcon />Pendiente de confirmar</span>}</div>
      <div className="contact-row"><span className="contact-label">Correo electrónico</span>{item.contact.email ? <span className="contact-address">{item.contact.email}</span> : <span className="contact-missing">Pendiente de confirmar</span>}</div>
      <div className="contact-row"><button className="primary-button contact-form-button" type="button" onClick={open}>Envianos un correo <span aria-hidden="true">→</span></button></div>
    </div>
    <dialog ref={dialog} className="email-dialog" aria-labelledby="email-dialog-title" aria-describedby="email-dialog-description" onCancel={event => { if (pending) event.preventDefault(); }}>
      <div className="email-dialog-heading"><h2 id="email-dialog-title">Envianos un correo</h2><button type="button" className="dialog-close" aria-label="Cerrar formulario" disabled={pending} onClick={() => dialog.current?.close()}>×</button></div>
      <p id="email-dialog-description" className="email-recipient">Para: <strong>{item.name}</strong>{item.contact.email && <span>{item.contact.email}</span>}</p>
      {sent ? <div className="email-success" role="status"><p>Tu consulta fue enviada al alojamiento.</p><button className="primary-button" type="button" onClick={() => dialog.current?.close()}>Cerrar</button></div> : <form ref={form} onSubmit={submit} onChange={() => { requestId.current = crypto.randomUUID(); }}>
        <label className="field" htmlFor="inquiry-name">Nombre<input id="inquiry-name" name="name" autoComplete="name" required minLength={2} maxLength={100} disabled={pending} autoFocus /></label>
        <label className="field" htmlFor="inquiry-phone">Teléfono<input id="inquiry-phone" name="phone" type="tel" autoComplete="tel" required minLength={7} maxLength={30} disabled={pending} placeholder="Incluí el código de país" /></label>
        <label className="field" htmlFor="inquiry-message">Mensaje<textarea id="inquiry-message" name="message" required minLength={10} maxLength={4000} rows={5} disabled={pending} /></label>
        <div className="inquiry-honeypot" aria-hidden="true"><label>Sitio web<input name="website" autoComplete="off" tabIndex={-1} /></label></div>
        <p className="email-sharing">{process.env.NEXT_PUBLIC_STATIC_DEMO === 'true' ? 'Demo: este formulario no envía correos ni guarda tus datos.' : 'El alojamiento recibirá tu nombre, teléfono y mensaje para responderte.'}</p>
        {error && <p className="email-error" role="alert">{error}</p>}
        <div className="email-dialog-actions"><button className="secondary-button" type="button" disabled={pending} onClick={() => dialog.current?.close()}>Cancelar</button><button className="primary-button" type="submit" disabled={pending}>{pending ? 'Enviando…' : 'Enviar mensaje'}</button></div>
      </form>}
    </dialog>
  </aside>;
}

function WhatsAppIcon() {
  return <svg className="whatsapp-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20.8 11.6a8.8 8.8 0 0 1-13 7.8L3 21l1.5-4.8a8.8 8.8 0 1 1 16.3-4.6Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><path d="m8.1 7.4 1.4-.4 1.2 2.7-1 .9c.8 1.6 1.8 2.5 3.4 3.2l.8-1.1 2.8 1.3-.2 1.4c-.2 1-1.3 1.3-2.2 1.1-3.7-.8-6.3-3.3-7.2-6.8-.2-.9 0-1.9 1-2.3Z" fill="currentColor" /></svg>;
}
