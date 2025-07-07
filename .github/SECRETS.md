# 🔐 Configuration des Secrets - ADS SaaS

Ce document explique comment configurer les secrets et environnements nécessaires pour les workflows GitHub Actions.

## 📋 Vue d'ensemble

Le projet utilise deux environnements principaux :
- **staging** : Environnement de test/développement
- **production** : Environnement de production

## 🔧 Configuration des Environnements

### 1. Créer les Environnements

1. Allez dans **Settings** → **Environments**
2. Créez deux environnements :
   - `staging`
   - `production`

### 2. Configuration de l'Environnement Staging

Dans l'environnement `staging`, configurez les secrets suivants :

#### Secrets Obligatoires
```
STAGING_HOST          # Adresse IP ou domaine du serveur staging
STAGING_USER          # Nom d'utilisateur SSH
STAGING_SSH_KEY       # Clé privée SSH (format PEM)
STAGING_PORT          # Port SSH (optionnel, défaut: 22)
STAGING_ENV           # Variables d'environnement (format .env)
```

#### Exemple de STAGING_ENV
```env
NODE_ENV=staging
DATABASE_URL=postgresql://user:password@localhost:5432/ads_staging
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-staging-jwt-secret
API_BASE_URL=https://staging.ads-saas.com
```

### 3. Configuration de l'Environnement Production

Dans l'environnement `production`, configurez les secrets suivants :

#### Secrets Obligatoires
```
PRODUCTION_HOST       # Adresse IP ou domaine du serveur production
PRODUCTION_USER       # Nom d'utilisateur SSH
PRODUCTION_SSH_KEY    # Clé privée SSH (format PEM)
PRODUCTION_PORT       # Port SSH (optionnel, défaut: 22)
PRODUCTION_ENV        # Variables d'environnement (format .env)
```

#### Exemple de PRODUCTION_ENV
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@prod-db:5432/ads_production
REDIS_URL=redis://prod-redis:6379
JWT_SECRET=your-production-jwt-secret-very-secure
API_BASE_URL=https://ads-saas.com
```

## 📡 Secrets Optionnels (Niveau Repository)

Ces secrets sont configurés au niveau du repository (pas dans les environnements) :

```
CODECOV_TOKEN         # Token pour upload des métriques de couverture
SLACK_WEBHOOK         # URL webhook Slack pour notifications
DISCORD_WEBHOOK       # URL webhook Discord pour notifications
METRICS_API_KEY       # Clé API pour envoyer des métriques
```

## 🔑 Génération des Clés SSH

### 1. Générer une paire de clés SSH

```bash
# Générer une nouvelle clé SSH
ssh-keygen -t rsa -b 4096 -f ~/.ssh/ads_deploy -N ""

# Afficher la clé publique (à ajouter sur le serveur)
cat ~/.ssh/ads_deploy.pub

# Afficher la clé privée (à ajouter dans les secrets GitHub)
cat ~/.ssh/ads_deploy
```

### 2. Configurer la clé sur le serveur

```bash
# Sur le serveur staging/production
mkdir -p ~/.ssh
echo "YOUR_PUBLIC_KEY_CONTENT" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

## 🚀 Configuration des Serveurs

### Structure attendue sur les serveurs

```
/opt/ads-saas/
├── .env.production           # Variables d'environnement
├── docker-compose.yml        # Configuration Docker
├── scripts/
│   └── deploy.sh            # Script de déploiement
└── ... (autres fichiers)
```

### Script de déploiement minimal

Assurez-vous que le script `scripts/deploy.sh` existe et est exécutable :

```bash
#!/bin/bash
set -e

case "$1" in
  "deploy")
    echo "🚀 Déploiement en cours..."
    docker-compose down
    docker-compose pull
    docker-compose up -d
    echo "✅ Déploiement terminé"
    ;;
  "backup")
    echo "💾 Sauvegarde en cours..."
    # Vos commandes de sauvegarde ici
    ;;
  "rollback")
    echo "🔄 Rollback en cours..."
    # Vos commandes de rollback ici
    ;;
  *)
    echo "Usage: $0 {deploy|backup|rollback}"
    exit 1
    ;;
esac
```

## 🧪 Test de Configuration

Utilisez le workflow `debug-secrets.yml` pour tester votre configuration :

1. Allez dans **Actions**
2. Sélectionnez **Debug Secrets Configuration**
3. Cliquez **Run workflow**
4. Choisissez l'environnement à tester
5. Consultez les logs pour identifier les problèmes

## 🔒 Bonnes Pratiques de Sécurité

### Clés SSH
- ✅ Utilisez des clés SSH dédiées pour le déploiement
- ✅ Limitez les permissions de la clé SSH sur le serveur
- ✅ Rotez régulièrement vos clés SSH
- ❌ Ne réutilisez pas vos clés personnelles

### Secrets
- ✅ Utilisez des secrets différents entre staging et production
- ✅ Utilisez des mots de passe/tokens forts et uniques
- ✅ Limitez l'accès aux environnements GitHub
- ❌ Ne committez jamais de secrets dans le code

### Variables d'Environnement
- ✅ Documentez toutes les variables requises
- ✅ Utilisez des valeurs par défaut sécurisées
- ✅ Validez la configuration au démarrage
- ❌ N'exposez pas de secrets dans les logs

## 📞 Dépannage

### Erreur "Context access might be invalid"
- Vérifiez que les secrets sont configurés dans le bon environnement
- Assurez-vous que les noms des secrets sont exacts (sensible à la casse)

### Erreur de connexion SSH
- Vérifiez que la clé SSH est correctement configurée
- Testez la connexion manuellement avec `ssh -i key user@host`
- Vérifiez les permissions du répertoire `.ssh`

### Workflow qui ne se déclenche pas
- Vérifiez les conditions `if` dans le workflow
- Assurez-vous que la branche correspond aux conditions
- Consultez l'onglet Actions pour voir les workflows ignorés

## 📚 Ressources

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [GitHub Environments Documentation](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
- [SSH Key Management Best Practices](https://docs.github.com/en/authentication/connecting-to-github-with-ssh) 