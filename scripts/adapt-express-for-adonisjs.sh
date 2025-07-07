#!/bin/bash

# 🔄 Adaptation du serveur Express.js pour coexister avec AdonisJS
# Ce script modifie le serveur Express.js existant pour qu'il puisse fonctionner avec AdonisJS

set -e

echo "🔄 Adaptation du serveur Express.js pour AdonisJS"
echo "================================================"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier si AdonisJS est installé
if [ ! -f "server/.adonisrc.json" ]; then
    log_error "AdonisJS n'est pas installé. Exécutez d'abord: ./scripts/integrate-adonisjs-existing.sh"
    exit 1
fi

# Création d'un serveur Express.js adapté pour coexister avec AdonisJS
log_info "Création d'un serveur Express.js adapté..."

# Création du serveur Express.js adapté
cat > server/src/express-server.ts << 'EOF'
import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import path from 'path';

// Import routes Express.js existantes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';  
import campaignRoutes from './routes/campaigns.js';
import analyticsRoutes from './routes/analytics.js';
import subscriptionRoutes from './routes/subscriptions.js';
import notificationRoutes from './routes/notifications.js';
import fileRoutes from './routes/files.js';
import integrationRoutes from './routes/integrations.js';
import sitemapRoutes from './routes/sitemap.js';
import adminRoutes from './routes/admin.js';

// Middleware
import errorHandler from './middleware/errorHandler.js';
import { authenticateToken } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.EXPRESS_PORT || 8001; // Port différent d'AdonisJS

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Trop de requêtes depuis cette IP, réessayez dans 15 minutes.'
  }
});

// Middleware global
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}
const accessLogStream = fs.createWriteStream(path.join(logsDir, 'express-server.log'), { flags: 'a' });
app.use(helmet());
app.use(compression());
app.use(morgan('combined', { stream: accessLogStream }));
app.use(limiter);
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check pour Express.js
app.get('/express/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    service: 'express-server',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// API Routes Express.js avec préfixe /express
app.use('/express/api/auth', authRoutes);
app.use('/express/api/admin', adminRoutes);
app.use('/express/api/users', authenticateToken, userRoutes);
app.use('/express/api/campaigns', authenticateToken, campaignRoutes);
app.use('/express/api/analytics', authenticateToken, analyticsRoutes);
app.use('/express/api/subscriptions', authenticateToken, subscriptionRoutes);
app.use('/express/api/notifications', authenticateToken, notificationRoutes);
app.use('/express/api/files', authenticateToken, fileRoutes);
app.use('/express/api/integrations', authenticateToken, integrationRoutes);
app.use('/express/api/sitemap', sitemapRoutes);

// API Documentation Express.js
app.get('/express/api/docs', (req: Request, res: Response) => {
  res.json({
    title: 'ADS SaaS Express.js API Documentation',
    version: '1.0.0',
    service: 'express-server',
    endpoints: {
      auth: {
        'POST /express/api/auth/register': 'Créer un compte utilisateur',
        'POST /express/api/auth/login': 'Se connecter',
        'POST /express/api/auth/refresh': 'Renouveler le token',
        'POST /express/api/auth/logout': 'Se déconnecter'
      },
      users: {
        'GET /express/api/users/me': 'Profil utilisateur actuel',
        'PUT /express/api/users/me': 'Mettre à jour le profil',
        'DELETE /express/api/users/me': 'Supprimer le compte'
      },
      campaigns: {
        'GET /express/api/campaigns': 'Liste des campagnes',
        'POST /express/api/campaigns': 'Créer une campagne',
        'GET /express/api/campaigns/:id': 'Détails d\'une campagne',
        'PUT /express/api/campaigns/:id': 'Mettre à jour une campagne',
        'DELETE /express/api/campaigns/:id': 'Supprimer une campagne'
      },
      analytics: {
        'GET /express/api/analytics/dashboard': 'Données du tableau de bord',
        'GET /express/api/analytics/campaigns/:id': 'Analytics d\'une campagne'
      },
      subscriptions: {
        'GET /express/api/subscriptions/plans': 'Plans disponibles',
        'POST /express/api/subscriptions/subscribe': 'S\'abonner à un plan',
        'GET /express/api/subscriptions/current': 'Abonnement actuel'
      },
      notifications: {
        'GET /express/api/notifications': 'Liste des notifications',
        'PUT /express/api/notifications/:id/read': 'Marquer comme lu',
        'GET /express/api/notifications/settings': 'Paramètres notifications'
      },
      files: {
        'POST /express/api/files/upload': 'Upload de fichiers',
        'GET /express/api/files': 'Liste des fichiers',
        'DELETE /express/api/files/:id': 'Supprimer un fichier'
      },
      integrations: {
        'GET /express/api/integrations': 'Liste des intégrations',
        'POST /express/api/integrations/connect': 'Connecter une intégration',
        'GET /express/api/integrations/platforms': 'Plateformes disponibles'
      },
      sitemap: {
        'GET /express/api/sitemap/urls': 'URLs dynamiques pour sitemap',
        'GET /express/api/sitemap/status': 'Statut du sitemap',
        'POST /express/api/sitemap/generate': 'Régénérer le sitemap (admin uniquement)'
      }
    }
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route non trouvée',
    service: 'express-server',
    path: req.originalUrl
  });
});

// Error handler middleware (doit être en dernier)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Serveur Express.js ADS SaaS démarré sur le port ${PORT}`);
  console.log(`📖 Documentation API: http://localhost:${PORT}/express/api/docs`);
  console.log(`🏥 Health check: http://localhost:${PORT}/express/health`);
  console.log(`🔄 Service: Express.js (coexistant avec AdonisJS)`);
}); 
EOF

