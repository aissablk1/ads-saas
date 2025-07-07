/**
 * Fonction utilitaire pour obtenir un message de bienvenue selon l'heure
 */

export const getGreetingByTime = (): string => {
  const hour = new Date().getHours()
  
  if (hour >= 5 && hour < 12) {
    return 'Bonjour'
  } else if (hour >= 12 && hour < 17) {
    return 'Bon après-midi'
  } else if (hour >= 17 && hour < 22) {
    return 'Bonsoir'
  } else {
    return 'Bonne nuit'
  }
}

export const getWelcomeMessage = (includeAppName: boolean = true): string => {
  const greeting = getGreetingByTime()
  return includeAppName ? `${greeting} et bienvenue dans ADS SaaS !` : greeting
}

export const getPersonalizedGreeting = (userName?: string): string => {
  const greeting = getGreetingByTime()
  return userName ? `${greeting}, ${userName} !` : `${greeting} !`
}

// Nouvelles fonctions pour les messages de retour
export const getTimeSinceLastVisit = (): number | null => {
  // Vérifier si nous sommes côté client
  if (typeof window === 'undefined') return null
  
  const lastVisit = localStorage.getItem('lastVisit')
  if (!lastVisit) return null
  
  const lastVisitTime = new Date(lastVisit).getTime()
  const now = new Date().getTime()
  const diffInHours = (now - lastVisitTime) / (1000 * 60 * 60)
  
  return diffInHours
}

export const updateLastVisit = (): void => {
  // Vérifier si nous sommes côté client
  if (typeof window === 'undefined') return
  
  localStorage.setItem('lastVisit', new Date().toISOString())
}

export const getReturnMessage = (userName?: string): string => {
  const hoursSinceLastVisit = getTimeSinceLastVisit()
  const greeting = getGreetingByTime()
  
  // Première visite ou pas d'historique
  if (hoursSinceLastVisit === null) {
    return userName 
      ? `${greeting} et bienvenue dans ADS SaaS, ${userName} !`
      : `${greeting} et bienvenue dans ADS SaaS !`
  }
  
  // Moins de 30 minutes - pas de message de retour spécial
  if (hoursSinceLastVisit < 0.5) {
    return userName ? `${greeting}, ${userName} !` : `${greeting} !`
  }
  
  // Entre 30 minutes et 4 heures
  if (hoursSinceLastVisit < 4) {
    return userName 
      ? `${greeting} et bon retour, ${userName} !`
      : `${greeting} et bon retour !`
  }
  
  // Entre 4 heures et 1 jour
  if (hoursSinceLastVisit < 24) {
    return userName 
      ? `${greeting} ! Content de vous revoir, ${userName} !`
      : `${greeting} ! Content de vous revoir !`
  }
  
  // Entre 1 jour et 1 semaine
  if (hoursSinceLastVisit < 168) { // 7 jours * 24 heures
    const days = Math.floor(hoursSinceLastVisit / 24)
    return userName 
      ? `${greeting} ${userName} ! Bon retour après ${days} jour${days > 1 ? 's' : ''} !`
      : `${greeting} ! Bon retour après ${days} jour${days > 1 ? 's' : ''} !`
  }
  
  // Entre 1 semaine et 1 mois
  if (hoursSinceLastVisit < 720) { // 30 jours * 24 heures
    const weeks = Math.floor(hoursSinceLastVisit / 168)
    return userName 
      ? `${greeting} ${userName} ! Ravi de vous retrouver après ${weeks} semaine${weeks > 1 ? 's' : ''} !`
      : `${greeting} ! Ravi de vous retrouver après ${weeks} semaine${weeks > 1 ? 's' : ''} !`
  }
  
  // Plus d'un mois
  const months = Math.floor(hoursSinceLastVisit / 720)
  return userName 
    ? `${greeting} ${userName} ! Quel plaisir de vous revoir après ${months} mois !`
    : `${greeting} ! Quel plaisir de vous revoir après ${months} mois !`
}

export const getWelcomeBackMessage = (includeAppName: boolean = true): string => {
  const hoursSinceLastVisit = getTimeSinceLastVisit()
  const greeting = getGreetingByTime()
  
  // Première visite
  if (hoursSinceLastVisit === null) {
    return includeAppName ? `${greeting} et bienvenue dans ADS SaaS !` : greeting
  }
  
  // Visite récente (moins de 30 minutes)
  if (hoursSinceLastVisit < 0.5) {
    return includeAppName ? `${greeting} dans ADS SaaS !` : greeting
  }
  
  // Messages de retour selon la durée
  if (hoursSinceLastVisit < 4) {
    return includeAppName ? `${greeting} et bon retour dans ADS SaaS !` : `${greeting} et bon retour !`
  }
  
  if (hoursSinceLastVisit < 24) {
    return includeAppName ? `${greeting} ! Content de vous revoir dans ADS SaaS !` : `${greeting} ! Content de vous revoir !`
  }
  
  if (hoursSinceLastVisit < 168) {
    const days = Math.floor(hoursSinceLastVisit / 24)
    return includeAppName 
      ? `${greeting} ! Bon retour dans ADS SaaS après ${days} jour${days > 1 ? 's' : ''} !`
      : `${greeting} ! Bon retour après ${days} jour${days > 1 ? 's' : ''} !`
  }
  
  if (hoursSinceLastVisit < 720) {
    const weeks = Math.floor(hoursSinceLastVisit / 168)
    return includeAppName 
      ? `${greeting} ! Ravi de vous retrouver dans ADS SaaS après ${weeks} semaine${weeks > 1 ? 's' : ''} !`
      : `${greeting} ! Ravi de vous retrouver après ${weeks} semaine${weeks > 1 ? 's' : ''} !`
  }
  
  const months = Math.floor(hoursSinceLastVisit / 720)
  return includeAppName 
    ? `${greeting} ! Quel plaisir de vous revoir dans ADS SaaS après ${months} mois !`
    : `${greeting} ! Quel plaisir de vous revoir après ${months} mois !`
} 