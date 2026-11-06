import Providers from '@/components/layout/providers';
import { Toaster } from '@/components/ui/sonner';
import { fontVariables } from '@/components/themes/font.config';
import { DEFAULT_THEME, THEMES } from '@/components/themes/theme.config';
import ThemeProvider from '@/components/themes/theme-provider';
import { cn } from '@/lib/utils';
import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import NextTopLoader from 'nextjs-toploader';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import '../styles/globals.css';

const META_THEME_COLORS = {
  light: '#ffffff',
  dark: '#09090b'
};

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://jg-stores.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'JG Store 🛍️ Distribuidora Mayorista y Detal | Precios Directos',
    template: '%s | JG Store'
  },
  description:
    '¡Comprá al mejor precio directo de fábrica e importador! 24 departamentos en librería, bazar, juguetería, tecnología y más. Descuentos por volumen y envíos a todo el país.',
  keywords: [
    'JG Store',
    'distribuidora mayorista',
    'compras por mayor',
    'polirrubro mayorista',
    'bazar por mayor',
    'libreria por mayor',
    'precios de fabrica',
    'pancho recargas'
  ],
  authors: [{ name: 'JG Store' }],
  creator: 'JG Store',
  publisher: 'JG Store',
  alternates: {
    canonical: SITE_URL
  },
  icons: {
    icon: [
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
      { url: '/favicon.ico', sizes: '32x32' }
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/favicon.ico'
  },
  openGraph: {
    title: 'JG Store 🛍️ Distribuidora Mayorista y Detal | Precios Directos',
    description:
      '¡Comprá al mejor precio directo de fábrica e importador! 24 departamentos comerciales, descuentos por volumen y envíos a todo el país.',
    url: SITE_URL,
    siteName: 'JG Store Polirrubro',
    images: [
      {
        url: '/icon.png',
        width: 512,
        height: 512,
        alt: 'JG Store Polirrubro'
      }
    ],
    locale: 'es_AR',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JG Store 🛍️ Distribuidora Mayorista y Detal',
    description:
      '¡Precios imbatibles en 24 departamentos! Compra al detal o al mayor con descuentos automáticos por volumen.',
    images: ['/icon.png']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  }
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: META_THEME_COLORS.light },
    { media: '(prefers-color-scheme: dark)', color: META_THEME_COLORS.dark }
  ]
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'JG Store',
      url: SITE_URL,
      logo: `${SITE_URL}/icon.png`,
      description:
        'Distribuidora oficial y tienda polirrubro con 24 departamentos comerciales, venta al mayor y al detal con envíos a todo el país.',
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        availableLanguage: 'Spanish'
      }
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'JG Store',
      publisher: {
        '@id': `${SITE_URL}/#organization`
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_URL}/?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    }
  ]
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const activeThemeValue = cookieStore.get('active_theme')?.value;
  const isValidTheme = THEMES.some((t) => t.value === activeThemeValue);
  const themeToApply = isValidTheme ? activeThemeValue! : DEFAULT_THEME;

  return (
    <html lang='es' suppressHydrationWarning data-theme={themeToApply}>
      <head>
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='anonymous' />
        <link
          href='https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap'
          rel='stylesheet'
        />
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={cn(
          'bg-background overflow-x-hidden overscroll-none font-sans antialiased',
          fontVariables
        )}
      >
        <NextTopLoader color='var(--primary)' showSpinner={false} />
        <NuqsAdapter>
          <ThemeProvider
            attribute='class'
            defaultTheme='system'
            enableSystem
            disableTransitionOnChange
            enableColorScheme
          >
            <Providers activeThemeValue={themeToApply}>
              <Toaster />
              {children}
            </Providers>
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
