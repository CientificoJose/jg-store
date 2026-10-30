'use client';
import { ClerkProvider } from '@clerk/nextjs';
import React from 'react';
import { ActiveThemeProvider } from '../themes/active-theme';
import QueryProvider from './query-provider';

export default function Providers({
  activeThemeValue,
  children
}: {
  activeThemeValue: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <ActiveThemeProvider initialTheme={activeThemeValue}>
        <ClerkProvider
          publishableKey={
            process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
            'pk_test_c2hpbmluZy1uYXJ3aGFsLTk2MzAuY2xlcmsuYWNjb3VudHMuZGV2JA'
          }
          signInUrl='/admin'
          signUpUrl='/admin'
          signInFallbackRedirectUrl='/dashboard/overview'
          signUpFallbackRedirectUrl='/dashboard/overview'
          appearance={{
            variables: {
              colorPrimary: 'var(--primary)',
              colorForeground: 'var(--foreground)',
              colorBackground: 'var(--card)',
              colorInput: 'var(--background)',
              colorInputForeground: 'var(--foreground)',
              colorDanger: 'var(--destructive)',
              fontFamily: 'var(--font-sans)'
            }
          }}
        >
          <QueryProvider>{children}</QueryProvider>
        </ClerkProvider>
      </ActiveThemeProvider>
    </>
  );
}
