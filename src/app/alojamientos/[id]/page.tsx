import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getAccommodations } from '../../../lib/accommodations';
import { SiteHeader } from '../../../components/site-header';
import { AccommodationDetail } from '../../../components/accommodation-detail';
import { es } from '../../../content/es';
import { Text } from '../../../components/language-provider';

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;
export async function generateStaticParams() {
  return (await getAccommodations()).map(item => ({ id: item.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const item = (await getAccommodations()).find(item => item.id === id);
  return { title: item ? `${item.name} | Centro de Hoteles de La Paloma` : 'Alojamiento no encontrado' };
}

export default async function DetailPage({ params }: Props) {
  const { id } = await params;
  const item = (await getAccommodations()).find(item => item.id === id);
  if (!item) notFound();
  return <>
    <a className="skip-link" href="#ficha"><Text>Ir a la ficha</Text></a>
    {item.status === 'draft' && <div className="draft-notice">{<Text>{es.catalog.draft}</Text>}</div>}
    <SiteHeader />
    <Suspense fallback={<main className="shell institutional"><h1>{item.name}</h1><p><Text>Cargando ficha…</Text></p></main>}><AccommodationDetail key={item.id} item={item} initialType="" /></Suspense>
    <footer className="shell site-footer"><Text>{es.footer}</Text></footer>
  </>;
}
