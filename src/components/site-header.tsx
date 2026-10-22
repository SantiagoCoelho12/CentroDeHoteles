'use client';

import Link from 'next/link';
import { useEffect, useRef, type MouseEvent } from 'react';
import { es } from '../content/es';

export function SiteHeader({ current, overHero = false }: { current?: 'about'; overHero?: boolean }) {
  const header = useRef<HTMLElement>(null);
  const scrollAnimation = useRef<(() => void) | null>(null);
  useEffect(() => () => scrollAnimation.current?.(), []);
  function goToAccommodations(event: MouseEvent<HTMLAnchorElement>) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0 || window.location.pathname !== '/') return;
    const title = document.getElementById('catalog-title');
    if (!title || !header.current) return;
    event.preventDefault();
    const style = getComputedStyle(header.current);
    const compactHeight = parseFloat(style.getPropertyValue('--header-expanded')) - parseFloat(style.getPropertyValue('--header-shrink'));
    const top = title.getBoundingClientRect().top + window.scrollY - compactHeight - 12;
    window.history.replaceState(window.history.state, '', '/#alojamientos');
    scrollAnimation.current?.();
    const start = window.scrollY;
    const destination = Math.max(0, Math.min(top, document.documentElement.scrollHeight - window.innerHeight));
    const distance = destination - start;
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 180 : Math.min(1100, Math.max(750, Math.abs(distance) * 0.45 + 550));
    const startedAt = performance.now();
    let frame = 0;
    const stop = () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('wheel', stop);
      window.removeEventListener('touchstart', stop);
      window.removeEventListener('pointerdown', stop);
      window.removeEventListener('keydown', stop);
      scrollAnimation.current = null;
    };
    const animate = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      // Smootherstep: velocidad y aceleración nulas en ambos extremos.
      const eased = progress ** 3 * (progress * (progress * 6 - 15) + 10);
      window.scrollTo({ top: start + distance * eased, behavior: 'instant' });
      if (progress < 1) frame = requestAnimationFrame(animate);
      else stop();
    };
    scrollAnimation.current = stop;
    window.addEventListener('wheel', stop, { passive: true });
    window.addEventListener('touchstart', stop, { passive: true });
    window.addEventListener('pointerdown', stop, { passive: true });
    window.addEventListener('keydown', stop);
    frame = requestAnimationFrame(animate);
  }
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
    <Link className="brand" href="/" aria-label="Centro de Hoteles de La Paloma, inicio">{es.brand}<span>{es.destination}</span></Link>
    <nav aria-label="Navegación principal">
      <Link href="/#alojamientos" onClick={goToAccommodations}>{es.nav.accommodations}</Link>
      <Link href="/quienes-somos" aria-current={current === 'about' ? 'page' : undefined}>{es.nav.about}</Link>
    </nav>
    </div>
  </header>;
}
