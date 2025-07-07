# 🏛️ Système d'Administration ADS

## Vue d'ensemble

Le système d'administration ADS est une interface complète et sécurisée permettant de gérer l'ensemble de la plateforme SaaS. Il offre un contrôle total sur les utilisateurs, les campagnes, les performances système et la sécurité.

## 🚀 Installation et Configuration

### Prérequis

- Node.js 18+ 
- npm ou yarn
- Base de données SQLite (configurée automatiquement)

### Installation rapide

```bash
# Cloner le projet
git clone <repository-url>
cd ADS

# Initialiser le système d'administration
./scripts/setup-admin-system.sh
```

### Installation manuelle

```bash
# 1. Installer les dépendances serveur
cd server
npm install

# 2. Configurer la base de données
npx prisma generate
npx prisma migrate deploy

# 3. Créer l'utilisateur administrateur
node scripts/create-admin-user.js

# 4. Générer les données de test (optionnel)
node scripts/seed-test-data.js

# 5. Installer les dépendances client
cd ../client
npm install
```

## 🔐 Accès et Authentification

### Identifiants par défaut

**Administrateur principal:**
- Email: `admin@ads-saas.com`
- Mot de passe: `ADS2024Secure!`

**Utilisateur de test:**
- Email: `john.doe@example.com`
- Mot de passe: `password123`

### URLs d'accès

- **Interface d'administration:** http://localhost:3000/admin/login
- **Application principale:** http://localhost:3000
- **API backend:** http://localhost:8000

## 🏗️ Architecture

### Structure des fichiers

```
ADS/
├── client/
│   ├── src/
│   │   ├── app/admin/           # Pages d'administration
│   │   │   └── AdminAuthGuard.tsx  # Système d'authentification
│   │   └── lib/
│   │       └── admin-api.ts     # Service API admin
├── server/
│   ├── src/
│   │   └── routes/
│   │       └── admin.js         # Routes API admin
│   ├── scripts/
│   │   ├── create-admin-user.js # Création utilisateur admin
│   │   └── seed-test-data.js    # Données de test
│   └── prisma/
│       └── schema.prisma        # Schéma base de données
└── scripts/
    └── setup-admin-system.sh    # Script d'initialisation
```

### Composants principaux

#### 1. AdminAuthGuard
- Gestion de l'authentification admin
- Protection des routes
- Gestion des sessions
- Redirection automatique

#### 2. AdminApiService
- Communication avec l'API backend
- Gestion des tokens d'authentification
- Appels aux endpoints admin

#### 3. Routes API Admin
- `/api/admin/login` - Connexion admin
- `/api/admin/verify-session` - Vérification session
- `/api/admin/dashboard/stats` - Statistiques dashboard
- `/api/admin/system/action` - Actions système

## 📊 Fonctionnalités

### Tableau de bord principal

#### Statistiques utilisateurs
- Nombre total d'utilisateurs
- Utilisateurs actifs (7 derniers jours)
- Nouveaux utilisateurs (mois en cours)
- Utilisateurs premium

#### Statistiques campagnes
- Nombre total de campagnes
- Campagnes actives
- Total des clics
- Total des conversions

#### Métriques système
- Utilisation CPU, mémoire, disque
- Temps de réponse API
- Requêtes par minute
- Taux d'erreur

#### Sécurité
- Menaces détectées
- Requêtes bloquées
- Vulnérabilités
- Dernier scan de sécurité

### Actions système

#### Maintenance
- **Nettoyer Cache:** Vide le cache système
- **Optimiser DB:** Optimise la base de données
- **Sauvegarde:** Crée une sauvegarde complète
- **Redémarrer:** Redémarre le système

#### Monitoring
- Données en temps réel
- Alertes système
- Logs d'activité
- Métriques de performance

### Gestion des utilisateurs

#### Fonctionnalités
- Liste des utilisateurs avec pagination
- Recherche et filtrage
- Création/modification/suppression
- Suspension/réactivation
- Réinitialisation de mot de passe

#### Rôles et permissions
- **ADMIN:** Accès complet au système
- **USER:** Utilisateur standard
- **EDITOR:** Éditeur de contenu
- **VIEWER:** Lecture seule

## 🔧 Configuration

### Variables d'environnement

