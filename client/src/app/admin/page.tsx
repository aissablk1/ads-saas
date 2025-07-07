'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import {
  UsersIcon,
  ChartBarIcon,
  ServerIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CpuChipIcon,
  CircleStackIcon,
  GlobeAltIcon,
  BellIcon,
  KeyIcon,
  ArchiveBoxIcon,
  CloudIcon,
  RocketLaunchIcon,
  LightBulbIcon,
  ArrowRightOnRectangleIcon,
  CogIcon,
  WrenchScrewdriverIcon,
  CircleStackIcon as DatabaseIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { useAdminAuth } from '@/components/AdminAuthGuard'
import { AdminApiService } from '@/lib/admin-api'

interface SystemStats {
  users: {
    total: number
    active: number
    new: number
    premium: number
  }
  system: {
    uptime: string
    cpu: number
    memory: number
    disk: number
  }
  performance: {
    responseTime: number
    requestsPerMinute: number
    errorRate: number
    throughput: number
  }
  security: {
    threats: number
    blocked: number
    vulnerabilities: number
    lastScan: string
  }
  campaigns: {
    total: number
    active: number
    totalSpent: number
    totalImpressions: number
    totalClicks: number
    totalConversions: number
  }
  recentActivities: Array<{
    id: string
    type: string
    action: string
    user: string
    time: string
    status: string
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPerformingAction, setIsPerformingAction] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const { user, logout } = useAdminAuth()
  const router = useRouter()
  const adminApi = new AdminApiService()

