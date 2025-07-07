'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion'

// Types pour les transitions cinématiques
type TransitionType = 'morph' | 'parallax' | 'reveal' | 'slide' | 'fade' | 'scale'
type TransitionDirection = 'up' | 'down' | 'left' | 'right' | 'in' | 'out'
type TransitionTiming = 'spring' | 'tween' | 'inertia'

interface CinematicTransitionProps {
  children: React.ReactNode
  isVisible: boolean
  type: TransitionType
  direction?: TransitionDirection
  timing?: TransitionTiming
  duration?: number
  delay?: number
  stagger?: number
  userMode?: 'exploration' | 'efficiency' | 'accessibility'
  intensity?: 'low' | 'medium' | 'high'
}

// Configuration des transitions selon le mode utilisateur
const TransitionConfig = {
  exploration: {
    duration: { low: 0.6, medium: 0.8, high: 1.2 },
    spring: { stiffness: 100, damping: 15 },
    tween: { duration: 0.8 },
    effects: 'full'
  },
  efficiency: {
    duration: { low: 0.3, medium: 0.4, high: 0.6 },
    spring: { stiffness: 200, damping: 25 },
    tween: { duration: 0.4 },
    effects: 'minimal'
  },
  accessibility: {
    duration: { low: 1.0, medium: 1.4, high: 2.0 },
    spring: { stiffness: 50, damping: 20 },
    tween: { duration: 1.4 },
    effects: 'reduced'
  }
}

