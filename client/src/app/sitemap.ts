import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://ads-saas.com'
  
  // URLs statiques de l'application
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/demo`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // Pour le build statique, retourner seulement les routes statiques
  // Les routes dynamiques seront ajoutées en runtime si nécessaire
  if (process.env.NODE_ENV === 'production' || process.env.NEXT_PHASE === 'phase-production-build') {
    return staticRoutes
  }

  // En développement, essayer de récupérer les URLs dynamiques
  let dynamicRoutes: MetadataRoute.Sitemap = []
  
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    // Construire l'URL API correctement (éviter le double /api/)
    const sitemapUrl = apiUrl.endsWith('/api') 
      ? `${apiUrl}/sitemap/urls`
      : `${apiUrl}/api/sitemap/urls`
    
    const response = await fetch(sitemapUrl, {
      cache: 'no-store', // Toujours récupérer les données fraîches
      next: { revalidate: 3600 } // Revalider chaque heure
    })
    
    if (response.ok) {
      const data = await response.json()
      dynamicRoutes = data.urls.map((url: any) => ({
        url: url.url,
        lastModified: new Date(url.lastModified),
        changeFrequency: url.changeFrequency as 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never',
        priority: url.priority,
      }))
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des URLs dynamiques:', error)
    // Ne pas ajouter de routes de fallback pour éviter les liens brisés
    dynamicRoutes = []
  }

  // Combiner les routes statiques et dynamiques
  return [...staticRoutes, ...dynamicRoutes]
}

// Fonction utilitaire pour valider les URLs du sitemap
export function validateSitemapUrls(urls: MetadataRoute.Sitemap): boolean {
  for (const url of urls) {
    // Vérifier que l'URL est valide
    try {
      new URL(url.url)
    } catch {
      console.error(`URL invalide dans le sitemap: ${url.url}`)
      return false
    }

    // Vérifier la priorité
    if (url.priority && (url.priority < 0 || url.priority > 1)) {
      console.error(`Priorité invalide pour ${url.url}: ${url.priority}`)
      return false
    }

    // Vérifier la fréquence de changement
    const validFrequencies = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never']
    if (url.changeFrequency && !validFrequencies.includes(url.changeFrequency)) {
      console.error(`Fréquence invalide pour ${url.url}: ${url.changeFrequency}`)
      return false
    }
  }

  return true
}

// Configuration pour le sitemap
export const sitemapConfig = {
  maxUrls: 50000, // Limite recommandée par Google
  excludePatterns: [
    '/dashboard/*',
    '/api/*',
    '/admin/*',
    '/private/*',
    '/verify-email/*',
    '/reset-password/*',
    '/forgot-password/*',
    '/onboarding/*',
  ],
  includeLastModified: true,
  includePriority: true,
  includeChangeFrequency: true,
} 