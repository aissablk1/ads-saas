'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  CreditCardIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  DocumentTextIcon,
  StarIcon,
  CurrencyDollarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import { subscriptionsAPI } from '../../../lib/api'
import { SubscriptionPlan, Subscription } from '../../../types'
import { toast } from 'react-hot-toast'

export default function BillingPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  useEffect(() => {
    fetchBillingData()
  }, [])

  const fetchBillingData = async () => {
    try {
      setLoading(true)
      const [plansData, subscriptionData] = await Promise.all([
        subscriptionsAPI.getPlans(),
        subscriptionsAPI.getCurrentSubscription()
      ])
      setPlans(plansData.plans || plansData)
      setCurrentSubscription(subscriptionData.subscription || subscriptionData)
    } catch (error) {
      console.error('Erreur lors du chargement des données de facturation:', error)
      toast.error('Erreur lors du chargement des données de facturation')
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (planId: string) => {
    try {
      setSelectedPlan(planId)
      const response = await subscriptionsAPI.subscribe(planId)
      
      // Redirect to Stripe Checkout if provided
      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl
      } else {
        toast.success('Abonnement souscrit avec succès !')
        fetchBillingData()
      }
    } catch (error) {
      console.error('Erreur lors de la souscription:', error)
      toast.error('Erreur lors de la souscription')
    } finally {
      setSelectedPlan(null)
    }
  }

  const handleCancelSubscription = async () => {
    try {
      await subscriptionsAPI.cancelSubscription()
      toast.success('Abonnement annulé avec succès')
      fetchBillingData()
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error)
      toast.error('Erreur lors de l\'annulation de l\'abonnement')
    }
  }

  const handleManageSubscription = () => {
    // Redirect to Stripe Customer Portal
    window.open('https://billing.stripe.com/p/login/test_00000000', '_blank')
  }

  const formatFeature = (value: any) => {
    if (value === 'unlimited') return 'Illimité'
    if (typeof value === 'number') return value.toLocaleString('fr-FR')
    return value
  }

  const PlanCard = ({ plan, isCurrentPlan, isPopular }: {
    plan: SubscriptionPlan
    isCurrentPlan: boolean
    isPopular?: boolean
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative bg-white rounded-lg shadow-lg border-2 ${
        isPopular ? 'border-primary-500' : 'border-gray-200'
      } ${isCurrentPlan ? 'ring-2 ring-primary-500' : ''}`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
            <StarIcon className="h-4 w-4" />
            <span>Populaire</span>
          </span>
        </div>
      )}
      
      <div className="p-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
          <div className="mt-4">
            <span className="text-4xl font-bold text-gray-900">{plan.price}€</span>
            <span className="text-gray-500">/{plan.interval}</span>
          </div>
        </div>

        <ul className="mt-6 space-y-4">
          <li className="flex items-center">
            <CheckIcon className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-gray-700">
              {formatFeature(plan.features.campaigns)} campagnes
            </span>
          </li>
          <li className="flex items-center">
            <CheckIcon className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-gray-700">
              {formatFeature(plan.features.ads)} annonces
            </span>
          </li>
          <li className="flex items-center">
            <CheckIcon className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-gray-700">
              {formatFeature(plan.limits.impressions)} impressions
            </span>
          </li>
          <li className="flex items-center">
            <CheckIcon className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-gray-700">
              {plan.features.apiKeys} clés API
            </span>
          </li>
          <li className="flex items-center">
            <CheckIcon className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-gray-700">
              Support {plan.features.support}
            </span>
          </li>
          <li className="flex items-center">
            <CheckIcon className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-gray-700">
              Analytics {plan.features.analytics}
            </span>
          </li>
          {plan.features.customReports && (
            <li className="flex items-center">
              <CheckIcon className="h-5 w-5 text-green-500 mr-3" />
              <span className="text-gray-700">Rapports personnalisés</span>
            </li>
          )}
        </ul>

        <div className="mt-8">
          {isCurrentPlan ? (
            <button
              disabled
              className="w-full bg-gray-100 text-gray-500 py-2 px-4 rounded-md cursor-not-allowed"
            >
              Plan actuel
            </button>
          ) : (
            <button
              onClick={() => handleSubscribe(plan.id)}
              disabled={selectedPlan === plan.id}
              className={`w-full py-2 px-4 rounded-md font-medium ${
                isPopular
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              } disabled:opacity-50`}
            >
              {selectedPlan === plan.id ? 'Souscription...' : 'Choisir ce plan'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="bg-gray-200 h-32 rounded-lg mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-96 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Facturation et abonnements</h1>
        <p className="text-gray-600">Gérez votre abonnement et consultez votre historique de facturation</p>
      </div>

      {/* Plan actuel */}
      {currentSubscription && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow p-6 mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Plan actuel</h3>
              <p className="text-gray-600">
                Plan {currentSubscription.plan.toLowerCase()} • 
                <span className={`ml-1 ${
                  currentSubscription.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {currentSubscription.status === 'ACTIVE' ? 'Actif' : 'Inactif'}
                </span>
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Prochaine facturation</div>
                <div className="font-medium">
                  {currentSubscription.endDate 
                    ? new Date(currentSubscription.endDate).toLocaleDateString('fr-FR')
                    : 'N/A'
                  }
                </div>
              </div>
              <button className="btn-secondary" onClick={handleManageSubscription}>
                Gérer l'abonnement
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Plans disponibles */}
      <div className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Choisissez votre plan</h2>
          <p className="mt-4 text-gray-600">
            Sélectionnez le plan qui correspond le mieux à vos besoins
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrentPlan={currentSubscription?.plan.toLowerCase() === plan.id}
              isPopular={index === 1}
            />
          ))}
        </div>
      </div>

      {/* Méthodes de paiement */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow mb-8"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CreditCardIcon className="h-6 w-6 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900">Méthodes de paiement</h3>
            </div>
            <button className="btn-primary">
              Ajouter une carte
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="text-center text-gray-500 py-8">
            <CreditCardIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Aucune méthode de paiement configurée</p>
            <p className="text-sm">Ajoutez une carte de crédit pour souscrire à un plan payant</p>
          </div>
        </div>
      </motion.div>

      {/* Historique de facturation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <DocumentTextIcon className="h-6 w-6 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900">Historique de facturation</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="text-center text-gray-500 py-8">
            <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Aucune facture disponible</p>
            <p className="text-sm">Vos factures apparaîtront ici une fois que vous aurez souscrit à un plan payant</p>
          </div>
        </div>
      </motion.div>

      {/* FAQ Facturation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-12"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-6">Questions fréquentes</h3>
        <div className="bg-white rounded-lg shadow divide-y">
          <div className="p-6">
            <h4 className="font-medium text-gray-900 mb-2">Puis-je changer de plan à tout moment ?</h4>
            <p className="text-gray-600">
              Oui, vous pouvez passer à un plan supérieur ou inférieur à tout moment. 
              Les changements prennent effet immédiatement.
            </p>
          </div>
          <div className="p-6">
            <h4 className="font-medium text-gray-900 mb-2">Puis-je annuler mon abonnement ?</h4>
            <p className="text-gray-600">
              Vous pouvez annuler votre abonnement à tout moment. Vous conserverez l'accès 
              jusqu'à la fin de votre période de facturation actuelle.
            </p>
          </div>
          <div className="p-6">
            <h4 className="font-medium text-gray-900 mb-2">Acceptez-vous les cartes de crédit ?</h4>
            <p className="text-gray-600">
              Nous acceptons toutes les principales cartes de crédit (Visa, MasterCard, American Express) 
              ainsi que PayPal.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 