// Transition morphique avec déformation fluide
export const MorphTransition: React.FC<CinematicTransitionProps> = ({
  children,
  isVisible,
  direction = 'up',
  timing = 'spring',
  duration = 0.8,
  delay = 0,
  userMode = 'exploration',
  intensity = 'medium'
}) => {
  const config = TransitionConfig[userMode]
  const actualDuration = config.duration[intensity] || duration

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.8,
            rotateX: direction === 'up' ? 45 : direction === 'down' ? -45 : 0,
            rotateY: direction === 'left' ? 45 : direction === 'right' ? -45 : 0,
            filter: 'blur(10px)'
          }}
          animate={{
            opacity: 1,
            scale: 1,
            rotateX: 0,
            rotateY: 0,
            filter: 'blur(0px)'
          }}
          exit={{
            opacity: 0,
            scale: 0.8,
            rotateX: direction === 'up' ? -45 : direction === 'down' ? 45 : 0,
            rotateY: direction === 'left' ? -45 : direction === 'right' ? 45 : 0,
            filter: 'blur(10px)'
          }}
          transition={timing === 'spring' ? {
            type: 'spring',
            stiffness: config.spring.stiffness,
            damping: config.spring.damping,
            delay
          } : {
            type: 'tween',
            duration: actualDuration,
            delay
          }}
          style={{ perspective: 1000 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Transition parallaxe avec profondeur
export const ParallaxTransition: React.FC<CinematicTransitionProps> = ({
  children,
  isVisible,
  direction = 'up',
  timing = 'spring',
  duration = 0.8,
  delay = 0,
  userMode = 'exploration',
  intensity = 'medium'
}) => {
  const config = TransitionConfig[userMode]
  const actualDuration = config.duration[intensity] || duration
  const parallaxDistance = intensity === 'high' ? 100 : intensity === 'medium' ? 60 : 30

  const variants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? parallaxDistance : direction === 'down' ? -parallaxDistance : 0,
      x: direction === 'left' ? parallaxDistance : direction === 'right' ? -parallaxDistance : 0,
      z: -200,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      z: 0,
      scale: 1,
      transition: {
        type: timing,
        duration: actualDuration,
        delay,
        ...config.spring
      }
    },
    exit: {
      opacity: 0,
      y: direction === 'up' ? -parallaxDistance : direction === 'down' ? parallaxDistance : 0,
      x: direction === 'left' ? -parallaxDistance : direction === 'right' ? parallaxDistance : 0,
      z: -200,
      scale: 0.9,
      transition: {
        type: timing,
        duration: actualDuration * 0.6,
        ...config.spring
      }
    }
  }

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          variants={variants}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={{ 
            perspective: 1000,
            transformStyle: 'preserve-3d'
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Transition de révélation progressive
export const RevealTransition: React.FC<CinematicTransitionProps> = ({
  children,
  isVisible,
  direction = 'up',
  timing = 'spring',
  duration = 0.8,
  delay = 0,
  userMode = 'exploration',
  intensity = 'medium'
}) => {
  const config = TransitionConfig[userMode]
  const actualDuration = config.duration[intensity] || duration

  const variants = {
    hidden: {
      opacity: 0,
      clipPath: direction === 'up' ? 'inset(100% 0 0 0)' :
                direction === 'down' ? 'inset(0 0 100% 0)' :
                direction === 'left' ? 'inset(0 100% 0 0)' :
                'inset(0 0 0 100%)',
      scale: 0.95
    },
    visible: {
      opacity: 1,
      clipPath: 'inset(0 0 0 0)',
      scale: 1,
      transition: {
        type: timing,
        duration: actualDuration,
        delay,
        ...config.spring
      }
    },
    exit: {
      opacity: 0,
      clipPath: direction === 'up' ? 'inset(0 0 100% 0)' :
                direction === 'down' ? 'inset(100% 0 0 0)' :
                direction === 'left' ? 'inset(0 0 0 100%)' :
                'inset(0 100% 0 0)',
      scale: 0.95,
      transition: {
        type: timing,
        duration: actualDuration * 0.6,
        ...config.spring
      }
    }
  }

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          variants={variants}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={{ overflow: 'hidden' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Transition de glissement fluide
export const SlideTransition: React.FC<CinematicTransitionProps> = ({
  children,
  isVisible,
  direction = 'up',
  timing = 'spring',
  duration = 0.8,
  delay = 0,
  userMode = 'exploration',
  intensity = 'medium'
}) => {
  const config = TransitionConfig[userMode]
  const actualDuration = config.duration[intensity] || duration
  const slideDistance = intensity === 'high' ? 200 : intensity === 'medium' ? 120 : 80

  const variants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? slideDistance : direction === 'down' ? -slideDistance : 0,
      x: direction === 'left' ? slideDistance : direction === 'right' ? -slideDistance : 0,
      rotate: direction === 'up' ? 5 : direction === 'down' ? -5 : 0
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      rotate: 0,
      transition: {
        type: timing,
        duration: actualDuration,
        delay,
        ...config.spring
      }
    },
    exit: {
      opacity: 0,
      y: direction === 'up' ? -slideDistance : direction === 'down' ? slideDistance : 0,
      x: direction === 'left' ? -slideDistance : direction === 'right' ? slideDistance : 0,
      rotate: direction === 'up' ? -5 : direction === 'down' ? 5 : 0,
      transition: {
        type: timing,
        duration: actualDuration * 0.6,
        ...config.spring
      }
    }
  }

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          variants={variants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Transition de fondu avec échelle
export const FadeScaleTransition: React.FC<CinematicTransitionProps> = ({
  children,
  isVisible,
  direction = 'in',
  timing = 'spring',
  duration = 0.8,
  delay = 0,
  userMode = 'exploration',
  intensity = 'medium'
}) => {
  const config = TransitionConfig[userMode]
  const actualDuration = config.duration[intensity] || duration

  const variants = {
    hidden: {
      opacity: 0,
      scale: direction === 'in' ? 0.8 : 1.2,
      filter: 'blur(4px)'
    },
    visible: {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        type: timing,
        duration: actualDuration,
        delay,
        ...config.spring
      }
    },
    exit: {
      opacity: 0,
      scale: direction === 'in' ? 1.2 : 0.8,
      filter: 'blur(4px)',
      transition: {
        type: timing,
        duration: actualDuration * 0.6,
        ...config.spring
      }
    }
  }

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          variants={variants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Transition de texte avec révélation caractère par caractère
export const TextRevealTransition: React.FC<{
  text: string
  isVisible: boolean
  direction?: TransitionDirection
  timing?: TransitionTiming
  duration?: number
  delay?: number
  userMode?: 'exploration' | 'efficiency' | 'accessibility'
  intensity?: 'low' | 'medium' | 'high'
  staggerDelay?: number
}> = ({
  text,
  isVisible,
  direction = 'up',
  timing = 'spring',
  duration = 0.8,
  delay = 0,
  userMode = 'exploration',
  intensity = 'medium',
  staggerDelay = 0.03
}) => {
  const config = TransitionConfig[userMode]
  const actualDuration = config.duration[intensity] || duration
  const actualStaggerDelay = userMode === 'efficiency' ? staggerDelay * 0.5 : 
                            userMode === 'accessibility' ? staggerDelay * 2 : staggerDelay

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: delay,
        staggerChildren: actualStaggerDelay
      }
    }
  }

  const letterVariants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? 20 : direction === 'down' ? -20 : 0,
      x: direction === 'left' ? 20 : direction === 'right' ? -20 : 0,
      rotateX: direction === 'up' ? 90 : direction === 'down' ? -90 : 0
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      rotateX: 0,
      transition: {
        type: timing,
        duration: actualDuration,
        ...config.spring
      }
    }
  }

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ display: 'flex', flexWrap: 'wrap' }}
        >
          {text.split('').map((letter, index) => (
            <motion.span
              key={index}
              variants={letterVariants}
              style={{ 
                display: 'inline-block',
                whiteSpace: letter === ' ' ? 'pre' : 'normal'
              }}
            >
              {letter}
            </motion.span>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Transition de grille avec apparition progressive
export const GridRevealTransition: React.FC<{
  children: React.ReactNode[]
  isVisible: boolean
  columns: number
  direction?: TransitionDirection
  timing?: TransitionTiming
  duration?: number
  delay?: number
  userMode?: 'exploration' | 'efficiency' | 'accessibility'
  intensity?: 'low' | 'medium' | 'high'
  staggerDelay?: number
}> = ({
  children,
  isVisible,
  columns,
  direction = 'up',
  timing = 'spring',
  duration = 0.8,
  delay = 0,
  userMode = 'exploration',
  intensity = 'medium',
  staggerDelay = 0.1
}) => {
  const config = TransitionConfig[userMode]
  const actualDuration = config.duration[intensity] || duration
  const actualStaggerDelay = userMode === 'efficiency' ? staggerDelay * 0.5 : 
                            userMode === 'accessibility' ? staggerDelay * 2 : staggerDelay

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: delay,
        staggerChildren: actualStaggerDelay
      }
    }
  }

  const itemVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: direction === 'up' ? 50 : direction === 'down' ? -50 : 0,
      x: direction === 'left' ? 50 : direction === 'right' ? -50 : 0,
      rotate: direction === 'up' ? 10 : direction === 'down' ? -10 : 0
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      x: 0,
      rotate: 0,
      transition: {
        type: timing,
        duration: actualDuration,
        ...config.spring
      }
    }
  }

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: '1rem'
          }}
        >
          {children.map((child, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
            >
              {child}
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Composant de transition unifié
export const CinematicTransition: React.FC<CinematicTransitionProps> = ({
  children,
  isVisible,
  type,
  direction = 'up',
  timing = 'spring',
  duration = 0.8,
  delay = 0,
  userMode = 'exploration',
  intensity = 'medium'
}) => {
  const transitionComponents = {
    morph: MorphTransition,
    parallax: ParallaxTransition,
    reveal: RevealTransition,
    slide: SlideTransition,
    fade: FadeScaleTransition
  }

  const TransitionComponent = transitionComponents[type] || FadeScaleTransition

  return (
    <TransitionComponent
      isVisible={isVisible}
      direction={direction}
      timing={timing}
      duration={duration}
      delay={delay}
      userMode={userMode}
      intensity={intensity}
    >
      {children}
    </TransitionComponent>
  )
}

// Hook pour les transitions cinématiques
export const useCinematicTransition = (userMode: 'exploration' | 'efficiency' | 'accessibility' = 'exploration') => {
  const [transitionQueue, setTransitionQueue] = useState<Array<{
    id: string
    type: TransitionType
    direction: TransitionDirection
    timing: TransitionTiming
    duration: number
    delay: number
    intensity: 'low' | 'medium' | 'high'
  }>>([])

  const addTransition = useCallback((transition: {
    id: string
    type: TransitionType
    direction?: TransitionDirection
    timing?: TransitionTiming
    duration?: number
    delay?: number
    intensity?: 'low' | 'medium' | 'high'
  }) => {
    setTransitionQueue(prev => [...prev, {
      id: transition.id,
      type: transition.type,
      direction: transition.direction || 'up',
      timing: transition.timing || 'spring',
      duration: transition.duration || 0.8,
      delay: transition.delay || 0,
      intensity: transition.intensity || 'medium'
    }])
  }, [])

  const removeTransition = useCallback((id: string) => {
    setTransitionQueue(prev => prev.filter(t => t.id !== id))
  }, [])

  const clearQueue = useCallback(() => {
    setTransitionQueue([])
  }, [])

  return {
    transitionQueue,
    addTransition,
    removeTransition,
    clearQueue,
    userMode
  }
} 