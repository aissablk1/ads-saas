'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'

// Types pour les transitions optimisées
type OptimizedTransitionType = 'fade' | 'slide' | 'scale'
type PerformanceLevel = 'low' | 'medium' | 'high'
type DeviceCapability = 'basic' | 'standard' | 'advanced'

interface OptimizedTransitionProps {
  children: React.ReactNode
  isVisible: boolean
  type: OptimizedTransitionType
  direction?: 'up' | 'down' | 'left' | 'right'
  duration?: number
  delay?: number
  performanceLevel?: PerformanceLevel
  deviceCapability?: DeviceCapability
  userMode?: 'exploration' | 'efficiency' | 'accessibility'
  className?: string
  onClick?: () => void
}

// Détection des capacités de l'appareil
const detectDeviceCapability = (): DeviceCapability => {
  if (typeof window === 'undefined') return 'standard'
  
  // Détection simplifiée basée sur les cores CPU
  const cores = navigator.hardwareConcurrency || 4
  
  // Détection basée sur l'user agent
  const userAgent = navigator.userAgent
  const isLowEndDevice = 
    cores <= 2 ||
    /Android.*4\.|iPhone.*\[5-6\]|iPad.*\[1-4\]/.test(userAgent)
  
  const isHighEndDevice = 
    cores >= 8 ||
    /iPhone.*\[12-15\]|iPad.*\[8-9\]/.test(userAgent)
  
  if (isLowEndDevice) return 'basic'
  if (isHighEndDevice) return 'advanced'
  return 'standard'
}

// Configuration optimisée selon les capacités
const OptimizedConfig = {
  basic: {
    duration: { fade: 0.3, slide: 0.4, scale: 0.3 },
    maxConcurrent: 2
  },
  standard: {
    duration: { fade: 0.5, slide: 0.6, scale: 0.4 },
    maxConcurrent: 4
  },
  advanced: {
    duration: { fade: 0.8, slide: 1.0, scale: 0.6 },
    maxConcurrent: 8
  }
}

// Hook pour la gestion des performances
export const usePerformanceOptimizer = () => {
  const [deviceCapability, setDeviceCapability] = useState<DeviceCapability>('standard')
  const [activeTransitions, setActiveTransitions] = useState<Set<string>>(new Set())
  const [performanceLevel, setPerformanceLevel] = useState<PerformanceLevel>('medium')
  
  // Détecter les capacités au montage
  useEffect(() => {
    const capability = detectDeviceCapability()
    setDeviceCapability(capability)
    
    // Ajuster le niveau de performance selon les capacités
    const level: PerformanceLevel = 
      capability === 'basic' ? 'low' :
      capability === 'advanced' ? 'high' : 'medium'
    setPerformanceLevel(level)
  }, [])
  
  // Gérer les transitions actives
  const addTransition = useCallback((id: string) => {
    setActiveTransitions(prev => {
      const newSet = new Set(prev)
      newSet.add(id)
      return newSet
    })
  }, [])
  
  const removeTransition = useCallback((id: string) => {
    setActiveTransitions(prev => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
  }, [])
  
  // Vérifier si on peut ajouter une transition
  const canAddTransition = useCallback(() => {
    const config = OptimizedConfig[deviceCapability]
    return activeTransitions.size < config.maxConcurrent
  }, [deviceCapability, activeTransitions.size])
  
  return {
    deviceCapability,
    performanceLevel,
    activeTransitions: activeTransitions.size,
    canAddTransition,
    addTransition,
    removeTransition
  }
}

// Composant de transition optimisée simplifié
export const OptimizedTransition: React.FC<OptimizedTransitionProps> = ({
  children,
  isVisible,
  type,
  direction = 'up',
  duration,
  delay = 0,
  performanceLevel: propPerformanceLevel,
  deviceCapability: propDeviceCapability,
  userMode = 'exploration',
  className = '',
  onClick
}) => {
  const {
    deviceCapability,
    performanceLevel,
    canAddTransition,
    addTransition,
    removeTransition
  } = usePerformanceOptimizer()
  
  const transitionId = useRef(`transition-${Math.random().toString(36).substr(2, 9)}`)
  const config = OptimizedConfig[propDeviceCapability || deviceCapability]
  const actualPerformanceLevel = propPerformanceLevel || performanceLevel
  
  // Ajuster la durée selon le mode utilisateur
  const getDuration = useCallback(() => {
    const baseDuration = duration || config.duration[type]
    const userModeMultiplier = 
      userMode === 'efficiency' ? 0.7 :
      userMode === 'accessibility' ? 1.5 : 1.0
    return baseDuration * userModeMultiplier
  }, [duration, config.duration, type, userMode])
  
  // Gérer l'ajout/suppression des transitions
  useEffect(() => {
    if (isVisible && canAddTransition()) {
      addTransition(transitionId.current)
    } else if (!isVisible) {
      removeTransition(transitionId.current)
    }
  }, [isVisible, canAddTransition, addTransition, removeTransition])
  
  // Si on ne peut pas ajouter de transition, utiliser un fallback simple
  if (!canAddTransition() && !isVisible) {
    return (
      <div 
        className={className}
        style={{ 
          opacity: isVisible ? 1 : 0,
          transition: `opacity ${getDuration()}s ease-out`
        }}
        onClick={onClick}
      >
        {children}
      </div>
    )
  }
  
  // Variants simplifiés
  const getInitialState = () => {
    const distance = actualPerformanceLevel === 'high' ? 50 : 30
    
    switch (type) {
      case 'fade':
        return { opacity: 0 }
      case 'slide':
        return {
          opacity: 0,
          x: direction === 'left' ? distance : direction === 'right' ? -distance : 0,
          y: direction === 'up' ? distance : direction === 'down' ? -distance : 0
        }
      case 'scale':
        return { opacity: 0, scale: 0.8 }
      default:
        return { opacity: 0 }
    }
  }
  
  return (
    <motion.div
      initial={getInitialState()}
      animate={isVisible ? {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1
      } : getInitialState()}
      transition={{
        type: 'tween',
        duration: getDuration(),
        delay,
        ease: 'easeOut'
      }}
      className={className}
      onClick={onClick}
      onAnimationStart={() => addTransition(transitionId.current)}
      onAnimationComplete={() => removeTransition(transitionId.current)}
    >
      {children}
    </motion.div>
  )
}

// Hook pour l'optimisation des performances
export const useTransitionOptimizer = () => {
  const [transitionQueue, setTransitionQueue] = useState<Array<{
    id: string
    priority: number
    type: OptimizedTransitionType
    timestamp: number
  }>>([])
  
  const addToQueue = useCallback((transition: {
    id: string
    priority: number
    type: OptimizedTransitionType
  }) => {
    setTransitionQueue(prev => [
      ...prev,
      { ...transition, timestamp: Date.now() }
    ].sort((a, b) => b.priority - a.priority))
  }, [])
  
  const removeFromQueue = useCallback((id: string) => {
    setTransitionQueue(prev => prev.filter(t => t.id !== id))
  }, [])
  
  const clearQueue = useCallback(() => {
    setTransitionQueue([])
  }, [])
  
  return {
    transitionQueue,
    addToQueue,
    removeFromQueue,
    clearQueue
  }
} 