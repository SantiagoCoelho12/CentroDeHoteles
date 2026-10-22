/** Las claves de idioma son extensibles: es, pt, en, etc. */
export type LocalizedText = { es: string; [locale: string]: string };

export interface Photo {
  /** Ruta desde public, por ejemplo /fotos/la-tuna/exterior.jpg. */
  src: string;
  alt: LocalizedText;
}

export interface Accommodation {
  id: string;
  name: string;
  active: boolean;
  status: "draft" | "published";
  summary: LocalizedText;
  description: LocalizedText;
  location: {
    address: string | null;
    zone: string | null;
    coordinates: { lat: number; lng: number } | null;
  };
  contact: { phone?: string | null; whatsapp: string | null; email: string | null };
  cover: Photo | null;
  photos: Photo[];
  /** Estos servicios se aplican a todos los tipos del establecimiento. */
  sharedServices: string[];
  types: {
    id: string;
    description: LocalizedText;
    photos: Photo[];
    services: string[];
  }[];
  sources: { url: string; checkedAt: string; notes: string }[];
}
