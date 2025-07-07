# 🔄 Cache Busting - ADS SaaS

## Vue d'ensemble

Le système de cache busting d'ADS SaaS ajoute automatiquement le paramètre `?v=` à tous les assets statiques pour éviter les problèmes de cache des utilisateurs. Cette fonctionnalité est essentielle pour garantir que les utilisateurs voient toujours la dernière version de vos assets.

## 🚀 Installation et Configuration

### 1. Configuration Automatique

```bash
# Exécuter le script de configuration
./scripts/setup-cache-busting.sh
```

Ce script configure automatiquement :
- Variables d'environnement
- Fichiers de configuration
- Scripts de test et de mise à jour

### 2. Configuration Manuelle

#### Variables d'Environnement

Ajoutez ces variables dans votre fichier `.env` :

```env
# Mode de génération de version
NEXT_PUBLIC_VERSION_MODE=build

# Version de l'application (peut être un hash de build)
NEXT_PUBLIC_APP_VERSION=1703123456789

# Hash de build (optionnel)
NEXT_PUBLIC_BUILD_HASH=a1b2c3d4
```

#### Modes de Version Disponibles

| Mode | Description | Utilisation |
|------|-------------|-------------|
| `timestamp` | Timestamp actuel | Développement |
| `hash` | Hash généré | Tests |
| `build` | Version de build | Production |
| `manual` | Version manuelle | Contrôle total |

## 🛠️ Utilisation

### Composants Prêts à l'Emploi

#### VersionedImage

```tsx
import { VersionedImage } from '../lib/versioned-asset';

function MyComponent() {
  return (
    <VersionedImage
      src="/images/logo.png"
      alt="Logo ADS SaaS"
      width={200}
      height={100}
      priority={true}
    />
  );
}
```

#### VersionedAsset

```tsx
import { VersionedAsset } from '../lib/versioned-asset';

function MyComponent() {
  return (
    <div>
      {/* Image */}
      <VersionedAsset
        src="/images/hero.jpg"
        type="image"
        alt="Image héro"
        className="w-full h-64 object-cover"
      />
      
      {/* Script */}
      <VersionedAsset
        src="/scripts/analytics.js"
        type="script"
      />
      
      {/* Style */}
      <VersionedAsset
        src="/styles/custom.css"
        type="style"
      />
    </div>
  );
}
```

#### VersionedScript

```tsx
import { VersionedScript } from '../lib/versioned-asset';

function MyComponent() {
  return (
    <VersionedScript
      src="/scripts/third-party.js"
      strategy="afterInteractive"
      onLoad={() => console.log('Script chargé')}
    />
  );
}
```

#### VersionedLink

```tsx
import { VersionedLink } from '../lib/versioned-asset';

function MyComponent() {
  return (
    <VersionedLink
      href="/styles/theme.css"
      rel="stylesheet"
      media="(prefers-color-scheme: dark)"
    />
  );
}
```

### Hooks React

#### useVersionedUrl

```tsx
import { useVersionedUrl } from '../lib/versioned-asset';

function MyComponent() {
  const versionedUrl = useVersionedUrl('/images/background.jpg');
  
  return (
    <div style={{ backgroundImage: `url(${versionedUrl})` }}>
      Contenu avec image de fond versionnée
    </div>
  );
}
```

#### useVersionedUrls

```tsx
import { useVersionedUrls } from '../lib/versioned-asset';

function MyComponent() {
  const assets = {
    logo: '/images/logo.png',
    icon: '/images/icon.svg',
    stylesheet: '/styles/main.css'
  };
  
  const versionedAssets = useVersionedUrls(assets);
  
  return (
    <div>
      <img src={versionedAssets.logo} alt="Logo" />
      <img src={versionedAssets.icon} alt="Icon" />
      <link href={versionedAssets.stylesheet} rel="stylesheet" />
    </div>
  );
}
```

#### useCacheBuster

```tsx
import { useCacheBuster } from '../lib/cache-buster';

function MyComponent() {
  const { 
    getVersion, 
    updateVersion, 
    addVersion,
    getAssetUrl 
  } = useCacheBuster();
  
  return (
    <div>
      <p>Version actuelle: {getVersion()}</p>
      <button onClick={updateVersion}>
        Mettre à jour la version
      </button>
      <img src={getAssetUrl('/images/logo.png')} alt="Logo" />
    </div>
  );
}
```

## 🔧 Configuration Avancée

### Personnalisation des Patterns

Vous pouvez personnaliser quels assets sont inclus dans le cache busting :

