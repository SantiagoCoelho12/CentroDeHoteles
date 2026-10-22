import Link from 'next/link';
import { SiteHeader } from '../../../components/site-header';

export default function AccommodationNotFound() {
  return <><SiteHeader /><main className="shell institutional"><h1>Alojamiento no encontrado</h1><p>Este establecimiento no está disponible en el catálogo.</p><Link className="primary-button institutional-action" href="/#alojamientos">Volver a alojamientos</Link></main></>;
}
