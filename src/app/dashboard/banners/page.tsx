import { Metadata } from 'next';
import { BannersView } from '@/features/banners/components/banners-view';

export const metadata: Metadata = {
  title: 'Carrusel y Banners Promocionales | JG Store Admin',
  description: 'Gestor visual de banners promocionales y carrusel de inicio de JG Store'
};

export default function BannersPage() {
  return <BannersView />;
}
