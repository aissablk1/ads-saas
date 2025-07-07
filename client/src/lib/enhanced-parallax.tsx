'use client'

import React, { useEffect, useRef, useCallback, useState } from 'react'

// Types simplifiés et optimisés
type ScrollMode = 'smooth' | 'snap' | 'free'
type VisualStyle = 'minimal' | 'modern' | 'immersive'

interface ParallaxConfig {
  mode: ScrollMode
  style: VisualStyle
  enableEffects: boolean
  showProgress: boolean
  showNavigation: boolean
}

interface SectionProps {
  children: React.ReactNode
  className?: string
  id?: string
  index: number
  background?: string
  overlay?: React.ReactNode
}

// Hook principal simplifié
export const useEnhancedParallax = (totalSections: number = 5) => {
  const [currentSection, setCurrentSection] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const [config, setConfig] = useState<ParallaxConfig>({
    mode: 'smooth',
    style: 'modern',
    enableEffects: true,
    showProgress: true,
    showNavigation: true
  })

  const scrollTimeout = useRef<NodeJS.Timeout | undefined>(undefined)
  const mainRef = useRef<HTMLElement>(null)
  const lastScrollTime = useRef<number>(0)

  // Navigation vers une section
  const scrollToSection = useCallback((sectionIndex: number) => {
    if (isScrolling || sectionIndex < 0 || sectionIndex >= totalSections) return

    setIsScrolling(true)
    setCurrentSection(sectionIndex)

    const targetSection = document.querySelector(`[data-section="${sectionIndex}"]`)
    if (targetSection) {
      targetSection.scrollIntoView({
        behavior: config.mode === 'smooth' ? 'smooth' : 'auto',
        block: 'start'
      })
    }

    if (scrollTimeout.current) clearTimeout(scrollTimeout.current)
    scrollTimeout.current = setTimeout(() => setIsScrolling(false), 800)
  }, [isScrolling, totalSections, config.mode])

  // Gestionnaire de scroll optimisé
  const handleScroll = useCallback(() => {
    if (isScrolling) return

    requestAnimationFrame(() => {
      const sections = document.querySelectorAll('[data-section]')
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
          activeSection = parseInt(section.getAttribute('data-section') || '0')
        }
      })

      if (activeSection !== currentSection) {
        setCurrentSection(activeSection)
      }
    })
  }, [isScrolling, currentSection])

  // Gestionnaire de clavier
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isScrolling) return

    let newSection = currentSection
    switch (e.key) {
      case 'ArrowDown':
      case 'PageDown':
        newSection = Math.min(currentSection + 1, totalSections - 1)
        break
      case 'ArrowUp':
      case 'PageUp':
        newSection = Math.max(currentSection - 1, 0)
        break
      case 'Home':
        newSection = 0
        break
      case 'End':
        newSection = totalSections - 1
        break
      case ' ':
        e.preventDefault()
        newSection = Math.min(currentSection + 1, totalSections - 1)
        break
      default:
        return
    }

    if (newSection !== currentSection) {
      e.preventDefault()
      scrollToSection(newSection)
    }
  }, [currentSection, isScrolling, scrollToSection, totalSections])

  // Gestionnaire de molette avec throttling
  const handleWheel = useCallback((e: WheelEvent) => {
    const now = Date.now()
    if (now - lastScrollTime.current < 150) {
      e.preventDefault()
      return
    }

    if (isScrolling) {
      e.preventDefault()
      return
    }

    const direction = e.deltaY > 0 ? 1 : -1
    const newSection = Math.max(0, Math.min(currentSection + direction, totalSections - 1))
    
    if (newSection !== currentSection) {
      lastScrollTime.current = now
      scrollToSection(newSection)
    }
  }, [currentSection, isScrolling, scrollToSection, totalSections])

  // Initialisation
  useEffect(() => {
    const isDesktop = window.innerWidth >= 768
    
    if (!isDesktop) {
      setConfig(prev => ({ ...prev, mode: 'free', enableEffects: false }))
      return
    }

    mainRef.current = document.querySelector('main')
    if (mainRef.current) {
      mainRef.current.style.scrollSnapType = config.mode === 'snap' ? 'y mandatory' : 'none'
      mainRef.current.style.overflowY = 'auto'
      mainRef.current.style.height = 'calc(100vh - 4rem)'
      mainRef.current.style.scrollBehavior = config.mode === 'smooth' ? 'smooth' : 'auto'
    }

    const mainElement = mainRef.current || window
    mainElement.addEventListener('scroll', handleScroll, { passive: true })
    
    if (isDesktop) {
      window.addEventListener('wheel', handleWheel, { passive: false })
    }
    
    window.addEventListener('keydown', handleKeyDown)

    setTimeout(() => {
      const sections = document.querySelectorAll('[data-section]')
      if (sections.length > 0) {
        const rect = sections[0].getBoundingClientRect()
        if (rect.top < window.innerHeight / 2) {
          setCurrentSection(0)
        }
      }
    }, 100)

    return () => {
      mainElement.removeEventListener('scroll', handleScroll)
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('keydown', handleKeyDown)
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current)
    }
  }, [handleScroll, handleWheel, handleKeyDown, config.mode])

  return {
    currentSection,
    scrollToSection,
    isScrolling,
    config,
    setConfig,
    totalSections
  }
}

