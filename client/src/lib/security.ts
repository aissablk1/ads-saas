import { toast } from 'react-hot-toast'

// Rate limiting storage
const rateLimit = new Map<string, { count: number; resetTime: number }>()

// XSS protection
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
}

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Password strength validation
export const validatePassword = (password: string): {
  isValid: boolean
  errors: string[]
  strength: 'weak' | 'medium' | 'strong'
} => {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre')
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial')
  }

  // Common password check
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123', 
    'password123', 'admin', 'letmein', 'welcome', 'monkey'
  ]
  
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Ce mot de passe est trop commun')
  }

  // Strength calculation
  let strength: 'weak' | 'medium' | 'strong' = 'weak'
  if (errors.length === 0) {
    if (password.length >= 12 && /[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      strength = 'strong'
    } else {
      strength = 'medium'
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength
  }
}

// Rate limiting
export const checkRateLimit = (
  identifier: string, 
  maxAttempts: number = 5, 
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): boolean => {
  const now = Date.now()
  const key = `${identifier}_${Math.floor(now / windowMs)}`
  
  const current = rateLimit.get(key)
  
  if (!current) {
    rateLimit.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (current.count >= maxAttempts) {
    const remainingTime = Math.ceil((current.resetTime - now) / 1000 / 60)
    toast.error(`Trop de tentatives. Réessayez dans ${remainingTime} minutes.`)
    return false
  }
  
  current.count++
  return true
}

// Form validation
export const validateForm = (data: Record<string, any>, rules: Record<string, any>): {
  isValid: boolean
  errors: Record<string, string>
} => {
  const errors: Record<string, string> = {}
  
  for (const [field, value] of Object.entries(data)) {
    const rule = rules[field]
    if (!rule) continue
    
    // Required validation
    if (rule.required && (!value || value.toString().trim() === '')) {
      errors[field] = `${rule.label || field} est requis`
      continue
    }
    
    // Skip other validations if field is empty and not required
    if (!value || value.toString().trim() === '') continue
    
    // Email validation
    if (rule.type === 'email' && !validateEmail(value)) {
      errors[field] = 'Format d\'email invalide'
    }
    
    // Password validation
    if (rule.type === 'password') {
      const validation = validatePassword(value)
      if (!validation.isValid) {
        errors[field] = validation.errors[0]
      }
    }
    
    // Minimum length
    if (rule.minLength && value.length < rule.minLength) {
      errors[field] = `${rule.label || field} doit contenir au moins ${rule.minLength} caractères`
    }
    
    // Maximum length
    if (rule.maxLength && value.length > rule.maxLength) {
      errors[field] = `${rule.label || field} ne peut pas dépasser ${rule.maxLength} caractères`
    }
    
    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value)) {
      errors[field] = rule.message || `${rule.label || field} a un format invalide`
    }
    
    // Custom validation
    if (rule.custom && typeof rule.custom === 'function') {
      const customError = rule.custom(value, data)
      if (customError) {
        errors[field] = customError
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// CSRF Token (simulation)
export const generateCSRFToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15)
}

// Session timeout warning
export const initSessionTimeout = (timeoutMs: number = 30 * 60 * 1000) => {
  let warningTimer: NodeJS.Timeout
  let logoutTimer: NodeJS.Timeout
  
  const resetTimers = () => {
    clearTimeout(warningTimer)
    clearTimeout(logoutTimer)
    
    // Warning 5 minutes before timeout
    warningTimer = setTimeout(() => {
      toast.error('Votre session va expirer dans 5 minutes', {
        duration: 10000
      })
    }, timeoutMs - 5 * 60 * 1000)
    
    // Auto logout
    logoutTimer = setTimeout(() => {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      toast.error('Session expirée. Veuillez vous reconnecter.')
      window.location.href = '/login'
    }, timeoutMs)
  }
  
  // Track user activity
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
  
  const resetActivity = () => {
    resetTimers()
  }
  
  events.forEach(event => {
    document.addEventListener(event, resetActivity, true)
  })
  
  resetTimers()
  
  return () => {
    clearTimeout(warningTimer)
    clearTimeout(logoutTimer)
    events.forEach(event => {
      document.removeEventListener(event, resetActivity, true)
    })
  }
}

// Content Security Policy helper
export const initCSP = () => {
  // Add meta tag for CSP if not present
  if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
    const meta = document.createElement('meta')
    meta.httpEquiv = 'Content-Security-Policy'
    meta.content = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https:;"
    document.head.appendChild(meta)
  }
}

// Input sanitization for forms
export const sanitizeFormData = (data: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {}
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value)
    } else {
      sanitized[key] = value
    }
  }
  
  return sanitized
}

// Check for suspicious activity
export const detectSuspiciousActivity = (userAgent: string, ip?: string): boolean => {
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /php/i
  ]
  
  return suspiciousPatterns.some(pattern => pattern.test(userAgent))
}

// Secure random ID generation
export const generateSecureId = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}

// Validate file uploads
export const validateFileUpload = (file: File, options: {
  maxSize?: number // in bytes
  allowedTypes?: string[]
  allowedExtensions?: string[]
} = {}): { isValid: boolean; error?: string } => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  } = options
  
  // Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `Le fichier est trop volumineux. Taille maximale : ${Math.round(maxSize / 1024 / 1024)}MB`
    }
  }
  
  // Check MIME type
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Type de fichier non autorisé'
    }
  }
  
  // Check file extension
  const extension = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!allowedExtensions.includes(extension)) {
    return {
      isValid: false,
      error: 'Extension de fichier non autorisée'
    }
  }
  
  return { isValid: true }
} 