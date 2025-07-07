'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckIcon, ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import { getWelcomeBackMessage, updateLastVisit } from '../../lib/greetings'

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Mettre à jour la dernière visite
  React.useEffect(() => {
    updateLastVisit()
  }, [])

  const [data, setData] = useState({
    goals: [] as string[],
    company: '',
    experience: '',
    budget: ''
  })

  const goals = [
    { id: 'sales', label: 'Augmenter les ventes' },
    { id: 'brand', label: 'Notoriété de marque' },
    { id: 'leads', label: 'Génération de leads' },
    { id: 'traffic', label: 'Trafic web' }
  ]

  const handleGoalToggle = (goalId: string) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.includes(goalId)
        ? prev.goals.filter(g => g !== goalId)
        : [...prev.goals, goalId]
    }))
  }

  const handleFinish = async () => {
    setIsLoading(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      localStorage.setItem('onboardingCompleted', 'true')
      toast.success('Configuration terminée !')
      router.push('/dashboard')
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          <div className="text-center mb-8">
            <SparklesIcon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {getWelcomeBackMessage()}
            </h1>
            <p className="text-gray-600">
              Configurons votre compte en quelques étapes simples
            </p>
          </div>

          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Quels sont vos objectifs ?
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {goals.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => handleGoalToggle(goal.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      data.goals.includes(goal.id)
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{goal.label}</span>
                      {data.goals.includes(goal.id) && (
                        <CheckIcon className="h-5 w-5 text-primary-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Informations sur votre entreprise
              </h2>
              <div>
                <label className="form-label">Nom de l'entreprise</label>
                <input
                  type="text"
                  value={data.company}
                  onChange={(e) => setData(prev => ({ ...prev, company: e.target.value }))}
                  className="form-input"
                  placeholder="Votre entreprise"
                />
              </div>
              <div>
                <label className="form-label">Votre expérience</label>
                <select
                  value={data.experience}
                  onChange={(e) => setData(prev => ({ ...prev, experience: e.target.value }))}
                  className="form-input"
                >
                  <option value="">Sélectionnez</option>
                  <option value="beginner">Débutant</option>
                  <option value="intermediate">Intermédiaire</option>
                  <option value="advanced">Avancé</option>
                </select>
              </div>
              <div>
                <label className="form-label">Budget mensuel</label>
                <select
                  value={data.budget}
                  onChange={(e) => setData(prev => ({ ...prev, budget: e.target.value }))}
                  className="form-input"
                >
                  <option value="">Sélectionnez</option>
                  <option value="small">&lt; 1 000€</option>
                  <option value="medium">1 000 - 5 000€</option>
                  <option value="large">5 000 - 20 000€</option>
                  <option value="enterprise">&gt; 20 000€</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="btn-secondary"
              >
                Précédent
              </button>
            )}
            
            {currentStep < 2 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="btn-primary ml-auto"
              >
                Suivant
                <ArrowRightIcon className="h-5 w-5 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={isLoading}
                className="btn-primary ml-auto relative"
              >
                {isLoading && (
                  <div className="absolute left-4">
                    <div className="spinner"></div>
                  </div>
                )}
                {isLoading ? 'Finalisation...' : 'Terminer'}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
} 