```typescript
import { getCacheBuster } from '../lib/cache-buster';

// Configuration personnalisée
const cacheBuster = getCacheBuster({
  versionMode: 'build',
  appVersion: '1.2.3',
  includePatterns: [
    /\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|webp|avif)$/i
  ],
  excludePatterns: [
    /\.(html|htm)$/i,
    /\/api\//i,
    /\/_next\/webpack-hmr/i
  ]
});
```

### Middleware Automatique

Le middleware Next.js gère automatiquement le cache busting pour tous les assets statiques. Il ajoute les headers appropriés :

```typescript
// Headers ajoutés automatiquement
Cache-Control: public, max-age=31536000, immutable
X-Cache-Busting: enabled
X-Asset-Version: [version]
```

## 📊 Monitoring et Debugging

### Scripts de Test

```bash
# Tester la configuration
./scripts/test-cache-busting.sh

# Mettre à jour la version
./scripts/update-version.sh
```

### Vérification des Headers

Vous pouvez vérifier que le cache busting fonctionne en inspectant les headers HTTP :

```bash
curl -I http://localhost:3000/images/logo.png
```

Résultat attendu :
```
HTTP/1.1 200 OK
Cache-Control: public, max-age=31536000, immutable
X-Cache-Busting: enabled
X-Asset-Version: 1703123456789
```

### Debugging dans le Navigateur

Ouvrez les outils de développement et vérifiez :

1. **Network Tab** : Les URLs contiennent `?v=`
2. **Console** : Pas d'erreurs de cache
3. **Application Tab** : Cache vidé automatiquement

## 🚨 Dépannage

### Problèmes Courants

#### Assets non versionnés

**Symptôme** : Les assets n'ont pas le paramètre `?v=`

**Solution** :
1. Vérifiez que l'asset correspond aux patterns d'inclusion
2. Assurez-vous que le middleware est actif
3. Redémarrez l'application

#### Cache persistant

**Symptôme** : Les utilisateurs voient encore l'ancienne version

**Solution** :
1. Mettez à jour la version : `./scripts/update-version.sh`
2. Videz le cache du navigateur
3. Vérifiez les headers de cache

#### Performance dégradée

**Symptôme** : Chargement lent des assets

**Solution** :
1. Utilisez le mode `build` en production
2. Optimisez la taille des assets
3. Utilisez un CDN

### Logs de Debug

Activez les logs de debug en ajoutant :

```env
NEXT_PUBLIC_DEBUG_CACHE_BUSTING=true
```

## 🔄 Intégration avec CI/CD

### GitHub Actions

```yaml
- name: Update version for cache busting
  run: |
    NEW_VERSION=$(date +%s)
    echo "NEXT_PUBLIC_APP_VERSION=$NEW_VERSION" >> $GITHUB_ENV
    echo "NEXT_PUBLIC_BUILD_HASH=$(echo $NEW_VERSION | md5sum | cut -d' ' -f1 | cut -c1-8)" >> $GITHUB_ENV
```

### Docker

```dockerfile
# Générer une version unique lors du build
ARG BUILD_VERSION
ENV NEXT_PUBLIC_APP_VERSION=$BUILD_VERSION
ENV NEXT_PUBLIC_VERSION_MODE=build
```

## 📈 Métriques et Analytics

### Suivi des Versions

Le système ajoute automatiquement des métadonnées pour le suivi :

- `X-Asset-Version` : Version de l'asset
- `X-Cache-Busting` : Statut du cache busting
- `X-Build-Hash` : Hash du build (si configuré)

### Analytics

Vous pouvez suivre l'efficacité du cache busting :

```typescript
// Exemple de tracking
const { getVersion } = useCacheBuster();

// Envoyer à votre système d'analytics
analytics.track('asset_loaded', {
  asset: '/images/logo.png',
  version: getVersion(),
  timestamp: Date.now()
});
```

## 🔒 Sécurité

### Validation des URLs

Le système valide automatiquement les URLs pour éviter les attaques :

- Vérification des extensions de fichiers
- Exclusion des chemins sensibles
- Validation des paramètres

### Headers de Sécurité

Les headers de sécurité sont maintenus :

```typescript
// Headers automatiquement ajoutés
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Cache-Control: public, max-age=31536000, immutable
```

## 📚 Références

- [Next.js Middleware](https://nextjs.org/docs/advanced-features/middleware)
- [Cache Control Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)
- [Web Performance](https://web.dev/cache-control-best-practices/)

## 🤝 Contribution

Pour contribuer au système de cache busting :

1. Testez vos modifications avec `./scripts/test-cache-busting.sh`
2. Mettez à jour la documentation
3. Vérifiez la compatibilité avec tous les modes de version
4. Ajoutez des tests si nécessaire

---

**Note** : Ce système est conçu pour être transparent et ne nécessite aucune modification de votre code existant. Il fonctionne automatiquement en arrière-plan pour garantir une expérience utilisateur optimale. 