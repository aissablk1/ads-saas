'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'

// Types pour les tests utilisateurs
type TestType = 'performance' | 'usability' | 'accessibility' | 'navigation'
type TestResult = 'pass' | 'fail' | 'warning'
type UserInteraction = 'click' | 'scroll' | 'keyboard' | 'voice' | 'hover'

interface TestMetric {
  name: string
  value: number
  unit: string
  threshold: number
  result: TestResult
}

interface UserTestSession {
  id: string
  startTime: number
  endTime?: number
  interactions: UserInteraction[]
  metrics: TestMetric[]
  deviceInfo: {
    userAgent: string
    screenSize: { width: number; height: number }
    cores: number
    memory?: number
  }
  performance: {
    fps: number[]
    memoryUsage: number[]
    loadTimes: number[]
  }
}

// Hook pour les tests de performance
export const usePerformanceTesting = () => {
  const [metrics, setMetrics] = useState<TestMetric[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const frameCount = useRef(0)
  const lastTime = useRef(performance.now())
  const fpsHistory = useRef<number[]>([])
  
  const measureFPS = useCallback(() => {
    const now = performance.now()
    frameCount.current++
    
    if (now - lastTime.current >= 1000) {
      const fps = Math.round((frameCount.current * 1000) / (now - lastTime.current))
      fpsHistory.current.push(fps)
      
      // Garder seulement les 60 dernières mesures
      if (fpsHistory.current.length > 60) {
        fpsHistory.current.shift()
      }
      
      frameCount.current = 0
      lastTime.current = now
      
      // Mettre à jour les métriques
      const avgFPS = fpsHistory.current.reduce((a, b) => a + b, 0) / fpsHistory.current.length
      const minFPS = Math.min(...fpsHistory.current)
      
      setMetrics(prev => [
        ...prev.filter(m => !m.name.includes('FPS')),
        {
          name: 'FPS Moyen',
          value: Math.round(avgFPS),
          unit: 'fps',
          threshold: 30,
          result: avgFPS >= 30 ? 'pass' : avgFPS >= 20 ? 'warning' : 'fail'
        },
        {
          name: 'FPS Minimum',
          value: minFPS,
          unit: 'fps',
          threshold: 20,
          result: minFPS >= 20 ? 'pass' : minFPS >= 15 ? 'warning' : 'fail'
        }
      ])
    }
    
    if (isRunning) {
      requestAnimationFrame(measureFPS)
    }
  }, [isRunning])
  
  const startTest = useCallback(() => {
    setIsRunning(true)
    setMetrics([])
    fpsHistory.current = []
    frameCount.current = 0
    lastTime.current = performance.now()
    requestAnimationFrame(measureFPS)
  }, [measureFPS])
  
  const stopTest = useCallback(() => {
    setIsRunning(false)
  }, [])
  
  return {
    metrics,
    isRunning,
    startTest,
    stopTest,
    fpsHistory: fpsHistory.current
  }
}

// Hook pour les tests d'utilisabilité
export const useUsabilityTesting = () => {
  const [interactions, setInteractions] = useState<UserInteraction[]>([])
  const [session, setSession] = useState<UserTestSession | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  
  const startSession = useCallback(() => {
    const newSession: UserTestSession = {
      id: `session-${Date.now()}`,
      startTime: Date.now(),
      interactions: [],
      metrics: [],
      deviceInfo: {
        userAgent: navigator.userAgent,
        screenSize: { width: window.innerWidth, height: window.innerHeight },
        cores: navigator.hardwareConcurrency || 4
      },
      performance: {
        fps: [],
        memoryUsage: [],
        loadTimes: []
      }
    }
    
    setSession(newSession)
    setIsRecording(true)
  }, [])
  
  const recordInteraction = useCallback((interaction: UserInteraction) => {
    if (!isRecording || !session) return
    
    setInteractions(prev => [...prev, interaction])
    setSession(prev => prev ? {
      ...prev,
      interactions: [...prev.interactions, interaction]
    } : null)
  }, [isRecording, session])
  
  const stopSession = useCallback(() => {
    if (!session) return
    
    const endTime = Date.now()
    const duration = endTime - session.startTime
    
    const completedSession: UserTestSession = {
      ...session,
      endTime,
      metrics: [
        {
          name: 'Durée de session',
          value: duration / 1000,
          unit: 'secondes',
          threshold: 300,
          result: duration >= 300000 ? 'pass' : 'warning'
        },
        {
          name: 'Interactions totales',
          value: session.interactions.length,
          unit: 'actions',
          threshold: 10,
          result: session.interactions.length >= 10 ? 'pass' : 'warning'
        }
      ]
    }
    
    setSession(completedSession)
    setIsRecording(false)
    
    // Sauvegarder la session
    const sessions = JSON.parse(localStorage.getItem('userTestSessions') || '[]')
    sessions.push(completedSession)
    localStorage.setItem('userTestSessions', JSON.stringify(sessions))
  }, [session])
  
  return {
    interactions,
    session,
    isRecording,
    startSession,
    stopSession,
    recordInteraction
  }
}

// Hook pour les tests d'accessibilité
export const useAccessibilityTesting = () => {
  const [accessibilityIssues, setAccessibilityIssues] = useState<string[]>([])
  const [isScanning, setIsScanning] = useState(false)
  
  const scanAccessibility = useCallback(() => {
    setIsScanning(true)
    const issues: string[] = []
    
    // Vérifier les images sans alt
    const images = document.querySelectorAll('img')
    images.forEach((img, index) => {
      if (!img.alt && !img.getAttribute('aria-label')) {
        issues.push(`Image ${index + 1} sans attribut alt ou aria-label`)
      }
    })
    
    // Vérifier les contrastes
    const elements = document.querySelectorAll('*')
    elements.forEach((element) => {
      const style = window.getComputedStyle(element)
      const color = style.color
      const backgroundColor = style.backgroundColor
      
      // Vérification basique du contraste (simplifiée)
      if (color && backgroundColor && color !== backgroundColor) {
        // Logique de vérification du contraste simplifiée
        if (color.includes('rgb(255,255,255)') && backgroundColor.includes('rgb(255,255,255)')) {
          issues.push('Contraste insuffisant détecté')
        }
      }
    })
    
    // Vérifier la navigation au clavier
    const focusableElements = document.querySelectorAll('button, a, input, textarea, select, [tabindex]')
    if (focusableElements.length === 0) {
      issues.push('Aucun élément focusable trouvé')
    }
    
    setAccessibilityIssues(issues)
    setIsScanning(false)
  }, [])
  
  return {
    accessibilityIssues,
    isScanning,
    scanAccessibility
  }
}

// Composant de test utilisateur complet
export const UserTestingPanel: React.FC = () => {
  const performanceTest = usePerformanceTesting()
  const usabilityTest = useUsabilityTesting()
  const accessibilityTest = useAccessibilityTesting()
  const [activeTest, setActiveTest] = useState<TestType | null>(null)
  const [testResults, setTestResults] = useState<{
    performance: TestMetric[]
    usability: UserTestSession | null
    accessibility: string[]
  }>({
    performance: [],
    usability: null,
    accessibility: []
  })
  
  const runTest = useCallback((testType: TestType) => {
    setActiveTest(testType)
    
    switch (testType) {
      case 'performance':
        performanceTest.startTest()
        setTimeout(() => {
          performanceTest.stopTest()
          setTestResults(prev => ({ ...prev, performance: performanceTest.metrics }))
          setActiveTest(null)
        }, 10000) // 10 secondes de test
        break
        
      case 'usability':
        usabilityTest.startSession()
        break
        
      case 'accessibility':
        accessibilityTest.scanAccessibility()
        setTimeout(() => {
          setTestResults(prev => ({ 
            ...prev, 
            accessibility: accessibilityTest.accessibilityIssues 
          }))
          setActiveTest(null)
        }, 2000)
        break
    }
  }, [performanceTest, usabilityTest, accessibilityTest])
  
  const stopUsabilityTest = useCallback(() => {
    usabilityTest.stopSession()
    setTestResults(prev => ({ ...prev, usability: usabilityTest.session }))
    setActiveTest(null)
  }, [usabilityTest])
  
  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 w-80 max-h-96 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4">Tests Utilisateurs</h3>
      
      {/* Boutons de test */}
      <div className="space-y-2 mb-4">
        <button
          onClick={() => runTest('performance')}
          disabled={activeTest !== null}
          className="w-full px-3 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {activeTest === 'performance' ? 'Test en cours...' : 'Test Performance'}
        </button>
        
        <button
          onClick={() => runTest('usability')}
          disabled={activeTest !== null}
          className="w-full px-3 py-2 bg-green-500 text-white rounded disabled:opacity-50"
        >
          {activeTest === 'usability' ? 'Enregistrement...' : 'Test Utilisabilité'}
        </button>
        
        <button
          onClick={() => runTest('accessibility')}
          disabled={activeTest !== null}
          className="w-full px-3 py-2 bg-purple-500 text-white rounded disabled:opacity-50"
        >
          {activeTest === 'accessibility' ? 'Scan en cours...' : 'Test Accessibilité'}
        </button>
        
        {activeTest === 'usability' && (
          <button
            onClick={stopUsabilityTest}
            className="w-full px-3 py-2 bg-red-500 text-white rounded"
          >
            Arrêter l'enregistrement
          </button>
        )}
      </div>
      
      {/* Résultats */}
      <div className="space-y-4">
        {/* Performance */}
        {testResults.performance.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Performance</h4>
            {testResults.performance.map((metric, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span>{metric.name}:</span>
                <span className={`${
                  metric.result === 'pass' ? 'text-green-600' :
                  metric.result === 'warning' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {metric.value} {metric.unit}
                </span>
              </div>
            ))}
          </div>
        )}
        
        {/* Utilisabilité */}
        {testResults.usability && (
          <div>
            <h4 className="font-medium mb-2">Utilisabilité</h4>
            <div className="text-sm space-y-1">
              <div>Durée: {testResults.usability.endTime ? 
                ((testResults.usability.endTime - testResults.usability.startTime) / 1000).toFixed(1) : 
                ((Date.now() - testResults.usability.startTime) / 1000).toFixed(1)}s</div>
              <div>Interactions: {testResults.usability.interactions.length}</div>
            </div>
          </div>
        )}
        
        {/* Accessibilité */}
        {testResults.accessibility.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Accessibilité</h4>
            <div className="text-sm text-red-600">
              {testResults.accessibility.length} problème(s) détecté(s)
            </div>
            <ul className="text-xs text-gray-600 mt-1">
              {testResults.accessibility.slice(0, 3).map((issue, index) => (
                <li key={index}>• {issue}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

// Hook pour enregistrer automatiquement les interactions
export const useInteractionLogger = () => {
  const { recordInteraction } = useUsabilityTesting()
  
  useEffect(() => {
    const handleClick = () => recordInteraction('click')
    const handleScroll = () => recordInteraction('scroll')
    const handleKeydown = () => recordInteraction('keyboard')
    
    document.addEventListener('click', handleClick)
    document.addEventListener('scroll', handleScroll)
    document.addEventListener('keydown', handleKeydown)
    
    return () => {
      document.removeEventListener('click', handleClick)
      document.removeEventListener('scroll', handleScroll)
      document.removeEventListener('keydown', handleKeydown)
    }
  }, [recordInteraction])
} 