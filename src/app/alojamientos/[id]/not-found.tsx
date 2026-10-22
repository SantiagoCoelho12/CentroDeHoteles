'use client';
import Link from 'next/link';
import { useLanguage } from '../../../components/language-provider';
import { SiteHeader } from '../../../components/site-header';

export default function AccommodationNotFound() {
  const { t } = useLanguage();
  return <><SiteHeader /><main className="shell institutional"><h1>{t('Alojamiento no encontrado')}</h1><p>{t('Este establecimiento no está disponible en el catálogo.')}</p><Link className="primary-button institutional-action" href="/#alojamientos">{t('Volver a alojamientos')}</Link></main></>;
}
