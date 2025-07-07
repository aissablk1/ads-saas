# 🚀 Guide de Déploiement Complet - ADS SaaS

Ce guide détaille l'ensemble du processus de déploiement du SaaS ADS, de l'environnement de développement à la production.

## 📋 Table des Matières

1. [Prérequis](#-prérequis)
2. [Configuration Initiale](#-configuration-initiale)
3. [Déploiement Local](#-déploiement-local)
4. [Déploiement Production](#-déploiement-production)
5. [Monitoring & Maintenance](#-monitoring--maintenance)
6. [Sécurité](#-sécurité)
7. [Troubleshooting](#-troubleshooting)

---

## 🔧 Prérequis

### Système
- **OS**: Ubuntu 20.04+ / CentOS 8+ / macOS 12+
- **RAM**: Minimum 4GB (8GB recommandé)
- **Stockage**: Minimum 20GB SSD
- **CPU**: 2 cores minimum (4+ recommandé)

### Logiciels Requis
```bash
# Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER

# Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Node.js (pour le développement)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Git
sudo apt-get install git -y
```

---

## ⚙️ Configuration Initiale

### 1. Cloner le Repository
```bash
git clone https://github.com/votre-org/ads-saas.git
cd ads-saas
```

### 2. Configuration des Variables d'Environnement
```bash
# Copier le template d'environnement
cp .env.example .env.production

# Éditer les variables
nano .env.production
```

**Variables essentielles à configurer :**
```env
# Base de données
POSTGRES_PASSWORD=VotreMotDePasseSecurise123!
DATABASE_URL=postgresql://ads_user_prod:VotreMotDePasseSecurise123!@postgres:5432/ads_saas_prod

# JWT Secrets (générer avec: openssl rand -base64 32)
JWT_SECRET=votre_jwt_secret_32_caracteres_minimum
JWT_REFRESH_SECRET=votre_refresh_secret_32_caracteres

# Email
EMAIL_SMTP_USER=noreply@votre-domaine.com
EMAIL_SMTP_PASSWORD=votre_mot_de_passe_email

# Stripe
STRIPE_SECRET_KEY=sk_live_votre_cle_stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_votre_cle_publique

# URLs
NEXT_PUBLIC_API_URL=https://api.votre-domaine.com
NEXT_PUBLIC_APP_URL=https://votre-domaine.com
```

### 3. Rendre les Scripts Exécutables
```bash
chmod +x scripts/*.sh
```

---

## 🏠 Déploiement Local

### Développement
```bash
# Démarrer en mode développement
npm run dev

# Ou avec Docker
docker-compose -f docker-compose.dev.yml up
```

### Test de Production Local
```bash
# Build et démarrage
./scripts/deploy.sh

# Vérifier les services
docker-compose ps

# Vérifier les logs
docker-compose logs -f
```

---

## 🌐 Déploiement Production

### 1. Préparation du Serveur

#### Configuration DNS
```bash
# Pointer le domaine vers votre serveur
# A Record: votre-domaine.com -> IP_SERVEUR
# CNAME: www.votre-domaine.com -> votre-domaine.com
# CNAME: api.votre-domaine.com -> votre-domaine.com
```

#### Sécurisation du Serveur
```bash
# Mise à jour système
sudo apt update && sudo apt upgrade -y

# Firewall
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https

# Fail2Ban (protection contre brute force)
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
```

### 2. Configuration SSL
```bash
# Configuration automatique avec Let's Encrypt
./scripts/setup-ssl.sh setup votre-domaine.com contact@votre-domaine.com

# Test en mode staging (recommandé d'abord)
./scripts/setup-ssl.sh setup votre-domaine.com contact@votre-domaine.com true
```

### 3. Déploiement de l'Application
```bash
# Déploiement complet
./scripts/deploy.sh deploy

# Vérification de la santé
./scripts/deploy.sh health

# Voir les statuts
./scripts/deploy.sh status
```

### 4. Configuration CI/CD (GitHub Actions)

#### Secrets GitHub à configurer :
```yaml
# Serveurs
STAGING_HOST: ip-staging
STAGING_USER: deploy
STAGING_SSH_KEY: clé_ssh_privée
STAGING_PORT: 22

PRODUCTION_HOST: ip-production
PRODUCTION_USER: deploy
PRODUCTION_SSH_KEY: clé_ssh_privée
PRODUCTION_PORT: 22

# Variables d'environnement
STAGING_ENV: contenu_du_.env.staging
PRODUCTION_ENV: contenu_du_.env.production

# Notifications
SLACK_WEBHOOK: https://hooks.slack.com/...
DISCORD_WEBHOOK: https://discord.com/api/webhooks/...

# Monitoring
SENTRY_DSN: https://votre-sentry-dsn
CODECOV_TOKEN: votre-token-codecov
```

---

## 📊 Monitoring & Maintenance

### Services de Monitoring Inclus

#### Grafana (Dashboards)
- URL: `https://votre-domaine.com:3001`
- Login: `admin` / `password_from_env`
- Dashboards préconfigurés pour infrastructure et application

#### Prometheus (Métriques)
- URL: `https://votre-domaine.com:9090`
- Collecte automatique des métriques système et application

### Commandes de Maintenance

```bash
# Vérifier la santé des services
./scripts/deploy.sh health

# Voir les logs en temps réel
./scripts/deploy.sh logs

# Créer une sauvegarde manuelle
./scripts/deploy.sh backup

# Effectuer un rollback
./scripts/deploy.sh rollback

# Renouveler les certificats SSL
./scripts/renew-ssl.sh
```

### Sauvegardes Automatiques

Les sauvegardes sont configurées automatiquement :
- **Base de données** : Quotidienne à 2h00
- **Fichiers** : Quotidienne à 2h00
- **Rétention** : 30 jours
- **Stockage** : Local + S3 (si configuré)

### Alertes Configurées

Le système surveille automatiquement :
- **Infrastructure** : CPU, RAM, disque, services down
- **Application** : Erreurs HTTP, temps de réponse, taux de conversion
- **Sécurité** : Tentatives de connexion suspectes, certificats SSL
- **Business** : Inscriptions, paiements, performances

---

## 🔒 Sécurité

### Mesures Implémentées

#### Authentification & Autorisation
- JWT avec refresh tokens
- Rate limiting sur les APIs sensibles
- Validation stricte des données d'entrée
- Sessions sécurisées avec timeout

#### Protection Réseau
- Reverse proxy Nginx avec configuration sécurisée
- Headers de sécurité (CSP, HSTS, etc.)
- Rate limiting par IP
- Certificats SSL automatiques

#### Sécurité des Données
- Chiffrement en transit (HTTPS)
- Chiffrement au repos (base de données)
- Sanitisation XSS
- Protection CSRF

### Bonnes Pratiques

```bash
# Mise à jour régulière des dépendances
npm audit fix

# Scan de sécurité des containers
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image ads-saas-client:latest

# Vérification des logs de sécurité
tail -f nginx/logs/access.log | grep -E "40[0-9]|50[0-9]"
```

---

## 🔧 Troubleshooting

### Problèmes Courants

#### 1. Service ne démarre pas
```bash
# Vérifier les logs
docker-compose logs nom-du-service

# Vérifier l'espace disque
df -h

# Vérifier la RAM
free -m

# Redémarrer un service spécifique
docker-compose restart nom-du-service
```

#### 2. Base de données inaccessible
```bash
# Vérifier le statut PostgreSQL
docker-compose exec postgres pg_isready

# Se connecter à la base
docker-compose exec postgres psql -U ads_user -d ads_saas

# Voir les connexions actives
docker-compose exec postgres psql -U ads_user -d ads_saas -c "SELECT * FROM pg_stat_activity;"
```

#### 3. Certificat SSL expiré
```bash
# Vérifier l'expiration
openssl x509 -in nginx/ssl/cert.pem -text -noout | grep "Not After"

# Renouveler manuellement
./scripts/setup-ssl.sh renew
```

#### 4. Performances dégradées
```bash
# Vérifier les métriques
curl https://votre-domaine.com:9090/metrics

# Analyser les logs Nginx
tail -f nginx/logs/access.log | grep -E "slow|error"

# Redimensionner si nécessaire
docker-compose up -d --scale server=2
```

### Contacts d'Urgence

Pour les problèmes critiques en production :
- **Technique** : tech@votre-domaine.com
- **Business** : support@votre-domaine.com
- **Sécurité** : security@votre-domaine.com

### Logs Importants

```bash
# Logs application
tail -f ./logs/deploy.log
tail -f ./logs/ssl-renewal.log

# Logs système
journalctl -u docker
journalctl -f

# Logs containers
docker-compose logs --tail=100 -f
```

---

## 📈 Optimisations de Performance

### Frontend (Next.js)
- **Build statique** optimisé avec `output: 'standalone'`
- **Images** optimisées avec WebP/AVIF
- **Cache** agressif pour les assets statiques
- **Bundle splitting** intelligent

### Backend (Express.js)
- **Connection pooling** PostgreSQL
- **Cache Redis** pour les sessions et données fréquentes
- **Compression gzip** activée
- **Health checks** configurés

### Infrastructure
- **Nginx** comme reverse proxy avec cache
- **CDN** ready (configuration incluse)
- **Load balancing** horizontal possible
- **Auto-scaling** avec Docker Swarm (optionnel)

---

## 🎯 Checklist de Déploiement

### Avant le Déploiement
- [ ] Variables d'environnement configurées
- [ ] DNS configuré et propagé
- [ ] Certificats SSL obtenus
- [ ] Sauvegardes fonctionnelles
- [ ] Tests de charge passés
- [ ] Monitoring configuré

### Pendant le Déploiement
- [ ] Services démarrés sans erreur
- [ ] Health checks OK
- [ ] Base de données migrée
- [ ] Cache Redis opérationnel
- [ ] SSL fonctionnel

### Après le Déploiement
- [ ] Tests de fumée passés
- [ ] Monitoring actif
- [ ] Alertes configurées
- [ ] Documentation à jour
- [ ] Équipe informée

---

**🎉 Félicitations ! Votre SaaS ADS est maintenant déployé et prêt pour la production !**

Pour toute question ou support, consultez la documentation technique ou contactez l'équipe de développement. 