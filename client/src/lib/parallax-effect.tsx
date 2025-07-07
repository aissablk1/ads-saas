'use client'

import React, { useEffect, useRef, useCallback, useState } from 'react'
import { VoiceNavigation, AdaptiveControls } from './voice-navigation'
import { ProgressiveReveal } from './progressive-reveal'

interface SectionScrollProps {
  children: React.ReactNode
  className?: string
  id?: string
  index: number
  totalSections: number
}

export const SectionScroll: React.FC<SectionScrollProps> = ({
  children,
  className = '',
  id,
  index,
  totalSections
}) => {
  const sectionRef = useRef<HTMLElement>(null)

  return (
    <section
      ref={sectionRef}
      id={id}
      data-section-index={index}
      className={`section-scroll ${className}`}
      style={{
        height: '100vh',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        scrollSnapAlign: 'start',
        scrollSnapStop: 'always'
      }}
    >
      {children}
    </section>
  )
}

// Types simplifiés
type Platform = 'desktop' | 'mobile' | 'tablet'
type ScrollSpeed = 'slow' | 'normal' | 'fast'
type UserMode = 'exploration' | 'efficiency' | 'accessibility'
type NavigationStyle = 'minimal' | 'detailed' | 'immersive'

interface ScrollState {
  currentSection: number
  isScrolling: boolean
  platform: Platform
  scrollSpeed: ScrollSpeed
  scrollVelocity: number
  canUseEffects: boolean
  sectionHeights: number[]
  averageSectionHeight: number
  windowHeight: number
  totalSections: number
  userMode: UserMode
  navigationStyle: NavigationStyle
  scrollDirection: 'up' | 'down' | 'none'
  userBehavior: 'fast' | 'slow' | 'exploring'
  voiceNavigationEnabled: boolean
  effectsIntensity: 'low' | 'medium' | 'high'
}

// Configuration des modes utilisateur
const UserModeConfig = {
  exploration: { 
    showThumbnails: true, 
    showEffects: true, 
    showProgress: true,
    animationSpeed: 'normal',
    feedbackLevel: 'detailed'
  },
  efficiency: { 
    showThumbnails: false, 
    showEffects: false, 
    showProgress: true,
    animationSpeed: 'fast',
    feedbackLevel: 'minimal'
  },
  accessibility: { 
    showThumbnails: false, 
    showEffects: false, 
    showProgress: true,
    animationSpeed: 'slow',
    feedbackLevel: 'enhanced',
    largeTargets: true,
    highContrast: true
  }
}

