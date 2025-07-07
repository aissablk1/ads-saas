'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'

// Types pour la navigation vocale
type VoiceCommand = 'next' | 'previous' | 'home' | 'end' | 'pause' | 'resume' | 'help'
type VoiceRecognitionState = 'idle' | 'listening' | 'processing' | 'error'
type AccessibilityLevel = 'basic' | 'enhanced' | 'full'

interface VoiceNavigationProps {
  onSectionChange: (index: number) => void
  currentSection: number
  totalSections: number
  userMode: 'exploration' | 'efficiency' | 'accessibility'
  platform: 'desktop' | 'mobile' | 'tablet'
  isEnabled?: boolean
}

// Configuration des commandes vocales selon le mode
const VoiceCommands = {
  exploration: {
    commands: {
      'section suivante': 'next',
      'section précédente': 'previous',
      'aller à l\'accueil': 'home',
      'aller à la fin': 'end',
      'pause': 'pause',
      'reprendre': 'resume',
      'aide': 'help'
    },
    feedback: 'detailed',
    sensitivity: 'medium'
  },
  efficiency: {
    commands: {
      'suivant': 'next',
      'précédent': 'previous',
      'accueil': 'home',
      'fin': 'end',
      'stop': 'pause',
      'aide': 'help'
    },
    feedback: 'minimal',
    sensitivity: 'high'
  },
  accessibility: {
    commands: {
      'section suivante': 'next',
      'section précédente': 'previous',
      'aller à l\'accueil': 'home',
      'aller à la fin': 'end',
      'mettre en pause': 'pause',
      'reprendre la lecture': 'resume',
      'afficher l\'aide': 'help'
    },
    feedback: 'enhanced',
    sensitivity: 'low'
  }
}

// Hook pour la reconnaissance vocale
export const useVoiceRecognition = (userMode: 'exploration' | 'efficiency' | 'accessibility' = 'exploration') => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [confidence, setConfidence] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  
  const recognitionRef = useRef<any>(null)
  const commands = VoiceCommands[userMode].commands

  // Initialiser la reconnaissance vocale
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'fr-FR'
      
      setIsSupported(true)
    } else {
      setIsSupported(false)
      setError('La reconnaissance vocale n\'est pas supportée par votre navigateur')
    }
  }, [])

  // Configurer les événements de reconnaissance
  useEffect(() => {
    if (!recognitionRef.current) return

    recognitionRef.current.onstart = () => {
      setIsListening(true)
      setError(null)
    }

    recognitionRef.current.onresult = (event: any) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      setTranscript(finalTranscript || interimTranscript)
      setConfidence(event.results[event.results.length - 1]?.[0]?.confidence || 0)
    }

    recognitionRef.current.onerror = (event: any) => {
      setError(`Erreur de reconnaissance vocale: ${event.error}`)
      setIsListening(false)
    }

    recognitionRef.current.onend = () => {
      setIsListening(false)
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  // Démarrer l'écoute
  const startListening = useCallback(() => {
    if (recognitionRef.current && isSupported) {
      try {
        recognitionRef.current.start()
      } catch (error) {
        setError('Impossible de démarrer la reconnaissance vocale')
      }
    }
  }, [isSupported])

  // Arrêter l'écoute
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }, [])

  // Analyser les commandes vocales
  const analyzeCommand = useCallback((text: string): VoiceCommand | null => {
    const normalizedText = text.toLowerCase().trim()
    
    for (const [phrase, command] of Object.entries(commands)) {
      if (normalizedText.includes(phrase.toLowerCase())) {
        return command as VoiceCommand
      }
    }
    
    return null
  }, [commands])

  return {
    isListening,
    transcript,
    confidence,
    error,
    isSupported,
    startListening,
    stopListening,
    analyzeCommand
  }
}

