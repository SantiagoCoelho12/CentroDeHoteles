'use client';
import { useLanguage, LanguageButtons } from './language-provider';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { AccommodationsLink } from './accommodations-link';

export function SiteHeader({ current, overHero = false }: { current?: 'about'; overHero?: boolean }) {
  const { copy: es, t } = useLanguage();
  const header = useRef<HTMLElement>(null);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let value = 0;
    let target = 0;
    let previous = 0;
    const paint = () => {
      const eased = value * value * (3 - 2 * value);
      header.current?.style.setProperty('--header-progress', String(eased));
      header.current?.style.setProperty('--header-opacity', String(overHero ? eased : 1));
    };
    const animate = (now: number) => {
      const elapsed = Math.min(now - previous || 16, 50);
      previous = now;
      value += (target - value) * (1 - Math.exp(-elapsed / 85));
      if (Math.abs(target - value) < 0.001) value = target;
      paint();
      frame = value === target ? 0 : requestAnimationFrame(animate);
    };
    const update = () => {
      target = Math.min(Math.max(window.scrollY / 220, 0), 1);
      if (reduced.matches) { value = target; paint(); }
      else if (!frame) { previous = performance.now(); frame = requestAnimationFrame(animate); }
    };
    value = Math.min(Math.max(window.scrollY / 220, 0), 1);
    target = value; paint();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('pageshow', update);
    reduced.addEventListener('change', update);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', update); window.removeEventListener('pageshow', update); reduced.removeEventListener('change', update); };
  }, [overHero]);
  return <header ref={header} className={`site-header${overHero ? ' site-header-over-hero' : ' site-header-solid'}`}>
    <div className="shell site-header-inner">
    <Link className="brand" href="/" aria-label={t("Centro de Hoteles de La Paloma, inicio")}>{es.brand}<span>{es.destination}</span></Link>
    <nav aria-label={t("Navegación principal")}>
      <AccommodationsLink>{es.nav.accommodations}</AccommodationsLink>
      <Link href="/quienes-somos" aria-current={current === 'about' ? 'page' : undefined}>{es.nav.about}</Link>
    </nav>
    <LanguageButtons />
    </div>
  </header>;
}
