/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance Optimizations
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,
  
  // Experimental Features for Performance
  experimental: {
    // App Directory Features
    appDir: true,
    
    // Performance Optimizations
    optimizePackageImports: [
      'lucide-react',
      '@heroicons/react',
      'framer-motion',
      'chart.js',
      'react-chartjs-2'
    ],
    
    // Server Actions
    serverActions: true,
    
    // Turbo Mode
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js'
        }
      }
    }
  },
  
  // Webpack Optimizations
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev) {
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
      
      // Tree shaking optimization
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 200000,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true
          }
        }
      };
    }
    
    // SVG optimization
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    });
    
    // Performance optimizations
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': './src',
      '@/components': './src/components',
      '@/lib': './src/lib',
      '@/types': './src/types',
      '@/styles': './src/styles'
    };
    
    return config;
  },
  
  // Image Optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    domains: ['localhost', 'ads-saas.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.ads-saas.com',
      },
      {
        protocol: 'https',
        hostname: 'api.ads-saas.com',
      }
    ]
  },
  
  // Compression
  compress: true,
  
  // Headers for Security and Performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=86400, stale-while-revalidate=86400'
          }
        ]
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
  },
  
  // Redirects for Performance
  async redirects() {
    return [
      {
        source: '/dashboard/home',
        destination: '/dashboard',
        permanent: true
      }
    ];
  },
  
  // Rewrites for API optimization
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`
      }
    ];
  },
  
  // Output optimization
  output: 'standalone',
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false
  },
  
  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false
  },
  
  // Transpile packages for optimization
  transpilePackages: [
    'lucide-react',
    '@heroicons/react',
    'framer-motion'
  ],
  
  // Environment variables
  env: {
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
    NEXT_PUBLIC_BUILD_ID: process.env.VERCEL_GIT_COMMIT_SHA || 'dev'
  },
  
  // Generate static exports for better performance
  trailingSlash: false,
  
  // Optimize fonts
  optimizeFonts: true,
  
  // Bundle analyzer (disabled by default)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: 'bundle-analyzer-report.html'
        })
      );
      return config;
    }
  })
};

module.exports = nextConfig; 