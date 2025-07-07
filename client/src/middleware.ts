import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware pour le cache busting automatique des assets statiques
 * Ajoute automatiquement le paramètre ?v= aux assets qui peuvent être mis en cache
 */

// Configuration du cache busting
const CACHE_BUSTING_CONFIG = {
  // Assets à inclure dans le cache busting
  includePatterns: [
    /\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|webp|avif)$/i
  ],
  // Assets à exclure du cache busting
  excludePatterns: [
    /\.(html|htm)$/i,
    /\/api\//i,
    /\/_next\/webpack-hmr/i,
    /\/_next\/on-demand-entries/i,
    /\/_next\/static\/chunks\/.*\.js$/i, // Chunks Next.js (gérés automatiquement)
    /\/_next\/static\/css\/.*\.css$/i,   // CSS Next.js (gérés automatiquement)
  ],
  // Version de l'application (peut être un hash de build ou timestamp)
  appVersion: process.env.NEXT_PUBLIC_APP_VERSION || Date.now().toString(),
  // Mode de génération de version
  versionMode: (process.env.NEXT_PUBLIC_VERSION_MODE as 'timestamp' | 'hash' | 'build' | 'manual') || 'timestamp'
};

/**
 * Génère une version unique basée sur la configuration
 */
function generateVersion(): string {
  switch (CACHE_BUSTING_CONFIG.versionMode) {
    case 'timestamp':
      return Date.now().toString();
    
    case 'hash':
      // Génère un hash simple basé sur le timestamp et un salt
      const salt = Math.random().toString(36).substring(2, 15);
      return simpleHash(`${Date.now()}${salt}`);
    
    case 'build':
      // Utilise la version de l'application si disponible, sinon timestamp
      return CACHE_BUSTING_CONFIG.appVersion || Date.now().toString();
    
    case 'manual':
      return CACHE_BUSTING_CONFIG.appVersion || '1.0.0';
    
    default:
      return Date.now().toString();
  }
}

/**
 * Génère un hash simple pour les versions
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Vérifie si un asset doit être inclus dans le cache busting
 */
function shouldIncludeAsset(url: string): boolean {
  // Vérifier les patterns d'exclusion
  for (const pattern of CACHE_BUSTING_CONFIG.excludePatterns) {
    if (pattern.test(url)) {
      return false;
    }
  }

  // Vérifier les patterns d'inclusion
  for (const pattern of CACHE_BUSTING_CONFIG.includePatterns) {
    if (pattern.test(url)) {
      return true;
    }
  }

  // Par défaut, inclure si c'est un asset statique
  return /\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|webp|avif)$/i.test(url);
}

/**
 * Ajoute le paramètre de version à une URL
 */
function addVersionToUrl(url: string): string {
  if (!shouldIncludeAsset(url)) {
    return url;
  }

  const separator = url.includes('?') ? '&' : '?';
  const version = generateVersion();
  return `${url}${separator}v=${version}`;
}

/**
 * Middleware principal
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protection des routes admin
  if (pathname.startsWith('/admin')) {
    // Exclure la page de login
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    // Vérifier le token admin dans les cookies
    const adminToken = request.cookies.get('adminToken')?.value;
    const adminUser = request.cookies.get('adminUser')?.value;

    if (!adminToken || !adminUser) {
      // Rediriger vers la page de login admin
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      // Vérifier la validité du token
      const tokenData = JSON.parse(Buffer.from(adminToken, 'base64').toString());
      if (tokenData.expiresAt < Date.now()) {
        // Token expiré, rediriger vers login
        const response = NextResponse.redirect(new URL('/admin/login', request.url));
        response.cookies.delete('adminToken');
        response.cookies.delete('adminUser');
        return response;
      }

      // Vérifier le rôle utilisateur
      const user = JSON.parse(decodeURIComponent(adminUser));
      if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
        // Accès refusé
        return NextResponse.redirect(new URL('/admin/login?error=unauthorized', request.url));
      }

      return NextResponse.next();
    } catch (error) {
      // Token invalide, rediriger vers login
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete('adminToken');
      response.cookies.delete('adminUser');
      return response;
    }
  }

  // Protection contre les attaques XSS et autres
  const response = NextResponse.next();
  
  // Headers de sécurité
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Content Security Policy pour les routes admin
  if (pathname.startsWith('/admin')) {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' ws: wss:;"
    );
  } else {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' ws: wss:;"
    );
  }

  // Ignorer les requêtes API et les pages dynamiques
  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/')) {
    return response;
  }

  // Vérifier si c'est un asset statique qui nécessite du cache busting
  if (shouldIncludeAsset(pathname)) {
    // Créer une nouvelle URL avec le paramètre de version
    const versionedUrl = addVersionToUrl(pathname);
    
    // Rediriger vers l'URL versionnée
    if (versionedUrl !== pathname) {
      const url = request.nextUrl.clone();
      url.pathname = versionedUrl;
      return NextResponse.redirect(url);
    }
  }

  // Ajouter des headers de cache appropriés
  if (shouldIncludeAsset(pathname)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    response.headers.set('X-Cache-Busting', 'enabled');
    response.headers.set('X-Asset-Version', generateVersion());
  } else {
    // Headers de cache pour les pages dynamiques
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  return response;
}

/**
 * Configuration du middleware
 */
export const config = {
  // Appliquer le middleware seulement aux assets statiques et pages
  matcher: [
    '/admin/:path*',
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 