'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  CheckCircleIcon,
  PlayIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  XMarkIcon,
  RocketLaunchIcon,
  MegaphoneIcon,
  ChartBarIcon,
  UsersIcon,
  CogIcon,
  LightBulbIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import { getWelcomeBackMessage, updateLastVisit } from '../../../lib/greetings'

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [showWelcome, setShowWelcome] = useState(true)
  const [showTour, setShowTour] = useState(false)

  // Mettre à jour la dernière visite
  React.useEffect(() => {
    updateLastVisit()
  }, [])

  const onboardingSteps = [
    {
      id: 'profile_setup',
      title: 'Configurez votre profil',
      description: 'Complétez vos informations personnelles pour personnaliser votre expérience',
      completed: false,
      optional: false
    },
    {
      id: 'first_campaign',
      title: 'Créez votre première campagne',
      description: 'Lancez votre première campagne publicitaire en quelques minutes',
      completed: false,
      optional: false
    },
    {
      id: 'integrations',
      title: 'Connectez vos outils',
      description: 'Intégrez vos plateformes favorites pour synchroniser vos données',
      completed: false,
      optional: true
    },
    {
      id: 'team_invite',
      title: 'Invitez votre équipe',
      description: 'Collaborez efficacement en invitant vos collègues',
      completed: false,
      optional: true
    }
  ]

  const tourSteps = [
    {
      title: 'Tableau de bord',
      description: 'Voici votre tableau de bord principal. Vous y trouverez un aperçu de toutes vos métriques importantes.',
      icon: ChartBarIcon,
      action: () => router.push('/dashboard')
    },
    {
      title: 'Campagnes',
      description: 'Créez et gérez vos campagnes publicitaires. Suivez leurs performances en temps réel.',
      icon: MegaphoneIcon,
      action: () => router.push('/dashboard/campaigns')
    },
    {
      title: 'Analytics',
      description: 'Analysez vos données en profondeur avec nos outils d\'analyse avancés.',
      icon: ChartBarIcon,
      action: () => router.push('/dashboard/analytics')
    },
    {
      title: 'Équipe',
      description: 'Invitez des collaborateurs et gérez les permissions d\'accès.',
      icon: UsersIcon,
      action: () => router.push('/dashboard/team')
    }
  ]

  const startTour = () => {
    setShowWelcome(false)
    setShowTour(true)
    setCurrentStep(0)
  }

  const nextTourStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setShowTour(false)
    }
  }

  const prevTourStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const skipTour = () => {
    setShowTour(false)
    setShowWelcome(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Welcome Screen */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center z-50"
          >
            <div className="text-center text-white max-w-2xl mx-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <RocketLaunchIcon className="h-24 w-24 mx-auto mb-6" />
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-4xl md:text-5xl font-bold mb-6"
              >
                {getWelcomeBackMessage()}
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-xl mb-8 text-primary-100"
              >
                Nous allons vous guider pour configurer votre compte et découvrir toutes les fonctionnalités.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <button
                  onClick={startTour}
                  className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
                >
                  <PlayIcon className="h-5 w-5" />
                  <span>Commencer le tour guidé</span>
                </button>
                <button
                  onClick={() => {
                    setShowWelcome(false)
                    router.push('/dashboard')
                  }}
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
                >
                  Aller au tableau de bord
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tour Modal */}
      <AnimatePresence>
        {showTour && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-8 max-w-2xl mx-4 relative"
            >
              <button
                onClick={skipTour}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>

              <div className="text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    {React.createElement(tourSteps[currentStep].icon, {
                      className: "h-8 w-8 text-primary-600"
                    })}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {tourSteps[currentStep].title}
                  </h3>
                  <p className="text-gray-600 text-lg">
                    {tourSteps[currentStep].description}
                  </p>
                </div>

                <div className="mb-8">
                  <div className="flex justify-center space-x-2 mb-2">
                    {tourSteps.map((_, index) => (
                      <div
                        key={index}
                        className={`w-3 h-3 rounded-full ${
                          index === currentStep ? 'bg-primary-600' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">
                    {currentStep + 1} sur {tourSteps.length}
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  <button
                    onClick={prevTourStep}
                    disabled={currentStep === 0}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                  >
                    <ArrowLeftIcon className="h-4 w-4" />
                    <span>Précédent</span>
                  </button>

                  <button
                    onClick={skipTour}
                    className="text-gray-500 hover:text-gray-700 underline"
                  >
                    Passer
                  </button>

                  <button
                    onClick={nextTourStep}
                    className="flex items-center space-x-2 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
                  >
                    <span>{currentStep === tourSteps.length - 1 ? 'Terminer' : 'Suivant'}</span>
                    <ArrowRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Onboarding Steps */}
      {!showWelcome && !showTour && (
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Configurons votre compte</h1>
              <p className="text-gray-600 text-lg">
                Suivez ces étapes pour tirer le meilleur parti d'ADS SaaS
              </p>
            </div>

            <div className="space-y-6">
              {onboardingSteps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow p-6 border-l-4 border-gray-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-sm font-semibold text-gray-600">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                          {step.optional && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              Optionnel
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600">{step.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      {step.optional && (
                        <button className="text-gray-500 hover:text-gray-700 text-sm underline">
                          Ignorer
                        </button>
                      )}
                      <button
                        onClick={() => {
                          switch (step.id) {
                            case 'profile_setup':
                              router.push('/dashboard/profile')
                              break
                            case 'first_campaign':
                              router.push('/dashboard/campaigns/create')
                              break
                            case 'integrations':
                              router.push('/dashboard/integrations')
                              break
                            case 'team_invite':
                              router.push('/dashboard/team')
                              break
                          }
                        }}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 text-sm"
                      >
                        Commencer
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <AcademicCapIcon className="h-8 w-8 text-blue-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">Centre d'aide</h4>
                    <p className="text-blue-700 text-sm mb-3">
                      Consultez notre documentation complète et nos tutoriels
                    </p>
                    <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                      Accéder au centre d'aide →
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <LightBulbIcon className="h-8 w-8 text-purple-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-purple-900 mb-2">Conseils et astuces</h4>
                    <p className="text-purple-700 text-sm mb-3">
                      Découvrez les meilleures pratiques pour optimiser vos campagnes
                    </p>
                    <button className="text-purple-600 hover:text-purple-800 font-medium text-sm">
                      Voir les conseils →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