// Hook unifié avec système de modes
export const useSectionScroll = (totalSections: number = 5) => {
  const [state, setState] = useState<ScrollState>({
    currentSection: 0,
    isScrolling: false,
    platform: 'desktop',
    scrollSpeed: 'normal',
    scrollVelocity: 0,
    canUseEffects: false,
    sectionHeights: [],
    averageSectionHeight: 0,
    windowHeight: 0,
    totalSections,
    userMode: 'exploration',
    navigationStyle: 'detailed',
    scrollDirection: 'none',
    userBehavior: 'exploring',
    voiceNavigationEnabled: false,
    effectsIntensity: 'medium'
  })

  // Fonction pour changer le mode utilisateur
  const changeUserMode = useCallback((newMode: UserMode) => {
    setState(prev => ({
      ...prev,
      userMode: newMode
    }))
  }, [])

  // Fonction pour activer/désactiver la navigation vocale
  const toggleVoiceNavigation = useCallback(() => {
    setState(prev => ({
      ...prev,
      voiceNavigationEnabled: !prev.voiceNavigationEnabled
    }))
  }, [])

  // Fonction pour changer l'intensité des effets
  const changeEffectsIntensity = useCallback((intensity: 'low' | 'medium' | 'high') => {
    setState(prev => ({
      ...prev,
      effectsIntensity: intensity
    }))
  }, [])

  const scrollTimeout = useRef<NodeJS.Timeout | null>(null)
  const mainRef = useRef<HTMLElement>(null)
  const lastScrollTime = useRef<number>(0)
  const lastScrollPosition = useRef<number>(0)
  const scrollVelocityHistory = useRef<number[]>([])
  const maxVelocityHistory = 10
  const userBehaviorHistory = useRef<Array<'fast' | 'slow' | 'exploring'>>([])

  // Détecter la plateforme
  const detectPlatform = useCallback((): Platform => {
    const width = window.innerWidth
    if (width < 768) return 'mobile'
    if (width < 1024) return 'tablet'
    return 'desktop'
  }, [])

  // Analyser le comportement utilisateur
  const analyzeUserBehavior = useCallback((velocity: number, timeBetweenScrolls: number) => {
    const behavior: 'fast' | 'slow' | 'exploring' = 
      velocity > 2.0 ? 'fast' : 
      timeBetweenScrolls > 3000 ? 'exploring' : 'slow'
    
    userBehaviorHistory.current.push(behavior)
    if (userBehaviorHistory.current.length > 5) {
      userBehaviorHistory.current.shift()
    }
    
    // Déterminer le mode dominant
    const behaviorCounts = userBehaviorHistory.current.reduce((acc, b) => {
      acc[b] = (acc[b] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const dominantBehavior = Object.entries(behaviorCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] as 'fast' | 'slow' | 'exploring'
    
    return dominantBehavior || 'exploring'
  }, [])

  // Déterminer le style de navigation optimal
  const determineNavigationStyle = useCallback((platform: Platform, userBehavior: string, canUseEffects: boolean): NavigationStyle => {
    if (platform !== 'desktop') return 'minimal'
    if (!canUseEffects) return 'detailed'
    
    switch (userBehavior) {
      case 'fast': return 'minimal'
      case 'slow': return 'detailed'
      case 'exploring': return 'immersive'
      default: return 'detailed'
    }
  }, [])

  // Analyser les hauteurs des sections
  const analyzeSectionHeights = useCallback(() => {
    const sections = document.querySelectorAll('[data-section-index]')
    const windowHeight = window.innerHeight
    const heights: number[] = []
    let totalHeight = 0

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect()
      const height = rect.height
      heights.push(height)
      totalHeight += height
    })

    const averageHeight = totalHeight / heights.length
    const platform = detectPlatform()
    const isDesktop = platform === 'desktop'
    
    const allSectionsFullHeight = heights.every(height => 
      Math.abs(height - windowHeight) <= 5
    )
    
    const averageHeightSufficient = averageHeight >= windowHeight
    const canUseEffects = isDesktop && allSectionsFullHeight && averageHeightSufficient

    setState(prev => ({
      ...prev,
      sectionHeights: heights,
      averageSectionHeight: averageHeight,
      windowHeight,
      platform,
      canUseEffects
    }))

    return { heights, averageHeight, canUseEffects, platform }
  }, [detectPlatform])

  // Calculer la vitesse de scroll
  const calculateScrollSpeed = useCallback((currentPosition: number, currentTime: number) => {
    const deltaPosition = Math.abs(currentPosition - lastScrollPosition.current)
    const deltaTime = currentTime - lastScrollTime.current
    
    if (deltaTime === 0) return { speed: 'normal' as ScrollSpeed, velocity: 0 }
    
    const velocity = deltaPosition / deltaTime
    scrollVelocityHistory.current.push(velocity)
    if (scrollVelocityHistory.current.length > maxVelocityHistory) {
      scrollVelocityHistory.current.shift()
    }
    
    const averageVelocity = scrollVelocityHistory.current.reduce((sum, vel) => sum + vel, 0) / scrollVelocityHistory.current.length
    
    let speed: ScrollSpeed = 'normal'
    if (averageVelocity < 0.5) speed = 'slow'
    else if (averageVelocity < 2.0) speed = 'normal'
    else speed = 'fast'
    
    return { speed, velocity: averageVelocity }
  }, [])

  // Faire défiler vers une section
  const scrollToSection = useCallback((sectionIndex: number) => {
    if (state.isScrolling || sectionIndex < 0 || sectionIndex >= totalSections) {
      return
    }

    if (!state.canUseEffects) {
      const targetSection = document.querySelector(`[data-section-index="${sectionIndex}"]`)
      if (targetSection) {
        targetSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }
      return
    }

    setState(prev => ({ ...prev, isScrolling: true, currentSection: sectionIndex }))

    const targetSection = document.querySelector(`[data-section-index="${sectionIndex}"]`)
    
    if (targetSection && mainRef.current) {
      mainRef.current.style.scrollSnapType = 'none'
      
      targetSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })

      setTimeout(() => {
        if (mainRef.current) {
          mainRef.current.style.scrollSnapType = 'y mandatory'
        }
      }, 100)
    }

    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current)
    }
    
    scrollTimeout.current = setTimeout(() => {
      setState(prev => ({ ...prev, isScrolling: false }))
    }, 800)
  }, [state.isScrolling, state.canUseEffects, totalSections])

  // Détecter la section active
  const detectActiveSection = useCallback(() => {
    if (state.isScrolling) return

    const sections = document.querySelectorAll('[data-section-index]')
    const windowHeight = window.innerHeight
    const windowCenter = windowHeight / 2

    let activeSection = 0
    let minDistance = Infinity

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect()
      const sectionCenter = (rect.top + rect.bottom) / 2
      const distance = Math.abs(sectionCenter - windowCenter)

      if (distance < minDistance) {
        minDistance = distance
        activeSection = parseInt(section.getAttribute('data-section-index') || '0')
      }
    })

    if (activeSection !== state.currentSection) {
      setState(prev => ({ ...prev, currentSection: activeSection }))
    }
  }, [state.isScrolling, state.currentSection])

  // Gestionnaire pour la molette de souris
  const handleWheel = useCallback((e: WheelEvent) => {
    const now = Date.now()
    
    if (state.platform !== 'desktop' || !state.canUseEffects) {
      return
    }

    if (now - lastScrollTime.current < 150) {
      e.preventDefault()
      return
    }

    if (state.isScrolling) {
      e.preventDefault()
      return
    }

    const direction = e.deltaY > 0 ? 1 : -1
    const newSection = Math.max(0, Math.min(state.currentSection + direction, totalSections - 1))
    
    if (newSection !== state.currentSection) {
      lastScrollTime.current = now
      scrollToSection(newSection)
    }
  }, [state.platform, state.canUseEffects, state.isScrolling, state.currentSection, scrollToSection, totalSections])

  // Gestionnaire pour les touches clavier
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (state.isScrolling) return

    let newSection = state.currentSection

    switch (e.key) {
      case 'ArrowDown':
      case 'PageDown':
        newSection = Math.min(state.currentSection + 1, totalSections - 1)
        break
      case 'ArrowUp':
      case 'PageUp':
        newSection = Math.max(state.currentSection - 1, 0)
        break
      case 'Home':
        newSection = 0
        break
      case 'End':
        newSection = totalSections - 1
        break
      case ' ':
        e.preventDefault()
        newSection = Math.min(state.currentSection + 1, totalSections - 1)
        break
      default:
        return
    }

    if (newSection !== state.currentSection) {
      e.preventDefault()
      scrollToSection(newSection)
    }
  }, [state.isScrolling, state.currentSection, scrollToSection, totalSections])

  // Gestionnaire pour le scroll natif
  const handleScroll = useCallback(() => {
    if (state.isScrolling) return
    
    const currentTime = Date.now()
    const currentPosition = window.scrollY || (mainRef.current?.scrollTop || 0)
    
    if (currentTime - lastScrollTime.current >= 16) {
      const { speed, velocity } = calculateScrollSpeed(currentPosition, currentTime)
      const timeBetweenScrolls = currentTime - lastScrollTime.current
      const userBehavior = analyzeUserBehavior(velocity, timeBetweenScrolls)
      const navigationStyle = determineNavigationStyle(state.platform, userBehavior, state.canUseEffects)
      
      setState(prev => ({
        ...prev,
        scrollSpeed: speed,
        scrollVelocity: velocity,
        userBehavior,
        navigationStyle
      }))
      
      lastScrollPosition.current = currentPosition
      lastScrollTime.current = currentTime
    }
    
    requestAnimationFrame(() => {
      detectActiveSection()
    })
  }, [state.isScrolling, state.platform, state.canUseEffects, calculateScrollSpeed, analyzeUserBehavior, determineNavigationStyle, detectActiveSection])

  // Initialisation
  useEffect(() => {
    const platform = detectPlatform()
    
    mainRef.current = document.querySelector('main')

    if (mainRef.current) {
      if (platform === 'desktop') {
        mainRef.current.style.scrollSnapType = 'y mandatory'
        mainRef.current.style.overflowY = 'auto'
        mainRef.current.style.height = 'calc(100vh - 4rem)'
        mainRef.current.style.scrollBehavior = 'smooth'
      } else {
        mainRef.current.style.scrollSnapType = 'none'
        mainRef.current.style.overflowY = 'visible'
        mainRef.current.style.height = 'auto'
        mainRef.current.style.scrollBehavior = 'auto'
      }
    }

    setTimeout(() => {
      analyzeSectionHeights()
    }, 100)

    const mainElement = mainRef.current || window
    mainElement.addEventListener('scroll', handleScroll, { passive: true })
    
    if (platform === 'desktop') {
      window.addEventListener('wheel', handleWheel, { passive: false })
    }
    
    window.addEventListener('keydown', handleKeyDown)

    setTimeout(detectActiveSection, 100)

    return () => {
      mainElement.removeEventListener('scroll', handleScroll)
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('keydown', handleKeyDown)
      
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current)
      }
    }
  }, [detectPlatform, analyzeSectionHeights, handleScroll, handleWheel, handleKeyDown, detectActiveSection])

  return {
    currentSection: state.currentSection,
    scrollToSection,
    isScrolling: state.isScrolling,
    platform: state.platform,
    scrollSpeed: state.scrollSpeed,
    scrollVelocity: state.scrollVelocity,
    canUseEffects: state.canUseEffects,
    sectionHeights: state.sectionHeights,
    averageSectionHeight: state.averageSectionHeight,
    windowHeight: state.windowHeight,
    totalSections,
    userMode: state.userMode,
    navigationStyle: state.navigationStyle,
    userBehavior: state.userBehavior,
    scrollDirection: state.scrollDirection,
    changeUserMode,
    toggleVoiceNavigation,
    changeEffectsIntensity,
    voiceNavigationEnabled: state.voiceNavigationEnabled,
    effectsIntensity: state.effectsIntensity
  }
}

