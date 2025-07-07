# 🔒 Sécurité de la Page de Contrôle Admin

## Vue d'ensemble

La page de contrôle admin (`/admin/`) est maintenant protégée par un système d'authentification robuste avec plusieurs couches de sécurité.

## 🛡️ Mesures de Sécurité Implémentées

### 1. Authentification Multi-Facteurs
- **Nom d'utilisateur et mot de passe** requis
- **Authentification à deux facteurs (2FA)** avec code TOTP
- **Code de test** : `123456` (à changer en production)

### 2. Protection contre les Attaques par Force Brute
- **Limitation des tentatives** : 5 tentatives maximum
- **Verrouillage automatique** : 15 minutes après échec
- **Compteur persistant** : stocké en localStorage
- **Déverrouillage automatique** avec compte à rebours

### 3. Gestion des Sessions Sécurisées
- **Tokens d'authentification** avec expiration (24h)
- **Validation automatique** des tokens à chaque accès
- **Déconnexion automatique** si token expiré
- **Nettoyage complet** des données de session

### 4. Headers de Sécurité
- **X-Frame-Options: DENY** - Protection contre le clickjacking
- **X-Content-Type-Options: nosniff** - Protection MIME
- **Content-Security-Policy** - Protection XSS
- **Referrer-Policy** - Contrôle des référents
- **Permissions-Policy** - Restrictions des permissions

### 5. Middleware de Protection
- **Vérification côté serveur** des tokens
- **Redirection automatique** vers login si non authentifié
- **Protection de toutes les routes** `/admin/*`

## 🔐 Credentials de Test

```typescript
Username: admin
Password: ADS2024Secure!
Code 2FA: 123456
```

## ⚠️ IMPORTANT - Production

### Changer les Credentials
1. Modifier `client/src/lib/admin-config.ts`
2. Changer le mot de passe par défaut
3. Générer un nouveau secret 2FA
4. Utiliser une vraie librairie TOTP

### Recommandations de Sécurité
1. **HTTPS obligatoire** en production
2. **Rate limiting** sur les endpoints de login
3. **Logs de sécurité** pour toutes les tentatives
4. **Monitoring** des accès admin
5. **Backup sécurisé** des credentials
6. **Rotation régulière** des mots de passe

## 🚀 Utilisation

### Accès à la Page de Contrôle
1. Aller sur `http://localhost:3000/admin/login`
2. Entrer les credentials
3. Entrer le code 2FA si demandé
4. Accès automatique à `/admin/`

### Déconnexion
- Cliquer sur l'icône de déconnexion dans la sidebar
- Ou aller directement sur `/admin/login`

## 🔧 Configuration

### Paramètres de Sécurité
```typescript
security: {
  maxLoginAttempts: 5,        // Tentatives max
  lockoutDuration: 15,        // Minutes de verrouillage
  sessionTimeout: 24,         // Heures de session
  requireTwoFactor: true      // 2FA obligatoire
}
```

### Permissions
```typescript
permissions: {
  superAdmin: ['*'],          // Toutes les permissions
  admin: [                    // Permissions limitées
    'users.read',
    'users.write',
    'system.read',
    'analytics.read',
    'maintenance.read'
  ]
}
```

## 🛠️ Développement

### Structure des Fichiers
```
client/src/
├── app/admin/
│   ├── login/page.tsx        # Page de connexion
│   ├── layout.tsx           # Layout avec protection
│   └── [autres pages]       # Pages protégées
├── components/
│   └── AdminAuthGuard.tsx   # Composant de protection
├── lib/
│   └── admin-config.ts      # Configuration sécurisée
└── middleware.ts            # Protection des routes
```

### Tests de Sécurité
1. **Test de force brute** : Essayer plus de 5 tentatives
2. **Test de session** : Vérifier l'expiration des tokens
3. **Test d'accès direct** : Essayer d'accéder à `/admin/` sans login
4. **Test de déconnexion** : Vérifier le nettoyage des données

## 📝 Logs de Sécurité

Les événements suivants sont loggés :
- Tentatives de connexion (réussies/échouées)
- Verrouillages de compte
- Expirations de session
- Accès non autorisés
- Déconnexions

## 🔄 Maintenance

### Rotation des Credentials
- Changer le mot de passe tous les 90 jours
- Régénérer le secret 2FA tous les 6 mois
- Révoquer les sessions anciennes

### Monitoring
- Surveiller les tentatives de connexion échouées
- Alerter en cas de verrouillage de compte
- Vérifier les accès depuis des IPs suspectes

---

**⚠️ ATTENTION** : Cette documentation contient des informations sensibles. Ne pas partager publiquement les credentials de production. 