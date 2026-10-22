'use client';

import Link from 'next/link';
import { SiteHeader } from '../components/site-header';
import { useLanguage } from './language-provider';


export function AboutContent() {
  const { copy: es, t } = useLanguage();
  return <>
    <a className="skip-link" href="#quienes">{t("Ir al contenido")}</a>
    <SiteHeader current="about" />
    <main id="quienes" className="institutional shell">
      <p className="eyebrow">{es.brand} · {es.destination}</p>
      <h1>{es.about.pageTitle}</h1>
      <div className="institutional-intro">{es.about.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
      <div className="institutional-values">
        <section aria-labelledby="mission-title"><h2 id="mission-title">{es.about.missionTitle}</h2><p>{es.about.mission}</p></section>
        <section aria-labelledby="vision-title"><h2 id="vision-title">{es.about.visionTitle}</h2><p>{es.about.vision}</p></section>
      </div>
      <Link className="primary-button institutional-action" href="/#alojamientos">{es.hero.action} <span aria-hidden="true">→</span></Link>
    </main>
    <footer className="shell site-footer">{es.footer}</footer>
  </>;
}
