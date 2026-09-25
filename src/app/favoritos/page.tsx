import { Metadata } from 'next';
import { FavoritesPageLayout } from '@/components/storefront/favorites-page-layout';

export const metadata: Metadata = {
  title: 'Mis Favoritos | JG Store Polirubro',
  description:
    'Revisa tu lista personalizada de productos favoritos en JG Store. Cotiza todos tus artículos por WhatsApp o agrégalos a tu pedido mayorista con un solo clic.'
};

export default function FavoritosPage() {
  return <FavoritesPageLayout />;
}
