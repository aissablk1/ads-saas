'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  EyeIcon,
  CursorArrowRaysIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  MegaphoneIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { analyticsAPI } from '../../lib/api'
import { DashboardData } from '../../types'
import { useOnboarding, useOnboardingCompleted } from '@/lib/onboarding-guide'
import { useNotifications } from '@/lib/notification-system'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [user, setUser] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    company: 'Tech Corp',
    plan: 'Pro',
    lastLogin: '2024-01-15T10:30:00Z'
  })

  const { startOnboarding } = useOnboarding()
  const { showNotification } = useNotifications()
  const isOnboardingCompleted = useOnboardingCompleted('dashboard')

  // Onboarding steps pour le dashboard
  const dashboardOnboardingSteps = [
    {
      id: 'welcome',
      title: 'Bienvenue sur votre dashboard !',
      content: 'Découvrez les fonctionnalités principales de votre espace de travail.',
      target: '.dashboard-welcome'
    },
    {
      id: 'quick-stats',
      title: 'Statistiques rapides',
      content: 'Consultez vos métriques clés en un coup d\'œil.',
      target: '.quick-stats'
    },
    {
      id: 'recent-campaigns',
      title: 'Campagnes récentes',
      content: 'Gérez et suivez vos campagnes publicitaires actives.',
      target: '.recent-campaigns'
    },
    {
      id: 'quick-actions',
      title: 'Actions rapides',
      content: 'Accédez rapidement aux fonctionnalités les plus utilisées.',
      target: '.quick-actions'
    }
  ]

  useEffect(() => {
    fetchDashboardData()

    // Démarrer l'onboarding si pas encore complété
    if (!isOnboardingCompleted) {
      setTimeout(() => {
        startOnboarding(dashboardOnboardingSteps, 'dashboard')
      }, 1000)
    }

    // Notification de bienvenue
    showNotification({
      type: 'info',
      title: 'Bienvenue !',
      message: 'Votre dashboard est prêt. Explorez les fonctionnalités !',
      duration: 5000
    })
  }, [selectedPeriod, isOnboardingCompleted, startOnboarding, showNotification])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const data = await analyticsAPI.getDashboard(selectedPeriod)
      setDashboardData(data)
    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error)
      // Données de démonstration si l'API n'est pas encore prête
      setDashboardData({
        overview: {
          totalCampaigns: 12,
          activeCampaigns: 8,
          totalAds: 45,
          totalSpent: 15420.50
        },
        metrics: {
          impressions: 234500,
          clicks: 4892,
          conversions: 127,
          ctr: 2.08,
          conversionRate: 2.59,
          budgetUtilization: 78.2,
          averageCpc: 3.15,
          averageCpa: 121.42
        },
        charts: {
          dailyStats: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            impressions: Math.floor(Math.random() * 10000) + 5000,
            clicks: Math.floor(Math.random() * 200) + 100,
            conversions: Math.floor(Math.random() * 10) + 2,
            cost: Math.floor(Math.random() * 500) + 200,
            revenue: Math.floor(Math.random() * 1000) + 500
          })),
          topCampaigns: [
            {
              id: '1',
              name: 'Campagne Black Friday',
              status: 'ACTIVE',
              budget: 5000,
              spent: 3200,
              impressions: 45000,
              clicks: 890,
              conversions: 23,
              startDate: '2024-01-01',
              endDate: '2024-12-31',
              createdAt: '2024-01-01',
              updatedAt: '2024-01-01',
              userId: '1',
              ctr: 1.98,
              conversionRate: 2.58
            }
          ]
        },
        recentActivities: [
          {
            id: '1',
            type: 'CAMPAIGN_CREATED',
            title: 'Nouvelle campagne créée',
            description: 'Campagne Black Friday créée avec succès',
            createdAt: new Date().toISOString(),
            userId: '1'
          }
        ]
      })
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, change, icon: Icon, color }: {
    title: string
    value: string | number
    change?: number
    icon: any
    color: string
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
    >
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-3 rounded-md ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{value}</div>
              {change !== undefined && (
                <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                  change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {change >= 0 ? (
                    <ArrowUpIcon className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4 mr-1" />
                  )}
                  {Math.abs(change)}%
                </div>
              )}
            </dd>
          </dl>
        </div>
      </div>
    </motion.div>
  )

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 dark:bg-gray-700 h-32 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-200 dark:bg-gray-700 h-96 rounded-lg"></div>
            <div className="bg-gray-200 dark:bg-gray-700 h-96 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="p-8">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">Impossible de charger les données du tableau de bord</p>
        </div>
      </div>
    )
  }

  const lineChartData = {
    labels: dashboardData.charts.dailyStats.map(d => {
      const date = new Date(d.date)
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
    }),
    datasets: [
      {
        label: 'Impressions',
        data: dashboardData.charts.dailyStats.map(d => d.impressions),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
      },
      {
        label: 'Clics',
        data: dashboardData.charts.dailyStats.map(d => d.clicks),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.1,
      }
    ]
  }

  const doughnutData = {
    labels: ['Budget utilisé', 'Budget restant'],
    datasets: [
      {
        data: [
          dashboardData.metrics.budgetUtilization,
          100 - dashboardData.metrics.budgetUtilization
        ],
        backgroundColor: ['#3B82F6', '#E5E7EB'],
        borderWidth: 0,
      }
    ]
  }

  return (
    <div className="p-6 space-y-6">
      {/* Section de bienvenue */}
      <div className="dashboard-welcome bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-primary-200 dark:border-primary-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Bonjour, {user.firstName} ! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Voici un aperçu de vos performances aujourd'hui
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Dernière connexion
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {new Date(user.lastLogin).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="quick-stats grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Campagnes actives
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                12
              </p>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600 dark:text-green-400">
              +8.2% vs hier
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                ROI moyen
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                3.2x
              </p>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600 dark:text-green-400">
              +12.5% vs hier
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Clics aujourd'hui
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                2.4k
              </p>
            </div>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.122 2.122" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600 dark:text-green-400">
              +15.3% vs hier
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Conversions
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                156
              </p>
            </div>
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600 dark:text-green-400">
              +5.7% vs hier
            </span>
          </div>
        </div>
      </div>

      {/* Campagnes récentes */}
      <div className="recent-campaigns bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Campagnes récentes
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[
              { name: 'Campagne Facebook Q1', status: 'active', budget: '2,500€', spent: '1,800€', roi: '2.8x' },
              { name: 'Google Ads - Produit A', status: 'paused', budget: '1,500€', spent: '1,200€', roi: '3.1x' },
              { name: 'LinkedIn B2B', status: 'active', budget: '3,000€', spent: '2,100€', roi: '4.2x' }
            ].map((campaign, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    campaign.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {campaign.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Budget: {campaign.budget} • Dépensé: {campaign.spent}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white">
                    ROI: {campaign.roi}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {campaign.status === 'active' ? 'Actif' : 'En pause'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="quick-actions grid grid-cols-1 md:grid-cols-3 gap-6">
        <button className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow text-left">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Nouvelle campagne
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Créer une campagne publicitaire
              </p>
            </div>
          </div>
        </button>

        <button className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow text-left">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Voir les rapports
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Analyser les performances
              </p>
            </div>
          </div>
        </button>

        <button className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow text-left">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Paramètres
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Configurer votre compte
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  )
} 