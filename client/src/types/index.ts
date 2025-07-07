// Types pour l'authentification
export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  avatar?: string
  role: 'USER' | 'ADMIN'
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  createdAt: string
  lastLogin?: string
  twoFactorEnabled?: boolean
  emailVerified?: boolean
  subscription?: Subscription
  _count?: {
    campaigns: number
    apiKeys: number
  }
}

export interface AuthResponse {
  message: string
  user: User
  accessToken: string
  refreshToken: string
}

// Types pour les campagnes
export interface Campaign {
  id: string
  name: string
  description?: string
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'
  budget: number
  spent: number
  impressions: number
  clicks: number
  conversions: number
  startDate?: string
  endDate?: string
  createdAt: string
  updatedAt: string
  userId: string
  ads?: Ad[]
  analytics?: Analytics[]
  _count?: {
    ads: number
  }
}

export interface CampaignFormData {
  name: string
  description?: string
  budget: number
  startDate?: string
  endDate?: string
}

// Types pour les annonces
export interface Ad {
  id: string
  title: string
  description?: string
  imageUrl?: string
  targetUrl?: string
  status: 'ACTIVE' | 'PAUSED' | 'REJECTED'
  impressions: number
  clicks: number
  conversions: number
  ctr: number
  createdAt: string
  updatedAt: string
  campaignId: string
}

// Types pour les analytics
export interface Analytics {
  id: string
  date: string
  impressions: number
  clicks: number
  conversions: number
  cost: number
  revenue?: number
  campaignId: string
  campaign?: {
    id: string
    name: string
  }
}

export interface DashboardData {
  overview: {
    totalCampaigns: number
    activeCampaigns: number
    totalAds: number
    totalSpent: number
  }
  metrics: {
    impressions: number
    clicks: number
    conversions: number
    ctr: number
    conversionRate: number
    budgetUtilization: number
    averageCpc: number
    averageCpa: number
  }
  charts: {
    dailyStats: Array<{
      date: string
      impressions: number
      clicks: number
      conversions: number
      cost: number
      revenue: number
    }>
    topCampaigns: Array<Campaign & {
      ctr: number
      conversionRate: number
    }>
  }
  recentActivities: Activity[]
}

// Types pour les abonnements
export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  currency: string
  interval: string
  features: {
    campaigns: number | 'unlimited'
    ads: number | 'unlimited'
    apiKeys: number
    support: string
    analytics: string
    customReports?: boolean
    whiteLabel?: boolean
  }
  limits: {
    impressions: number | 'unlimited'
    clicks: number | 'unlimited'
  }
}

export interface Subscription {
  id: string
  plan: 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE'
  status: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE' | 'TRIALING'
  startDate: string
  endDate?: string
  trialEnds?: string
  stripeSubscriptionId?: string
  stripeCustomerId?: string
  userId: string
  usage?: {
    campaigns: {
      current: number
      limit: number | 'unlimited'
    }
    apiKeys: {
      current: number
      limit: number
    }
    impressions: {
      current: number
      limit: number | 'unlimited'
    }
    clicks: {
      current: number
      limit: number | 'unlimited'
    }
  }
  billingPeriod?: {
    start: string
    end: string
  }
}

// Types pour les clés API
export interface ApiKey {
  id: string
  name: string
  key: string
  isActive: boolean
  lastUsed?: string
  requestLimit: number
  requestCount: number
  createdAt: string
  expiresAt?: string
  userId: string
}

// Types pour les activités
export interface Activity {
  id: string
  type: 'LOGIN' | 'LOGOUT' | 'CAMPAIGN_CREATED' | 'CAMPAIGN_UPDATED' | 'CAMPAIGN_DELETED' | 'AD_CREATED' | 'AD_UPDATED' | 'SUBSCRIPTION_UPDATED' | 'API_KEY_CREATED'
  title: string
  description?: string
  metadata?: Record<string, any>
  createdAt: string
  userId: string
}

// Types pour les réponses API
export interface ApiResponse<T = any> {
  data?: T
  message?: string
  error?: string
  details?: any
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// Types pour les formulaires
export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  email: string
  password: string
  firstName?: string
  lastName?: string
}