```env
# Base de données
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="votre-secret-jwt-super-securise"

# API
NEXT_PUBLIC_API_URL="http://localhost:8000"
API_URL="http://localhost:8000"

# Sécurité
NODE_ENV="development"
```

### Configuration de sécurité

#### Authentification
- JWT avec expiration 24h
- Refresh automatique des tokens
- Déconnexion automatique après inactivité

#### Autorisation
- Vérification des rôles admin
- Protection des routes sensibles
- Audit des actions administrateur

## 📈 Données et Analytics

### Types de données collectées

#### Utilisateurs
- Informations de profil
- Historique de connexion
- Activités et actions
- Abonnements et paiements

#### Campagnes
- Métriques de performance
- Budget et dépenses
- Impressions et clics
- Conversions et ROI

#### Système
- Métriques de performance
- Logs d'erreur
- Utilisation des ressources
- Alertes de sécurité

### Export et rapports

- Export CSV des données
- Rapports PDF automatiques
- API pour intégration externe
- Webhooks pour notifications

## 🛡️ Sécurité

### Mesures de sécurité

#### Authentification
- Mots de passe hachés (bcrypt)
- Authentification à deux facteurs (optionnel)
- Limitation des tentatives de connexion
- Sessions sécurisées

#### Autorisation
- Vérification des rôles
- Permissions granulaires
- Audit des actions
- Logs de sécurité

#### Protection des données
- Chiffrement en transit (HTTPS)
- Validation des entrées
- Protection contre les injections SQL
- Sanitisation des données

### Bonnes pratiques

1. **Changer les mots de passe par défaut**
2. **Utiliser HTTPS en production**
3. **Configurer un pare-feu**
4. **Sauvegarder régulièrement**
5. **Monitorer les logs**
6. **Mettre à jour régulièrement**

## 🚨 Dépannage

### Problèmes courants

#### Erreur de connexion
```bash
# Vérifier la base de données
cd server
npx prisma db push

# Recréer l'utilisateur admin
node scripts/create-admin-user.js
```

#### Erreur de base de données
```bash
# Réinitialiser la base
cd server
npx prisma migrate reset
npx prisma migrate deploy
```

#### Problème de build
```bash
# Nettoyer le cache
cd client
rm -rf .next
npm run build
```

### Logs et debugging

#### Logs serveur
```bash
cd server
npm run dev
# Les logs apparaissent dans la console
```

#### Logs client
```bash
cd client
npm run dev
# Ouvrir les outils de développement du navigateur
```

## 📚 API Reference

### Endpoints principaux

#### Authentification
```http
POST /api/admin/login
Content-Type: application/json

{
  "email": "admin@ads-saas.com",
  "password": "ADS2024Secure!"
}
```

#### Statistiques dashboard
```http
GET /api/admin/dashboard/stats
Authorization: Bearer <token>
```

#### Actions système
```http
POST /api/admin/system/action
Authorization: Bearer <token>
Content-Type: application/json

{
  "action": "clear_cache"
}
```

### Codes de réponse

- `200` - Succès
- `401` - Non authentifié
- `403` - Non autorisé
- `404` - Ressource non trouvée
- `500` - Erreur serveur

## 🔄 Maintenance

### Tâches régulières

#### Quotidiennes
- Vérifier les logs d'erreur
- Monitorer les performances
- Sauvegarder la base de données

#### Hebdomadaires
- Analyser les métriques
- Vérifier la sécurité
- Optimiser la base de données

#### Mensuelles
- Mettre à jour les dépendances
- Réviser les permissions
- Analyser les tendances

### Sauvegarde

```bash
# Sauvegarde automatique
cd server
node scripts/backup-database.js

# Restauration
npx prisma db push --force-reset
```

## 📞 Support

### Contact
- **Email:** support@ads-saas.com
- **Documentation:** `/docs`
- **Issues:** GitHub Issues

### Ressources
- [Documentation API](../docs/API.md)
- [Guide de déploiement](../docs/DEPLOYMENT.md)
- [Guide de sécurité](../docs/SECURITY.md)

---

**⚠️ Important:** Ce système d'administration donne un accès complet à la plateforme. Utilisez-le avec précaution et changez les mots de passe par défaut en production. 