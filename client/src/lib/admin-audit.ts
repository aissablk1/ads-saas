// Utilitaire pour l'audit des actions administrateur

export interface AuditAction {
  action: string
  details: any
  severity?: 'low' | 'medium' | 'high' | 'critical'
}

export const logAdminAction = async (auditAction: AuditAction): Promise<void> => {
  try {
    const response = await fetch('/api/admin/audit-log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(auditAction)
    })

    if (!response.ok) {
      console.warn('Échec de l\'enregistrement de l\'audit:', auditAction.action)
    }
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de l\'audit:', error)
  }
}

// Actions d'audit prédéfinies
export const AUDIT_ACTIONS = {
  // Authentification
  LOGIN: 'admin.login',
  LOGOUT: 'admin.logout',
  SESSION_EXPIRED: 'admin.session_expired',
  
  // Gestion utilisateurs
  USER_CREATED: 'admin.user.created',
  USER_UPDATED: 'admin.user.updated',
  USER_DELETED: 'admin.user.deleted',
  USER_SUSPENDED: 'admin.user.suspended',
  USER_ACTIVATED: 'admin.user.activated',
  PASSWORD_RESET: 'admin.user.password_reset',
  
  // Gestion partenaires
  PARTNER_CREATED: 'admin.partner.created',
  PARTNER_UPDATED: 'admin.partner.updated',
  PARTNER_DELETED: 'admin.partner.deleted',
  API_KEY_REVOKED: 'admin.partner.api_key_revoked',
  API_KEY_REGENERATED: 'admin.partner.api_key_regenerated',
  
  // Actions système
  SYSTEM_RESTART: 'admin.system.restart',
  SYSTEM_SHUTDOWN: 'admin.system.shutdown',
  CACHE_CLEARED: 'admin.system.cache_cleared',
  BACKUP_CREATED: 'admin.system.backup_created',
  MAINTENANCE_MODE_TOGGLED: 'admin.system.maintenance_mode',
  
  // Sécurité
  SECURITY_ALERT: 'admin.security.alert',
  PERMISSION_CHANGED: 'admin.security.permission_changed',
  ACCESS_DENIED: 'admin.security.access_denied',
  
  // Configuration
  CONFIG_UPDATED: 'admin.config.updated',
  SETTINGS_CHANGED: 'admin.settings.changed',
  
  // Monitoring
  ALERT_ACKNOWLEDGED: 'admin.alert.acknowledged',
  METRICS_EXPORTED: 'admin.metrics.exported',
  
  // Maintenance
  MAINTENANCE_STARTED: 'admin.maintenance.started',
  MAINTENANCE_COMPLETED: 'admin.maintenance.completed',
  DIAGNOSTIC_RUN: 'admin.maintenance.diagnostic',
  
  // Données
  DATA_EXPORTED: 'admin.data.exported',
  DATA_IMPORTED: 'admin.data.imported',
  DATA_DELETED: 'admin.data.deleted',
  
  // Intégrations
  INTEGRATION_ADDED: 'admin.integration.added',
  INTEGRATION_REMOVED: 'admin.integration.removed',
  INTEGRATION_UPDATED: 'admin.integration.updated',
  
  // Analytics
  REPORT_GENERATED: 'admin.analytics.report_generated',
  DASHBOARD_CUSTOMIZED: 'admin.analytics.dashboard_customized',
  
  // Audit
  AUDIT_LOG_EXPORTED: 'admin.audit.exported',
  AUDIT_LOG_CLEARED: 'admin.audit.cleared'
} as const

