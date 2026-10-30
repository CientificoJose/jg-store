import { Metadata } from 'next';
import { AdminSignInView } from '@/features/auth/components/admin-sign-in-view';

export const metadata: Metadata = {
  title: 'Acceso Administrativo | JG Store',
  description: 'Portal de autenticación exclusivo para el equipo de administración de JG Store.',
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminPage() {
  return <AdminSignInView />;
}
