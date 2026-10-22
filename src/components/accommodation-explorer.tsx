'use client';

import { useEffect, useId, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { assetPath } from '../lib/paths';
import type { Accommodation } from '../domain/accommodation';
import catalogs from '../../data/catalogs.json';
import { es } from '../content/es';

type Labels = Record<string, { es: string }>;
const typeLabels: Labels = catalogs.accommodationTypes;
const zoneLabels: Labels = catalogs.zones;
const serviceLabels: Labels = catalogs.services;
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').trim();

export function AccommodationExplorer({ accommodations }: { accommodations: Accommodation[] }) {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [zone, setZone] = useState('');
  const [services, setServices] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const panelId = useId();
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('paloma-explorer');
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (typeof saved.search === 'string') setSearch(saved.search);
      if (typeof saved.type === 'string' && (!saved.type || Object.hasOwn(typeLabels, saved.type))) setType(saved.type);
      if (typeof saved.zone === 'string' && (!saved.zone || Object.hasOwn(zoneLabels, saved.zone))) setZone(saved.zone);
      if (Array.isArray(saved.services)) setServices(saved.services.filter((key: unknown) => typeof key === 'string' && Object.hasOwn(serviceLabels, key)));
      setFiltersOpen(saved.filtersOpen === true);
      if (typeof saved.scrollY === 'number') requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo({ top: saved.scrollY, behavior: 'instant' })));
      sessionStorage.removeItem('paloma-explorer');
    } catch { /* El catálogo sigue funcionando sin almacenamiento disponible. */ }
  }, []);
  const remember = () => {
    try { sessionStorage.setItem('paloma-explorer', JSON.stringify({ search, type, zone, services, filtersOpen, scrollY: window.scrollY })); }
    catch { /* La navegación no depende del almacenamiento. */ }
  };
  const types = Object.keys(typeLabels).filter(key => accommodations.some(item => item.types.some(t => t.id === key)));
  const zones = Object.keys(zoneLabels).filter(key => accommodations.some(item => item.location.zone === key));
  const availableServices = Object.keys(serviceLabels).filter(key => accommodations.some(item => item.sharedServices.includes(key) || item.types.some(t => t.services.includes(key))));
  // Todos los servicios elegidos deben existir en un mismo tipo más los compartidos.
  const results = accommodations.filter(item => normalize(item.name).includes(normalize(search)) && (!zone || item.location.zone === zone) && item.types.some(t => (!type || t.id === type) && services.every(service => item.sharedServices.includes(service) || t.services.includes(service))));
  const selectedCount = Number(Boolean(type)) + Number(Boolean(zone)) + services.length;
  const clear = () => { setSearch(''); setType(''); setZone(''); setServices([]); };
  const typeControl = <label className="field">{es.catalog.type}<select value={type} onChange={event => setType(event.target.value)}><option value="">{es.catalog.allTypes}</option>{types.map(key => <option key={key} value={key}>{typeLabels[key].es}</option>)}</select></label>;

  return <section id="alojamientos" className="catalog shell" aria-labelledby="catalog-title">
    <div className="section-heading"><h2 id="catalog-title">{es.catalog.title}</h2><p>{es.catalog.subtitle}</p></div>
    <div className="search-tools">
      <label className="field search-field">{es.catalog.search}<input type="search" placeholder={es.catalog.placeholder} value={search} onChange={event => setSearch(event.target.value)} /></label>
      <div className="desktop-type">{typeControl}</div>
      <button className="secondary-button filters-toggle" type="button" aria-expanded={filtersOpen} aria-controls={panelId} onClick={() => setFiltersOpen(!filtersOpen)}>{es.catalog.filters}{selectedCount > 0 ? ` (${selectedCount})` : ''}<span aria-hidden="true">{filtersOpen ? '−' : '+'}</span></button>
    </div>
    <div id={panelId} className="filter-panel" hidden={!filtersOpen}>
      <div className="mobile-type">{typeControl}</div>
      <label className="field">{es.catalog.zone}<select value={zone} onChange={event => setZone(event.target.value)}><option value="">{es.catalog.allZones}</option>{zones.map(key => <option key={key} value={key}>{zoneLabels[key].es}</option>)}</select></label>
      {availableServices.length > 0 && <fieldset><legend>{es.catalog.services}</legend><div className="service-options">{availableServices.map(key => <label key={key}><input type="checkbox" checked={services.includes(key)} onChange={event => setServices(event.target.checked ? [...services, key] : services.filter(value => value !== key))} />{serviceLabels[key].es}</label>)}</div></fieldset>}
      <button className="primary-button apply-filters" type="button" onClick={() => setFiltersOpen(false)}>Ver {results.length} alojamientos</button>
    </div>
    {selectedCount > 0 && <div className="selected-filters" aria-label="Filtros aplicados">{type && <button type="button" onClick={() => setType('')}>{typeLabels[type].es} <span aria-label="Quitar">×</span></button>}{zone && <button type="button" onClick={() => setZone('')}>{zoneLabels[zone].es} <span aria-label="Quitar">×</span></button>}{services.map(key => <button key={key} type="button" onClick={() => setServices(services.filter(value => value !== key))}>{serviceLabels[key].es} <span aria-label="Quitar">×</span></button>)}</div>}
    <div className="result-row"><span role="status">{results.length} {results.length === 1 ? 'alojamiento' : 'alojamientos'} · A–Z</span>{(search || selectedCount > 0) && <button className="text-button" type="button" onClick={clear}>{es.catalog.clear}</button>}</div>
    <div className="accommodation-list">{results.map(item => <article className="accommodation" key={item.id}><Link className="accommodation-card-link" href={`/alojamientos/${item.id}${type ? `?tipo=${encodeURIComponent(type)}` : ''}`} onClick={remember} aria-label={`Ver ${item.name}`}>
      <div className="accommodation-photo">{item.cover ? <Image src={assetPath(item.cover.src)} alt={item.cover.alt.es} fill sizes="(max-width: 699px) 100vw, (max-width: 1199px) 46vw, 526px" /> : <div className="photo-placeholder"><span aria-hidden="true">—</span>{es.catalog.noPhoto}</div>}</div>
      <p className="accommodation-type">{item.types.map(t => typeLabels[t.id]?.es ?? t.id).join(' · ')}</p><h3>{item.name}</h3><p className="location">{item.location.zone ? `${zoneLabels[item.location.zone]?.es ?? item.location.zone} · La Paloma` : es.catalog.unknownZone}</p><p className="summary">{item.summary.es}</p>
      <div className="accommodation-bottom"><span>{item.sharedServices.slice(0, 3).map(key => serviceLabels[key]?.es ?? key).join(' · ')}</span><span className="coming-soon">{es.catalog.pending}</span></div>
    </Link></article>)}</div>
    {results.length === 0 && <div className="empty-state"><p>{accommodations.length ? es.catalog.empty : es.catalog.noItems}</p>{accommodations.length > 0 && <button className="secondary-button" type="button" onClick={clear}>{es.catalog.clear}</button>}</div>}
  </section>;
}
