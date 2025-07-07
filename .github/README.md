# 🤖 GitHub Actions - ADS SaaS

Ce dossier contient les workflows et configurations GitHub Actions pour le projet ADS SaaS.

## 📁 Structure

```
.github/
├── workflows/
│   ├── deploy.yml          # Pipeline CI/CD principal
│   └── debug-secrets.yml   # Workflow de debug temporaire
├── SECRETS.md              # Guide de configuration des secrets
├── ENVIRONMENT_SETUP.md    # Configuration des environnements GitHub Actions
└── README.md              # Ce fichier
```

## 🚀 Workflow Principal : `deploy.yml`

### Déclencheurs
- **Push** sur `main` → Déploiement en production
- **Push** sur `develop` → Déploiement en staging
- **Pull Request** vers `main` → Tests uniquement

### Étapes du Pipeline

#### 1. 🧪 Tests & Qualité (`test`)
- Installation des dépendances client/serveur
- Vérification TypeScript
- Linting du code
- Build du frontend
- Audit de sécurité
- Upload coverage vers Codecov (optionnel)

#### 2. 🏗️ Build Images (`build`)
- Construction des images Docker
- Push vers GitHub Container Registry
- Cache des layers pour optimisation

#### 3. 🚀 Déploiement Staging (`deploy-staging`)
- **Condition** : Push sur `develop`
- Déploiement SSH vers serveur staging
- Tests post-déploiement
- Notification Slack (optionnelle)

#### 4. 🏭 Déploiement Production (`deploy-production`)
- **Condition** : Push sur `main`
- Scan de sécurité avec Trivy
- Mode maintenance temporaire
- Déploiement avec rollback automatique
- Tests de santé post-déploiement
- Notifications Discord/Slack (optionnelles)

#### 5. ⚡ Tests de Performance (`performance-tests`)
- **Condition** : Après déploiement production
- Audit Lighthouse
- Tests de charge avec k6
- Génération de rapports

## 🔍 Workflow de Debug : `debug-secrets.yml`

Workflow temporaire pour diagnostiquer les problèmes de configuration :
- **Déclenchement** : Manuel uniquement (`workflow_dispatch`)
- **Tests** : Vérification des secrets et connexions SSH
- **Rapport** : Génération automatique de rapport de debug
- **À supprimer** : Une fois les environnements configurés

### Utilisation
1. Aller dans `Actions` → `Debug Secrets Configuration`
2. Cliquer sur "Run workflow"
3. Choisir l'environnement à tester (staging/production)
4. Analyser les résultats et suivre les recommandations

## 🔧 Configuration Requise

### Documentation de Configuration
- 📚 [SECRETS.md](./SECRETS.md) - Guide des secrets GitHub
- 🌍 [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) - Configuration des environnements

### Secrets Obligatoires
- Credentials SSH pour staging et production
- Variables d'environnement des serveurs

### Secrets Optionnels
- Webhooks pour notifications
- Tokens pour intégrations externes

### 🚨 Erreurs "Context access might be invalid"
Si vous rencontrez ces erreurs, consultez le [guide des environnements](./ENVIRONMENT_SETUP.md) qui explique :
- Comment créer les environnements GitHub Actions
- Comment configurer les secrets au bon niveau
- Comment résoudre les problèmes d'accès aux secrets

**Solution rapide** : Utilisez le workflow de debug pour identifier les secrets manquants !

## 🛠️ Personnalisation

### Modifier les Environnements
Éditez les variables dans `deploy.yml` :
```yaml
env:
  NODE_VERSION: '18'
  REGISTRY: ghcr.io
  IMAGE_NAME: ads-saas
```

### Ajouter des Étapes
Ajoutez de nouveaux jobs ou steps selon vos besoins :
```yaml
my-custom-job:
  name: 🔄 Custom Job
  runs-on: ubuntu-latest
  needs: test
  steps:
    - name: Custom Step
      run: echo "Hello World"
```

## 📊 Monitoring

### Notifications
- **Staging** : Slack uniquement
- **Production** : Discord + Slack
- **Échecs** : Notifications automatiques avec détails

### Métriques
- Durée des déploiements
- Statut des health checks
- Performance Lighthouse
- Résultats des tests de charge

## 🔍 Debugging

### Logs Détaillés
Activez les logs détaillés en ajoutant :
```yaml
env:
  ACTIONS_STEP_DEBUG: true
```

### Runner en Local
Utilisez `act` pour tester localement :
```bash
# Installer act
brew install act

# Tester le workflow
act -j test
```

## 📈 Optimisations

### Cache
- Cache npm automatique
- Cache Docker layers
- Cache des builds entre runs

### Parallélisation
- Tests client/serveur en parallèle
- Build des images simultané
- Déploiements conditionnels

## 🚨 Sécurité

### Bonnes Pratiques
- ✅ Secrets jamais en plain text
- ✅ Scans de sécurité automatiques
- ✅ Authentification SSH par clés
- ✅ Rollback automatique en cas d'échec

### Permissions Minimales
Le workflow utilise uniquement les permissions nécessaires :
- `contents: read` pour checkout
- `packages: write` pour registry
- Secrets limités par environnement

---

📚 **Documentation** : [Guide de Déploiement](../docs/DEPLOYMENT.md)
🔧 **Support** : Voir les issues GitHub pour assistance 