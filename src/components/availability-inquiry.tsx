'use client';
import { useLanguage } from './language-provider';

import { useRef, useState, type FormEvent } from 'react';
import type { Accommodation } from '../domain/accommodation';
import { destinationToday, isoDay, monthCells, availabilityLink } from '../domain/availability.mjs';
import catalogs from '../../data/catalogs.json';
import { closeOnBackdrop } from '../lib/dialog';

const types: Record<string, { es: string }> = catalogs.accommodationTypes;

export function AvailabilityInquiry({ item, selected }: { item: Accommodation; selected: string }) {
  const { t, locale, intlLocale } = useLanguage();
  const weekdays = Array.from({ length: 7 }, (_, index) => new Intl.DateTimeFormat(intlLocale, { timeZone: 'UTC', weekday: 'short' }).format(new Date(Date.UTC(2024, 0, 1 + index))));
  const pretty = (date: string) => date ? new Intl.DateTimeFormat(intlLocale, { timeZone: 'UTC', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${date}T12:00:00Z`)) : t('Elegir fecha');
  const dialog = useRef<HTMLDialogElement>(null);
  const [today, setToday] = useState('');
  const [month, setMonth] = useState(0);
  const [year, setYear] = useState(2026);
  const [type, setType] = useState('');
  const [arrival, setArrival] = useState('');
  const [departure, setDeparture] = useState('');
  const [flexible, setFlexible] = useState(false);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [error, setError] = useState('');
  const hasWhatsApp = Boolean(item.contact.whatsapp && /^[1-9]\d{7,14}$/.test(item.contact.whatsapp));
  const choosingDeparture = Boolean(arrival && !departure);
  const nights = arrival && departure ? Math.round((Date.parse(`${departure}T00:00:00Z`) - Date.parse(`${arrival}T00:00:00Z`)) / 86400000) : 0;

  function open() {
    const current = destinationToday();
    setToday(current); setYear(Number(current.slice(0, 4))); setMonth(Number(current.slice(5, 7)) - 1);
    setType(item.types.length === 1 ? item.types[0].id : selected);
    setArrival(''); setDeparture(''); setFlexible(false); setAdults(2); setChildren(0); setRooms(1); setError('');
    dialog.current?.showModal();
    if (dialog.current) dialog.current.scrollTop = 0;
  }
  function changeMonth(delta: number) {
    const date = new Date(Date.UTC(year, month + delta, 1));
    setYear(date.getUTCFullYear()); setMonth(date.getUTCMonth());
  }
  function choose(date: string) {
    setError('');
    if (!arrival || departure || date <= arrival) { setArrival(date); setDeparture(''); }
    else setDeparture(date);
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = availabilityLink(item, { type, typeLabel: t(types[type]?.es ?? type), flexible, arrival, departure, adults, children, rooms }, destinationToday(), locale);
    if (!result.url) { setError(result.error ?? 'Revisá la consulta.'); return; }
    window.open(result.url, '_blank', 'noopener,noreferrer');
  }
  function calendar(offset: number) {
    const date = new Date(Date.UTC(year, month + offset, 1));
    const y = date.getUTCFullYear(); const m = date.getUTCMonth();
    const label = new Intl.DateTimeFormat(intlLocale, { timeZone: 'UTC', month: 'long', year: 'numeric' }).format(date);
    const cells = monthCells(y, m);
    return <section className={`availability-month${offset ? ' second-month' : ''}`} aria-label={t(label)} key={offset}>
      <h3>{label}</h3><div className="calendar-weekdays" aria-hidden="true">{weekdays.map(day => <span key={day}>{day}</span>)}</div>
      <div className="calendar-days">{cells.map((day: string | null, index: number) => day ? <button type="button" key={day} disabled={day < today} className={`${day === arrival || day === departure ? 'range-endpoint' : ''}${arrival && departure && day > arrival && day < departure ? ' in-date-range' : ''}`} aria-label={`${new Intl.DateTimeFormat(intlLocale, { timeZone: 'UTC', dateStyle: 'full' }).format(new Date(`${day}T12:00:00Z`))}${day === arrival ? `, ${t('Entrada')}` : day === departure ? `, ${t('Salida')}` : ''}`} aria-pressed={day === arrival || day === departure} aria-current={day === today ? 'date' : undefined} onClick={() => choose(day)}>{Number(day.slice(8))}</button> : <span key={`empty-${index}`} />)}</div>
    </section>;
  }

  return <section className="availability-section" aria-labelledby="availability-section-title"><div><h2 id="availability-section-title">{t("Consultá por tu estadía")}</h2><p>{t("Elegí tus fechas y enviá la consulta al alojamiento por WhatsApp.")}</p></div><button className="primary-button" type="button" onClick={open}>{t("Consultar fechas disponibles")}</button>
    <dialog ref={dialog} onClick={closeOnBackdrop} className="availability-dialog" aria-labelledby="availability-title" aria-describedby="availability-description">
      <div className="email-dialog-heading"><h2 id="availability-title">{t("Consultar fechas disponibles")}</h2><button type="button" className="dialog-close" aria-label={t("Cerrar consulta de fechas")} onClick={() => dialog.current?.close()}>×</button></div>
      <p id="availability-description">{item.name}</p>
      <form onSubmit={submit}>
        {item.types.length > 1 ? <label className="field">{t("Tipo de alojamiento")}<select value={type} onChange={event => setType(event.target.value)}><option value="">{t("Cualquiera")}</option>{item.types.map(type => <option key={type.id} value={type.id}>{t(types[type.id]?.es ?? type.id)}</option>)}</select></label> : <p className="availability-single-type">{t('Tipo de alojamiento:')} {t(types[item.types[0]?.id]?.es ?? item.types[0]?.id)}</p>}
        <div className="availability-date-heading"><h3>{t("¿Cuándo querés alojarte?")}</h3><button className="secondary-button flexible-toggle" type="button" aria-pressed={flexible} onClick={() => { setFlexible(!flexible); setError(''); }}>{t('Fechas flexibles')} {flexible ? '✓' : ''}</button></div>
        {!flexible ? <><div className="date-summary" aria-live="polite"><div><span>{t("Entrada")}</span><strong>{pretty(arrival)}</strong></div><div><span>{t("Salida")}</span><strong>{pretty(departure)}</strong></div></div><div className="calendar-toolbar"><button className="secondary-button" type="button" aria-label={t("Mes anterior")} disabled={Boolean(today && isoDay(year, month, 1) <= `${today.slice(0, 7)}-01`)} onClick={() => changeMonth(-1)}>←</button><p role="status">{nights > 0 ? `${t('Cantidad de noches:')} ${nights}` : t(choosingDeparture ? 'Ahora elegí la fecha de salida' : 'Elegí la fecha de entrada')}</p><button className="secondary-button" type="button" aria-label={t("Mes siguiente")} onClick={() => changeMonth(1)}>→</button></div><div className="availability-calendars">{calendar(0)}{calendar(1)}</div><button className="text-button" type="button" onClick={() => { setArrival(''); setDeparture(''); }}>{t("Limpiar fechas")}</button></> : <p className="flexible-notice" role="status">{t("Las fechas se coordinarán con el alojamiento.")}</p>}
        <fieldset className="guest-counters"><legend>{t("Personas y habitaciones")}</legend><Counter label="Adultos" value={adults} min={1} onChange={setAdults} /><Counter label="Niños" value={children} min={0} onChange={setChildren} /><Counter label="Habitaciones" value={rooms} min={1} onChange={setRooms} /></fieldset>
        <p className="availability-disclaimer">{t("Esta consulta no confirma disponibilidad ni realiza una reserva. Todos los pagos serán coordinados con el establecimiento.")}</p>
        {!hasWhatsApp && <p className="detail-pending">{t("El WhatsApp de este alojamiento está pendiente de confirmar.")}</p>}
        {error && <p className="email-error" role="alert">{t(error)}</p>}
        <div className="availability-actions"><button className="secondary-button" type="button" onClick={() => dialog.current?.close()}>{t("Cancelar")}</button><button className="availability-whatsapp" type="submit" disabled={!hasWhatsApp}>{t("Consultar por WhatsApp ↗")}</button></div>
      </form>
    </dialog>
  </section>;
}

function Counter({ label, value, min, onChange }: { label: string; value: number; min: number; onChange: (n: number) => void }) {
  const { t } = useLanguage();
  return <div className="guest-counter"><span>{t(label)}</span><div><button type="button" aria-label={`${t('Reducir')} ${t(label).toLowerCase()}`} disabled={value <= min} onClick={() => onChange(value - 1)}>−</button><output aria-label={t(label)} aria-live="polite">{value}</output><button type="button" aria-label={`${t('Aumentar')} ${t(label).toLowerCase()}`} disabled={value >= 99} onClick={() => onChange(value + 1)}>+</button></div></div>;
}