// Navigation unifiée et adaptative
export const AdaptiveNavigation: React.FC<{
  currentSection: number;
  totalSections: number;
  onSectionChange: (index: number) => void;
  platform: Platform;
  navigationStyle: NavigationStyle;
  canUseEffects: boolean;
  userBehavior: string;
  sectionTitles?: string[];
}> = ({
  currentSection,
  totalSections,
  onSectionChange,
  platform,
  navigationStyle,
  canUseEffects,
  userBehavior,
  sectionTitles = ['Accueil', 'Fonctionnalités', 'Tarifs', 'Témoignages', 'Contact']
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [hoveredSection, setHoveredSection] = useState<number | null>(null)

  // Masquer sur mobile/tablet
  if (platform !== 'desktop') return null

  // Rendu selon le style de navigation
  const renderNavigation = () => {
    switch (navigationStyle) {
      case 'minimal':
        return (
          <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-50">
            <div className="flex flex-col space-y-2">
              {Array.from({ length: totalSections }, (_, index) => (
                <button
                  key={index}
                  onClick={() => onSectionChange(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentSection === index
                      ? 'bg-primary-600 scale-125'
                      : 'bg-foreground-muted hover:bg-foreground-secondary'
                  }`}
                  aria-label={`Section ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )

      case 'detailed':
        return (
          <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-50">
            <div className="flex flex-col space-y-3">
              {Array.from({ length: totalSections }, (_, index) => (
                <div key={index} className="relative group">
                  <button
                    onClick={() => onSectionChange(index)}
                    onMouseEnter={() => setHoveredSection(index)}
                    onMouseLeave={() => setHoveredSection(null)}
                    className={`w-4 h-4 rounded-full transition-all duration-300 border-2 ${
                      currentSection === index
                        ? 'bg-primary-600 border-primary-600 scale-110'
                        : 'bg-foreground-muted border-transparent hover:bg-foreground-secondary hover:scale-105'
                    }`}
                    aria-label={`Aller à ${sectionTitles[index]}`}
                  />
                  
                  {/* Label au survol */}
                  <div 
                    className={`absolute right-8 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
                      hoveredSection === index 
                        ? 'opacity-100 translate-x-0' 
                        : 'opacity-0 translate-x-4 pointer-events-none'
                    }`}
                  >
                    <div className="bg-foreground text-background px-3 py-2 rounded-lg shadow-lg whitespace-nowrap text-sm">
                      {sectionTitles[index]}
                    </div>
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-foreground border-t-4 border-t-transparent border-b-4 border-b-transparent" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'immersive':
        return (
          <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-50">
            <div 
              className={`flex flex-col space-y-3 transition-all duration-500 ease-out ${
                isExpanded ? 'w-48' : 'w-12'
              }`}
              onMouseEnter={() => setIsExpanded(true)}
              onMouseLeave={() => setIsExpanded(false)}
            >
              {Array.from({ length: totalSections }, (_, index) => (
                <div key={index} className="relative group">
                  <button
                    onClick={() => onSectionChange(index)}
                    onMouseEnter={() => setHoveredSection(index)}
                    onMouseLeave={() => setHoveredSection(null)}
                    className={`w-12 h-12 rounded-full transition-all duration-300 border-2 relative overflow-hidden ${
                      currentSection === index
                        ? 'bg-primary-600 scale-110 border-primary-600 shadow-lg'
                        : 'bg-foreground-muted hover:bg-foreground-secondary border-transparent hover:scale-105'
                    }`}
                    aria-label={`Aller à ${sectionTitles[index]}`}
                  >
                    {/* Indicateur de progression */}
                    <div 
                      className="absolute inset-0 bg-gradient-to-t from-primary-400 to-primary-600 rounded-full transition-all duration-500"
                      style={{ 
                        clipPath: `polygon(0 ${100 - ((index + 1) / totalSections) * 100}%, 100% ${100 - ((index + 1) / totalSections) * 100}%, 100% 100%, 0% 100%)` 
                      }}
                    />
                    
                    {/* Numéro de section */}
                    <span className="relative z-10 text-white font-bold text-sm">
                      {index + 1}
                    </span>

                    {/* Indicateur d'effets activés */}
                    {canUseEffects && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-white" />
                    )}
                  </button>

                  {/* Label avec animation */}
                  <div 
                    className={`absolute right-16 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
                      isExpanded && hoveredSection === index 
                        ? 'opacity-100 translate-x-0' 
                        : 'opacity-0 translate-x-4 pointer-events-none'
                    }`}
                  >
                    <div className="bg-foreground text-background px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                      <div className="text-sm font-medium">{sectionTitles[index]}</div>
                      <div className="text-xs text-foreground-muted">
                        Section {index + 1} sur {totalSections}
                      </div>
                    </div>
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-foreground border-t-4 border-t-transparent border-b-4 border-b-transparent" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return renderNavigation()
}

// Barre de progression simplifiée
export const ProgressBar: React.FC<{
  currentSection: number;
  totalSections: number;
  platform: Platform;
  showProgress: boolean;
}> = ({ currentSection, totalSections, platform, showProgress }) => {
  if (platform !== 'desktop' || !showProgress) return null

  const progress = ((currentSection + 1) / totalSections) * 100

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-foreground-muted z-50">
      <div 
        className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

// Composant de transition simplifié
export const SectionTransition: React.FC<{
  children: React.ReactNode;
  isVisible: boolean;
  direction: 'up' | 'down';
  delay?: number;
  animationSpeed?: 'slow' | 'normal' | 'fast';
}> = ({ children, isVisible, direction, delay = 0, animationSpeed = 'normal' }) => {
  const speedMap = {
    slow: 'duration-1500',
    normal: 'duration-1000',
    fast: 'duration-500'
  }

  return (
    <div 
      className={`transition-all ${speedMap[animationSpeed]} ease-out ${
        isVisible 
          ? 'opacity-100 translate-y-0 scale-100' 
          : `opacity-0 translate-y-${direction === 'up' ? '8' : '-8'} scale-95`
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

// Effets de fond simplifiés
export const BackgroundEffects: React.FC<{
  platform: Platform;
  canUseEffects: boolean;
  userBehavior: string;
}> = ({ platform, canUseEffects, userBehavior }) => {
  if (platform !== 'desktop' || !canUseEffects) return null

  // Réduire les effets pour les utilisateurs rapides
  const effectIntensity = userBehavior === 'fast' ? 'low' : userBehavior === 'slow' ? 'high' : 'medium'

  return (
    <>
      {/* Particules flottantes */}
      {effectIntensity !== 'low' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: effectIntensity === 'high' ? 20 : 10 }, (_, i) => (
            <div
              key={i}
              className="absolute bg-primary-400/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                animationDuration: `${Math.random() * 20 + 10}s`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Formes morphiques */}
      {effectIntensity === 'high' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="morphGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--primary-400)" stopOpacity="0.1" />
                <stop offset="100%" stopColor="var(--primary-600)" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            <path
              d="M0,50 Q25,25 50,50 T100,50 L100,100 L0,100 Z"
              fill="url(#morphGradient)"
              className="animate-pulse"
              style={{ animationDuration: '8s' }}
            />
          </svg>
        </div>
      )}
    </>
  )
}

// Sélecteur de mode utilisateur
export const UserModeSelector: React.FC<{
  currentMode: UserMode;
  onModeChange: (mode: UserMode) => void;
  platform: Platform;
}> = ({ currentMode, onModeChange, platform }) => {
  const [isOpen, setIsOpen] = useState(false)

  if (platform !== 'desktop') return null

  const modes = [
    {
      id: 'exploration' as UserMode,
      name: 'Exploration',
      description: 'Découvrez toutes les fonctionnalités avec des effets visuels',
      icon: '🔍',
      features: ['Effets visuels', 'Navigation détaillée', 'Animations fluides']
    },
    {
      id: 'efficiency' as UserMode,
      name: 'Efficacité',
      description: 'Navigation rapide et minimaliste pour les utilisateurs expérimentés',
      icon: '⚡',
      features: ['Navigation rapide', 'Effets réduits', 'Interface épurée']
    },
    {
      id: 'accessibility' as UserMode,
      name: 'Accessibilité',
      description: 'Interface adaptée pour une meilleure accessibilité',
      icon: '♿',
      features: ['Animations lentes', 'Contraste élevé', 'Cibles larges']
    }
  ]

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <div className="relative">
        {/* Bouton principal */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-foreground text-background p-3 rounded-full shadow-lg hover:bg-foreground-secondary transition-colors"
          title="Changer le mode d'utilisation"
        >
          <span className="text-lg">
            {modes.find(m => m.id === currentMode)?.icon}
          </span>
        </button>

        {/* Panneau de sélection */}
        {isOpen && (
          <div className="absolute bottom-16 left-0 bg-background/95 backdrop-blur-md border border-border rounded-lg p-4 shadow-lg min-w-80">
            <h3 className="text-sm font-medium text-foreground mb-3">Mode d'utilisation</h3>
            
            <div className="space-y-3">
              {modes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => {
                    onModeChange(mode.id)
                    setIsOpen(false)
                  }}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                    currentMode === mode.id
                      ? 'bg-primary-100 dark:bg-primary-900/30 border border-primary-600'
                      : 'hover:bg-background-secondary border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{mode.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium text-foreground">{mode.name}</div>
                      <div className="text-xs text-foreground-muted mt-1">{mode.description}</div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {mode.features.map((feature, index) => (
                          <span
                            key={index}
                            className="text-xs px-2 py-1 bg-foreground-muted/20 rounded-full text-foreground-muted"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                    {currentMode === mode.id && (
                      <div className="w-2 h-2 bg-primary-600 rounded-full" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-border">
              <div className="text-xs text-foreground-muted">
                Le mode s'adapte automatiquement selon votre comportement de navigation.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Feedback contextuel
export const FeedbackContextuel: React.FC<{
  currentSection: number;
  totalSections: number;
  userBehavior: string;
  platform: Platform;
  navigationStyle: NavigationStyle;
}> = ({ currentSection, totalSections, userBehavior, platform, navigationStyle }) => {
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState('')

  useEffect(() => {
    if (platform !== 'desktop') return

    // Afficher un feedback contextuel selon le comportement
    const messages = {
      fast: [
        "Navigation rapide détectée - Mode efficacité activé",
        "Vous naviguez rapidement - Interface optimisée",
        "Mode rapide : Effets réduits pour plus de fluidité"
      ],
      slow: [
        "Navigation lente détectée - Mode exploration activé",
        "Vous prenez votre temps - Effets visuels activés",
        "Mode exploration : Découvrez toutes les fonctionnalités"
      ],
      exploring: [
        "Mode exploration activé - Navigation immersive",
        "Découvrez l'interface avec des effets visuels",
        "Navigation immersive : Effets et animations activés"
      ]
    }

    const message = messages[userBehavior as keyof typeof messages]?.[currentSection % 3] || ''
    
    if (message && message !== feedbackMessage) {
      setFeedbackMessage(message)
      setShowFeedback(true)
      
      setTimeout(() => {
        setShowFeedback(false)
      }, 3000)
    }
  }, [currentSection, userBehavior, platform, feedbackMessage])

  if (platform !== 'desktop' || !showFeedback) return null

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-foreground text-background px-4 py-2 rounded-lg shadow-lg text-sm font-medium animate-in slide-in-from-top-2 duration-300">
        {feedbackMessage}
      </div>
    </div>
  )
}

// Indicateur de progression narrative
export const NarrativeProgress: React.FC<{
  currentSection: number;
  totalSections: number;
  platform: Platform;
  sectionTitles: string[];
}> = ({ currentSection, totalSections, platform, sectionTitles }) => {
  if (platform !== 'desktop') return null

  const progress = ((currentSection + 1) / totalSections) * 100
  const currentTitle = sectionTitles[currentSection] || `Section ${currentSection + 1}`

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
      <div className="bg-background/90 backdrop-blur-md border border-border rounded-full px-4 py-2 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="text-xs text-foreground-muted">
            {currentSection + 1} sur {totalSections}
          </div>
          <div className="w-24 h-1 bg-foreground-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary-600 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xs font-medium text-foreground max-w-32 truncate">
            {currentTitle}
          </div>
        </div>
      </div>
    </div>
  )
} 