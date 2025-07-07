'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Types pour le design system
export interface DesignSystemConfig {
  theme: 'light' | 'dark' | 'auto'
  style: 'neumorphic' | 'glassmorphic' | 'flat' | 'gradient'
  animations: 'subtle' | 'moderate' | 'extreme'
  accessibility: 'standard' | 'high-contrast' | 'reduced-motion'
}

// Configuration par défaut
export const defaultConfig: DesignSystemConfig = {
  theme: 'auto',
  style: 'glassmorphic',
  animations: 'moderate',
  accessibility: 'standard'
}

// Hook pour gérer le design system
export const useDesignSystem = () => {
  const [config, setConfig] = useState<DesignSystemConfig>(defaultConfig)

  useEffect(() => {
    // Détection automatique du thème
    if (config.theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const updateTheme = (e: MediaQueryListEvent) => {
        document.documentElement.classList.toggle('dark', e.matches)
      }
      
      mediaQuery.addEventListener('change', updateTheme)
      document.documentElement.classList.toggle('dark', mediaQuery.matches)
      
      return () => mediaQuery.removeEventListener('change', updateTheme)
    }
  }, [config.theme])

  return { config, setConfig }
}

// Composant Card Neumorphique
export const NeumorphicCard: React.FC<{
  children: React.ReactNode
  className?: string
  variant?: 'elevated' | 'pressed' | 'inset'
  intensity?: number
  onClick?: () => void
}> = ({ children, className = '', variant = 'elevated', intensity = 1, onClick }) => {
  const baseClasses = 'rounded-xl transition-all duration-300 cursor-pointer'
  
  const variantClasses = {
    elevated: 'shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.8)] hover:shadow-[12px_12px_24px_rgba(0,0,0,0.15),-12px_-12px_24px_rgba(255,255,255,0.9)]',
    pressed: 'shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.8)]',
    inset: 'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]'
  }

  return (
    <motion.div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        transform: `scale(${intensity})`
      }}
    >
      {children}
    </motion.div>
  )
}

// Composant Card Glassmorphique
export const GlassmorphicCard: React.FC<{
  children: React.ReactNode
  className?: string
  blur?: number
  opacity?: number
  border?: boolean
}> = ({ children, className = '', blur = 10, opacity = 0.1, border = true }) => {
  return (
    <motion.div
      className={`backdrop-blur-md rounded-xl ${className}`}
      style={{
        backgroundColor: `rgba(255, 255, 255, ${opacity})`,
        border: border ? '1px solid rgba(255, 255, 255, 0.2)' : 'none',
        backdropFilter: `blur(${blur}px)`
      }}
      whileHover={{ 
        backgroundColor: `rgba(255, 255, 255, ${opacity + 0.05})`,
        scale: 1.02 
      }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}

// Composant Button avec gradients
export const GradientButton: React.FC<{
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onClick?: () => void
  disabled?: boolean
}> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  onClick, 
  disabled = false 
}) => {
  const gradients = {
    primary: 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700',
    secondary: 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700',
    success: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700',
    danger: 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700'
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }

  return (
    <motion.button
      className={`${gradients[variant]} ${sizes[size]} text-white font-semibold rounded-lg shadow-lg ${className}`}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      style={{
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer'
      }}
    >
      {children}
    </motion.button>
  )
}

// Composant Floating Action Button
export const FloatingActionButton: React.FC<{
  icon: React.ReactNode
  onClick?: () => void
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  variant?: 'primary' | 'secondary'
}> = ({ icon, onClick, position = 'bottom-right', variant = 'primary' }) => {
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  }

  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg',
    secondary: 'bg-gradient-to-r from-gray-500 to-gray-600 shadow-lg'
  }

  return (
    <motion.button
      className={`fixed ${positionClasses[position]} ${variantClasses[variant]} w-14 h-14 rounded-full text-white flex items-center justify-center z-50`}
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      {icon}
    </motion.button>
  )
}

// Composant Progress Ring
export const ProgressRing: React.FC<{
  progress: number
  size?: number
  strokeWidth?: number
  color?: string
  showPercentage?: boolean
}> = ({ progress, size = 120, strokeWidth = 8, color = '#3B82F6', showPercentage = true }) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-200"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeInOut" }}
          strokeLinecap="round"
        />
      </svg>
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </div>
  )
}

// Composant Notification Bubble
export const NotificationBubble: React.FC<{
  children: React.ReactNode
  type?: 'info' | 'success' | 'warning' | 'error'
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  duration?: number
  onClose?: () => void
}> = ({ 
  children, 
  type = 'info', 
  position = 'top-right', 
  duration = 5000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true)

  const typeClasses = {
    info: 'bg-blue-500 border-blue-600',
    success: 'bg-green-500 border-green-600',
    warning: 'bg-yellow-500 border-yellow-600',
    error: 'bg-red-500 border-red-600'
  }

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  }

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onClose?.()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`fixed ${positionClasses[position]} ${typeClasses[type]} text-white px-4 py-3 rounded-lg shadow-lg border z-50 max-w-sm`}
          initial={{ 
            opacity: 0, 
            y: position.includes('bottom') ? 50 : -50, 
            scale: 0.3 
          }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ 
            opacity: 0, 
            y: position.includes('bottom') ? 50 : -50, 
            scale: 0.3 
          }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">{children}</div>
            {onClose && (
              <button
                onClick={() => {
                  setIsVisible(false)
                  onClose()
                }}
                className="ml-3 text-white hover:text-gray-200 transition-colors"
              >
                ×
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Composant Tooltip Avancé
export const AdvancedTooltip: React.FC<{
  children: React.ReactNode
  content: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  trigger?: 'hover' | 'click'
  className?: string
}> = ({ children, content, position = 'top', trigger = 'hover', className = '' }) => {
  const [isVisible, setIsVisible] = useState(false)

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  }

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-t-gray-800',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-b-gray-800',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-l-gray-800',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-r-gray-800'
  }

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={trigger === 'hover' ? () => setIsVisible(true) : undefined}
      onMouseLeave={trigger === 'hover' ? () => setIsVisible(false) : undefined}
      onClick={trigger === 'click' ? () => setIsVisible(!isVisible) : undefined}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={`absolute ${positionClasses[position]} z-50`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg text-sm max-w-xs">
              {content}
              <div className={`absolute w-0 h-0 border-4 border-transparent ${arrowClasses[position]}`} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Composant Modal Sheet
export const ModalSheet: React.FC<{
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}> = ({ isOpen, onClose, children, title, size = 'md' }) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            className={`relative ${sizeClasses[size]} w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden`}
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            {title && (
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {title}
                </h2>
              </div>
            )}
            
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Composant Skeleton Loading
export const Skeleton: React.FC<{
  type?: 'text' | 'avatar' | 'card' | 'button'
  lines?: number
  className?: string
}> = ({ type = 'text', lines = 1, className = '' }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'text':
        return (
          <div className="space-y-2">
            {Array.from({ length: lines }).map((_, i) => (
              <div
                key={i}
                className={`h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${className}`}
                style={{ width: `${Math.random() * 40 + 60}%` }}
              />
            ))}
          </div>
        )
      
      case 'avatar':
        return (
          <div className={`w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse ${className}`} />
        )
      
      case 'card':
        return (
          <div className={`p-4 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse ${className}`}>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2" />
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
          </div>
        )
      
      case 'button':
        return (
          <div className={`h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse ${className}`} />
        )
      
      default:
        return null
    }
  }

  return renderSkeleton()
}

// Les composants sont déjà exportés individuellement ci-dessus 