'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CalculatorIcon, 
  ArrowTrendingUpIcon, 
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { GlassmorphicCard, GradientButton, AdvancedTooltip, ProgressRing } from './design-system'

interface ROICalculatorProps {
  onCalculate?: (results: ROICalculation) => void
}

interface ROICalculation {
  currentSpend: number
  currentRevenue: number
  currentROI: number
  projectedSpend: number
  projectedRevenue: number
  projectedROI: number
  improvement: number
  monthlySavings: number
  yearlySavings: number
}

export const ROICalculator: React.FC<ROICalculatorProps> = ({ onCalculate }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    monthlyBudget: 5000,
    currentCTR: 2.0,
    currentConversionRate: 3.0,
    currentCPA: 50,
    currentRevenue: 15000,
    industry: 'ecommerce'
  })
  const [results, setResults] = useState<ROICalculation | null>(null)

  const industryBenchmarks = {
    ecommerce: { avgCTR: 2.5, avgConversion: 3.5, avgCPA: 45 },
    saas: { avgCTR: 1.8, avgConversion: 2.5, avgCPA: 80 },
    leadgen: { avgCTR: 3.2, avgConversion: 4.0, avgCPA: 35 },
    retail: { avgCTR: 2.8, avgConversion: 3.8, avgCPA: 40 }
  }

  const calculateROI = () => {
    const benchmark = industryBenchmarks[formData.industry as keyof typeof industryBenchmarks]
    
    // Calculs actuels
    const currentSpend = formData.monthlyBudget
    const currentRevenue = formData.currentRevenue
    const currentROI = ((currentRevenue - currentSpend) / currentSpend) * 100

    // Projections avec ADS SaaS (améliorations basées sur les benchmarks)
    const ctrImprovement = (benchmark.avgCTR - formData.currentCTR) / formData.currentCTR
    const conversionImprovement = (benchmark.avgConversion - formData.currentConversionRate) / formData.currentConversionRate
    const cpaImprovement = (formData.currentCPA - benchmark.avgCPA) / formData.currentCPA

    const projectedSpend = currentSpend * 0.9 // 10% d'économie grâce à l'optimisation
    const projectedRevenue = currentRevenue * (1 + ctrImprovement * 0.3 + conversionImprovement * 0.4)
    const projectedROI = ((projectedRevenue - projectedSpend) / projectedSpend) * 100

    const improvement = projectedROI - currentROI
    const monthlySavings = currentSpend - projectedSpend
    const yearlySavings = monthlySavings * 12

    const calculation: ROICalculation = {
      currentSpend,
      currentRevenue,
      currentROI,
      projectedSpend,
      projectedRevenue,
      projectedROI,
      improvement,
      monthlySavings,
      yearlySavings
    }

    setResults(calculation)
    onCalculate?.(calculation)
  }

  useEffect(() => {
    if (currentStep === 3) {
      calculateROI()
    }
  }, [currentStep, formData])

  const steps = [
    { title: 'Budget', description: 'Votre budget publicitaire mensuel' },
    { title: 'Performance', description: 'Vos métriques actuelles' },
    { title: 'Secteur', description: 'Votre secteur d\'activité' },
    { title: 'Résultats', description: 'Votre ROI projeté' }
  ]

  const updateFormData = (field: string, value: number | string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <>
      {/* Bouton pour ouvrir le calculateur */}
      <GradientButton
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <CalculatorIcon className="w-5 h-5" />
        Calculer mon ROI
      </GradientButton>

      {/* Modal du calculateur */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CalculatorIcon className="w-8 h-8" />
                    <div>
                      <h2 className="text-2xl font-bold">Calculateur de ROI</h2>
                      <p className="text-blue-100">Découvrez votre potentiel d'amélioration</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* Progress bar */}
                <div className="mt-6">
                  <div className="flex justify-between text-sm mb-2">
                    {steps.map((step, index) => (
                      <span
                        key={index}
                        className={`${
                          index <= currentStep ? 'text-white' : 'text-blue-200'
                        }`}
                      >
                        {step.title}
                      </span>
                    ))}
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <motion.div
                      className="bg-white h-2 rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {currentStep === 0 && (
                    <motion.div
                      key="budget"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Budget publicitaire mensuel</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Quel est votre budget publicitaire mensuel actuel ?
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Budget mensuel (€)
                          </label>
                          <input
                            type="range"
                            min="500"
                            max="50000"
                            step="500"
                            value={formData.monthlyBudget}
                            onChange={(e) => updateFormData('monthlyBudget', parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="flex justify-between text-sm text-gray-500 mt-1">
                            <span>500€</span>
                            <span className="font-semibold text-blue-600">
                              {formData.monthlyBudget.toLocaleString()}€
                            </span>
                            <span>50,000€</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[5000, 10000, 25000].map((budget) => (
                            <button
                              key={budget}
                              onClick={() => updateFormData('monthlyBudget', budget)}
                              className={`p-4 rounded-lg border-2 transition-all ${
                                formData.monthlyBudget === budget
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="text-lg font-semibold">{budget.toLocaleString()}€</div>
                              <div className="text-sm text-gray-500">par mois</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 1 && (
                    <motion.div
                      key="performance"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Vos métriques actuelles</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Renseignez vos performances actuelles pour des projections précises
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Taux de clic (CTR) %
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={formData.currentCTR}
                            onChange={(e) => updateFormData('currentCTR', parseFloat(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Taux de conversion %
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={formData.currentConversionRate}
                            onChange={(e) => updateFormData('currentConversionRate', parseFloat(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Coût par acquisition (CPA) €
                          </label>
                          <input
                            type="number"
                            value={formData.currentCPA}
                            onChange={(e) => updateFormData('currentCPA', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Revenus mensuels €
                          </label>
                          <input
                            type="number"
                            value={formData.currentRevenue}
                            onChange={(e) => updateFormData('currentRevenue', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 2 && (
                    <motion.div
                      key="industry"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Votre secteur d'activité</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Sélectionnez votre secteur pour des benchmarks précis
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { id: 'ecommerce', name: 'E-commerce', avgCTR: 2.5, avgConversion: 3.5 },
                          { id: 'saas', name: 'SaaS / Tech', avgCTR: 1.8, avgConversion: 2.5 },
                          { id: 'leadgen', name: 'Génération de leads', avgCTR: 3.2, avgConversion: 4.0 },
                          { id: 'retail', name: 'Commerce physique', avgCTR: 2.8, avgConversion: 3.8 }
                        ].map((industry) => (
                          <button
                            key={industry.id}
                            onClick={() => updateFormData('industry', industry.id)}
                            className={`p-4 rounded-lg border-2 transition-all text-left ${
                              formData.industry === industry.id
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="font-semibold">{industry.name}</div>
                            <div className="text-sm text-gray-500">
                              CTR: {industry.avgCTR}% | Conversion: {industry.avgConversion}%
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 3 && results && (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Vos résultats projetés</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Voici l'impact qu'ADS SaaS pourrait avoir sur votre ROI
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* ROI Actuel vs Projeté */}
                        <GlassmorphicCard className="p-6">
                          <h4 className="font-semibold mb-4 flex items-center gap-2">
                            <ChartBarIcon className="w-5 h-5" />
                            ROI Comparaison
                          </h4>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Actuel</span>
                              <span className="font-semibold">{results.currentROI.toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between items-center text-green-600">
                              <span>Projeté</span>
                              <span className="font-semibold flex items-center gap-1">
                                {results.projectedROI.toFixed(1)}%
                                <ArrowUpIcon className="w-4 h-4" />
                              </span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(results.projectedROI / 2, 100)}%` }}
                                transition={{ duration: 1, delay: 0.5 }}
                              />
                            </div>
                          </div>
                        </GlassmorphicCard>

                        {/* Économies */}
                        <GlassmorphicCard className="p-6">
                          <h4 className="font-semibold mb-4 flex items-center gap-2">
                            <CurrencyDollarIcon className="w-5 h-5" />
                            Économies annuelles
                          </h4>
                          <div className="text-center">
                            <div className="text-3xl font-bold text-green-600 mb-2">
                              {results.yearlySavings.toLocaleString()}€
                            </div>
                            <div className="text-sm text-gray-600">
                              Soit {results.monthlySavings.toLocaleString()}€ par mois
                            </div>
                          </div>
                        </GlassmorphicCard>
                      </div>

                      {/* Détails des améliorations */}
                      <GlassmorphicCard className="p-6">
                        <h4 className="font-semibold mb-4">Détails des améliorations</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              +{results.improvement.toFixed(1)}%
                            </div>
                            <div className="text-sm text-gray-600">Amélioration ROI</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              +{((results.projectedRevenue - results.currentRevenue) / results.currentRevenue * 100).toFixed(1)}%
                            </div>
                            <div className="text-sm text-gray-600">Augmentation revenus</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              -10%
                            </div>
                            <div className="text-sm text-gray-600">Réduction coûts</div>
                          </div>
                        </div>
                      </GlassmorphicCard>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex justify-between mt-8">
                  <button
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                    className="px-6 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Précédent
                  </button>

                  {currentStep < 3 ? (
                    <GradientButton
                      onClick={() => setCurrentStep(currentStep + 1)}
                    >
                      Suivant
                    </GradientButton>
                  ) : (
                    <GradientButton
                      onClick={() => {
                        setIsOpen(false)
                        // Ici on pourrait rediriger vers l'inscription
                      }}
                    >
                      Commencer maintenant
                    </GradientButton>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default ROICalculator 