  const loadDashboardData = async () => {
    try {
      const data = await adminApi.getDashboardStats()
      setStats(data)
      setLastUpdate(new Date())
    } catch (error) {
      toast.error('Erreur lors du chargement des données')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
    
    // Rafraîchir les données toutes les 30 secondes
    const interval = setInterval(loadDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleSystemAction = async (action: string, actionName: string) => {
    setIsPerformingAction(true)
    try {
      const result = await adminApi.performSystemAction(action)
      toast.success(result.message)
      // Recharger les données après l'action
      setTimeout(loadDashboardData, 1000)
    } catch (error) {
      toast.error(`Erreur lors de ${actionName.toLowerCase()}`)
    } finally {
      setIsPerformingAction(false)
    }
  }

  const handleLogout = () => {
    logout()
  }

  const quickActions = [
    {
      name: 'Constructeur de Pages',
      href: '/admin/builder',
      icon: CpuChipIcon,
      description: 'Créer des pages visuellement',
      color: 'from-blue-500 to-purple-600',
      bgColor: 'bg-gradient-to-r from-blue-500 to-purple-600'
    },
    {
      name: 'Gestion Utilisateurs',
      href: '/admin/users',
      icon: UsersIcon,
      description: 'Gérer les comptes',
      color: 'from-green-500 to-blue-600',
      bgColor: 'bg-gradient-to-r from-green-500 to-blue-600'
    },
    {
      name: 'Monitoring Système',
      href: '/admin/system',
      icon: ServerIcon,
      description: 'Surveiller les performances',
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-gradient-to-r from-orange-500 to-red-600'
    },
    {
      name: 'Sécurité',
      href: '/admin/security',
      icon: ShieldCheckIcon,
      description: 'Paramètres de sécurité',
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-gradient-to-r from-purple-500 to-pink-600'
    }
  ]

  const systemActions = [
    {
      name: 'Nettoyer Cache',
      action: 'clear_cache',
      icon: CloudIcon,
      description: 'Vider le cache système',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      name: 'Optimiser DB',
      action: 'optimize_database',
      icon: DatabaseIcon,
      description: 'Optimiser la base de données',
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      name: 'Sauvegarde',
      action: 'backup_database',
      icon: ArchiveBoxIcon,
      description: 'Créer une sauvegarde',
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      name: 'Redémarrer',
      action: 'restart_system',
      icon: ServerIcon,
      description: 'Redémarrer le système',
      color: 'bg-orange-600 hover:bg-orange-700'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400'
      case 'warning': return 'text-yellow-400'
      case 'error': return 'text-red-400'
      case 'info': return 'text-blue-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return CheckCircleIcon
      case 'warning': return ExclamationTriangleIcon
      case 'error': return ExclamationTriangleIcon
      case 'info': return ClockIcon
      default: return ClockIcon
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto" style={{ animationDelay: '-0.5s' }}></div>
          </div>
          <p className="mt-4 text-white/80 text-lg">Chargement du tableau de bord...</p>
          <p className="text-blue-200 text-sm">Récupération des données système</p>
        </motion.div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-white text-lg">Erreur de chargement des données</p>
          <button 
            onClick={loadDashboardData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header avec navigation */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <ShieldCheckIcon className="h-8 w-8 text-red-500" />
              <div>
                <h1 className="text-xl font-bold text-white">ADS - Espace de Contrôle Ultime</h1>
                <p className="text-sm text-gray-400">Administration système</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">Système Opérationnel</span>
              </div>
              <div className="text-gray-400 text-sm">
                Dernière mise à jour: {lastUpdate.toLocaleTimeString()}
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition duration-200"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Actions rapides */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {quickActions.map((action, index) => (
            <motion.div
              key={action.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              className="group cursor-pointer"
            >
              <div
                onClick={() => router.push(action.href)}
                className="block bg-gray-800 hover:bg-gray-700 rounded-xl p-6 border border-gray-600 hover:border-gray-500 transition-all duration-200 group-hover:scale-105"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${action.bgColor}`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">{action.name}</h3>
                    <p className="text-gray-400 text-sm">{action.description}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Statistiques principales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Utilisateurs */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-600">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Utilisateurs</h3>
              <UsersIcon className="w-6 h-6 text-blue-400" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{stats.users.total}</div>
                <div className="text-gray-400 text-sm">Total</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">{stats.users.active}</div>
                <div className="text-gray-400 text-sm">Actifs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">{stats.users.new}</div>
                <div className="text-gray-400 text-sm">Nouveaux</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">{stats.users.premium}</div>
                <div className="text-gray-400 text-sm">Premium</div>
              </div>
            </div>
          </div>

          {/* Campagnes */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-600">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Campagnes</h3>
              <RocketLaunchIcon className="w-6 h-6 text-green-400" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{stats.campaigns.total}</div>
                <div className="text-gray-400 text-sm">Total</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">{stats.campaigns.active}</div>
                <div className="text-gray-400 text-sm">Actives</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">{stats.campaigns.totalClicks}</div>
                <div className="text-gray-400 text-sm">Clics</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">{stats.campaigns.totalConversions}</div>
                <div className="text-gray-400 text-sm">Conversions</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Système et Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Système */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-600">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">État du Système</h3>
              <ServerIcon className="w-6 h-6 text-orange-400" />
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">CPU</span>
                  <span className="text-white font-semibold">{stats.system.cpu}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stats.system.cpu}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Mémoire</span>
                  <span className="text-white font-semibold">{stats.system.memory}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stats.system.memory}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Disque</span>
                  <span className="text-white font-semibold">{stats.system.disk}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stats.system.disk}%` }}
                  ></div>
                </div>
              </div>
              <div className="pt-2 border-t border-gray-600">
                <div className="flex items-center space-x-2">
                  <ClockIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400 text-sm">Uptime: {stats.system.uptime}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-600">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Performance</h3>
              <ChartBarIcon className="w-6 h-6 text-green-400" />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Temps de réponse</span>
                <span className="text-white font-semibold">{stats.performance.responseTime}ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Requêtes/min</span>
                <span className="text-white font-semibold">{stats.performance.requestsPerMinute}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Taux d'erreur</span>
                <span className="text-white font-semibold">{stats.performance.errorRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Débit</span>
                <span className="text-white font-semibold">{stats.performance.throughput} MB/s</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sécurité et Actions Système */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Sécurité */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-600">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Sécurité</h3>
              <ShieldCheckIcon className="w-6 h-6 text-green-400" />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Menaces détectées</span>
                <span className="text-red-400 font-semibold">{stats.security.threats}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Requêtes bloquées</span>
                <span className="text-yellow-400 font-semibold">{stats.security.blocked}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Vulnérabilités</span>
                <span className="text-green-400 font-semibold">{stats.security.vulnerabilities}</span>
              </div>
              <div className="pt-2 border-t border-gray-600">
                <div className="flex items-center space-x-2">
                  <ClockIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400 text-sm">Dernier scan: {stats.security.lastScan}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Système */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-600">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Actions Système</h3>
              <CogIcon className="w-6 h-6 text-blue-400" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {systemActions.map((action) => (
                <button
                  key={action.name}
                  onClick={() => handleSystemAction(action.action, action.name)}
                  disabled={isPerformingAction}
                  className={`${action.color} text-white p-3 rounded-lg transition duration-200 flex flex-col items-center space-y-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.name}</span>
                </button>
              ))}
            </div>
            {isPerformingAction && (
              <div className="mt-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-400 text-sm mt-2">Action en cours...</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Activités récentes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-600"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Activités Récentes</h3>
            <BellIcon className="w-6 h-6 text-blue-400" />
          </div>
          <div className="space-y-3">
            {stats.recentActivities.map((activity) => {
              const StatusIcon = getStatusIcon(activity.status)
              return (
                <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                  <StatusIcon className={`w-5 h-5 ${getStatusColor(activity.status)}`} />
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{activity.action}</p>
                    <p className="text-gray-400 text-xs">{activity.user}</p>
                  </div>
                  <span className="text-gray-500 text-xs">{activity.time}</span>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
} 