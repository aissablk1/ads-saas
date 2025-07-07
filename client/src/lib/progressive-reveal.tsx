'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { motion, useInView } from 'framer-motion'

// Types pour la révélation progressive
type RevealTrigger = 'scroll' | 'hover' | 'auto'
type RevealDirection = 'up' | 'down' | 'left' | 'right' | 'center'

interface ProgressiveRevealProps {
  children: React.ReactNode
  trigger?: RevealTrigger
  direction?: RevealDirection
  delay?: number
  duration?: number
  userMode?: 'exploration' | 'efficiency' | 'accessibility'
  intensity?: 'low' | 'medium' | 'high'
  className?: string
}

// Configuration des révélations selon le mode utilisateur
const RevealConfig = {
  exploration: {
    duration: { low: 0.6, medium: 0.8, high: 1.2 },
    delay: { low: 0.1, medium: 0.2, high: 0.3 }
  },
  efficiency: {
    duration: { low: 0.3, medium: 0.4, high: 0.6 },
    delay: { low: 0.05, medium: 0.1, high: 0.15 }
  },
  accessibility: {
    duration: { low: 1.0, medium: 1.4, high: 2.0 },
    delay: { low: 0.2, medium: 0.4, high: 0.6 }
  }
}

// Composant de révélation au scroll
export const ScrollReveal: React.FC<ProgressiveRevealProps> = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.8,
  userMode = 'exploration',
  intensity = 'medium',
  className = ''
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { amount: 0.1 })
  const config = RevealConfig[userMode]
  
  const actualDuration = config.duration[intensity] || duration
  const actualDelay = config.delay[intensity] || delay

  const getInitialState = () => {
    const distance = intensity === 'high' ? 100 : intensity === 'medium' ? 60 : 30
    
    switch (direction) {
      case 'up':
        return { y: distance, x: 0 }
      case 'down':
        return { y: -distance, x: 0 }
      case 'left':
        return { x: distance, y: 0 }
      case 'right':
        return { x: -distance, y: 0 }
      case 'center':
        return { scale: 0.8, opacity: 0 }
      default:
        return { y: distance, x: 0 }
    }
  }

  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        ...getInitialState()
      }}
      animate={isInView ? {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1
      } : {
        opacity: 0,
        ...getInitialState()
      }}
      transition={{
        type: 'spring',
        duration: actualDuration,
        delay: actualDelay,
        stiffness: userMode === 'efficiency' ? 200 : userMode === 'accessibility' ? 50 : 100,
        damping: userMode === 'efficiency' ? 25 : userMode === 'accessibility' ? 20 : 15
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Composant de révélation au survol
export const HoverReveal: React.FC<ProgressiveRevealProps> = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.8,
  userMode = 'exploration',
  intensity = 'medium',
  className = ''
}) => {
  const config = RevealConfig[userMode]
  const actualDuration = config.duration[intensity] || duration
  const actualDelay = config.delay[intensity] || delay

  const getInitialState = () => {
    const distance = intensity === 'high' ? 50 : intensity === 'medium' ? 30 : 20
    
    switch (direction) {
      case 'up':
        return { y: distance, x: 0 }
      case 'down':
        return { y: -distance, x: 0 }
      case 'left':
        return { x: distance, y: 0 }
      case 'right':
        return { x: -distance, y: 0 }
      case 'center':
        return { scale: 0.9, opacity: 0 }
      default:
        return { y: distance, x: 0 }
    }
  }

  return (
    <motion.div
      initial={{
        opacity: 0,
        ...getInitialState()
      }}
      whileHover={{
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1
      }}
      transition={{
        type: 'spring',
        duration: actualDuration,
        delay: actualDelay,
        stiffness: userMode === 'efficiency' ? 200 : userMode === 'accessibility' ? 50 : 100,
        damping: userMode === 'efficiency' ? 25 : userMode === 'accessibility' ? 20 : 15
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Composant de révélation automatique
export const AutoReveal: React.FC<ProgressiveRevealProps> = ({
  children,
  delay = 0,
  duration = 0.8,
  userMode = 'exploration',
  intensity = 'medium',
  className = ''
}) => {
  const config = RevealConfig[userMode]
  const actualDuration = config.duration[intensity] || duration
  const actualDelay = config.delay[intensity] || delay

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'spring',
        duration: actualDuration,
        delay: actualDelay,
        stiffness: userMode === 'efficiency' ? 200 : userMode === 'accessibility' ? 50 : 100,
        damping: userMode === 'efficiency' ? 25 : userMode === 'accessibility' ? 20 : 15
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Composant de révélation progressive unifié
export const ProgressiveReveal: React.FC<ProgressiveRevealProps> = ({
  children,
  trigger = 'scroll',
  direction = 'up',
  delay = 0,
  duration = 0.8,
  userMode = 'exploration',
  intensity = 'medium',
  className = ''
}) => {
  switch (trigger) {
    case 'scroll':
      return (
        <ScrollReveal
          direction={direction}
          delay={delay}
          duration={duration}
          userMode={userMode}
          intensity={intensity}
          className={className}
        >
          {children}
        </ScrollReveal>
      )
    
    case 'hover':
      return (
        <HoverReveal
          direction={direction}
          delay={delay}
          duration={duration}
          userMode={userMode}
          intensity={intensity}
          className={className}
        >
          {children}
        </HoverReveal>
      )
    
    case 'auto':
      return (
        <AutoReveal
          delay={delay}
          duration={duration}
          userMode={userMode}
          intensity={intensity}
          className={className}
        >
          {children}
        </AutoReveal>
      )
    
    default:
      return <div className={className}>{children}</div>
  }
}

// Hook pour la révélation progressive
export const useProgressiveReveal = (userMode: 'exploration' | 'efficiency' | 'accessibility' = 'exploration') => {
  const [revealedElements, setRevealedElements] = useState<Set<string>>(new Set())

  const markRevealed = useCallback((id: string) => {
    setRevealedElements(prev => new Set([...prev, id]))
  }, [])

  const clearReveals = useCallback(() => {
    setRevealedElements(new Set())
  }, [])

  return {
    revealedElements,
    markRevealed,
    clearReveals,
    userMode
  }
} 