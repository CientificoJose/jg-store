import { Metadata } from 'next';
import { StoreFront } from '@/components/storefront/store-front';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'JG Store | Venta al Detal y Mayorista B2B - 24 Departamentos',
  description:
    'Tienda online y distribuidora de JG Store. Precios al detal y al mayor con descuentos automáticos por volumen, 24 departamentos comerciales y pedidos directos vía WhatsApp.'
};

export default function HomePage() {
  return <StoreFront />;
}