# Création d'un script de démarrage pour Express.js seul
cat > scripts/start-express-only.sh << 'EOF'
#!/bin/bash

echo "🚀 Démarrage du serveur Express.js seul (port 8001)"

cd server

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# Démarrer Express.js
echo "📡 Démarrage du serveur Express.js sur le port 8001..."
npm run dev &
EXPRESS_PID=$!

# Retourner au répertoire racine
cd ..

echo "✅ Services démarrés:"
echo "  - Express.js: PID $EXPRESS_PID (port 8001)"

# Fonction de nettoyage
cleanup() {
    echo "🛑 Arrêt des services..."
    kill $EXPRESS_PID 2>/dev/null
    exit 0
}

# Capture des signaux d'arrêt
trap cleanup SIGINT SIGTERM

# Attendre que le processus se termine
wait
EOF

chmod +x scripts/start-express-only.sh

# Création d'un script de démarrage complet (Express.js + AdonisJS + Next.js)
cat > scripts/start-complete-hybrid.sh << 'EOF'
#!/bin/bash

echo "🚀 Démarrage complet hybride (Express.js + AdonisJS + Next.js)"

# Vérifier si AdonisJS est configuré
if [ ! -f "server/.adonisrc.json" ]; then
    echo "❌ AdonisJS n'est pas configuré. Exécutez d'abord: ./scripts/integrate-adonisjs-existing.sh"
    exit 1
fi

# Aller dans le dossier server
cd server

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# Démarrer Express.js
echo "📡 Démarrage du serveur Express.js sur le port 8001..."
npx ts-node src/express-server.ts &
EXPRESS_PID=$!

# Attendre que Express.js démarre
sleep 3

# Démarrer AdonisJS
echo "⚡ Démarrage d'AdonisJS sur le port 8000..."
adonis serve --dev &
ADONIS_PID=$!

# Retourner au répertoire racine
cd ..

# Démarrer le frontend Next.js
echo "🎨 Démarrage du frontend Next.js sur le port 3000..."
cd client && npm run dev &
NEXT_PID=$!

echo "✅ Services démarrés:"
echo "  - Express.js: PID $EXPRESS_PID (port 8001)"
echo "  - AdonisJS: PID $ADONIS_PID (port 8000)"
echo "  - Next.js: PID $NEXT_PID (port 3000)"

echo ""
echo "🌐 URLs d'accès:"
echo "  - Frontend: http://localhost:3000"
echo "  - API Express.js: http://localhost:8001/express/api/"
echo "  - API AdonisJS: http://localhost:8000/adonis/"
echo "  - Health Express.js: http://localhost:8001/express/health"
echo "  - Health AdonisJS: http://localhost:8000/health"

# Fonction de nettoyage
cleanup() {
    echo "🛑 Arrêt des services..."
    kill $EXPRESS_PID $ADONIS_PID $NEXT_PID 2>/dev/null
    exit 0
}

# Capture des signaux d'arrêt
trap cleanup SIGINT SIGTERM

# Attendre que tous les processus se terminent
wait
EOF

chmod +x scripts/start-complete-hybrid.sh

# Création d'un reverse proxy Nginx pour les deux backends
cat > nginx/nginx-hybrid-complete.conf << 'EOF'
# Configuration Nginx pour ADS SaaS (Express.js + AdonisJS + Next.js)

events {
    worker_connections 1024;
}

