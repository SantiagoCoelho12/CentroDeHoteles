import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAccommodations } from '../../../lib/accommodations';
import { SiteHeader } from '../../../components/site-header';
import { AccommodationDetail } from '../../../components/accommodation-detail';
import { es } from '../../../content/es';

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ tipo?: string | string[] }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const item = (await getAccommodations()).find(item => item.id === id);
  return { title: item ? `${item.name} | Centro de Hoteles de La Paloma` : 'Alojamiento no encontrado' };
}

export default async function DetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const item = (await getAccommodations()).find(item => item.id === id);
  if (!item) notFound();
  const { tipo } = await searchParams;
  const selected = typeof tipo === 'string' && item.types.some(type => type.id === tipo) ? tipo : '';
  return <>
    <a className="skip-link" href="#ficha">Ir a la ficha</a>
    {item.status === 'draft' && <div className="draft-notice">{es.catalog.draft}</div>}
    <SiteHeader />
    <AccommodationDetail key={item.id} item={item} initialType={selected} />
    <footer className="shell site-footer">{es.footer}</footer>
  </>;
}
