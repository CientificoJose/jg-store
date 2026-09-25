import { Metadata } from 'next';
import SignUpViewPage from '@/features/auth/components/sign-up-view';

export const metadata: Metadata = {
  title: 'Crear Cuenta | JG-STORE',
  description: 'Regístrate y accede a precios mayoristas y minoristas en JG-STORE Polirubro.'
};

export default function Page() {
  return <SignUpViewPage />;
}
