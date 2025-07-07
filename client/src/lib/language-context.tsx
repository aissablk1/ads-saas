'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

// Types pour les langues supportées
export type Language = 'fr' | 'en' | 'es' | 'de' | 'it' | 'pt' | 'ru' | 'zh' | 'ja' | 'ar'

export interface LanguageInfo {
  code: Language
  name: string
  nativeName: string
  flag: string
  rtl?: boolean
}

// Configuration des langues disponibles
export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'fr', name: 'Français', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true }
]

interface LanguageContextType {
  language: Language
  languageInfo: LanguageInfo
  setLanguage: (language: Language) => void
  translate: (text: string, targetLang?: Language) => Promise<string>
  isTranslating: boolean
  translationCache: Map<string, string>
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('fr')
  const [mounted, setMounted] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [translationCache] = useState(new Map<string, string>())

  // Obtenir les informations de la langue actuelle
  const languageInfo = SUPPORTED_LANGUAGES.find(lang => lang.code === language) || SUPPORTED_LANGUAGES[0]

  // Charger la langue sauvegardée au montage
  useEffect(() => {
    // Vérifier si on est côté client
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('language') as Language | null
      const browserLang = navigator.language.slice(0, 2) as Language
      
      let initialLanguage: Language = 'fr' // Langue par défaut
      
      if (stored && SUPPORTED_LANGUAGES.some(lang => lang.code === stored)) {
        initialLanguage = stored
      } else if (SUPPORTED_LANGUAGES.some(lang => lang.code === browserLang)) {
        initialLanguage = browserLang
      }

      setLanguageState(initialLanguage)
      
      // Appliquer la direction RTL si nécessaire
      const langInfo = SUPPORTED_LANGUAGES.find(lang => lang.code === initialLanguage)
      document.documentElement.dir = langInfo?.rtl ? 'rtl' : 'ltr'
      document.documentElement.lang = initialLanguage
    }
    
    setMounted(true)
  }, [])

  // Appliquer les changements de langue
  useEffect(() => {
    if (!mounted) return

    // Vérifier si localStorage est disponible
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      // Sauvegarder dans localStorage
      localStorage.setItem('language', language)
      
      // Mettre à jour les attributs HTML
      document.documentElement.lang = language
      document.documentElement.dir = languageInfo.rtl ? 'rtl' : 'ltr'
    }
  }, [language, languageInfo, mounted])

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage)
  }

  // Fonction de traduction avec cache
  const translate = async (text: string, targetLang?: Language): Promise<string> => {
    const target = targetLang || language
    
    // Si c'est déjà en français ou la langue cible, pas de traduction
    if (target === 'fr' || text.trim() === '') {
      return text
    }

    // Vérifier le cache
    const cacheKey = `${text}_${target}`
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey)!
    }

    setIsTranslating(true)
    
    try {
      // Appeler l'API de traduction
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          sourceLang: 'fr',
          targetLang: target,
        }),
      })

      if (!response.ok) {
        throw new Error('Erreur de traduction')
      }

      const data = await response.json()
      const translatedText = data.translatedText || text

      // Mettre en cache
      translationCache.set(cacheKey, translatedText)
      
      return translatedText
    } catch (error) {
      console.error('Erreur de traduction:', error)
      return text // Retourner le texte original en cas d'erreur
    } finally {
      setIsTranslating(false)
    }
  }

  return (
    <LanguageContext.Provider value={{
      language,
      languageInfo,
      setLanguage,
      translate,
      isTranslating,
      translationCache,
    }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// Hook pour vérifier si le composant est monté (éviter les erreurs d'hydratation)
export function useMounted() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return mounted
}

// Hook de traduction avec mise en cache automatique
export function useTranslation() {
  const { translate, language, isTranslating } = useLanguage()
  const [translations, setTranslations] = useState<Map<string, string>>(new Map())

  const t = async (text: string): Promise<string> => {
    const cacheKey = `${text}_${language}`
    
    if (translations.has(cacheKey)) {
      return translations.get(cacheKey)!
    }

    const translatedText = await translate(text)
    setTranslations(prev => new Map(prev).set(cacheKey, translatedText))
    
    return translatedText
  }

  return { t, isTranslating, language }
} 