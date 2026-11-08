import { Metadata } from 'next';
import { StoreFront } from '@/components/storefront/store-front';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://jg-stores.com'),
  title: 'JG Store 🛍️ Distribuidora Mayorista y Detal | Precios Directos de Fábrica',
  description:
    '¡Comprá al mejor precio directo de fábrica e importador! Venta mayorista y minorista en librería, indumentaria y polirrubro. Descuentos por volumen y envíos a todo el país.',
  alternates: {
    canonical: 'https://jg-stores.com'
  },
  openGraph: {
    title: 'JG Store 🛍️ Distribuidora Mayorista y Detal | Precios Directos de Fábrica',
    description:
      '¡Comprá al mejor precio directo de fábrica e importador! Venta mayorista y minorista con descuentos por volumen y envíos a todo el país.',
    url: 'https://jg-stores.com',
    siteName: 'JG Store Polirrubro',
    images: [
      {
        url: '/icon.png',
        width: 512,
        height: 512,
        alt: 'JG Store Polirrubro Oficial'
      }
    ],
    type: 'website'
  }
};

export default function HomePage() {
  return <StoreFront />;
}