export interface ProfileFormData {
  firstName?: string
  lastName?: string
  email?: string
}

export interface PasswordChangeFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// Types pour les erreurs
export interface FormError {
  field: string
  message: string
}

export interface ApiError {
  error: string
  details?: FormError[] | string
  status?: number
}

// Types pour les statistiques de campagne
export interface CampaignStats {
  campaign: {
    id: string
    name: string
    status: string
    budget: number
    spent: number
  }
  metrics: {
    impressions: number
    clicks: number
    conversions: number
    ctr: number
    conversionRate: number
    costPerClick: number
    costPerConversion: number
  }
  timeline: Array<{
    date: string
    impressions: number
    clicks: number
    conversions: number
    cost: number
  }>
}

// Types pour l'utilisation de l'abonnement
export interface SubscriptionUsage {
  plan: {
    id: string
    name: string
  }
  limits: {
    campaigns: {
      used: number
      limit: number | 'unlimited'
      percentage: number
    }
    ads: {
      used: number
      limit: number | 'unlimited'
      percentage: number
    }
    apiKeys: {
      used: number
      limit: number
      percentage: number
    }
    impressions: {
      used: number
      limit: number | 'unlimited'
      percentage: number
    }
    clicks: {
      used: number
      limit: number | 'unlimited'
      percentage: number
    }
  }
  spending: {
    thisMonth: number
    currency: string
  }
  billingPeriod: {
    start: string
    end: string
  }
}

// Types pour les réponses de l'export
export interface ExportResponse {
  data: Analytics[]
  exportedAt: string
  totalRecords: number
}

// Types pour les notifications
export interface Notification {
  id: string
  type: 'CAMPAIGN_STATUS' | 'BUDGET_ALERT' | 'PERFORMANCE_ALERT' | 'TEAM_INVITATION' | 'PAYMENT_ISSUE' | 'REPORTING'
  title: string
  message: string
  isRead: boolean
  data?: Record<string, any>
  createdAt: string
  userId: string
}

export interface NotificationSettings {
  email: {
    campaign_status: boolean
    budget_alerts: boolean
    performance_alerts: boolean
    team_invitations: boolean
    payment_issues: boolean
    reports: boolean
  }
  push: {
    campaign_status: boolean
    budget_alerts: boolean
    performance_alerts: boolean
    team_invitations: boolean
    payment_issues: boolean
    reports: boolean
  }
  webhook?: {
    enabled: boolean
    url?: string
    events: string[]
  }
}

// Types pour les fichiers
export interface MediaFile {
  id: string
  filename: string
  originalName: string
  mimetype: string
  size: number
  category: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'OTHER'
  url: string
  thumbnails?: {
    thumb: string
    small: string
    medium: string
  }
  metadata?: {
    width?: number
    height?: number
    duration?: number
  }
  createdAt: string
  userId: string
}

// Types pour les intégrations
export interface Integration {
  id: string
  platform: 'FACEBOOK_ADS' | 'GOOGLE_ADS' | 'LINKEDIN_ADS' | 'MAILCHIMP' | 'SALESFORCE' | 'HUBSPOT' | 'SLACK' | 'ZAPIER' | 'GOOGLE_ANALYTICS' | 'FACEBOOK_PIXEL'
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'PENDING'
  lastSync?: string
  syncStatus?: 'SUCCESS' | 'FAILED' | 'IN_PROGRESS'
  errorMessage?: string
  settings?: Record<string, any>
  createdAt: string
  userId: string
}

export interface IntegrationPlatform {
  id: string
  name: string
  description: string
  icon: string
  color?: string
  category: string
  requiredFields: Array<{
    name: string
    label: string
    type: 'text' | 'password' | 'email' | 'url'
    required: boolean
    placeholder?: string
  }>
  status: string
  connected?: boolean
  instructions?: string
}

// Types pour l'équipe
export interface TeamMember {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role: 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER'
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING'
  lastLogin?: string
  invitedAt?: string
  createdAt: string
}

