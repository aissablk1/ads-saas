import { NextRequest, NextResponse } from 'next/server'

interface TranslateRequest {
  text: string
  sourceLang: string
  targetLang: string
}

interface TranslateResponse {
  translatedText: string
  detectedLanguage?: string
  engine: 'google' | 'libre' | 'mock'
}

// Configuration de l'API Google Translate
const GOOGLE_TRANSLATE_API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY
const GOOGLE_TRANSLATE_URL = 'https://translation.googleapis.com/language/translate/v2'

// Configuration LibreTranslate (alternative open source)
const LIBRETRANSLATE_URL = process.env.LIBRETRANSLATE_URL || 'https://libretranslate.com/translate'
const LIBRETRANSLATE_API_KEY = process.env.LIBRETRANSLATE_API_KEY

// Fonction pour traduire avec Google Translate
async function translateWithGoogle(text: string, sourceLang: string, targetLang: string): Promise<string> {
  if (!GOOGLE_TRANSLATE_API_KEY) {
    throw new Error('Google Translate API key not configured')
  }

  const response = await fetch(GOOGLE_TRANSLATE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: text,
      source: sourceLang,
      target: targetLang,
      key: GOOGLE_TRANSLATE_API_KEY,
    }),
  })

  if (!response.ok) {
    throw new Error(`Google Translate API error: ${response.status}`)
  }

  const data = await response.json()
  return data.data.translations[0].translatedText
}

// Fonction pour traduire avec LibreTranslate
async function translateWithLibre(text: string, sourceLang: string, targetLang: string): Promise<string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  // Ajouter la clé API si disponible
  if (LIBRETRANSLATE_API_KEY) {
    headers['Authorization'] = `Bearer ${LIBRETRANSLATE_API_KEY}`
  }

  const requestBody = {
    q: text,
    source: sourceLang === 'auto' ? 'auto' : sourceLang,
    target: targetLang,
    format: 'text'
  }

  const response = await fetch(LIBRETRANSLATE_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('LibreTranslate error details:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText
    })
    throw new Error(`LibreTranslate API error: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  
  if (!data.translatedText) {
    throw new Error('Invalid response from LibreTranslate API')
  }
  
  return data.translatedText
}

// Fonction de traduction mock pour le développement
function translateWithMock(text: string, sourceLang: string, targetLang: string): string {
  // Traductions mockées pour les tests
  const mockTranslations: Record<string, Record<string, string>> = {
    en: {
      'Tableau de bord': 'Dashboard',
      'Campagnes': 'Campaigns',
      'Analytics': 'Analytics',
      'Paramètres': 'Settings',
      'Déconnexion': 'Logout',
      'Connexion': 'Login',
      'Inscription': 'Register',
    },
    es: {
      'Tableau de bord': 'Panel de control',
      'Campagnes': 'Campañas',
      'Analytics': 'Analítica',
      'Paramètres': 'Configuración',
      'Déconnexion': 'Cerrar sesión',
      'Connexion': 'Iniciar sesión',
      'Inscription': 'Registrarse',
    },
    de: {
      'Tableau de bord': 'Dashboard',
      'Campagnes': 'Kampagnen',
      'Analytics': 'Analytics',
      'Paramètres': 'Einstellungen',
      'Déconnexion': 'Abmelden',
      'Connexion': 'Anmelden',
      'Inscription': 'Registrieren',
    }
  }

  return mockTranslations[targetLang]?.[text] || `[${targetLang.toUpperCase()}] ${text}`
}

// Cache en mémoire simple (pour une vraie app, utiliser Redis)
const translationCache = new Map<string, string>()

export async function POST(request: NextRequest) {
  try {
    const { text, sourceLang, targetLang }: TranslateRequest = await request.json()

    // Validation des paramètres
    if (!text || !sourceLang || !targetLang) {
      return NextResponse.json(
        { error: 'Missing required parameters: text, sourceLang, targetLang' },
        { status: 400 }
      )
    }

    // Si la langue source et cible sont identiques
    if (sourceLang === targetLang) {
      return NextResponse.json({
        translatedText: text,
        engine: 'none'
      })
    }

    // Vérifier le cache
    const cacheKey = `${text}_${sourceLang}_${targetLang}`
    if (translationCache.has(cacheKey)) {
      return NextResponse.json({
        translatedText: translationCache.get(cacheKey),
        engine: 'cache'
      })
    }

    let translatedText: string
    let engine: 'google' | 'libre' | 'mock'

    try {
      // Essayer Google Translate en premier
      if (GOOGLE_TRANSLATE_API_KEY) {
        translatedText = await translateWithGoogle(text, sourceLang, targetLang)
        engine = 'google'
      }
      // Sinon essayer LibreTranslate
      else if (LIBRETRANSLATE_URL) {
        translatedText = await translateWithLibre(text, sourceLang, targetLang)
        engine = 'libre'
      }
      // Fallback sur les traductions mockées
      else {
        translatedText = translateWithMock(text, sourceLang, targetLang)
        engine = 'mock'
      }
    } catch (apiError) {
      console.error('Translation API error:', apiError)
      
      // En cas d'erreur, utiliser le mock
      translatedText = translateWithMock(text, sourceLang, targetLang)
      engine = 'mock'
    }

    // Mettre en cache
    translationCache.set(cacheKey, translatedText)

    const response: TranslateResponse = {
      translatedText,
      engine
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Translation API is running',
    engines: {
      google: !!GOOGLE_TRANSLATE_API_KEY,
      libre: !!LIBRETRANSLATE_URL,
      mock: true
    }
  })
} 