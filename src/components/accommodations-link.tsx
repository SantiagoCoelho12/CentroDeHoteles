'use client';

import Link from 'next/link';
import { useEffect, useRef, type MouseEvent, type ReactNode } from 'react';
import { basePath } from '../lib/paths';

export function AccommodationsLink({ children, className }: { children: ReactNode; className?: string }) {
  const scrollAnimation = useRef<(() => void) | null>(null);
  useEffect(() => () => scrollAnimation.current?.(), []);
  function goToAccommodations(event: MouseEvent<HTMLAnchorElement>) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0 || ![`${basePath}/`, basePath || '/'].includes(window.location.pathname)) return;
    const header = document.querySelector('header');
    const title = document.getElementById('catalog-title');
    if (!title || !header) return;
    event.preventDefault();
    const style = getComputedStyle(header);
    const compactHeight = parseFloat(style.getPropertyValue('--header-expanded')) - parseFloat(style.getPropertyValue('--header-shrink'));
    const top = title.getBoundingClientRect().top + window.scrollY - compactHeight - 12;
    window.history.replaceState(window.history.state, '', `${basePath}/#alojamientos`);
    scrollAnimation.current?.();
    const start = window.scrollY;
    const destination = Math.max(0, Math.min(top, document.documentElement.scrollHeight - window.innerHeight));
    const distance = destination - start;
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 180 : Math.min(1600, Math.max(1100, Math.abs(distance) * 0.5 + 900));
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
  return <Link href="/#alojamientos" className={className} onClick={goToAccommodations}>{children}</Link>;
}

