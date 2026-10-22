'use client';
import { useLanguage } from './language-provider';

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { phoneCountries } from '../domain/phone.mjs';
import { assetPath } from '../lib/paths';

export function CountrySelect({ value, onChange, disabled }: { value: string; onChange: (code: string) => void; disabled: boolean }) {
  const { t, locale } = useLanguage();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const id = useId();
  const names = new Intl.DisplayNames([locale], { type: 'region' });
  const priority = ['AR', 'BR', 'UY'];
  const countries = phoneCountries.map(country => ({ ...country, name: names.of(country.code) ?? country.name })).sort((a, b) => {
    const ai = priority.indexOf(a.code), bi = priority.indexOf(b.code);
    return ai !== -1 || bi !== -1 ? (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi) : a.name.localeCompare(b.name, locale);
  });
  const country = countries.find(country => country.code === value)!;
  const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const options = countries.filter(country => normalize(`${country.name} ${country.dial}`).includes(normalize(search)));
  function close() { setOpen(false); setSearch(''); }
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      const bounds = root.current?.getBoundingClientRect();
      const dropdown = root.current?.querySelector('.country-dropdown')?.getBoundingClientRect();
      const inside = (rect?: DOMRect) => rect && event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
      if (!inside(bounds) && !inside(dropdown) && event.target instanceof Node && !root.current?.contains(event.target)) close();
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);
  function keyboard(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Tab') requestAnimationFrame(() => { if (!root.current?.contains(document.activeElement)) close(); });
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); trigger.current?.focus(); }
    if (open && ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      if (event.target === searchInput.current && ['Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const buttons = [...(root.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? [])];
      if (!buttons.length) return;
      const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : event.key === 'ArrowDown' ? (current + 1) % buttons.length : (current - 1 + buttons.length) % buttons.length;
      buttons[next].focus();
    }
  }
  return <div className="country-picker field" ref={root} onKeyDown={keyboard}>
    <span id={`${id}-label`}>{t("País y código")}</span>
    <input type="hidden" name="country" value={value} />
    <button className="country-trigger" ref={trigger} type="button" aria-labelledby={`${id}-label ${id}-value`} aria-haspopup="listbox" aria-expanded={open} aria-controls={`${id}-options`} disabled={disabled} onClick={() => { if (open) close(); else { setOpen(true); requestAnimationFrame(() => searchInput.current?.focus()); } }}>
      <img src={assetPath(`/banderas/${country.code}.svg`)} alt="" width="24" height="16" /><span id={`${id}-value`}>{country.name} ({country.dial})</span><span aria-hidden="true">⌄</span>
    </button>
    {open && <div className="country-dropdown"><input ref={searchInput} type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder={t("Buscar país o código")} aria-label={t("Buscar país o código")} autoComplete="off" /><div id={`${id}-options`} className="country-options" role="listbox" aria-labelledby={`${id}-label`}>{options.map(option => <button type="button" role="option" aria-selected={option.code === value} tabIndex={option.code === value ? 0 : -1} key={option.code} onClick={() => { onChange(option.code); close(); trigger.current?.focus(); }}><img src={assetPath(`/banderas/${option.code}.svg`)} alt="" width="24" height="16" loading="lazy" /><span>{option.name}</span><span className="country-dial">{option.dial}</span></button>)}</div>{!options.length && <p role="status">{t("No se encontraron países.")}</p>}</div>}
  </div>;
}
