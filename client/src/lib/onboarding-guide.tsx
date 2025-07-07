'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  XMarkIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  LightBulbIcon,
  CheckIcon
} from '@heroicons/react/24/outline'

interface OnboardingStep {
  id: string
  title: string
  content: string
  target?: string // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right'
  action?: {
    label: string
    onClick: () => void
  }
}

interface OnboardingContextType {
  startOnboarding: (steps: OnboardingStep[], id?: string) => void
  stopOnboarding: () => void
  isOnboardingActive: boolean
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export const useOnboarding = () => {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider')
  }
  return context
}

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [steps, setSteps] = useState<OnboardingStep[]>([])
  const [onboardingId, setOnboardingId] = useState<string>('')

  const startOnboarding = useCallback((newSteps: OnboardingStep[], id: string = 'default') => {
    setSteps(newSteps)
    setCurrentStep(0)
    setOnboardingId(id)
    setIsActive(true)
  }, [])

  const stopOnboarding = useCallback(() => {
    setIsActive(false)
    setSteps([])
    setCurrentStep(0)
    // Save completion to localStorage
    if (onboardingId) {
      localStorage.setItem(`onboarding-${onboardingId}-completed`, 'true')
    }
  }, [onboardingId])

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      stopOnboarding()
    }
  }, [currentStep, steps.length, stopOnboarding])

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  const skipOnboarding = useCallback(() => {
    stopOnboarding()
  }, [stopOnboarding])

  // Highlight target element
  useEffect(() => {
    if (isActive && steps[currentStep]?.target) {
      const targetElement = document.querySelector(steps[currentStep].target!)
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [isActive, currentStep, steps])

  if (!isActive) {
    return <>{children}</>
  }

  const currentStepData = steps[currentStep]

  return (
    <OnboardingContext.Provider value={{ startOnboarding, stopOnboarding, isOnboardingActive: isActive }}>
      {children}
      
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-[9997]" onClick={skipOnboarding} />
      
      {/* Tooltip */}
      <AnimatePresence>
        {currentStepData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed z-[9998] max-w-sm"
            style={{
              top: currentStepData.target ? 
                (document.querySelector(currentStepData.target)?.getBoundingClientRect().bottom || 20) + 10 : 20,
              left: currentStepData.target ? 
                (document.querySelector(currentStepData.target)?.getBoundingClientRect().left || 20) : 20,
            }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <LightBulbIcon className="w-5 h-5 text-yellow-500" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {currentStepData.title}
                  </span>
                </div>
                <button
                  onClick={skipOnboarding}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
              
              {/* Content */}
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                {currentStepData.content}
              </p>
              
              {/* Action */}
              {currentStepData.action && (
                <button
                  onClick={currentStepData.action.onClick}
                  className="w-full mb-3 px-3 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
                >
                  {currentStepData.action.label}
                </button>
              )}
              
              {/* Navigation */}
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  {currentStep + 1} sur {steps.length}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextStep}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    {currentStep === steps.length - 1 ? (
                      <CheckIcon className="w-4 h-4" />
                    ) : (
                      <ChevronRightIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </OnboardingContext.Provider>
  )
}

// Hook pour vérifier si un onboarding a été complété
export const useOnboardingCompleted = (id: string) => {
  const [completed, setCompleted] = useState(false)
  
  useEffect(() => {
    const isCompleted = localStorage.getItem(`onboarding-${id}-completed`) === 'true'
    setCompleted(isCompleted)
  }, [id])
  
  return completed
}

export default OnboardingProvider 