# Configuration Unifiée du Fichier .env

## Vue d'ensemble

Ce document explique comment configurer et utiliser le fichier `.env` unifié à la racine du projet ADS SaaS, ainsi que la nouvelle documentation interactive de l'API.

## 📁 Structure du Fichier .env

Le fichier `.env` est situé à la racine du projet et est utilisé par tous les services :

```
ADS/
├── .env                    # ← Fichier de configuration unifié
├── client/                 # Frontend Next.js
├── server/                 # Backend Express.js
├── docker-compose.yml      # Configuration Docker
└── scripts/                # Scripts utilitaires
```

## 🔧 Variables d'Environnement

### Variables Requises (Backend)

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DATABASE_URL` | URL de connexion PostgreSQL | `postgresql://user:pass@localhost:5432/ads_saas` |
| `JWT_SECRET` | Clé secrète pour les tokens JWT | `your-super-secret-jwt-key` |
| `JWT_REFRESH_SECRET` | Clé secrète pour les refresh tokens | `your-refresh-secret-key` |
| `PORT` | Port du serveur backend | `8000` |

### Variables Recommandées

| Variable | Description | Exemple |
|----------|-------------|---------|
| `REDIS_URL` | URL de connexion Redis | `redis://:password@localhost:6379` |
| `EMAIL_SMTP_HOST` | Hôte SMTP pour les emails | `smtp.gmail.com` |
| `EMAIL_SMTP_USER` | Utilisateur SMTP | `your-email@gmail.com` |
| `EMAIL_SMTP_PASSWORD` | Mot de passe SMTP | `your-app-password` |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe | `sk_test_...` |
| `SENTRY_DSN` | DSN Sentry pour monitoring | `https://...@sentry.io/...` |
| `NODE_ENV` | Environnement | `development` ou `production` |

### Variables Frontend (NEXT_PUBLIC_)

| Variable | Description | Exemple |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | URL de l'API backend | `http://localhost:8000` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Clé publique Stripe | `pk_test_...` |
| `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` | ID Google Analytics | `G-XXXXXXXXXX` |

### Variables Docker

| Variable | Description | Exemple |
|----------|-------------|---------|
| `POSTGRES_DB` | Nom de la base de données | `ads_saas` |
| `POSTGRES_USER` | Utilisateur PostgreSQL | `ads_user` |
| `POSTGRES_PASSWORD` | Mot de passe PostgreSQL | `secure_password` |
| `REDIS_PASSWORD` | Mot de passe Redis | `redis_password` |
| `GRAFANA_PASSWORD` | Mot de passe Grafana | `admin` |

## 🚀 Utilisation

### 1. Vérification de la Configuration

```bash
# Vérifier la configuration .env
node scripts/check-env.js

# Ou via le script principal
./run.sh
# Puis choisir l'option 16) 🔍 Vérifier config serveur
```

### 2. Démarrage des Services

```bash
# Démarrage complet
./run.sh
# Puis choisir l'option 1) 🚀 Démarrer l'application complète

# Ou via Docker
docker-compose up -d
```

### 3. Accès à la Documentation Interactive

Une fois les services démarrés, accédez à :

- **Documentation Interactive** : http://localhost:8000/api/docs
- **Documentation JSON** : http://localhost:8000/api/docs.json
- **Variables d'Environnement** : http://localhost:8000/api/env

## 📖 Documentation Interactive de l'API

### Fonctionnalités

La nouvelle documentation interactive inclut :

1. **Interface Swagger UI** : Interface web interactive pour tester l'API
2. **Documentation complète** : Tous les endpoints avec exemples
3. **Authentification** : Support des tokens JWT
4. **Variables d'environnement** : Affichage sécurisé de la configuration
5. **Tests en direct** : Possibilité de tester les endpoints directement

### Endpoints Principaux

#### Authentification
- `POST /api/auth/register` - Créer un compte
- `POST /api/auth/login` - Se connecter
- `POST /api/auth/refresh` - Renouveler le token
- `POST /api/auth/logout` - Se déconnecter

#### Utilisateurs
- `GET /api/users/me` - Profil utilisateur
- `PUT /api/users/me` - Mettre à jour le profil
- `DELETE /api/users/me` - Supprimer le compte

#### Campagnes
- `GET /api/campaigns` - Liste des campagnes
- `POST /api/campaigns` - Créer une campagne
- `GET /api/campaigns/:id` - Détails d'une campagne
- `PUT /api/campaigns/:id` - Mettre à jour une campagne
- `DELETE /api/campaigns/:id` - Supprimer une campagne

#### Analytics
- `GET /api/analytics/dashboard` - Données du tableau de bord
- `GET /api/analytics/campaigns/:id` - Analytics d'une campagne

#### Configuration
- `GET /api/env` - Variables d'environnement (sécurisé)

## 🔒 Sécurité

### Variables Sensibles

Les variables sensibles sont masquées dans la documentation :

- Mots de passe (affichés comme `********`)
- Clés secrètes (affichées comme `********`)
- Tokens (affichés comme `********`)

### Authentification

La plupart des endpoints nécessitent un token JWT :

```bash
# Obtenir un token
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Utiliser le token
curl -X GET http://localhost:8000/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🛠️ Dépannage

### Problèmes Courants

1. **Serveur ne démarre pas**
   ```bash
   # Vérifier la configuration
   node scripts/check-env.js
   
   # Vérifier les logs
   ./run.sh logs-server
   ```

2. **Variables non trouvées**
   ```bash
   # Vérifier le chemin du .env
   ls -la .env
   
   # Vérifier le contenu (sans afficher les secrets)
   grep -v "SECRET\|PASSWORD" .env
   ```

3. **Documentation non accessible**
   ```bash
   # Vérifier que le serveur fonctionne
   curl http://localhost:8000/health
   
   # Vérifier la documentation
   curl http://localhost:8000/api/docs.json
   ```

### Logs Utiles

```bash
# Logs du serveur
./run.sh logs-server

# Logs du client
./run.sh logs-client

# Logs Docker
docker-compose logs -f
```

## 📝 Exemple de Fichier .env

```env
# ========================================
# Configuration ADS SaaS
# ========================================

# Environnement
NODE_ENV=development
PORT=8000

# Base de données
DATABASE_URL=postgresql://ads_user:secure_password@localhost:5432/ads_saas
POSTGRES_DB=ads_saas
POSTGRES_USER=ads_user
POSTGRES_PASSWORD=secure_password

# Redis
REDIS_URL=redis://:redis_password@localhost:6379
REDIS_PASSWORD=redis_password

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production

# Email
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=your-email@gmail.com
EMAIL_SMTP_PASSWORD=your-app-password

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# Monitoring
SENTRY_DSN=https://your-sentry-dsn
GRAFANA_PASSWORD=admin

# URLs
FRONTEND_URL=http://localhost:3000
API_URL=http://localhost:8000
```

## 🔄 Mise à Jour

Pour mettre à jour la configuration :

1. Modifiez le fichier `.env`
2. Redémarrez les services :
   ```bash
   ./run.sh restart
   ```
3. Vérifiez la configuration :
   ```bash
   node scripts/check-env.js
   ```

## 📞 Support

Pour toute question sur la configuration :

1. Consultez cette documentation
2. Vérifiez les logs avec `./run.sh logs-server`
3. Testez la configuration avec `node scripts/check-env.js`
4. Consultez la documentation interactive : http://localhost:8000/api/docs 