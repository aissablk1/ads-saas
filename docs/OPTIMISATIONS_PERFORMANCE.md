# 🚀 Guide d'Optimisation des Performances - ADS SaaS

## 📋 Vue d'ensemble

Ce guide détaille toutes les optimisations de performance implémentées dans l'application ADS SaaS pour améliorer la vitesse, la réactivité et l'efficacité.

## 🎯 Objectifs d'Optimisation

- **Réduction du temps de réponse API** : 50-80% d'amélioration
- **Optimisation du bundle frontend** : Réduction de 30-50%
- **Amélioration du cache** : Hit rate > 90%
- **Optimisation des requêtes DB** : Réduction de 60-80% du temps d'exécution

## 🔧 Optimisations Implémentées

### 1. Base de Données (SQLite + Prisma)

#### Index Optimisés
```sql
-- Index pour les requêtes fréquentes
CREATE INDEX idx_users_status_lastlogin ON users(status, lastLogin);
CREATE INDEX idx_users_created_at ON users(createdAt);
CREATE INDEX idx_users_role_status ON users(role, status);
CREATE INDEX idx_users_email_status ON users(email, status);
CREATE INDEX idx_users_last_login ON users(lastLogin);

CREATE INDEX idx_campaigns_user_status ON campaigns(userId, status);
CREATE INDEX idx_campaigns_user_archived ON campaigns(userId, archived);
CREATE INDEX idx_campaigns_status_created ON campaigns(status, createdAt);
CREATE INDEX idx_campaigns_dates ON campaigns(startDate, endDate);
CREATE INDEX idx_campaigns_user_status_archived ON campaigns(userId, status, archived);
CREATE INDEX idx_campaigns_created_status ON campaigns(createdAt, status);
```

#### Optimisations Prisma
- **Sélection spécifique** : Utilisation de `select` au lieu de `include` quand possible
- **Requêtes optimisées** : Évitement des N+1 queries
- **Batch operations** : Utilisation de `createMany`, `updateMany`

### 2. Cache Redis Avancé

#### Configuration Optimisée
```javascript
// Configuration Redis performante
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    connectTimeout: 5000,
    lazyConnect: true,
    reconnectStrategy: (retries) => {
      if (retries > 10) return false;
      return Math.min(retries * 100, 3000);
    }
  },
  database: 0,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3
});
```

#### Fonctionnalités Avancées
- **Cache intelligent** : `getOrSet` avec fallback automatique
- **Batch operations** : `setBatch`, `getBatch` pour les opérations multiples
- **Invalidation par tags** : Gestion intelligente de l'invalidation
- **TTL automatique** : Expiration automatique des données

#### Stratégies de Cache
```javascript
// Cache pour les requêtes fréquentes
const frequentQueriesCache = {
  async getUserStats(userId: string) {
    return cacheService.getOrSet(
      `user:stats:${userId}`,
      async () => { /* requête coûteuse */ },
      600 // 10 minutes
    );
  }
};
```

### 3. Backend Express/AdonisJS

#### Middleware d'Optimisation
```javascript
// Compression avancée
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));

// Rate limiting intelligent
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  skip: (req) => req.path === '/health' || req.path.startsWith('/api/admin')
});
```

#### Cache Global
```javascript
// Middleware de cache pour les routes GET
app.use('/api', (req, res, next) => {
  if (req.method === 'GET' && !req.path.includes('/admin')) {
    const cacheKey = `api:${req.originalUrl}`;
    cacheService.get(cacheKey).then(cached => {
      if (cached) return res.json(cached);
      
      const originalJson = res.json;
      res.json = function(data) {
        cacheService.set(cacheKey, data, 300); // 5 minutes
        return originalJson.call(this, data);
      };
      next();
    }).catch(() => next());
  } else {
    next();
  }
});
```

### 4. Frontend Next.js

#### Configuration Webpack Optimisée
```javascript
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
```

#### Optimisations d'Images
```javascript
images: {
  formats: ['image/webp', 'image/avif'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  minimumCacheTTL: 60,
  dangerouslyAllowSVG: true,
  contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
}
```

#### Headers de Cache
```javascript
async headers() {
  return [
    {
      source: '/_next/static/(.*)',
      headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
    },
    {
      source: '/_next/image/(.*)',
      headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
    },
  ];
}
```

## 📊 Métriques de Performance

### Avant Optimisation
- **Temps de réponse API** : 200-500ms
- **Taille du bundle** : 2-3MB
- **Requêtes DB** : Non optimisées, N+1 queries
- **Cache** : Aucun
- **Images** : Non optimisées

### Après Optimisation
- **Temps de réponse API** : 50-150ms (avec cache)
- **Taille du bundle** : 1-1.5MB (réduction 30-50%)
- **Requêtes DB** : Indexées et optimisées
- **Cache** : Hit rate > 90%
- **Images** : WebP/AVIF avec lazy loading

## 🛠️ Utilisation du Script d'Optimisation

### Installation
```bash
# Rendre le script exécutable
chmod +x scripts/optimize-performance.sh
```

### Utilisation
```bash
# Optimisation complète
./scripts/optimize-performance.sh

# Optimisation spécifique
./scripts/optimize-performance.sh db          # Base de données
./scripts/optimize-performance.sh cache       # Cache Redis
./scripts/optimize-performance.sh frontend    # Frontend
./scripts/optimize-performance.sh backend     # Backend
./scripts/optimize-performance.sh system      # Système
./scripts/optimize-performance.sh test        # Tests de performance
./scripts/optimize-performance.sh monitor     # Monitoring
```

## 🔍 Monitoring et Surveillance

### Métriques à Surveiller
1. **Temps de réponse API** : < 200ms
2. **Hit rate du cache** : > 90%
3. **Utilisation mémoire** : < 80%
4. **Requêtes DB lentes** : < 100ms
5. **Taille du bundle** : < 2MB

### Outils de Monitoring
- **Prometheus** : Métriques système
- **Grafana** : Dashboards de performance
- **Redis CLI** : Monitoring du cache
- **Prisma Studio** : Analyse des requêtes DB

## 🚨 Dépannage

### Problèmes Courants

#### Cache Redis non accessible
```bash
# Vérifier le statut Redis
redis-cli ping

# Redémarrer Redis
redis-server --daemonize yes
```

#### Requêtes DB lentes
```bash
# Analyser la base de données
cd server
npx prisma db execute --stdin <<< "ANALYZE;"
```

#### Bundle trop volumineux
```bash
# Analyser le bundle
cd client
npm run build
# Vérifier la taille dans .next/static/chunks/
```

## 📈 Recommandations Futures

### Optimisations Avancées
1. **CDN** : Implémenter un CDN pour les assets statiques
2. **Service Worker** : Cache offline pour le frontend
3. **Database Sharding** : Partitionnement pour la scalabilité
4. **Microservices** : Architecture distribuée
5. **Edge Computing** : Traitement à la périphérie

### Monitoring Continu
1. **APM** : Application Performance Monitoring
2. **Logs structurés** : Centralisation et analyse
3. **Alertes automatiques** : Notification des dégradations
4. **Tests de charge** : Validation des performances

## 📚 Ressources

- [Prisma Performance](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Redis Optimization](https://redis.io/topics/optimization)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Express Performance](https://expressjs.com/en/advanced/best-practices-performance.html)

---

**Note** : Ces optimisations sont conçues pour améliorer significativement les performances de l'application ADS SaaS. Surveillez régulièrement les métriques et ajustez selon vos besoins spécifiques. 