// Composant de section avec effets parallax
export const ParallaxSection: React.FC<SectionProps> = ({
  children,
  className = '',
  id,
  index,
  background,
  overlay
}) => {
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.3 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      id={id}
      data-section={index}
      className={`parallax-section ${className} ${isVisible ? 'section-visible' : ''}`}
      style={{
        height: '100vh',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        scrollSnapAlign: 'start',
        scrollSnapStop: 'always'
      }}
    >
      {/* Arrière-plan avec effet parallax */}
      {background && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url(${background})`,
            transform: isVisible ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.8s ease-out'
          }}
        />
      )}

      {/* Overlay */}
      {overlay && (
        <div className="absolute inset-0 z-10">
          {overlay}
        </div>
      )}

      {/* Contenu principal */}
      <div className="relative z-20 h-full flex items-center justify-center">
        <div className="container mx-auto px-4 lg:px-6">
          {children}
        </div>
      </div>
    </section>
  )
}

// Navigation moderne et intuitive
export const ModernNavigation: React.FC<{
  currentSection: number
  totalSections: number
  onSectionChange: (index: number) => void
  style: VisualStyle
  showNavigation: boolean
}> = ({ currentSection, totalSections, onSectionChange, style, showNavigation }) => {
  const [hoveredSection, setHoveredSection] = useState<number | null>(null)

  if (!showNavigation) return null

  const sectionTitles = ['Accueil', 'Fonctionnalités', 'Tarifs', 'Témoignages', 'Contact']

  const renderNavigation = () => {
    switch (style) {
      case 'minimal':
        return (
          <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-50">
            <div className="flex flex-col space-y-2">
              {Array.from({ length: totalSections }, (_, index) => (
                <button
                  key={index}
                  onClick={() => onSectionChange(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    currentSection === index
                      ? 'bg-primary-600 scale-150'
                      : 'bg-foreground-muted hover:bg-foreground-secondary'
                  }`}
                  aria-label={`Section ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )

      case 'modern':
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
                        ? 'bg-primary-600 border-primary-600 scale-110 shadow-lg'
                        : 'bg-foreground-muted border-transparent hover:bg-foreground-secondary hover:scale-105'
                    }`}
                    aria-label={`Aller à ${sectionTitles[index]}`}
                  />
                  
                  {/* Tooltip moderne */}
                  <div 
                    className={`absolute right-8 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
                      hoveredSection === index 
                        ? 'opacity-100 translate-x-0' 
                        : 'opacity-0 translate-x-4 pointer-events-none'
                    }`}
                  >
                    <div className="bg-foreground text-background px-3 py-2 rounded-lg shadow-xl whitespace-nowrap text-sm font-medium">
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
            <div className="flex flex-col space-y-4">
              {Array.from({ length: totalSections }, (_, index) => (
                <div key={index} className="relative group">
                  <button
                    onClick={() => onSectionChange(index)}
                    onMouseEnter={() => setHoveredSection(index)}
                    onMouseLeave={() => setHoveredSection(null)}
                    className={`w-12 h-12 rounded-full transition-all duration-500 relative overflow-hidden ${
                      currentSection === index
                        ? 'bg-primary-600 scale-110 shadow-xl ring-4 ring-primary-600/30'
                        : 'bg-foreground-muted hover:bg-foreground-secondary hover:scale-105'
                    }`}
                    aria-label={`Aller à ${sectionTitles[index]}`}
                  >
                    {/* Indicateur de progression circulaire */}
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 48 48">
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        className="text-primary-400/30"
                      />
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray={`${((index + 1) / totalSections) * 126} 126`}
                        className="text-primary-600 transition-all duration-1000"
                      />
                    </svg>
                    
                    {/* Numéro de section */}
                    <span className="relative z-10 text-white font-bold text-sm">
                      {index + 1}
                    </span>
                  </button>

                  {/* Label immersif */}
                  <div 
                    className={`absolute right-16 top-1/2 transform -translate-y-1/2 transition-all duration-500 ${
                      hoveredSection === index 
                        ? 'opacity-100 translate-x-0' 
                        : 'opacity-0 translate-x-4 pointer-events-none'
                    }`}
                  >
                    <div className="bg-foreground/95 backdrop-blur-md text-background px-4 py-3 rounded-xl shadow-2xl">
                      <div className="text-sm font-semibold">{sectionTitles[index]}</div>
                      <div className="text-xs text-foreground-muted mt-1">
                        Section {index + 1} sur {totalSections}
                      </div>
                    </div>
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-foreground/95 border-t-4 border-t-transparent border-b-4 border-b-transparent" />
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

// Barre de progression moderne
export const ModernProgressBar: React.FC<{
  currentSection: number
  totalSections: number
  showProgress: boolean
}> = ({ currentSection, totalSections, showProgress }) => {
  if (!showProgress) return null

  const progress = ((currentSection + 1) / totalSections) * 100
  const sectionTitles = ['Accueil', 'Fonctionnalités', 'Tarifs', 'Témoignages', 'Contact']

  return (
    <>
      {/* Barre de progression en haut */}
      <div className="fixed top-0 left-0 w-full h-1 bg-foreground-muted/20 z-50">
        <div 
          className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-700 ease-out shadow-lg"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Indicateur de progression en bas */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
        <div className="bg-background/90 backdrop-blur-md border border-border rounded-full px-6 py-3 shadow-xl">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-foreground-muted">
              {currentSection + 1} sur {totalSections}
            </div>
            <div className="w-32 h-2 bg-foreground-muted/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-sm font-medium text-foreground max-w-40 truncate">
              {sectionTitles[currentSection]}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// Contrôles de configuration
export const ParallaxControls: React.FC<{
  config: ParallaxConfig
  onConfigChange: (config: ParallaxConfig) => void
}> = ({ config, onConfigChange }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-foreground text-background p-3 rounded-full shadow-lg hover:bg-foreground-secondary transition-colors"
          title="Paramètres de navigation"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute bottom-16 left-0 bg-background/95 backdrop-blur-md border border-border rounded-xl p-4 shadow-2xl min-w-64">
            <h3 className="text-sm font-semibold text-foreground mb-4">Paramètres de navigation</h3>
            
            <div className="space-y-4">
              {/* Mode de défilement */}
              <div>
                <label className="text-xs font-medium text-foreground-muted mb-2 block">Mode de défilement</label>
                <select
                  value={config.mode}
                  onChange={(e) => onConfigChange({ ...config, mode: e.target.value as ScrollMode })}
                  className="w-full px-3 py-2 bg-background-secondary border border-border rounded-lg text-sm"
                >
                  <option value="smooth">Fluide</option>
                  <option value="snap">Par sections</option>
                  <option value="free">Libre</option>
                </select>
              </div>

              {/* Style visuel */}
              <div>
                <label className="text-xs font-medium text-foreground-muted mb-2 block">Style visuel</label>
                <select
                  value={config.style}
                  onChange={(e) => onConfigChange({ ...config, style: e.target.value as VisualStyle })}
                  className="w-full px-3 py-2 bg-background-secondary border border-border rounded-lg text-sm"
                >
                  <option value="minimal">Minimal</option>
                  <option value="modern">Moderne</option>
                  <option value="immersive">Immersif</option>
                </select>
              </div>

              {/* Options */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.enableEffects}
                    onChange={(e) => onConfigChange({ ...config, enableEffects: e.target.checked })}
                    className="rounded border-border"
                  />
                  <span className="text-sm text-foreground">Effets visuels</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.showProgress}
                    onChange={(e) => onConfigChange({ ...config, showProgress: e.target.checked })}
                    className="rounded border-border"
                  />
                  <span className="text-sm text-foreground">Barre de progression</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.showNavigation}
                    onChange={(e) => onConfigChange({ ...config, showNavigation: e.target.checked })}
                    className="rounded border-border"
                  />
                  <span className="text-sm text-foreground">Navigation latérale</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 