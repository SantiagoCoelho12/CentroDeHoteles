import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Centro de Hoteles de La Paloma',
  description: 'Explorá hoteles, cabañas y complejos de La Paloma, Rocha, Uruguay.',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
