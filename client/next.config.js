// Charger les variables d'environnement depuis la racine du projet
require('dotenv').config({ path: '../.env' });

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimisations de performance avancées
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@heroicons/react', 'lucide-react', 'framer-motion'],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
    // Nouvelles optimisations
    serverComponentsExternalPackages: ['@prisma/client'],
    optimizeServerReact: true,
    serverMinification: true,
    serverSourceMaps: false,
  },

  // Compression et optimisation des images avancée
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Optimisations supplémentaires
    unoptimized: false,
    loader: 'default',
    domains: [],
    path: '/_next/image',
  },

  // Optimisation du bundle avancée
  webpack: (config, { dev, isServer }) => {
    // Optimisations pour la production
    if (!dev && !isServer) {
      // Optimisation des chunks
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
            enforce: true,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
            priority: 5,
          },
          // Chunks spécifiques pour les librairies lourdes
          framer: {
            test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
            name: 'framer-motion',
            chunks: 'all',
            priority: 20,
          },
          react: {
            test: /[\\/]node_modules[\\/]react[\\/]/,
            name: 'react',
            chunks: 'all',
            priority: 20,
          },
        },
      };

      // Optimisation de la minification
      config.optimization.minimize = true;
      config.optimization.minimizer = config.optimization.minimizer || [];
    }

    // Optimisation des SVG
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    // Optimisation des modules
    config.resolve.alias = {
      ...config.resolve.alias,
      // Alias pour les imports fréquents
      '@': require('path').resolve(__dirname, 'src'),
      '@components': require('path').resolve(__dirname, 'src/components'),
      '@lib': require('path').resolve(__dirname, 'src/lib'),
    };

    return config;
  },

  // Headers de sécurité et cache optimisés
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          // Headers de performance
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
      // Cache pour les images
      {
        source: '/_next/image/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Redirection et réécriture
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: true,
      },
    ];
  },

  // Variables d'environnement publiques
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Optimisation du build avancée
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  // Optimisations supplémentaires
  reactStrictMode: true,
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,

  // Configuration TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },

  // Configuration ESLint
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Optimisation des performances
  onDemandEntries: {
    // Période de maintien des pages en mémoire
    maxInactiveAge: 25 * 1000,
    // Nombre de pages à maintenir
    pagesBufferLength: 2,
  },

  async rewrites() {
    return [
      // Routes API backend spécifiques avec cache
      {
        source: '/api/auth/:path*',
        destination: 'http://localhost:8000/api/auth/:path*',
      },
      {
        source: '/api/users/:path*',
        destination: 'http://localhost:8000/api/users/:path*',
      },
      {
        source: '/api/campaigns/:path*',
        destination: 'http://localhost:8000/api/campaigns/:path*',
      },
      {
        source: '/api/analytics/:path*',
        destination: 'http://localhost:8000/api/analytics/:path*',
      },
      {
        source: '/api/subscriptions/:path*',
        destination: 'http://localhost:8000/api/subscriptions/:path*',
      },
      {
        source: '/api/notifications/:path*',
        destination: 'http://localhost:8000/api/notifications/:path*',
      },
      {
        source: '/api/files/:path*',
        destination: 'http://localhost:8000/api/files/:path*',
      },
      {
        source: '/api/integrations/:path*',
        destination: 'http://localhost:8000/api/integrations/:path*',
      },
      {
        source: '/api/sitemap/:path*',
        destination: 'http://localhost:8000/api/sitemap/:path*',
      },
      {
        source: '/api/admin/:path*',
        destination: 'http://localhost:8000/api/admin/:path*',
      },
      // Routes API côté frontend (non redirigées)
      {
        source: '/api/translate/:path*',
        destination: '/api/translate/:path*',
      },
    ]
  },
}

module.exports = nextConfig 