import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/lib/theme-context'
import { LanguageProvider } from '@/lib/language-context'
import { TranslationIndicator } from '@/lib/language-toggle'
import { TranslationBadge } from '@/lib/text-translator'
import { NotificationProvider } from '@/lib/notification-system'
import { OnboardingProvider } from '@/lib/onboarding-guide'
import PageLoader from '@/lib/page-loader'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ADS SaaS - Plateforme de gestion publicitaire moderne',
  description: 'Gérez vos campagnes publicitaires avec notre plateforme SaaS moderne. ROI optimisé, analytics avancés, intégrations multiples.',
  keywords: 'SaaS, publicité, gestion campagnes, ROI, analytics, marketing digital',
  authors: [{ name: 'ADS SaaS Team' }],
  creator: 'ADS SaaS',
  publisher: 'ADS SaaS',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://ads-saas.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'ADS SaaS - Plateforme de gestion publicitaire moderne',
    description: 'Gérez vos campagnes publicitaires avec notre plateforme SaaS moderne. ROI optimisé, analytics avancés, intégrations multiples.',
    url: 'https://ads-saas.com',
    siteName: 'ADS SaaS',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ADS SaaS - Plateforme de gestion publicitaire',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ADS SaaS - Plateforme de gestion publicitaire moderne',
    description: 'Gérez vos campagnes publicitaires avec notre plateforme SaaS moderne. ROI optimisé, analytics avancés, intégrations multiples.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

// Script pour initialiser le thème avant l'hydratation
// Version sécurisée qui évite les erreurs d'hydratation
const themeScript = `
  (function() {
    try {
      // Vérifier si localStorage est disponible (côté client uniquement)
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        var stored = localStorage.getItem('theme');
        var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        var theme = stored || 'system';
        
        // Résoudre le thème final
        var finalTheme;
        if (theme === 'system') {
          finalTheme = prefersDark ? 'dark' : 'light';
        } else {
          finalTheme = theme;
        }
        
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(finalTheme);
      } else {
        // Côté serveur ou localStorage non disponible
        // Utiliser le thème système par défaut
        var prefersDark = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)').matches : false;
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(prefersDark ? 'dark' : 'light');
      }
    } catch (e) {
      // En cas d'erreur, utiliser le thème clair par défaut
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add('light');
    }
  })();
`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          <LanguageProvider>
            <NotificationProvider>
              <OnboardingProvider>
                <PageLoader />
                {children}
                <TranslationIndicator />
                <TranslationBadge />
                <Toaster 
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: 'var(--card)',
                      color: 'var(--foreground)',
                      border: '1px solid var(--border)',
                    },
                    success: {
                      duration: 3000,
                      style: {
                        background: '#10b981',
                        color: '#fff',
                      },
                    },
                    error: {
                      duration: 5000,
                      style: {
                        background: '#ef4444',
                        color: '#fff',
                      },
                    },
                  }}
                />
              </OnboardingProvider>
            </NotificationProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
} 