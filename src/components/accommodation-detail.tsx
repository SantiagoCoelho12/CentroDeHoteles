'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Accommodation } from '../domain/accommodation';
import { galleryFor } from '../domain/detail.mjs';
import { AccommodationContact } from './accommodation-contact';
import catalogs from '../../data/catalogs.json';
import { es } from '../content/es';

const types: Record<string, { es: string }> = catalogs.accommodationTypes;
const zones: Record<string, { es: string }> = catalogs.zones;
const services: Record<string, { es: string }> = catalogs.services;
const copy = es.detail;

export function AccommodationDetail({ item, initialType }: { item: Accommodation; initialType: string }) {
  const [selected, setSelected] = useState(initialType);
  const [photoIndex, setPhotoIndex] = useState(0);
  const photos = galleryFor(item, selected);
  const photo = photos[photoIndex] ?? photos[0];
  const shownTypes = item.types.filter(type => !selected || type.id === selected);
  const pickType = (id: string) => { setSelected(id); setPhotoIndex(0); };
  const serviceList = (keys: string[]) => keys.length ? <ul className="detail-services">{keys.map(key => <li key={key}>{services[key]?.es ?? key}</li>)}</ul> : <p className="detail-pending">{copy.servicesPending}</p>;

  return <main id="ficha" className="shell detail-page">
    <Link className="back-link" href="/#alojamientos">← {copy.back}</Link>
    <div className="detail-heading"><p className="eyebrow">{item.types.map(type => types[type.id]?.es ?? type.id).join(' · ')}</p><h1>{item.name}</h1><p className="location">{item.location.zone ? `${zones[item.location.zone]?.es ?? item.location.zone} · La Paloma` : 'La Paloma'}</p></div>
    <p className="detail-summary">{item.summary.es}</p>
    {item.types.length > 1 && <div className="type-selector" role="group" aria-label={copy.typeSelector}><button type="button" aria-pressed={!selected} onClick={() => pickType('')}>{copy.all}</button>{item.types.map(type => <button key={type.id} type="button" aria-pressed={selected === type.id} onClick={() => pickType(type.id)}>{types[type.id]?.es ?? type.id}</button>)}</div>}
    <div className="detail-columns"><div>
      <section className="detail-gallery" aria-label={copy.gallery}>
        {photos.length > 1 && <div className="gallery-navigation"><button className="secondary-button" type="button" aria-label="Foto anterior" onClick={() => setPhotoIndex((photoIndex - 1 + photos.length) % photos.length)}>← Anterior</button><span>{photoIndex + 1} de {photos.length}</span><button className="secondary-button" type="button" aria-label="Foto siguiente" onClick={() => setPhotoIndex((photoIndex + 1) % photos.length)}>Siguiente →</button></div>}
        {photo ? <><div className="detail-main-photo"><Image src={photo.src} alt={photo.alt.es} fill sizes="(max-width: 799px) 100vw, 740px" preload /></div><div className="gallery-caption" aria-live="polite"><span>{photo.category === 'general' ? copy.general : types[photo.category]?.es ?? photo.category} · {photoIndex + 1} / {photos.length}</span><span>{photo.alt.es}</span></div>{photos.length > 1 && <div className="gallery-thumbnails">{photos.map((image, index) => <button className="gallery-thumbnail" key={image.src} type="button" aria-label={`${copy.seePhoto} ${index + 1}: ${image.alt.es}`} aria-pressed={index === photoIndex} onClick={() => setPhotoIndex(index)}><Image src={image.src} alt="" fill sizes="100px" /></button>)}</div>}</> : <div className="detail-no-photo">{copy.photosPending}</div>}
      </section>
      <section className="detail-section"><h2>{copy.about}</h2><p>{item.description.es}</p></section>
      <section className="detail-section"><h2>{copy.sharedServices}</h2>{serviceList(item.sharedServices)}</section>
      <div aria-live="polite">{shownTypes.map(type => <section className="detail-section" key={type.id}><h2>{types[type.id]?.es ?? type.id}</h2><p>{type.description.es}</p>{serviceList(type.services)}</section>)}</div>
      <section className="detail-section"><h2>{copy.location}</h2><p>{item.location.address ?? copy.addressPending}</p>{item.location.zone && <p>{zones[item.location.zone]?.es ?? item.location.zone} · La Paloma, Rocha</p>}</section>
    </div><AccommodationContact item={item} selected={selected} /></div>
  </main>;
}
