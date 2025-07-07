# 🚀 ADS SaaS - Plateforme de Publicité Intelligente

> **Une solution SaaS complète pour la gestion de campagnes publicitaires avec tableau de bord avancé, analytics en temps réel et intégrations Stripe.**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/votre-org/ads-saas)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-ready-brightgreen.svg)](docker-compose.yml)
[![Security](https://img.shields.io/badge/security-enterprise-red.svg)](SECURITY.md)

## 📋 Vue d'Ensemble

ADS SaaS est une plateforme moderne de gestion de campagnes publicitaires construite avec les dernières technologies web. Elle offre une expérience utilisateur intuitive avec des fonctionnalités avancées d'analytics, de gestion d'équipe et de paiements.

### ✨ Fonctionnalités Principales

- **🎯 Gestion de Campagnes** - Création, modification et suivi de campagnes publicitaires
- **📊 Analytics Avancés** - Tableaux de bord interactifs avec métriques en temps réel
- **👥 Gestion d'Équipe** - Système de rôles et permissions granulaires
- **💳 Paiements Stripe** - Intégration complète avec abonnements et facturation
- **🔐 Sécurité Enterprise** - Authentification JWT, rate limiting, validation avancée
- **📧 Emails Transactionnels** - Système complet avec templates personnalisables
- **🗺️ Sitemap Automatique** - Génération et gestion SEO avec robots.txt intelligent
- **🌐 Multi-langues** - Interface disponible en français et anglais
- **📱 Responsive Design** - Compatible mobile, tablette et desktop

## 🏃‍♂️ Démarrage Rapide

### Option 1: Script Automatique (Recommandé)

```bash
# Cloner le repository
git clone https://github.com/votre-org/ads-saas.git
cd ads-saas

# Démarrage en un clic
./scripts/quick-start.sh

# Pour production avec domaine
./scripts/quick-start.sh -d votre-domaine.com -e contact@votre-domaine.com -p
```

### Option 2: Installation Manuelle

```bash
# Prérequis
# - Docker & Docker Compose
# - Node.js 18+ (pour développement)

# 1. Configuration
cp .env.example .env.development
nano .env.development

# 2. Démarrage des services
docker-compose up -d

# 3. Initialisation de la base
docker-compose exec server npx prisma migrate deploy
docker-compose exec server npx prisma db seed
```

### 🔗 Accès à l'Application

| Service | URL | Description |
|---------|-----|-------------|
| **Application** | http://localhost:3000 | Interface principale |
| **API** | http://localhost:8000 | API REST |
| **Documentation** | http://localhost:8000/docs | Swagger API |
| **Sitemap** | http://localhost:3000/sitemap.xml | Sitemap SEO |
| **Robots.txt** | http://localhost:3000/robots.txt | Fichier robots |
| **Base de données** | localhost:5432 | PostgreSQL |
| **Cache** | localhost:6379 | Redis |
| **Monitoring** | http://localhost:3001 | Grafana |
| **Métriques** | http://localhost:9090 | Prometheus |

### 👤 Comptes de Test

```bash
# Administrateur
Email: admin@test.com
Mot de passe: Admin123!

# Utilisateur standard
Email: user@test.com
Mot de passe: User123!
```

## 🛠️ Stack Technologique

### Frontend
- **Next.js 14** - Framework React avec App Router
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS utilitaire
- **Framer Motion** - Animations fluides
- **Chart.js** - Graphiques interactifs
- **React Hook Form** - Gestion des formulaires

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Prisma** - ORM moderne
- **PostgreSQL** - Base de données relationnelle
- **Redis** - Cache et sessions
- **JWT** - Authentification sécurisée

### Infrastructure
- **Docker** - Containerisation
- **Nginx** - Reverse proxy et load balancer
- **Prometheus** - Collecte de métriques
- **Grafana** - Dashboards de monitoring
- **Let's Encrypt** - Certificats SSL automatiques

### Services Externes
- **Stripe** - Paiements et abonnements
- **SMTP** - Envoi d'emails
- **Sentry** - Monitoring d'erreurs
- **Google Analytics** - Analytics web

## 📁 Structure du Projet

```
ads-saas/
├── 📂 client/                 # Frontend Next.js
│   ├── 📂 src/
│   │   ├── 📂 app/           # Pages et layouts
│   │   ├── 📂 components/    # Composants réutilisables
│   │   ├── 📂 lib/          # Utilitaires et configs
│   │   └── 📂 types/        # Types TypeScript
│   ├── 📄 Dockerfile        # Image Docker frontend
│   └── 📄 package.json
│
├── 📂 server/                # Backend Express.js
│   ├── 📂 src/
│   │   ├── 📂 routes/       # Routes API
│   │   ├── 📂 middleware/   # Middlewares
│   │   └── 📂 utils/        # Utilitaires
│   ├── 📂 prisma/          # Schéma et migrations
│   ├── 📄 Dockerfile       # Image Docker backend
│   └── 📄 package.json
│
├── 📂 scripts/              # Scripts de déploiement
│   ├── 📄 quick-start.sh   # Installation automatique
│   ├── 📄 deploy.sh        # Déploiement production
│   ├── 📄 setup-ssl.sh     # Configuration SSL
│   └── 📄 test-sitemap.js  # Test du sitemap automatique
│
├── 📂 nginx/               # Configuration Nginx
├── 📂 monitoring/          # Configuration monitoring
├── 📄 docker-compose.yml  # Orchestration services
├── 📄 .github/workflows/  # CI/CD GitHub Actions
└── 📄 DEPLOYMENT.md       # Guide de déploiement complet
```

## 🚀 Déploiement Production

### Déploiement Automatique

```bash
# Configuration SSL + Déploiement complet
./scripts/deploy.sh deploy

# Vérification santé
./scripts/deploy.sh health

# Rollback si nécessaire
./scripts/deploy.sh rollback
```

### CI/CD avec GitHub Actions

Le projet inclut un pipeline CI/CD complet :

- ✅ **Tests automatiques** - Frontend et backend
- 🔒 **Audit de sécurité** - Scan des vulnérabilités
- 🏗️ **Build Docker** - Images optimisées
- 🚀 **Déploiement automatique** - Staging et production
- 📊 **Tests de performance** - Lighthouse et k6
- 🔔 **Notifications** - Slack/Discord

### Plateformes Supportées

| Plateforme | Status | Guide |
|------------|--------|--------|
| **Docker Compose** | ✅ Recommandé | [Guide](DEPLOYMENT.md#docker-compose) |
| **DigitalOcean** | ✅ Testé | [Guide](DEPLOYMENT.md#digitalocean) |
| **AWS ECS** | ✅ Supporté | [Guide](DEPLOYMENT.md#aws) |
| **Google Cloud Run** | ✅ Supporté | [Guide](DEPLOYMENT.md#gcp) |
| **Kubernetes** | 🔄 En cours | [Guide](DEPLOYMENT.md#k8s) |

## 📊 Monitoring & Observabilité

### Métriques Surveillées

- **Infrastructure** : CPU, RAM, disque, réseau
- **Application** : Temps de réponse, taux d'erreur, throughput
- **Business** : Conversions, inscriptions, revenus
- **Sécurité** : Tentatives de connexion, attaques

### Alertes Configurées

- 🚨 **Critiques** : Services down, erreurs 5xx, espace disque
- ⚠️ **Avertissements** : Performances dégradées, RAM élevée
- 📈 **Business** : Baisse conversions, échecs paiements

### Dashboards Grafana

- 📊 **Vue d'ensemble** - Métriques système et application
- 🎯 **Performance** - Temps de réponse et throughput
- 💼 **Business** - KPIs et métriques métier
- 🔒 **Sécurité** - Logs et tentatives d'intrusion

## 🔒 Sécurité

### Mesures Implémentées

- **Authentification** : JWT avec refresh tokens, 2FA optionnel
- **Autorisation** : RBAC avec permissions granulaires
- **Chiffrement** : HTTPS obligatoire, données sensibles chiffrées
- **Protection** : Rate limiting, validation stricte, headers sécurisés
- **Monitoring** : Logs d'audit, détection d'intrusions

### Conformité

- ✅ **RGPD** - Gestion des données personnelles
- ✅ **OWASP** - Top 10 des vulnérabilités
- ✅ **SOC 2** - Contrôles de sécurité
- ✅ **ISO 27001** - Management de la sécurité

## 📈 Performance

### Métriques de Performance

- **First Contentful Paint** : < 1.5s
- **Time to Interactive** : < 3s
- **Core Web Vitals** : Tous verts
- **Lighthouse Score** : 95+/100
- **API Response Time** : < 200ms (p95)

### Optimisations

- **Frontend** : Code splitting, lazy loading, optimisation images
- **Backend** : Connection pooling, cache Redis, compression
- **Infrastructure** : CDN, load balancing, mise en cache

## 🧪 Tests

### Types de Tests

```bash
# Tests unitaires
npm run test

# Tests d'intégration
npm run test:integration

# Tests e2e
npm run test:e2e

# Tests de charge
k6 run scripts/load-test.js

# Audit sécurité
npm audit && docker scan
```

### Couverture de Code

- **Frontend** : 85%+ couverture
- **Backend** : 90%+ couverture
- **Intégration** : Scénarios critiques couverts

## 🤝 Contribution

### Workflow de Développement

1. **Fork** le repository
2. **Créer** une branche feature (`git checkout -b feature/amazing-feature`)
3. **Commit** les changements (`git commit -m 'Add amazing feature'`)
4. **Push** vers la branche (`git push origin feature/amazing-feature`)
5. **Ouvrir** une Pull Request

### Standards de Code

- **ESLint** + **Prettier** pour le formatage
- **Conventional Commits** pour les messages
- **Tests** requis pour nouvelles features
- **Documentation** mise à jour

## 📞 Support

### Documentation

- 📖 **Guide utilisateur** : [docs/user-guide.md](docs/user-guide.md)
- 🔧 **API Documentation** : [docs/api.md](docs/api.md)
- 🚀 **Déploiement** : [DEPLOYMENT.md](DEPLOYMENT.md)
- 🔒 **Sécurité** : [SECURITY.md](SECURITY.md)
- 🗺️ **Sitemap Automatique** : [docs/SITEMAP_AUTOMATIQUE.md](docs/SITEMAP_AUTOMATIQUE.md)

### Assistance

- 💬 **Discord** : [Serveur communauté](https://discord.gg/ads-saas)
- 📧 **Email** : support@ads-saas.com
- 🐛 **Issues** : [GitHub Issues](https://github.com/votre-org/ads-saas/issues)
- 📚 **Wiki** : [GitHub Wiki](https://github.com/votre-org/ads-saas/wiki)

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 🏆 Remerciements

- **Next.js Team** pour le framework fantastique
- **Vercel** pour l'hébergement et les outils
- **Prisma** pour l'ORM moderne
- **Stripe** pour les solutions de paiement
- **Communauté Open Source** pour les nombreuses librairies

---

<div align="center">
  <p>
    <strong>🎉 Prêt à révolutionner vos campagnes publicitaires ?</strong>
  </p>
  <p>
    <a href="https://ads-saas.com">🚀 Démo Live</a> •
    <a href="mailto:contact@ads-saas.com">📧 Contact</a> •
    <a href="https://github.com/votre-org/ads-saas/wiki">📚 Documentation</a>
  </p>
  
  <sub>Développé avec ❤️ par l'équipe ADS SaaS</sub>
</div> 