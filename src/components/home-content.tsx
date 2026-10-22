'use client';

import Image from 'next/image';
import { assetPath } from '../lib/paths';
import Link from 'next/link';
import { useLanguage } from './language-provider';
import type { Accommodation } from '../domain/accommodation';
import { AccommodationExplorer } from '../components/accommodation-explorer';
import { SiteHeader } from '../components/site-header';
import { AccommodationsLink } from '../components/accommodations-link';

export function HomeContent({ accommodations }: { accommodations: Accommodation[] }) {
  const { copy: es, t } = useLanguage();
  return <>
    <a className="skip-link" href="#alojamientos">{t("Ir a los alojamientos")}</a>
    {accommodations.some(item => item.status === 'draft') && <div className="draft-notice">{es.catalog.draft}</div>}
    <SiteHeader overHero />
    <main id="inicio">
      <section className="hero" aria-labelledby="hero-title">
        <Image className="hero-photo" src={assetPath('/fotos/la-paloma/portada.jpg')} alt={es.hero.alt} fill preload sizes="100vw" />
        <div className="hero-copy shell"><p className="eyebrow">{es.hero.location}</p><h1 id="hero-title">{es.hero.title}</h1><p className="hero-description">{es.hero.description}</p><AccommodationsLink className="explore-button">{es.hero.action}<span aria-hidden="true">↓</span></AccommodationsLink></div>
      </section>
      <AccommodationExplorer accommodations={accommodations} />
      <section id="centro" className="about" aria-labelledby="about-title"><div className="shell about-content"><h2 id="about-title">{es.about.title}</h2><div><p>{es.about.description}</p><Link className="about-link" href="/quienes-somos">{es.about.action} <span aria-hidden="true">→</span></Link></div></div></section>
    </main>
    <footer className="shell site-footer">{es.footer}</footer>
  </>;
}
