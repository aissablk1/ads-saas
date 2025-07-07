# 🚀 ADS SaaS - Plateforme de Gestion de Campagnes Publicitaires

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

## 📋 Description

ADS SaaS est une plateforme complète de gestion de campagnes publicitaires construite avec les technologies modernes. Elle offre une solution complète pour la création, gestion et analyse de campagnes publicitaires avec une interface utilisateur intuitive et des fonctionnalités avancées.

## ✨ Fonctionnalités Principales

### 🎯 Gestion de Campagnes
- Création et gestion de campagnes publicitaires
- Builder visuel pour les pages de destination
- Système de templates personnalisables
- Gestion des médias et assets

### 📊 Analytics et Rapports
- Tableaux de bord en temps réel
- Métriques de performance détaillées
- Rapports personnalisables
- ROI Calculator intégré

### 👥 Gestion des Utilisateurs
- Système d'authentification sécurisé
- Gestion des rôles et permissions
- Interface d'administration complète
- Système d'équipes

### 💳 Intégrations
- Paiements via Stripe
- Intégrations tierces
- API REST complète
- Webhooks configurables

### 🔒 Sécurité
- Authentification JWT
- Middleware de sécurité
- Validation des données
- Audit trail complet

## 🛠️ Stack Technique

### Frontend
- **Framework**: Next.js 14 avec App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: React Context + Hooks
- **Forms**: React Hook Form + Zod
- **Charts**: Chart.js

### Backend
- **Framework**: Express.js avec TypeScript
- **Database**: PostgreSQL avec Prisma ORM
- **Authentication**: JWT avec refresh tokens
- **Validation**: Zod
- **Documentation**: Swagger/OpenAPI

### Infrastructure
- **Containerisation**: Docker + Docker Compose
- **Reverse Proxy**: Nginx
- **Monitoring**: Prometheus + Grafana
- **SSL**: Let's Encrypt automatique
- **CI/CD**: GitHub Actions

## 🚀 Installation et Démarrage

### Prérequis
- Node.js 18+ 
- PostgreSQL 14+
- Docker (optionnel)
- Git

### Installation Rapide

1. **Cloner le repository**
```bash
git clone https://github.com/votre-username/ads-saas.git
cd ads-saas
```

2. **Installer les dépendances**
```bash
# Installer les dépendances du client
cd client
npm install

# Installer les dépendances du serveur
cd ../server
npm install
```

3. **Configuration de l'environnement**
```bash
# Copier les fichiers d'environnement
cp .env.example .env
cp client/.env.example client/.env.local
cp server/.env.example server/.env
```

4. **Configuration de la base de données**
```bash
cd server
npx prisma generate
npx prisma db push
npx prisma db seed
```

5. **Démarrage en développement**
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### Démarrage avec Docker

```bash
# Construire et démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f
```

## 📁 Structure du Projet

```
ADS/
├── client/                 # Frontend Next.js
│   ├── src/app/           # Pages et layouts (App Router)
│   ├── src/components/    # Composants réutilisables
│   ├── src/lib/          # Utilitaires et configurations
│   └── src/types/        # Types TypeScript
├── server/                # Backend Express.js
│   ├── src/routes/       # Routes API
│   ├── src/middleware/   # Middlewares
│   ├── prisma/          # Schéma et migrations DB
│   └── scripts/         # Scripts utilitaires
├── scripts/              # Scripts de déploiement
├── docs/                 # Documentation technique
├── monitoring/           # Configuration monitoring
└── nginx/               # Configuration Nginx
```

## 🔧 Configuration

### Variables d'Environnement

#### Client (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Serveur (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/ads_saas"
JWT_SECRET=your-jwt-secret
STRIPE_SECRET_KEY=sk_test_...
PORT=3001
NODE_ENV=development
```

## 📚 Documentation

- [Guide d'Installation](docs/INSTALLATION.md)
- [Guide de Déploiement](docs/DEPLOYMENT.md)
- [API Documentation](docs/API.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Sécurité](docs/SECURITY.md)

## 🧪 Tests

```bash
# Tests du frontend
cd client
npm run test

# Tests du backend
cd server
npm run test

# Tests E2E
npm run test:e2e
```

## 🚀 Déploiement

### Production avec Docker

```bash
# Construire les images
docker-compose -f docker-compose.prod.yml build

# Déployer
docker-compose -f docker-compose.prod.yml up -d
```

### Déploiement Manuel

```bash
# Script de déploiement automatisé
./scripts/deploy-production.sh
```

## 🤝 Contribution

Nous accueillons les contributions ! Consultez notre [Guide de Contribution](CONTRIBUTING.md) pour plus de détails.

### Processus de Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🆘 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/votre-username/ads-saas/issues)
- **Discussions**: [GitHub Discussions](https://github.com/votre-username/ads-saas/discussions)

## 🙏 Remerciements

- [Next.js](https://nextjs.org/) - Framework React
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [Prisma](https://www.prisma.io/) - ORM moderne
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Stripe](https://stripe.com/) - Paiements

---

**Développé avec ❤️ par l'équipe ADS SaaS** 