# 🌍 Configuration des Environnements GitHub Actions

Ce guide explique comment configurer correctement les environnements GitHub Actions pour résoudre les erreurs de contexte d'accès invalide.

## 🚨 Problème : "Context access might be invalid"

Les erreurs de type "Context access might be invalid" se produisent quand :
- Les secrets ne sont pas définis au bon niveau (repository vs environnement)
- Les environnements GitHub Actions ne sont pas configurés
- Les secrets optionnels ne sont pas gérés gracieusement

## 🔧 Solution : Configuration des Environnements

### 1. Créer les Environnements GitHub

1. **Aller dans les paramètres du repository**
   ```
   Repository → Settings → Environments
   ```

2. **Créer l'environnement "staging"**
   - Cliquer sur "New environment"
   - Nom : `staging`
   - Optionnel : Ajouter des règles de protection (reviewers, branches)

3. **Créer l'environnement "production"**
   - Cliquer sur "New environment"
   - Nom : `production`
   - **Recommandé** : Ajouter des règles de protection :
     - Required reviewers (au moins 1)
     - Deployment branches : `main` uniquement

### 2. Configurer les Secrets par Environnement

#### Environnement "staging"
```
STAGING_HOST        # IP/domaine du serveur staging
STAGING_USER        # Utilisateur SSH staging
STAGING_SSH_KEY     # Clé SSH privée staging
STAGING_PORT        # Port SSH staging (optionnel, défaut: 22)
STAGING_ENV         # Variables d'environnement staging
SLACK_WEBHOOK       # Webhook Slack (optionnel)
```

#### Environnement "production"
```
PRODUCTION_HOST     # IP/domaine du serveur production
PRODUCTION_USER     # Utilisateur SSH production
PRODUCTION_SSH_KEY  # Clé SSH privée production
PRODUCTION_PORT     # Port SSH production (optionnel, défaut: 22)
PRODUCTION_ENV      # Variables d'environnement production
SLACK_WEBHOOK       # Webhook Slack (optionnel)
DISCORD_WEBHOOK     # Webhook Discord (optionnel)
METRICS_API_KEY     # Clé API métriques (optionnel)
```

#### Repository (niveau global)
```
GITHUB_TOKEN        # Automatiquement fourni par GitHub
CODECOV_TOKEN       # Token Codecov (optionnel)
```

### 3. Étapes Détaillées

#### Pour chaque environnement (staging/production) :

1. **Accéder aux secrets de l'environnement**
   ```
   Settings → Environments → [staging/production] → Add secret
   ```

2. **Ajouter les secrets obligatoires**
   - `STAGING_HOST` / `PRODUCTION_HOST`
   - `STAGING_USER` / `PRODUCTION_USER`
   - `STAGING_SSH_KEY` / `PRODUCTION_SSH_KEY`
   - `STAGING_ENV` / `PRODUCTION_ENV`

3. **Ajouter les secrets optionnels** (si nécessaire)
   - `SLACK_WEBHOOK`
   - `DISCORD_WEBHOOK`
   - `METRICS_API_KEY`

## 📋 Template de Secrets

### STAGING_ENV / PRODUCTION_ENV
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/ads_saas
JWT_SECRET=your-jwt-secret-here
REDIS_URL=redis://host:6379
API_BASE_URL=https://api.ads-saas.com
FRONTEND_URL=https://ads-saas.com

# Email configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@ads-saas.com
SMTP_PASS=your-smtp-password

# Third-party integrations
STRIPE_SECRET_KEY=sk_test_...
GOOGLE_ANALYTICS_ID=GA-...
```

### Clés SSH (STAGING_SSH_KEY / PRODUCTION_SSH_KEY)
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAFwAAAAdzc2gtcn
NhAAAAAwEAAQAAAQEAyOKdKjwm3h9k8y7VZ1xF2E5PmHEMqRHgJgGvPtFq5Y8bN3cRdF
... (votre clé SSH privée complète)
-----END OPENSSH PRIVATE KEY-----
```

## ✅ Vérification de la Configuration

### Méthode 1 : Déclenchement Manuel
1. Aller dans `Actions` → Workflow `CI/CD Pipeline`
2. Cliquer sur "Run workflow" 
3. Vérifier les logs pour s'assurer qu'aucune erreur d'authentification

### Méthode 2 : Push de Test
1. Créer une branche de test
2. Pousser vers `develop` (pour staging) ou `main` (pour production)
3. Observer l'exécution du workflow

### Méthode 3 : Logs de Debug
Ajouter temporairement dans le workflow :
```yaml
- name: 🔍 Debug Environment
  run: |
    echo "Environment: ${{ github.environment }}"
    echo "Ref: ${{ github.ref }}"
    echo "Has staging host: ${{ secrets.STAGING_HOST != '' }}"
    echo "Has production host: ${{ secrets.PRODUCTION_HOST != '' }}"
```

## 🚨 Dépannage

### Erreur : "Secret not found"
- ✅ Vérifiez que le secret est créé dans le bon environnement
- ✅ Vérifiez l'orthographe exacte du nom du secret
- ✅ Vérifiez que l'environnement est référencé dans le job

### Erreur : "Environment not found"
- ✅ Créez l'environnement dans `Settings → Environments`
- ✅ Vérifiez que le nom correspond exactement dans le workflow

### Erreur : "Context access might be invalid"
- ✅ Suivez ce guide pour configurer les environnements
- ✅ Utilisez `continue-on-error: true` pour les secrets optionnels
- ✅ Vérifiez les permissions du repository

## 📚 Bonnes Pratiques

### Sécurité
- 🔒 **Production** : Toujours avec protection et reviewers
- 🔒 **Secrets sensibles** : Jamais dans les logs ou en plain text
- 🔒 **Rotation** : Changer les clés SSH périodiquement

### Organisation
- 📁 **Secrets par environnement** : Séparation claire staging/production
- 📁 **Nommage cohérent** : Préfixes `STAGING_` et `PRODUCTION_`
- 📁 **Documentation** : Maintenir la liste des secrets à jour

### Monitoring
- 📊 **Notifications** : Configurer Slack/Discord pour les alertes
- 📊 **Logs** : Surveiller les échecs de déploiement
- 📊 **Rollback** : Tester la procédure de rollback

---

🔧 **Support** : Si les erreurs persistent, vérifiez les permissions du repository et contactez l'équipe DevOps. 