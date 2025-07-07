'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDownIcon, LanguageIcon, GlobeAltIcon } from '@heroicons/react/24/outline'
import { useLanguage, SUPPORTED_LANGUAGES, Language, useMounted } from './language-context'

interface LanguageToggleProps {
  variant?: 'button' | 'menu'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showFlag?: boolean
  showName?: boolean
}

export function LanguageToggle({ 
  variant = 'button', 
  size = 'md',
  className = '',
  showFlag = true,
  showName = false
}: LanguageToggleProps) {
  const { language, languageInfo, setLanguage } = useLanguage()
  const mounted = useMounted()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg'
  }

  const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  // Fermer le menu quand on clique à l'extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Éviter les erreurs d'hydratation
  if (!mounted) {
    return (
      <button
        className={`
          ${variant === 'menu' ? 'px-3 py-2' : sizeClasses[size]}
          inline-flex items-center justify-center
          rounded-md
          bg-gray-200
          text-gray-400
          border border-gray-300
          ${className}
        `}
        disabled
      >
        <GlobeAltIcon className={iconSizeClasses[size]} />
      </button>
    )
  }

  if (variant === 'button') {
    return (
      <button
        onClick={() => {
          // Cycler à travers les langues principales
          const mainLanguages: Language[] = ['fr', 'en', 'es', 'de']
          const currentIndex = mainLanguages.indexOf(language)
          const nextIndex = (currentIndex + 1) % mainLanguages.length
          setLanguage(mainLanguages[nextIndex])
        }}
        className={`
          ${sizeClasses[size]}
          inline-flex items-center justify-center
          rounded-full
          bg-background-secondary
          text-foreground-secondary
          hover:bg-background
          hover:text-foreground
          focus:outline-none
          focus:ring-2
          focus:ring-primary-500
          focus:ring-offset-2
          transition-all duration-200
          border border-border
          ${className}
        `}
        title={`Langue actuelle: ${languageInfo.nativeName}`}
      >
        <span className="text-lg font-medium">
          {showFlag ? languageInfo.flag : languageInfo.code.toUpperCase()}
        </span>
      </button>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          inline-flex items-center justify-center
          px-3 py-2
          rounded-md
          bg-background-secondary
          text-foreground-secondary
          hover:bg-background
          hover:text-foreground
          focus:outline-none
          focus:ring-2
          focus:ring-primary-500
          focus:ring-offset-2
          transition-all duration-200
          border border-border
          ${className}
        `}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="flex items-center space-x-2">
          {showFlag && <span className="text-base">{languageInfo.flag}</span>}
          {showName && <span className="text-sm font-medium">{languageInfo.code.toUpperCase()}</span>}
          {!showFlag && !showName && <GlobeAltIcon className={iconSizeClasses[size]} />}
          <ChevronDownIcon 
            className={`h-4 w-4 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-56 rounded-md bg-card border border-border shadow-lg z-50"
          >
            <div className="py-1">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code)
                    setIsOpen(false)
                  }}
                  className={`
                    w-full text-left px-4 py-2 text-sm
                    flex items-center space-x-3
                    hover:bg-background-secondary
                    transition-colors duration-150
                    ${language === lang.code 
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300' 
                      : 'text-foreground-secondary'
                    }
                  `}
                >
                  <span className="text-base">{lang.flag}</span>
                  <div className="flex-1">
                    <div className="font-medium">{lang.nativeName}</div>
                    <div className="text-xs text-foreground-muted">{lang.name}</div>
                  </div>
                  {language === lang.code && (
                    <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Composant de sélection simple avec select natif
export function LanguageSelector() {
  const { language, setLanguage } = useLanguage()
  const mounted = useMounted()

  // Éviter les erreurs d'hydratation
  if (!mounted) {
    return (
      <select className="form-select pr-10 appearance-none cursor-pointer" disabled>
        <option value="fr">Français</option>
      </select>
    )
  }

  return (
    <div className="relative">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="form-select pr-10 appearance-none cursor-pointer"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.nativeName}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <GlobeAltIcon className="h-4 w-4 text-foreground-muted" />
      </div>
    </div>
  )
}

// Composant indicateur de traduction en cours
export function TranslationIndicator() {
  const { isTranslating } = useLanguage()

  if (!isTranslating) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-primary-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
        <span className="text-sm font-medium">Traduction en cours...</span>
      </div>
    </div>
  )
}

// Hook pour traduire automatiquement le contenu des éléments
export function useAutoTranslate() {
  const { translate, language } = useLanguage()
  const [isTranslating, setIsTranslating] = useState(false)

  const translateElement = async (element: HTMLElement) => {
    if (language === 'fr') return // Pas de traduction si on est déjà en français

    setIsTranslating(true)
    
    try {
      const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            // Ignorer les scripts et styles
            const parent = node.parentElement
            if (!parent || ['SCRIPT', 'STYLE', 'CODE', 'PRE'].includes(parent.tagName)) {
              return NodeFilter.FILTER_REJECT
            }
            // Ignorer les textes vides ou très courts
            if (!node.textContent || node.textContent.trim().length < 3) {
              return NodeFilter.FILTER_REJECT
            }
            return NodeFilter.FILTER_ACCEPT
          }
        }
      )

      const textNodes: Text[] = []
      let node
      while (node = walker.nextNode()) {
        textNodes.push(node as Text)
      }

      // Traduire chaque nœud de texte
      for (const textNode of textNodes) {
        const originalText = textNode.textContent || ''
        if (originalText.trim()) {
          const translatedText = await translate(originalText)
          textNode.textContent = translatedText
        }
      }
    } catch (error) {
      console.error('Erreur lors de la traduction automatique:', error)
    } finally {
      setIsTranslating(false)
    }
  }

  return { translateElement, isTranslating }
} 