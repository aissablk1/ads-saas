/**
 * Utilitaire de Cache Busting pour ADS SaaS
 * Gère automatiquement les versions des assets statiques pour éviter les problèmes de cache
 */

export interface CacheBusterConfig {
  // Version de l'application (peut être un hash de build ou timestamp)
  appVersion?: string;
  // Mode de génération de version
  versionMode: 'timestamp' | 'hash' | 'build' | 'manual';
  // Assets à exclure du cache busting
  excludePatterns?: RegExp[];
  // Assets à toujours inclure
  includePatterns?: RegExp[];
}

class CacheBuster {
  private config: CacheBusterConfig;
  private version: string;

  constructor(config: Partial<CacheBusterConfig> = {}) {
    this.config = {
      versionMode: 'timestamp',
      excludePatterns: [
        /\.(html|htm)$/i,
        /\/api\//i,
        /\/_next\/webpack-hmr/i,
        /\/_next\/on-demand-entries/i
      ],
      includePatterns: [
        /\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|webp|avif)$/i
      ],
      ...config
    };

    this.version = this.generateVersion();
  }

  /**
   * Génère une version unique basée sur la configuration
   */
  private generateVersion(): string {
    switch (this.config.versionMode) {
      case 'timestamp':
        return Date.now().toString();
      
      case 'hash':
        // Génère un hash simple basé sur le timestamp et un salt
        const salt = Math.random().toString(36).substring(2, 15);
        return this.simpleHash(`${Date.now()}${salt}`);
      
      case 'build':
        // Utilise la version de l'application si disponible, sinon timestamp
        return this.config.appVersion || Date.now().toString();
      
      case 'manual':
        return this.config.appVersion || '1.0.0';
      
      default:
        return Date.now().toString();
    }
  }

  /**
   * Génère un hash simple pour les versions
   */
  private simpleHash(str: string): string {
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
  private shouldIncludeAsset(url: string): boolean {
    // Vérifier les patterns d'exclusion
    if (this.config.excludePatterns) {
      for (const pattern of this.config.excludePatterns) {
        if (pattern.test(url)) {
          return false;
        }
      }
    }

    // Vérifier les patterns d'inclusion
    if (this.config.includePatterns) {
      for (const pattern of this.config.includePatterns) {
        if (pattern.test(url)) {
          return true;
        }
      }
    }

    // Par défaut, inclure si c'est un asset statique
    return /\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|webp|avif)$/i.test(url);
  }

  /**
   * Ajoute le paramètre de version à une URL
   */
  public addVersionToUrl(url: string): string {
    if (!this.shouldIncludeAsset(url)) {
      return url;
    }

    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}v=${this.version}`;
  }

  /**
   * Met à jour la version (utile pour les rechargements manuels)
   */
  public updateVersion(): void {
    this.version = this.generateVersion();
  }

  /**
   * Récupère la version actuelle
   */
  public getVersion(): string {
    return this.version;
  }

  /**
   * Génère une URL avec version pour les assets Next.js
   */
  public getAssetUrl(path: string): string {
    // Pour les assets Next.js, on utilise le chemin relatif
    const assetPath = path.startsWith('/') ? path : `/${path}`;
    return this.addVersionToUrl(assetPath);
  }

  /**
   * Génère une URL avec version pour les images
   */
  public getImageUrl(path: string): string {
    return this.addVersionToUrl(path);
  }

  /**
   * Génère une URL avec version pour les scripts
   */
  public getScriptUrl(path: string): string {
    return this.addVersionToUrl(path);
  }

  /**
   * Génère une URL avec version pour les styles
   */
  public getStyleUrl(path: string): string {
    return this.addVersionToUrl(path);
  }

  /**
   * Crée un objet avec toutes les URLs versionnées pour un composant
   */
  public createVersionedUrls(assets: Record<string, string>): Record<string, string> {
    const versioned: Record<string, string> = {};
    
    for (const [key, url] of Object.entries(assets)) {
      versioned[key] = this.addVersionToUrl(url);
    }
    
    return versioned;
  }
}

// Instance singleton pour l'application
let cacheBusterInstance: CacheBuster | null = null;

/**
 * Obtient l'instance singleton du cache buster
 */
export function getCacheBuster(config?: Partial<CacheBusterConfig>): CacheBuster {
  if (!cacheBusterInstance) {
    cacheBusterInstance = new CacheBuster(config);
  }
  return cacheBusterInstance;
}

/**
 * Met à jour la configuration du cache buster
 */
export function updateCacheBusterConfig(config: Partial<CacheBusterConfig>): void {
  if (cacheBusterInstance) {
    cacheBusterInstance = new CacheBuster(config);
  }
}

/**
 * Utilitaire pour ajouter automatiquement la version à une URL
 */
export function addVersionToUrl(url: string): string {
  return getCacheBuster().addVersionToUrl(url);
}

/**
 * Hook React pour utiliser le cache buster
 */
export function useCacheBuster() {
  const cacheBuster = getCacheBuster();
  
  return {
    addVersion: cacheBuster.addVersionToUrl.bind(cacheBuster),
    getAssetUrl: cacheBuster.getAssetUrl.bind(cacheBuster),
    getImageUrl: cacheBuster.getImageUrl.bind(cacheBuster),
    getScriptUrl: cacheBuster.getScriptUrl.bind(cacheBuster),
    getStyleUrl: cacheBuster.getStyleUrl.bind(cacheBuster),
    getVersion: cacheBuster.getVersion.bind(cacheBuster),
    updateVersion: cacheBuster.updateVersion.bind(cacheBuster),
    createVersionedUrls: cacheBuster.createVersionedUrls.bind(cacheBuster)
  };
}

export default CacheBuster; 