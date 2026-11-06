import { Metadata } from 'next';
import { AboutUsPageLayout } from '@/components/storefront/about-us-page-layout';

export const metadata: Metadata = {
  title: 'Conocé Nuestra Empresa & Local Físico | JG Store Polirrubro',
  description:
    'Misión, visión, equipo de trabajo, local físico, depósito y preguntas frecuentes de JG Store / Pancho Recargas.'
};

export default function NosotrosPage() {
  return <AboutUsPageLayout />;
}

