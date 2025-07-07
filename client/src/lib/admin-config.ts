// Configuration sécurisée pour l'administration
// ⚠️ ATTENTION: En production, ces credentials doivent être stockés de manière sécurisée
// et ne jamais être exposés dans le code client

export interface AdminConfig {
  credentials: {
    username: string
    password: string
    twoFactorSecret: string
  }
  security: {
    maxLoginAttempts: number
    lockoutDuration: number // en minutes
    sessionTimeout: number // en heures
    requireTwoFactor: boolean
    passwordPolicy: {
      minLength: number
      requireUppercase: boolean
      requireLowercase: boolean
      requireNumbers: boolean
      requireSpecialChars: boolean
    }
  }
  permissions: {
    superAdmin: string[]
    admin: string[]
  }
  systemActions: {
    emergencyShutdown: SystemAction
    restartSystem: SystemAction
    clearCache: SystemAction
    backupDatabase: SystemAction
    maintenanceMode: SystemAction
  }
  userActions: {
    resetPassword: UserAction
    suspendUser: UserAction
    deleteUser: UserAction
  }
  partnerActions: {
    revokeApiKey: PartnerAction
    regenerateApiKey: PartnerAction
    deletePartner: PartnerAction
  }
  systemMetrics: {
    updateInterval: number
    thresholds: {
      cpu: {
        warning: number
        critical: number
      }
      memory: {
        warning: number
        critical: number
      }
      disk: {
        warning: number
        critical: number
      }
      network: {
        warning: number
        critical: number
      }
    }
  }
  alerts: {
    retentionDays: number
    severityLevels: {
      critical: { color: string; icon: string }
      high: { color: string; icon: string }
      medium: { color: string; icon: string }
      low: { color: string; icon: string }
    }
  }
  ui: {
    theme: string
    language: string
    refreshInterval: number
    autoLogout: number
    showRealTimeData: boolean
    enableAnimations: boolean
  }
  api: {
    baseUrl: string
    timeout: number
    retries: number
    endpoints: {
      auth: string
      users: string
      partners: string
      system: string
      analytics: string
      maintenance: string
    }
  }
}

export const ADMIN_CONFIG: AdminConfig = {
  credentials: {
    username: 'admin',
    password: 'ADS2024Secure!', // ⚠️ Changer en production
    twoFactorSecret: 'JBSWY3DPEHPK3PXP' // Secret 2FA de test
  },
  security: {
    maxLoginAttempts: 5,
    lockoutDuration: 15, // 15 minutes
    sessionTimeout: 24, // 24 heures
    requireTwoFactor: false,
    passwordPolicy: {
      minLength: 12,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true
    }
  },
  permissions: {
    superAdmin: [
      '*', // Toutes les permissions
      'system.control',
      'users.manage',
      'partners.manage',
      'security.admin',
      'maintenance.admin',
      'analytics.admin',
      'backup.admin',
      'emergency.admin'
    ],
    admin: [
      'users.read',
      'users.write',
      'system.read',
      'analytics.read',
      'maintenance.read',
      'security.read'
    ]
  },
  systemActions: {
    emergencyShutdown: {
      name: 'Arrêt d\'Urgence',
      description: 'Arrêt immédiat du système',
      requiresConfirmation: true,
      confirmationMessage: 'Êtes-vous sûr de vouloir arrêter le système ? Cette action est irréversible.',
      timeout: 2000
    },
    restartSystem: {
      name: 'Redémarrer Système',
      description: 'Redémarrage complet du système',
      requiresConfirmation: true,
      confirmationMessage: 'Le système va redémarrer. Toutes les sessions actives seront fermées.',
      timeout: 3000
    },
    clearCache: {
      name: 'Nettoyer Cache',
      description: 'Nettoyage complet du cache système',
      requiresConfirmation: false,
      timeout: 1500
    },
    backupDatabase: {
      name: 'Sauvegarde DB',
      description: 'Créer une sauvegarde de la base de données',
      requiresConfirmation: false,
      timeout: 5000
    },
    maintenanceMode: {
      name: 'Mode Maintenance',
      description: 'Activer le mode maintenance d\'urgence',
      requiresConfirmation: true,
      confirmationMessage: 'Le mode maintenance va limiter l\'accès aux utilisateurs.',
      timeout: 1000
    }
  },
  userActions: {
    resetPassword: {
      name: 'Réinitialiser Mot de Passe',
      description: 'Générer un nouveau mot de passe temporaire',
      requiresConfirmation: true,
      confirmationMessage: 'Un nouveau mot de passe temporaire sera envoyé par email.',
      timeout: 2000
    },
    suspendUser: {
      name: 'Suspendre Utilisateur',
      description: 'Suspendre temporairement l\'accès utilisateur',
      requiresConfirmation: true,
      confirmationMessage: 'L\'utilisateur sera suspendu et ne pourra plus se connecter.',
      timeout: 1500
    },
    deleteUser: {
      name: 'Supprimer Utilisateur',
      description: 'Supprimer définitivement l\'utilisateur',
      requiresConfirmation: true,
      confirmationMessage: 'Cette action est irréversible. Toutes les données utilisateur seront supprimées.',
      timeout: 1000
    }
  },
  partnerActions: {
    revokeApiKey: {
      name: 'Révoquer Clé API',
      description: 'Révoquer la clé API du partenaire',
      requiresConfirmation: true,
      confirmationMessage: 'La clé API sera révoquée immédiatement.',
      timeout: 2000
    },
    regenerateApiKey: {
      name: 'Régénérer Clé API',
      description: 'Générer une nouvelle clé API',
      requiresConfirmation: true,
      confirmationMessage: 'Une nouvelle clé API sera générée.',
      timeout: 2000
    },
    deletePartner: {
      name: 'Supprimer Partenaire',
      description: 'Supprimer définitivement le partenaire',
      requiresConfirmation: true,
      confirmationMessage: 'Cette action est irréversible.',
      timeout: 1000
    }
  },
  systemMetrics: {
    updateInterval: 5000, // ms
    thresholds: {
      cpu: {
        warning: 70,
        critical: 90
      },
      memory: {
        warning: 80,
        critical: 95
      },
      disk: {
        warning: 85,
        critical: 95
      },
      network: {
        warning: 80,
        critical: 95
      }
    }
  },
  alerts: {
    retentionDays: 30,
    severityLevels: {
      critical: { color: 'red', icon: 'ExclamationTriangleIcon' },
      high: { color: 'orange', icon: 'ExclamationTriangleIcon' },
      medium: { color: 'yellow', icon: 'ExclamationTriangleIcon' },
      low: { color: 'blue', icon: 'InformationCircleIcon' }
    }
  },
  ui: {
    theme: 'dark',
    language: 'fr',
    refreshInterval: 30000, // ms
    autoLogout: 3600000, // 1 heure
    showRealTimeData: true,
    enableAnimations: true
  },
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    timeout: 10000,
    retries: 3,
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      partners: '/api/partners',
      system: '/api/system',
      analytics: '/api/analytics',
      maintenance: '/api/maintenance'
    }
  }
}