http {
    upstream express_backend {
        server localhost:8001;
    }

    upstream adonisjs_backend {
        server localhost:8000;
    }

    upstream frontend {
        server localhost:3000;
    }

    # Routes Express.js (API existante)
    server {
        listen 80;
        server_name localhost;

        # API Express.js (routes existantes)
        location /express/ {
            proxy_pass http://express_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # API AdonisJS (nouvelles fonctionnalités)
        location /adonis/ {
            proxy_pass http://adonisjs_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Health checks
        location /express/health {
            proxy_pass http://express_backend;
            proxy_set_header Host $host;
        }

        location /health {
            proxy_pass http://adonisjs_backend;
            proxy_set_header Host $host;
        }

        # Frontend Next.js
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
EOF

# Mise à jour du fichier .env pour inclure le port Express.js
cat >> server/.env << 'EOF'

# Configuration Express.js
EXPRESS_PORT=8001
EOF

# Création d'un guide de migration progressive
cat > docs/MIGRATION_PROGRESSIVE.md << 'EOF'
# 🔄 Migration Progressive Express.js → AdonisJS

## Vue d'ensemble

Ce guide détaille la migration progressive de votre backend Express.js vers AdonisJS, en gardant les deux systèmes fonctionnels pendant la transition.

## Architecture Hybride

```
ADS SaaS (Migration Progressive)
├── server/           # Backend hybride
│   ├── src/         # Code Express.js (port 8001)
│   ├── app/         # Contrôleurs AdonisJS (port 8000)
│   ├── config/      # Configuration AdonisJS
│   ├── database/    # Migrations et seeders AdonisJS
│   └── start/       # Routes et kernel AdonisJS
├── client/           # Frontend Next.js (port 3000)
└── nginx/            # Reverse proxy (port 80)
```

## URLs d'accès

- **Frontend:** http://localhost:3000
- **API Express.js:** http://localhost:8001/express/api/
- **API AdonisJS:** http://localhost:8000/adonis/
- **Nginx Proxy:** http://localhost (routage automatique)

## Plan de Migration

### Phase 1 : Préparation (1-2 semaines)
- [x] Intégration d'AdonisJS dans l'arborescence existante
- [x] Configuration des deux serveurs sur des ports différents
- [x] Mise en place du reverse proxy Nginx
- [x] Tests de coexistence

### Phase 2 : Migration des modèles (2-3 semaines)
- [ ] Migration du modèle User
- [ ] Migration du modèle Campaign
- [ ] Migration du modèle Activity
- [ ] Migration du modèle Subscription
- [ ] Migration du modèle File

### Phase 3 : Migration des contrôleurs (3-4 semaines)
- [ ] Migration du contrôleur d'authentification
- [ ] Migration du contrôleur utilisateurs
- [ ] Migration du contrôleur campagnes
- [ ] Migration du contrôleur analytics
- [ ] Migration du contrôleur notifications

### Phase 4 : Migration des routes (2-3 semaines)
- [ ] Migration des routes d'authentification
- [ ] Migration des routes utilisateurs
- [ ] Migration des routes campagnes
- [ ] Migration des routes analytics
- [ ] Migration des routes admin

### Phase 5 : Tests et optimisation (2-3 semaines)
- [ ] Tests de performance
- [ ] Tests d'intégration
- [ ] Optimisation des requêtes
- [ ] Documentation finale

### Phase 6 : Déploiement (1-2 semaines)
- [ ] Déploiement en staging
- [ ] Tests en production
- [ ] Migration des données
- [ ] Mise en production

## Commandes de démarrage

### Démarrage complet (recommandé)
```bash
./scripts/start-complete-hybrid.sh
```

### Démarrage Express.js seul
```bash
./scripts/start-express-only.sh
```

### Démarrage AdonisJS seul
```bash
cd server && adonis serve --dev
```

## Migration des fonctionnalités

### Fonctionnalités à migrer en priorité
1. **Authentification** - Système critique
2. **Gestion des utilisateurs** - Fonctionnalité de base
3. **Gestion des campagnes** - Fonctionnalité métier
4. **Analytics** - Fonctionnalité avancée
5. **Notifications** - Fonctionnalité de support

### Fonctionnalités à garder en Express.js
1. **Intégrations externes** - Stripe, SMTP, etc.
2. **Gestion des fichiers** - Upload, stockage
3. **Sitemap** - Génération automatique
4. **Admin** - Interface d'administration

## Avantages de cette approche

1. **Migration progressive** - Pas d'interruption de service
2. **Tests en conditions réelles** - Validation continue
3. **Rollback facile** - Retour possible à Express.js
4. **Performance comparée** - Mesure des améliorations
5. **Formation équipe** - Apprentissage progressif

## Métriques de suivi

### Performance
- Temps de réponse moyen
- Utilisation mémoire
- CPU usage
- Throughput (requêtes/seconde)

### Qualité
- Taux d'erreur
- Disponibilité
- Temps de récupération
- Satisfaction utilisateur

## Prochaines étapes

1. **Tester l'architecture hybride**
2. **Commencer par la migration des modèles**
3. **Migrer fonctionnalité par fonctionnalité**
4. **Mesurer les améliorations**
5. **Optimiser selon les résultats**
EOF

log_success "Adaptation du serveur Express.js terminée !"
log_info "Prochaines étapes:"
log_info "1. ./scripts/start-complete-hybrid.sh (démarrage complet)"
log_info "2. ./scripts/start-express-only.sh (Express.js seul)"
log_info "3. Consulter docs/MIGRATION_PROGRESSIVE.md"

echo ""
echo "🎉 Adaptation Express.js pour AdonisJS terminée !"
echo "📖 Documentation: docs/MIGRATION_PROGRESSIVE.md"
echo "🚀 Pour démarrer complet: ./scripts/start-complete-hybrid.sh" 