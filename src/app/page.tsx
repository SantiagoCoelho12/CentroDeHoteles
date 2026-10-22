import Image from 'next/image';
import { assetPath } from '../lib/paths';
import Link from 'next/link';
import { getAccommodations } from '../lib/accommodations';
import { es } from '../content/es';
import { AccommodationExplorer } from '../components/accommodation-explorer';
import { SiteHeader } from '../components/site-header';

export default async function Home() {
  const accommodations = await getAccommodations();
  return <>
    <a className="skip-link" href="#alojamientos">Ir a los alojamientos</a>
    {accommodations.some(item => item.status === 'draft') && <div className="draft-notice">{es.catalog.draft}</div>}
    <SiteHeader overHero />
    <main id="inicio">
      <section className="hero" aria-labelledby="hero-title">
        <Image className="hero-photo" src={assetPath('/fotos/la-paloma/portada.jpg')} alt={es.hero.alt} fill preload sizes="100vw" />
        <div className="hero-copy shell"><p className="eyebrow">{es.hero.location}</p><h1 id="hero-title">Centro de Hoteles<br />de La Paloma</h1><p className="hero-description">{es.hero.description}</p><a className="explore-button" href="#alojamientos">{es.hero.action}<span aria-hidden="true">↓</span></a></div>
      </section>
      <AccommodationExplorer accommodations={accommodations} />
      <section id="centro" className="about" aria-labelledby="about-title"><div className="shell about-content"><h2 id="about-title">{es.about.title}</h2><div><p>{es.about.description}</p><Link className="about-link" href="/quienes-somos">{es.about.action} <span aria-hidden="true">→</span></Link></div></div></section>
    </main>
    <footer className="shell site-footer">{es.footer}</footer>
  </>;
}
