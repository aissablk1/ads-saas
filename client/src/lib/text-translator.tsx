'use client'

import React, { useEffect, useState, ReactNode } from 'react'
import { useLanguage } from './language-context'

interface TranslatedTextProps {
  children: ReactNode
  className?: string
  fallback?: ReactNode
}

// Composant pour traduire automatiquement le texte
export function TranslatedText({ children, className, fallback }: TranslatedTextProps) {
  const { translate, language } = useLanguage()
  const [translatedContent, setTranslatedContent] = useState<ReactNode>(children)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (language === 'fr') {
      setTranslatedContent(children)
      return
    }

    const translateContent = async () => {
      if (typeof children === 'string') {
        setIsLoading(true)
        try {
          const translated = await translate(children)
          setTranslatedContent(translated)
        } catch (error) {
          console.error('Erreur de traduction:', error)
          setTranslatedContent(fallback || children)
        } finally {
          setIsLoading(false)
        }
      }
    }

    translateContent()
  }, [children, language, translate, fallback])

  if (isLoading) {
    return (
      <span className={className}>
        <span className="opacity-50">{children}</span>
        <span className="inline-block ml-1 w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
      </span>
    )
  }

  return <span className={className}>{translatedContent}</span>
}

// Hook pour traduire du texte de manière réactive
export function useTranslatedText(text: string): [string, boolean] {
  const { translate, language } = useLanguage()
  const [translatedText, setTranslatedText] = useState(text)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (language === 'fr' || !text) {
      setTranslatedText(text)
      return
    }

    const translateText = async () => {
      setIsLoading(true)
      try {
        const translated = await translate(text)
        setTranslatedText(translated)
      } catch (error) {
        console.error('Erreur de traduction:', error)
        setTranslatedText(text)
      } finally {
        setIsLoading(false)
      }
    }

    translateText()
  }, [text, language, translate])

  return [translatedText, isLoading]
}

// Hook pour traduire plusieurs textes en batch
export function useTranslatedTexts(texts: string[]): [string[], boolean] {
  const { translate, language } = useLanguage()
  const [translatedTexts, setTranslatedTexts] = useState(texts)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (language === 'fr' || texts.length === 0) {
      setTranslatedTexts(texts)
      return
    }

    const translateTexts = async () => {
      setIsLoading(true)
      try {
        const translations = await Promise.all(
          texts.map(text => translate(text))
        )
        setTranslatedTexts(translations)
      } catch (error) {
        console.error('Erreur de traduction batch:', error)
        setTranslatedTexts(texts)
      } finally {
        setIsLoading(false)
      }
    }

    translateTexts()
  }, [texts, language, translate])

  return [translatedTexts, isLoading]
}

// Composant HOC pour wrapper un composant avec traduction automatique
export function withTranslation<P extends object>(
  Component: React.ComponentType<P>
) {
  return function TranslatedComponent(props: P) {
    const { language } = useLanguage()
    
    // Passer la langue actuelle comme prop si le composant l'accepte
    const propsWithLanguage = {
      ...props,
      currentLanguage: language,
    } as P & { currentLanguage: string }

    return <Component {...propsWithLanguage} />
  }
}

// Hook pour traduire le contenu d'objets (ex: éléments de navigation)
interface TranslatableItem {
  [key: string]: any
  name?: string
  title?: string
  description?: string
  label?: string
}

export function useTranslatedItems<T extends TranslatableItem>(
  items: T[], 
  textFields: (keyof T)[] = ['name', 'title', 'description', 'label']
): [T[], boolean] {
  const { translate, language } = useLanguage()
  const [translatedItems, setTranslatedItems] = useState(items)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (language === 'fr' || items.length === 0) {
      setTranslatedItems(items)
      return
    }

    const translateItems = async () => {
      setIsLoading(true)
      try {
        const translated = await Promise.all(
          items.map(async (item) => {
            const translatedItem = { ...item }
            
            for (const field of textFields) {
              const fieldValue = item[field]
              if (typeof fieldValue === 'string') {
                (translatedItem[field] as any) = await translate(fieldValue)
              }
            }
            
            return translatedItem
          })
        )
        setTranslatedItems(translated)
      } catch (error) {
        console.error('Erreur de traduction des éléments:', error)
        setTranslatedItems(items)
      } finally {
        setIsLoading(false)
      }
    }

    translateItems()
  }, [items, language, translate, textFields])

  return [translatedItems, isLoading]
}

// Composant pour afficher un indicateur de traduction
export function TranslationBadge() {
  const { language, languageInfo, isTranslating } = useLanguage()
  
  if (language === 'fr') return null

  return (
    <div className={`
      fixed top-20 right-4 z-40 px-3 py-1 rounded-full text-xs font-medium
      ${isTranslating 
        ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
        : 'bg-green-100 text-green-800 border border-green-200'
      }
      transition-all duration-200
    `}>
      <div className="flex items-center space-x-1">
        <span>{languageInfo.flag}</span>
        <span>{isTranslating ? 'Traduction...' : 'Traduit'}</span>
        {isTranslating && (
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
        )}
      </div>
    </div>
  )
}

// Directive pour marquer du texte comme non traduisible
export function NoTranslate({ children, className }: { children: ReactNode, className?: string }) {
  return <span className={className} data-notranslate="true">{children}</span>
} 