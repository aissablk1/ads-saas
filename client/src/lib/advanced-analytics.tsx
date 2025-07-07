'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  UsersIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { GlassmorphicCard, GradientButton, ProgressRing, NotificationBubble } from './design-system'

interface AnalyticsData {
  revenue: number
  impressions: number
  clicks: number
  conversions: number
  ctr: number
  cpc: number
  cpa: number
  roi: number
  spend: number
}

interface Campaign {
  id: string
  name: string
  status: 'active' | 'paused' | 'completed'
  budget: number
  spent: number
  impressions: number
  clicks: number
  conversions: number
  ctr: number
  cpc: number
  cpa: number
  roi: number
  performance: 'excellent' | 'good' | 'average' | 'poor'
}

interface Insight {
  id: string
  type: 'optimization' | 'alert' | 'opportunity' | 'trend'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  action: string
  icon: any
  color: string
}

export const AdvancedAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [selectedMetric, setSelectedMetric] = useState<string>('revenue')
  const [showInsights, setShowInsights] = useState(true)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    revenue: 15420,
    impressions: 1250000,
    clicks: 45000,
    conversions: 1250,
    ctr: 3.6,
    cpc: 0.85,
    cpa: 12.50,
    roi: 285,
    spend: 5400
  })

  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: '1',
      name: 'Campagne E-commerce Q4',
      status: 'active',
      budget: 5000,
      spent: 3200,
      impressions: 450000,
      clicks: 18000,
      conversions: 450,
      ctr: 4.0,
      cpc: 0.78,
      cpa: 7.11,
      roi: 320,
      performance: 'excellent'
    },
    {
      id: '2',
      name: 'Promotion Black Friday',
      status: 'active',
      budget: 3000,
      spent: 2100,
      impressions: 280000,
      clicks: 12000,
      conversions: 320,
      ctr: 4.3,
      cpc: 0.82,
      cpa: 6.56,
      roi: 380,
      performance: 'excellent'
    },
    {
      id: '3',
      name: 'Awareness Brand',
      status: 'paused',
      budget: 2000,
      spent: 1800,
      impressions: 320000,
      clicks: 8000,
      conversions: 180,
      ctr: 2.5,
      cpc: 1.20,
      cpa: 10.00,
      roi: 150,
      performance: 'average'
    }
  ])

  const [insights, setInsights] = useState<Insight[]>([
    {
      id: '1',
      type: 'optimization',
      title: 'Opportunité d\'optimisation détectée',
      description: 'Votre campagne "E-commerce Q4" pourrait améliorer son CTR de 15% en ajustant les heures de diffusion.',
      impact: 'high',
      action: 'Optimiser automatiquement',
      icon: ArrowTrendingUpIcon,
      color: 'text-green-500'
    },
    {
      id: '2',
      type: 'alert',
      title: 'Budget en cours d\'épuisement',
      description: 'La campagne "Promotion Black Friday" a utilisé 70% de son budget en 3 jours.',
      impact: 'medium',
      action: 'Ajuster le budget',
      icon: ExclamationTriangleIcon,
      color: 'text-orange-500'
    },
    {
      id: '3',
      type: 'opportunity',
      title: 'Nouveau segment découvert',
      description: 'Les utilisateurs de 25-34 ans ont un CPA 30% plus faible sur vos campagnes.',
      impact: 'high',
      action: 'Créer une campagne ciblée',
      icon: UsersIcon,
      color: 'text-blue-500'
    }
  ])

  // Simulation de données en temps réel
  useEffect(() => {
    const interval = setInterval(() => {
      setAnalyticsData(prev => ({
        ...prev,
        impressions: prev.impressions + Math.floor(Math.random() * 100),
        clicks: prev.clicks + Math.floor(Math.random() * 10),
        conversions: prev.conversions + Math.floor(Math.random() * 2),
        revenue: prev.revenue + Math.floor(Math.random() * 50)
      }))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatCurrency = (num: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(num)
  }

  const getPerformanceColor = (performance: string): string => {
    switch (performance) {
      case 'excellent': return 'text-green-500'
      case 'good': return 'text-blue-500'
      case 'average': return 'text-yellow-500'
      case 'poor': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getPerformanceIcon = (performance: string) => {
    switch (performance) {
      case 'excellent': return <ArrowTrendingUpIcon className="w-4 h-4" />
      case 'good': return <ArrowTrendingUpIcon className="w-4 h-4" />
      case 'average': return <ArrowUpIcon className="w-4 h-4" />
      case 'poor': return <ArrowTrendingDownIcon className="w-4 h-4" />
      default: return <InformationCircleIcon className="w-4 h-4" />
    }
  }

  const metrics = [
    {
      key: 'revenue',
      label: 'Revenus',
      value: analyticsData.revenue,
      format: formatCurrency,
      icon: CurrencyDollarIcon,
      color: 'text-green-500',
      change: '+12.5%'
    },
    {
      key: 'impressions',
      label: 'Impressions',
      value: analyticsData.impressions,
      format: formatNumber,
      icon: EyeIcon,
      color: 'text-blue-500',
      change: '+8.2%'
    },
    {
      key: 'clicks',
      label: 'Clics',
      value: analyticsData.clicks,
      format: formatNumber,
      icon: CursorArrowRaysIcon,
      color: 'text-purple-500',
      change: '+15.3%'
    },
    {
      key: 'conversions',
      label: 'Conversions',
      value: analyticsData.conversions,
      format: formatNumber,
      icon: UsersIcon,
      color: 'text-orange-500',
      change: '+22.1%'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header avec contrôles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Tableau de bord Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Vue d'ensemble de vos performances publicitaires
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Sélecteur de période */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {(['7d', '30d', '90d'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setTimeRange(period)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                  timeRange === period
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {period === '7d' ? '7 jours' : period === '30d' ? '30 jours' : '90 jours'}
              </button>
            ))}
          </div>

          {/* Toggle insights */}
          <button
            onClick={() => setShowInsights(!showInsights)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <InformationCircleIcon className="w-4 h-4" />
            {showInsights ? 'Masquer' : 'Afficher'} les insights
          </button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <GlassmorphicCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${metric.color.replace('text-', 'bg-')} bg-opacity-10`}>
                  <metric.icon className={`w-6 h-6 ${metric.color}`} />
                </div>
                <div className="text-right">
                  <div className="text-sm text-green-600 font-medium flex items-center gap-1">
                    <ArrowUpIcon className="w-3 h-3" />
                    {metric.change}
                  </div>
                </div>
              </div>
              
              <div className="mb-2">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metric.format(metric.value)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {metric.label}
                </div>
              </div>

              {/* Barre de progression */}
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${metric.color.replace('text-', 'bg-')} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((metric.value / 20000) * 100, 100)}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                />
              </div>
            </GlassmorphicCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KPIs détaillés */}
        <div className="lg:col-span-2">
          <GlassmorphicCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Métriques de performance
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {analyticsData.ctr}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">CTR</div>
                <div className="text-xs text-green-600 mt-1">+0.4%</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {formatCurrency(analyticsData.cpc)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">CPC</div>
                <div className="text-xs text-red-600 mt-1">-0.05€</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {formatCurrency(analyticsData.cpa)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">CPA</div>
                <div className="text-xs text-green-600 mt-1">-1.20€</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {analyticsData.roi}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">ROI</div>
                <div className="text-xs text-green-600 mt-1">+25%</div>
              </div>
            </div>

            {/* Graphique simulé */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Évolution des revenus
                </h4>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {timeRange === '7d' ? '7 derniers jours' : timeRange === '30d' ? '30 derniers jours' : '90 derniers jours'}
                </div>
              </div>
              
              <div className="h-48 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg flex items-end justify-center p-4">
                <div className="flex items-end gap-2 h-full">
                  {Array.from({ length: timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="bg-gradient-to-t from-blue-500 to-purple-500 rounded-t w-2"
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.random() * 100}%` }}
                      transition={{ duration: 0.5, delay: i * 0.02 }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </GlassmorphicCard>
        </div>

        {/* Insights IA */}
        <div>
          <GlassmorphicCard className="p-6 h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Insights IA
              </h3>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            </div>
            
            <AnimatePresence>
              {showInsights && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  {insights.map((insight, index) => (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-l-4 border-l-blue-500"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${insight.color.replace('text-', 'bg-')} bg-opacity-10`}>
                          <insight.icon className={`w-4 h-4 ${insight.color}`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                            {insight.title}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                            {insight.description}
                          </p>
                          <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                            {insight.action} →
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </GlassmorphicCard>
        </div>
      </div>

      {/* Campagnes */}
      <GlassmorphicCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Campagnes actives
          </h3>
          <GradientButton size="sm">
            Nouvelle campagne
          </GradientButton>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Campagne</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Statut</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Budget</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">CTR</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">CPA</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">ROI</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Performance</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign, index) => (
                <motion.tr
                  key={campaign.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {campaign.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {formatNumber(campaign.impressions)} impressions
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      campaign.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : campaign.status === 'paused'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {campaign.status === 'active' ? 'Active' : campaign.status === 'paused' ? 'En pause' : 'Terminée'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(campaign.spent)} / {formatCurrency(campaign.budget)}
                      </div>
                                              <div className="mt-1">
                          <ProgressRing
                            progress={(campaign.spent / campaign.budget) * 100}
                            size={24}
                          />
                        </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {campaign.ctr}%
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(campaign.cpa)}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {campaign.roi}%
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className={`flex items-center gap-1 ${getPerformanceColor(campaign.performance)}`}>
                      {getPerformanceIcon(campaign.performance)}
                      <span className="text-sm font-medium capitalize">
                        {campaign.performance}
                      </span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassmorphicCard>
    </div>
  )
}

export default AdvancedAnalytics 