// Fonctions d'aide pour les actions courantes
export const auditHelpers = {
  // Authentification
  logLogin: (username: string) => logAdminAction({
    action: AUDIT_ACTIONS.LOGIN,
    details: { username },
    severity: 'medium'
  }),

  logLogout: (username: string) => logAdminAction({
    action: AUDIT_ACTIONS.LOGOUT,
    details: { username },
    severity: 'low'
  }),

  // Utilisateurs
  logUserAction: (action: string, userId: string, details: any) => logAdminAction({
    action: `admin.user.${action}`,
    details: { userId, ...details },
    severity: 'high'
  }),

  // Partenaires
  logPartnerAction: (action: string, partnerId: string, details: any) => logAdminAction({
    action: `admin.partner.${action}`,
    details: { partnerId, ...details },
    severity: 'high'
  }),

  // Système
  logSystemAction: (action: string, details: any) => logAdminAction({
    action: `admin.system.${action}`,
    details,
    severity: 'critical'
  }),

  // Sécurité
  logSecurityEvent: (event: string, details: any) => logAdminAction({
    action: `admin.security.${event}`,
    details,
    severity: 'high'
  }),

  // Configuration
  logConfigChange: (setting: string, oldValue: any, newValue: any) => logAdminAction({
    action: AUDIT_ACTIONS.CONFIG_UPDATED,
    details: { setting, oldValue, newValue },
    severity: 'medium'
  }),

  // Maintenance
  logMaintenanceAction: (action: string, details: any) => logAdminAction({
    action: `admin.maintenance.${action}`,
    details,
    severity: 'medium'
  }),

  // Données
  logDataAction: (action: string, details: any) => logAdminAction({
    action: `admin.data.${action}`,
    details,
    severity: 'high'
  }),

  // Intégrations
  logIntegrationAction: (action: string, integrationId: string, details: any) => logAdminAction({
    action: `admin.integration.${action}`,
    details: { integrationId, ...details },
    severity: 'medium'
  }),

  // Analytics
  logAnalyticsAction: (action: string, details: any) => logAdminAction({
    action: `admin.analytics.${action}`,
    details,
    severity: 'low'
  })
}

// Fonction pour récupérer les logs d'audit
export const getAuditLogs = async (params?: {
  limit?: number
  offset?: number
  severity?: 'low' | 'medium' | 'high' | 'critical'
  action?: string
}) => {
  try {
    const searchParams = new URLSearchParams()
    
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.offset) searchParams.append('offset', params.offset.toString())
    if (params?.severity) searchParams.append('severity', params.severity)
    if (params?.action) searchParams.append('action', params.action)

    const response = await fetch(`/api/admin/audit-log?${searchParams.toString()}`)
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des logs')
    }

    return await response.json()
  } catch (error) {
    console.error('Erreur lors de la récupération des logs d\'audit:', error)
    throw error
  }
}

// Fonction pour exporter les logs d'audit
export const exportAuditLogs = async (format: 'json' | 'csv' = 'json') => {
  try {
    const logs = await getAuditLogs({ limit: 1000 })
    
    if (format === 'csv') {
      const csvContent = convertLogsToCSV(logs.logs)
      downloadFile(csvContent, 'audit-logs.csv', 'text/csv')
    } else {
      downloadFile(JSON.stringify(logs.logs, null, 2), 'audit-logs.json', 'application/json')
    }

    // Enregistrer l'action d'export
    await logAdminAction({
      action: AUDIT_ACTIONS.AUDIT_LOG_EXPORTED,
      details: { format, count: logs.logs.length },
      severity: 'low'
    })
  } catch (error) {
    console.error('Erreur lors de l\'export des logs:', error)
    throw error
  }
}

// Fonctions utilitaires
const convertLogsToCSV = (logs: any[]) => {
  const headers = ['ID', 'Timestamp', 'Action', 'Severity', 'User ID', 'Session ID', 'IP Address', 'Details']
  const rows = logs.map(log => [
    log.id,
    log.timestamp,
    log.action,
    log.severity,
    log.userId,
    log.sessionId,
    log.ipAddress,
    JSON.stringify(log.details)
  ])
  
  return [headers, ...rows].map(row => row.join(',')).join('\n')
}

const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
} 