export interface TeamInvitation {
  id: string
  email: string
  role: 'ADMIN' | 'EDITOR' | 'VIEWER'
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED'
  message?: string
  token: string
  expiresAt: string
  createdAt: string
  invitedBy: {
    id: string
    email: string
    firstName?: string
    lastName?: string
  }
}

// Types pour les rapports
export interface Report {
  id: string
  name: string
  type: 'CAMPAIGN_PERFORMANCE' | 'AUDIENCE_INSIGHTS' | 'BUDGET_ANALYSIS' | 'COMPETITIVE_ANALYSIS' | 'CUSTOM'
  status: 'GENERATING' | 'COMPLETED' | 'FAILED'
  filters: {
    dateRange?: { start: string; end: string }
    campaigns?: string[]
    metrics?: string[]
    groupBy?: 'day' | 'week' | 'month'
  }
  schedule?: {
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY'
    enabled: boolean
    nextRun?: string
  }
  fileUrl?: string
  fileSize?: number
  generatedAt?: string
  createdAt: string
  userId: string
}

// Types pour l'authentification 2FA
export interface TwoFactorAuth {
  enabled: boolean
  qrCode?: string
  secret?: string
  backupCodes?: string[]
}

// Types pour les webhooks
export interface Webhook {
  id: string
  url: string
  events: string[]
  secret: string
  status: 'ACTIVE' | 'INACTIVE'
  lastDelivery?: {
    timestamp: string
    status: 'SUCCESS' | 'FAILED'
    response?: string
  }
  createdAt: string
  userId: string
}

// Types pour l'onboarding
export interface OnboardingStep {
  id: string
  title: string
  description: string
  completed: boolean
  optional: boolean
}

export interface OnboardingProgress {
  currentStep: number
  totalSteps: number
  completedSteps: string[]
  skippedSteps: string[]
  completionPercentage: number
}

// Types pour les templates de campagne
export interface CampaignTemplate {
  id: string
  name: string
  description: string
  category: 'E_COMMERCE' | 'LEAD_GENERATION' | 'BRAND_AWARENESS' | 'APP_PROMOTION' | 'EVENT_PROMOTION'
  objective: 'AWARENESS' | 'TRAFFIC' | 'ENGAGEMENT' | 'LEADS' | 'SALES' | 'APP_INSTALLS'
  targeting: {
    ageRange?: { min: number; max: number }
    genders?: string[]
    locations?: string[]
    languages?: string[]
    interests?: string[]
    behaviors?: string[]
  }
  budget: {
    daily?: number
    total?: number
  }
  adTemplates: Array<{
    title: string
    description: string
    imageUrl?: string
    callToAction: string
  }>
  createdAt: string
}

// Types pour les commentaires
export interface Comment {
  id: string
  content: string
  author: {
    id: string
    firstName?: string
    lastName?: string
    email: string
  }
  campaignId: string
  parentId?: string
  replies?: Comment[]
  createdAt: string
  updatedAt: string
}

// Types pour les alertes
export interface Alert {
  id: string
  type: 'BUDGET_EXCEEDED' | 'LOW_PERFORMANCE' | 'HIGH_PERFORMANCE' | 'CAMPAIGN_ENDED' | 'CUSTOM'
  title: string
  message: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  conditions: Record<string, any>
  triggered: boolean
  campaignId?: string
  createdAt: string
  userId: string
}

// Types pour les optimisations automatiques
export interface AutoOptimization {
  id: string
  campaignId: string
  type: 'BID_ADJUSTMENT' | 'BUDGET_REALLOCATION' | 'AUDIENCE_EXPANSION' | 'AD_ROTATION'
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED'
  conditions: {
    metric: string
    operator: 'GREATER_THAN' | 'LESS_THAN' | 'EQUALS'
    value: number
    period: string
  }
  actions: {
    type: string
    parameters: Record<string, any>
  }[]
  results?: {
    applied: boolean
    changes: Record<string, any>
    impact?: Record<string, number>
  }
  createdAt: string
} 