// Composant de navigation vocale
export const VoiceNavigation: React.FC<VoiceNavigationProps> = ({
  onSectionChange,
  currentSection,
  totalSections,
  userMode,
  platform,
  isEnabled = true
}) => {
  const [isActive, setIsActive] = useState(false)
  const [lastCommand, setLastCommand] = useState<VoiceCommand | null>(null)
  const [feedback, setFeedback] = useState('')
  
  const {
    isListening,
    transcript,
    confidence,
    error,
    isSupported,
    startListening,
    stopListening,
    analyzeCommand
  } = useVoiceRecognition(userMode)

  // Traiter les commandes vocales
  useEffect(() => {
    if (transcript && confidence > 0.7) {
      const command = analyzeCommand(transcript)
      
      if (command) {
        setLastCommand(command)
        
        switch (command) {
          case 'next':
            if (currentSection < totalSections - 1) {
              onSectionChange(currentSection + 1)
              setFeedback(`Section ${currentSection + 2} sur ${totalSections}`)
            } else {
              setFeedback('Vous êtes déjà à la dernière section')
            }
            break
            
          case 'previous':
            if (currentSection > 0) {
              onSectionChange(currentSection - 1)
              setFeedback(`Section ${currentSection} sur ${totalSections}`)
            } else {
              setFeedback('Vous êtes déjà à la première section')
            }
            break
            
          case 'home':
            onSectionChange(0)
            setFeedback('Accueil')
            break
            
          case 'end':
            onSectionChange(totalSections - 1)
            setFeedback(`Section ${totalSections} sur ${totalSections}`)
            break
            
          case 'pause':
            setIsActive(false)
            stopListening()
            setFeedback('Navigation vocale mise en pause')
            break
            
          case 'resume':
            setIsActive(true)
            startListening()
            setFeedback('Navigation vocale reprise')
            break
            
          case 'help':
            setFeedback('Commandes disponibles: section suivante, section précédente, accueil, fin, pause, reprendre')
            break
        }
        
        // Effacer le feedback après 3 secondes
        setTimeout(() => setFeedback(''), 3000)
      }
    }
  }, [transcript, confidence, analyzeCommand, currentSection, totalSections, onSectionChange, startListening, stopListening])

  // Masquer sur mobile/tablet ou si non supporté
  if (platform !== 'desktop' || !isSupported || !isEnabled) {
    return null
  }

  const config = VoiceCommands[userMode]

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="flex flex-col items-end space-y-2">
        {/* Bouton de navigation vocale */}
        <button
          onClick={() => {
            if (isActive) {
              setIsActive(false)
              stopListening()
            } else {
              setIsActive(true)
              startListening()
            }
          }}
          className={`p-4 rounded-full shadow-lg transition-all duration-300 ${
            isActive 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-primary-600 hover:bg-primary-700 text-white'
          }`}
          title={isActive ? 'Arrêter la navigation vocale' : 'Activer la navigation vocale'}
        >
          <svg 
            className={`w-6 h-6 ${isListening ? 'animate-pulse' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            {isListening ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            )}
          </svg>
        </button>

        {/* Indicateur d'état */}
        {isActive && (
          <div className="bg-background/95 backdrop-blur-md border border-border rounded-lg p-3 shadow-lg min-w-64">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Navigation Vocale</span>
                <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
              </div>
              
              {isListening && (
                <div className="text-xs text-foreground-muted">
                  Écoute en cours... Dites une commande
                </div>
              )}
              
              {transcript && (
                <div className="text-xs text-foreground-muted">
                  <div>Reconnu: "{transcript}"</div>
                  <div>Confiance: {Math.round(confidence * 100)}%</div>
                </div>
              )}
              
              {error && (
                <div className="text-xs text-red-500">
                  {error}
                </div>
              )}
              
              {feedback && (
                <div className="text-xs text-primary-600 font-medium">
                  {feedback}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Composant de contrôles adaptatifs
export const AdaptiveControls: React.FC<{
  currentSection: number
  totalSections: number
  onSectionChange: (index: number) => void
  userMode: 'exploration' | 'efficiency' | 'accessibility'
  platform: 'desktop' | 'mobile' | 'tablet'
  canUseEffects: boolean
}> = ({
  currentSection,
  totalSections,
  onSectionChange,
  userMode,
  platform,
  canUseEffects
}) => {
  const [showControls, setShowControls] = useState(false)
  const [controlMode, setControlMode] = useState<'keyboard' | 'mouse' | 'touch' | 'voice'>('keyboard')

  // Détecter le mode de contrôle
  useEffect(() => {
    const handleKeyDown = () => setControlMode('keyboard')
    const handleMouseMove = () => setControlMode('mouse')
    const handleTouchStart = () => setControlMode('touch')

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('touchstart', handleTouchStart)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('touchstart', handleTouchStart)
    }
  }, [])

  // Masquer sur mobile/tablet
  if (platform !== 'desktop') return null

  const controls = {
    exploration: {
      showAdvanced: true,
      showShortcuts: true,
      showEffects: true
    },
    efficiency: {
      showAdvanced: false,
      showShortcuts: true,
      showEffects: false
    },
    accessibility: {
      showAdvanced: true,
      showShortcuts: true,
      showEffects: false
    }
  }

  const config = controls[userMode]

  return (
    <div className="fixed top-20 right-6 z-50">
      <div className="flex flex-col items-end space-y-2">
        {/* Bouton de contrôles */}
        <button
          onClick={() => setShowControls(!showControls)}
          className="p-3 bg-background/95 backdrop-blur-md border border-border rounded-lg shadow-lg hover:bg-background-secondary transition-colors"
          title="Contrôles adaptatifs"
        >
          <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        {/* Panneau de contrôles */}
        {showControls && (
          <div className="bg-background/95 backdrop-blur-md border border-border rounded-lg p-4 shadow-lg min-w-80">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">Contrôles Adaptatifs</h3>
              
              {/* Mode de contrôle actuel */}
              <div className="space-y-2">
                <div className="text-xs text-foreground-muted">Mode de contrôle:</div>
                <div className="flex space-x-2">
                  {['keyboard', 'mouse', 'touch', 'voice'].map((mode) => (
                    <button
                      key={mode}
                      className={`px-2 py-1 text-xs rounded ${
                        controlMode === mode 
                          ? 'bg-primary-600 text-white' 
                          : 'bg-background-secondary text-foreground-muted hover:text-foreground'
                      }`}
                    >
                      {mode === 'keyboard' && '⌨️'}
                      {mode === 'mouse' && '🖱️'}
                      {mode === 'touch' && '👆'}
                      {mode === 'voice' && '🎤'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Raccourcis clavier */}
              {config.showShortcuts && (
                <div className="space-y-2">
                  <div className="text-xs text-foreground-muted">Raccourcis clavier:</div>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>Section suivante:</span>
                      <kbd className="px-1 py-0.5 bg-background-secondary rounded text-xs">↓</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span>Section précédente:</span>
                      <kbd className="px-1 py-0.5 bg-background-secondary rounded text-xs">↑</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span>Accueil:</span>
                      <kbd className="px-1 py-0.5 bg-background-secondary rounded text-xs">Home</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span>Fin:</span>
                      <kbd className="px-1 py-0.5 bg-background-secondary rounded text-xs">End</kbd>
                    </div>
                  </div>
                </div>
              )}

              {/* Commandes vocales */}
              <div className="space-y-2">
                <div className="text-xs text-foreground-muted">Commandes vocales:</div>
                <div className="text-xs space-y-1">
                  <div>"Section suivante"</div>
                  <div>"Section précédente"</div>
                  <div>"Aller à l'accueil"</div>
                  <div>"Aller à la fin"</div>
                </div>
              </div>

              {/* État des effets */}
              {config.showEffects && (
                <div className="space-y-2">
                  <div className="text-xs text-foreground-muted">Effets visuels:</div>
                  <div className={`text-xs ${canUseEffects ? 'text-green-500' : 'text-red-500'}`}>
                    {canUseEffects ? 'Activés' : 'Désactivés'}
                  </div>
                </div>
              )}

              {/* Section actuelle */}
              <div className="space-y-2">
                <div className="text-xs text-foreground-muted">Section actuelle:</div>
                <div className="text-xs font-medium">
                  {currentSection + 1} sur {totalSections}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 