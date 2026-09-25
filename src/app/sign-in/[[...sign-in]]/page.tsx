import { Metadata } from 'next';
import SignInViewPage from '@/features/auth/components/sign-in-view';

export const metadata: Metadata = {
  title: 'Iniciar Sesión | JG-STORE',
  description: 'Inicia sesión en tu cuenta de JG-STORE Polirubro.'
};

export default function Page() {
  return <SignInViewPage />;
}