// Types pour la configuration
export interface AdminCredentials {
  username: string
  password: string
  twoFactorSecret: string
  role: 'SUPER_ADMIN' | 'ADMIN'
  permissions: string[]
  lastLogin?: string
}

export interface SystemAction {
  name: string
  description: string
  requiresConfirmation: boolean
  confirmationMessage?: string
  timeout: number
}

export interface UserAction {
  name: string
  description: string
  requiresConfirmation: boolean
  confirmationMessage?: string
  timeout: number
}

export interface PartnerAction {
  name: string
  description: string
  requiresConfirmation: boolean
  confirmationMessage?: string
  timeout: number
}

// Fonctions utilitaires
export const validateAdminCredentials = (username: string, password: string): boolean => {
  return username === ADMIN_CONFIG.credentials.username && 
         password === ADMIN_CONFIG.credentials.password
}

export const hasPermission = (userPermissions: string[], requiredPermission: string): boolean => {
  return userPermissions.includes('*') || userPermissions.includes(requiredPermission)
}

export const getSystemStatus = () => {
  return {
    server: 'online',
    database: 'online',
    cache: 'online',
    queue: 'online',
    api: 'online'
  }
}

export const formatTimestamp = (timestamp: string): string => {
  return new Date(timestamp).toLocaleString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

export const getSeverityColor = (severity: string): string => {
  const colors = {
    critical: 'text-red-400',
    high: 'text-orange-400',
    medium: 'text-yellow-400',
    low: 'text-blue-400'
  }
  return colors[severity as keyof typeof colors] || 'text-gray-400'
}

export const getStatusColor = (value: number, thresholds: { warning: number; critical: number }): string => {
  if (value >= thresholds.critical) return 'text-red-400'
  if (value >= thresholds.warning) return 'text-yellow-400'
  return 'text-green-400'
}

// Fonction pour valider le code 2FA
export const validateTwoFactorCode = async (code: string): Promise<boolean> => {
  // En production, utiliser une vraie librairie TOTP
  return new Promise((resolve) => {
    setTimeout(() => {
      // Code de test: 123456
      resolve(code === '123456')
    }, 500)
  })
}

// Fonction pour générer un token sécurisé
export const generateAdminToken = (userData: any): string => {
  const tokenData = {
    username: userData.username,
    role: userData.role,
    permissions: userData.permissions,
    timestamp: Date.now(),
    expiresAt: Date.now() + (ADMIN_CONFIG.security.sessionTimeout * 60 * 60 * 1000)
  }
  
  return btoa(JSON.stringify(tokenData))
}

// Fonction pour vérifier la validité d'un token
export const validateAdminToken = (token: string): boolean => {
  try {
    const tokenData = JSON.parse(atob(token))
    return tokenData.expiresAt > Date.now()
  } catch {
    return false
  }
} 