'use client'

import React, { useState, useEffect } from 'react'
import {
  ChartBarIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UsersIcon,
  ServerIcon,
  GlobeAltIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  EyeIcon,
  CogIcon,
  DocumentTextIcon,
  BoltIcon,
  FireIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

interface AnalyticsData {
  period: string
  users: number
  sessions: number
  requests: number
  errors: number
  responseTime: number
  revenue: number
}

interface TopUser {
  id: string
  email: string
  sessions: number
  lastActivity: string
  status: string
}

interface SystemMetric {
  name: string
  value: number
  change: number
  trend: 'up' | 'down' | 'stable'
}

export default function AdminAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d')
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([])
  const [topUsers, setTopUsers] = useState<TopUser[]>([])
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Données de test
  const mockAnalyticsData: AnalyticsData[] = [
    { period: '2024-01-08', users: 145, sessions: 289, requests: 1247, errors: 12, responseTime: 245, revenue: 1250 },
    { period: '2024-01-09', users: 167, sessions: 334, requests: 1456, errors: 8, responseTime: 234, revenue: 1380 },
    { period: '2024-01-10', users: 189, sessions: 378, requests: 1678, errors: 15, responseTime: 256, revenue: 1520 },
    { period: '2024-01-11', users: 156, sessions: 312, requests: 1345, errors: 6, responseTime: 221, revenue: 1280 },
    { period: '2024-01-12', users: 178, sessions: 356, requests: 1589, errors: 11, responseTime: 238, revenue: 1450 },
    { period: '2024-01-13', users: 201, sessions: 402, requests: 1823, errors: 9, responseTime: 228, revenue: 1680 },
    { period: '2024-01-14', users: 234, sessions: 468, requests: 2156, errors: 14, responseTime: 242, revenue: 1950 }
  ]

  const mockTopUsers: TopUser[] = [
    { id: '1', email: 'john.doe@example.com', sessions: 45, lastActivity: '2024-01-15T10:30:00Z', status: 'active' },
    { id: '2', email: 'admin@ads-saas.com', sessions: 38, lastActivity: '2024-01-15T09:15:00Z', status: 'active' },
    { id: '3', email: 'partner@company.com', sessions: 32, lastActivity: '2024-01-15T08:45:00Z', status: 'active' },
    { id: '4', email: 'user4@example.com', sessions: 28, lastActivity: '2024-01-14T16:20:00Z', status: 'inactive' },
    { id: '5', email: 'user5@example.com', sessions: 25, lastActivity: '2024-01-14T14:10:00Z', status: 'active' }
  ]

  const mockSystemMetrics: SystemMetric[] = [
    { name: 'Utilisateurs Actifs', value: 234, change: 12.5, trend: 'up' },
    { name: 'Sessions', value: 468, change: 8.3, trend: 'up' },
    { name: 'Requêtes API', value: 2156, change: -2.1, trend: 'down' },
    { name: 'Taux d\'Erreur', value: 0.65, change: -15.2, trend: 'down' },
    { name: 'Temps de Réponse', value: 242, change: 3.4, trend: 'up' },
    { name: 'Revenus', value: 1950, change: 18.7, trend: 'up' }
  ]

  useEffect(() => {
    setAnalyticsData(mockAnalyticsData)
    setTopUsers(mockTopUsers)
    setSystemMetrics(mockSystemMetrics)
  }, [])

  const handleRefreshData = () => {
    setIsLoading(true)
    toast.success('Actualisation des données...')
    
    setTimeout(() => {
      setIsLoading(false)
      toast.success('Données actualisées')
    }, 2000)
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowTrendingUpIcon className="h-4 w-4 text-green-400" />
      case 'down': return <ArrowTrendingDownIcon className="h-4 w-4 text-red-400" />
      default: return <ArrowTrendingUpIcon className="h-4 w-4 text-gray-400" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-400'
      case 'down': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-900/20'
      case 'inactive': return 'text-gray-400 bg-gray-900/20'
      default: return 'text-gray-400 bg-gray-900/20'
    }
  }

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 0
    return ((current - previous) / previous) * 100
  }

  const totalUsers = analyticsData.reduce((sum, data) => sum + data.users, 0)
  const totalSessions = analyticsData.reduce((sum, data) => sum + data.sessions, 0)
  const totalRequests = analyticsData.reduce((sum, data) => sum + data.requests, 0)
  const totalRevenue = analyticsData.reduce((sum, data) => sum + data.revenue, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics Avancées</h1>
          <p className="text-gray-400">Analyses détaillées et métriques système</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="24h">24 heures</option>
            <option value="7d">7 jours</option>
            <option value="30d">30 jours</option>
            <option value="90d">90 jours</option>
          </select>
          <button
            onClick={handleRefreshData}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <ArrowPathIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Utilisateurs Totaux</p>
              <p className="text-2xl font-bold text-white">{totalUsers}</p>
              <p className="text-sm text-green-400">+12.5% vs période précédente</p>
            </div>
            <div className="p-3 rounded-full bg-blue-900/20">
              <UsersIcon className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Sessions Totales</p>
              <p className="text-2xl font-bold text-white">{totalSessions}</p>
              <p className="text-sm text-green-400">+8.3% vs période précédente</p>
            </div>
            <div className="p-3 rounded-full bg-green-900/20">
              <GlobeAltIcon className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Requêtes API</p>
              <p className="text-2xl font-bold text-white">{totalRequests.toLocaleString()}</p>
              <p className="text-sm text-red-400">-2.1% vs période précédente</p>
            </div>
            <div className="p-3 rounded-full bg-purple-900/20">
              <ServerIcon className="h-6 w-6 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Revenus</p>
              <p className="text-2xl font-bold text-white">€{totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-green-400">+18.7% vs période précédente</p>
            </div>
                         <div className="p-3 rounded-full bg-yellow-900/20">
               <ArrowTrendingUpIcon className="h-6 w-6 text-yellow-400" />
             </div>
          </div>
        </div>
      </div>

      {/* Graphiques et analyses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution des métriques */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Évolution des Métriques</h3>
          <div className="space-y-4">
            {analyticsData.slice(-7).map((data, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div>
                  <p className="text-white font-medium">{new Date(data.period).toLocaleDateString('fr-FR')}</p>
                  <p className="text-sm text-gray-400">{data.users} utilisateurs, {data.sessions} sessions</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">{data.requests} req</p>
                  <p className="text-sm text-gray-400">{data.responseTime}ms</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top utilisateurs */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Top Utilisateurs</h3>
          <div className="space-y-3">
            {topUsers.map((user, index) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{user.email}</p>
                    <p className="text-sm text-gray-400">{user.sessions} sessions</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                    {user.status}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(user.lastActivity).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Métriques système détaillées */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Métriques Système Détaillées</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {systemMetrics.map((metric, index) => (
            <div key={index} className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-medium">{metric.name}</h4>
                {getTrendIcon(metric.trend)}
              </div>
              <p className="text-2xl font-bold text-white mb-1">
                {metric.name.includes('Taux') ? `${metric.value}%` : 
                 metric.name.includes('Temps') ? `${metric.value}ms` :
                 metric.name.includes('Revenus') ? `€${metric.value.toLocaleString()}` :
                 metric.value.toLocaleString()}
              </p>
              <p className={`text-sm ${getTrendColor(metric.trend)}`}>
                {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}% vs période précédente
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Analyses de performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance API */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Performance API</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Temps de réponse moyen</span>
              <span className="text-white font-medium">242ms</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Taux de succès</span>
              <span className="text-white font-medium">99.35%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '99.35%' }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Requêtes par minute</span>
              <span className="text-white font-medium">1,247</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>
        </div>

        {/* Alertes et notifications */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Alertes Récentes</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-red-900/20 rounded-lg">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mt-0.5" />
              <div>
                <p className="text-white text-sm">Pic de trafic détecté - 2,156 requêtes/min</p>
                <p className="text-gray-400 text-xs">Il y a 2 heures</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-yellow-900/20 rounded-lg">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mt-0.5" />
              <div>
                <p className="text-white text-sm">Temps de réponse élevé - 456ms</p>
                <p className="text-gray-400 text-xs">Il y a 4 heures</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-green-900/20 rounded-lg">
              <CheckCircleIcon className="h-5 w-5 text-green-400 mt-0.5" />
              <div>
                <p className="text-white text-sm">Sauvegarde automatique réussie</p>
                <p className="text-gray-400 text-xs">Il y a 6 heures</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 