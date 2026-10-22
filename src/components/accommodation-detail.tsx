'use client';
import { useLanguage } from './language-provider';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { assetPath } from '../lib/paths';
import Link from 'next/link';
import Image from 'next/image';
import type { Accommodation } from '../domain/accommodation';
import { galleryFor } from '../domain/detail.mjs';
import { AccommodationContact } from './accommodation-contact';
import { AvailabilityInquiry } from './availability-inquiry';
import catalogs from '../../data/catalogs.json';

const types: Record<string, { es: string }> = catalogs.accommodationTypes;
const zones: Record<string, { es: string }> = catalogs.zones;
const services: Record<string, { es: string }> = catalogs.services;

export function AccommodationDetail({ item, initialType }: { item: Accommodation; initialType: string }) {
  const { copy: es, t, localize } = useLanguage();
  const copy = es.detail;
  const params = useSearchParams();
  const requested = params.get('tipo') ?? initialType;
  const validType = item.types.some(type => type.id === requested) ? requested : '';
  const [selected, setSelected] = useState(validType);
  const [photoIndex, setPhotoIndex] = useState(0);
  useEffect(() => { setSelected(validType); setPhotoIndex(0); }, [validType]);
  const photos = galleryFor(item, selected);
  const photo = photos[photoIndex] ?? photos[0];
  const shownTypes = item.types.filter(type => !selected || type.id === selected);
  const pickType = (id: string) => { setSelected(id); setPhotoIndex(0); };
  const serviceList = (keys: string[]) => keys.length ? <ul className="detail-services">{keys.map(key => <li key={key}>{t(services[key]?.es ?? key)}</li>)}</ul> : <p className="detail-pending">{copy.servicesPending}</p>;

  return <main id="ficha" className="shell detail-page">
    <Link className="back-link" href="/#alojamientos">← {copy.back}</Link>
    <div className="detail-heading"><p className="eyebrow">{item.types.map(type => t(types[type.id]?.es ?? type.id)).join(' · ')}</p><h1>{item.name}</h1><p className="location">{item.location.zone ? `${t(zones[item.location.zone]?.es ?? item.location.zone)} · La Paloma` : 'La Paloma'}</p></div>
    <p className="detail-summary">{localize(item.summary)}</p>
    {item.types.length > 1 && <div className="type-selector" role="group" aria-label={copy.typeSelector}><button type="button" aria-pressed={!selected} onClick={() => pickType('')}>{copy.all}</button>{item.types.map(type => <button key={type.id} type="button" aria-pressed={selected === type.id} onClick={() => pickType(type.id)}>{t(types[type.id]?.es ?? type.id)}</button>)}</div>}
    <div className="detail-columns"><div>
      <section className="detail-gallery" aria-label={copy.gallery}>
        {photos.length > 1 && <div className="gallery-navigation"><button className="secondary-button" type="button" aria-label={t("Foto anterior")} onClick={() => setPhotoIndex((photoIndex - 1 + photos.length) % photos.length)}>{`← ${t("Anterior")}`}</button><span>{photoIndex + 1} {t('de')} {photos.length}</span><button className="secondary-button" type="button" aria-label={t("Foto siguiente")} onClick={() => setPhotoIndex((photoIndex + 1) % photos.length)}>{`${t("Siguiente")} →`}</button></div>}
        {photo ? <><div className="detail-main-photo"><Image src={assetPath(photo.src)} alt={localize(photo.alt)} fill sizes="(max-width: 799px) 100vw, 740px" preload />{photos.length > 1 && <><button className="photo-side-arrow photo-side-previous" type="button" aria-label={t("Foto anterior en imagen")} onClick={() => setPhotoIndex((photoIndex - 1 + photos.length) % photos.length)}>‹</button><button className="photo-side-arrow photo-side-next" type="button" aria-label={t("Foto siguiente en imagen")} onClick={() => setPhotoIndex((photoIndex + 1) % photos.length)}>›</button></>}</div><div className="gallery-caption" aria-live="polite"><span>{photo.category === 'general' ? copy.general : t(types[photo.category]?.es ?? photo.category)} · {photoIndex + 1} / {photos.length}</span><span>{localize(photo.alt)}</span></div>{photos.length > 1 && <div className="gallery-thumbnails">{photos.map((image, index) => <button className="gallery-thumbnail" key={image.src} type="button" aria-label={`${copy.seePhoto} ${index + 1}: ${localize(image.alt)}`} aria-pressed={index === photoIndex} onClick={() => setPhotoIndex(index)}><Image src={assetPath(image.src)} alt="" fill sizes="100px" /></button>)}</div>}</> : <div className="detail-no-photo">{copy.photosPending}</div>}
      </section>
      <section className="detail-section"><h2>{copy.about}</h2><p>{localize(item.description)}</p></section>
      <section className="detail-section"><h2>{copy.sharedServices}</h2>{serviceList(item.sharedServices)}</section>
      <div aria-live="polite">{shownTypes.map(type => <section className="detail-section" key={type.id}><h2>{t(types[type.id]?.es ?? type.id)}</h2><p>{localize(type.description)}</p>{serviceList(type.services)}</section>)}</div>
      <section className="detail-section"><h2>{copy.location}</h2><p>{item.location.address ?? copy.addressPending}</p>{item.location.zone && <p>{t(zones[item.location.zone]?.es ?? item.location.zone)} · La Paloma, Rocha</p>}</section>
    </div><AccommodationContact item={item} selected={selected} /></div>
    <AvailabilityInquiry item={item} selected={selected} />
  </main>;
}
