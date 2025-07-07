'use client'

import React, { useState, useEffect } from 'react'
import {
  ServerIcon,
  CpuChipIcon,
  CircleStackIcon,
  GlobeAltIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  BoltIcon,
  WrenchScrewdriverIcon,
  ArrowPathIcon,
  PlayIcon,
  StopIcon,
  CogIcon,
  ChartBarIcon,
  FireIcon,
  CloudIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

interface SystemStatus {
  server: 'online' | 'offline' | 'maintenance'
  database: 'online' | 'offline' | 'slow'
  cache: 'online' | 'offline' | 'full'
  queue: 'online' | 'offline' | 'backlogged'
  uptime: string
  version: string
  environment: string
}

interface SystemMetrics {
  cpu: number
  memory: number
  disk: number
  network: number
  databaseConnections: number
  activeRequests: number
  errorRate: number
  responseTime: number
}

interface Service {
  name: string
  status: 'running' | 'stopped' | 'error'
  pid?: number
  memory: number
  cpu: number
  uptime: string
  port: number
}

export default function AdminSystem() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    server: 'online',
    database: 'online',
    cache: 'online',
    queue: 'online',
    uptime: '15 jours, 3 heures',
    version: '2.1.0',
    environment: 'production'
  })

  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0,
    databaseConnections: 0,
    activeRequests: 0,
    errorRate: 0,
    responseTime: 0
  })

  const [services, setServices] = useState<Service[]>([
    {
      name: 'ADS Backend API',
      status: 'running',
      pid: 12345,
      memory: 256,
      cpu: 15,
      uptime: '15 jours',
      port: 8000
    },
    {
      name: 'Database Server',
      status: 'running',
      pid: 12346,
      memory: 512,
      cpu: 8,
      uptime: '15 jours',
      port: 5432
    },
    {
      name: 'Redis Cache',
      status: 'running',
      pid: 12347,
      memory: 128,
      cpu: 2,
      uptime: '15 jours',
      port: 6379
    },
    {
      name: 'Queue Worker',
      status: 'running',
      pid: 12348,
      memory: 64,
      cpu: 5,
      uptime: '15 jours',
      port: 0
    }
  ])

  const [isLoading, setIsLoading] = useState(false)

  // Simulation des métriques en temps réel
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics({
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        disk: Math.random() * 100,
        network: Math.random() * 100,
        databaseConnections: Math.floor(Math.random() * 50) + 10,
        activeRequests: Math.floor(Math.random() * 100) + 20,
        errorRate: Math.random() * 5,
        responseTime: Math.random() * 500 + 50
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const handleRestartService = (serviceName: string) => {
    setIsLoading(true)
    toast.success(`Redémarrage de ${serviceName} en cours...`)
    
    setTimeout(() => {
      setServices(services.map(service => 
        service.name === serviceName 
          ? { ...service, status: 'running' as const }
          : service
      ))
      setIsLoading(false)
      toast.success(`${serviceName} redémarré avec succès`)
    }, 2000)
  }

  const handleStopService = (serviceName: string) => {
    if (confirm(`Êtes-vous sûr de vouloir arrêter ${serviceName} ?`)) {
      setServices(services.map(service => 
        service.name === serviceName 
          ? { ...service, status: 'stopped' as const }
          : service
      ))
      toast.success(`${serviceName} arrêté`)
    }
  }

  const handleRestartAll = () => {
    if (confirm('Êtes-vous sûr de vouloir redémarrer tous les services ?')) {
      setIsLoading(true)
      toast.success('Redémarrage de tous les services en cours...')
      
      setTimeout(() => {
        setServices(services.map(service => ({ ...service, status: 'running' as const })))
        setIsLoading(false)
        toast.success('Tous les services ont été redémarrés')
      }, 3000)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'running': return 'text-green-400'
      case 'offline':
      case 'stopped': return 'text-red-400'
      case 'maintenance':
      case 'error': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'online':
      case 'running': return 'bg-green-900/20'
      case 'offline':
      case 'stopped': return 'bg-red-900/20'
      case 'maintenance':
      case 'error': return 'bg-yellow-900/20'
      default: return 'bg-gray-900/20'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Monitoring Système</h1>
          <p className="text-gray-400">Contrôle total de l'infrastructure et des services</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleRestartAll}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <ArrowPathIcon className="h-5 w-5" />
            <span>Redémarrer Tout</span>
          </button>
          <div className="bg-gray-800 px-3 py-2 rounded-lg border border-gray-700">
            <span className="text-sm text-gray-400">Version: {systemStatus.version}</span>
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Serveur API</p>
              <p className={`text-2xl font-bold ${getStatusColor(systemStatus.server)}`}>
                {systemStatus.server.toUpperCase()}
              </p>
            </div>
            <div className={`p-3 rounded-full ${getStatusBg(systemStatus.server)}`}>
              <ServerIcon className="h-6 w-6 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Base de Données</p>
              <p className={`text-2xl font-bold ${getStatusColor(systemStatus.database)}`}>
                {systemStatus.database.toUpperCase()}
              </p>
            </div>
            <div className={`p-3 rounded-full ${getStatusBg(systemStatus.database)}`}>
              <CircleStackIcon className="h-6 w-6 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Cache Redis</p>
              <p className={`text-2xl font-bold ${getStatusColor(systemStatus.cache)}`}>
                {systemStatus.cache.toUpperCase()}
              </p>
            </div>
            <div className={`p-3 rounded-full ${getStatusBg(systemStatus.cache)}`}>
              <BoltIcon className="h-6 w-6 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">File d'Attente</p>
              <p className={`text-2xl font-bold ${getStatusColor(systemStatus.queue)}`}>
                {systemStatus.queue.toUpperCase()}
              </p>
            </div>
            <div className={`p-3 rounded-full ${getStatusBg(systemStatus.queue)}`}>
              <ClockIcon className="h-6 w-6 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Métriques système */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Métriques Système</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">CPU</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${metrics.cpu}%` }}
                  ></div>
                </div>
                <span className="text-white text-sm">{metrics.cpu.toFixed(1)}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Mémoire</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${metrics.memory}%` }}
                  ></div>
                </div>
                <span className="text-white text-sm">{metrics.memory.toFixed(1)}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Disque</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full" 
                    style={{ width: `${metrics.disk}%` }}
                  ></div>
                </div>
                <span className="text-white text-sm">{metrics.disk.toFixed(1)}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Réseau</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full" 
                    style={{ width: `${metrics.network}%` }}
                  ></div>
                </div>
                <span className="text-white text-sm">{metrics.network.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Métriques Application</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Connexions DB</span>
              <span className="text-white">{metrics.databaseConnections}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Requêtes Actives</span>
              <span className="text-white">{metrics.activeRequests}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Taux d'Erreur</span>
              <span className="text-white">{metrics.errorRate.toFixed(2)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Temps de Réponse</span>
              <span className="text-white">{metrics.responseTime.toFixed(0)}ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Uptime</span>
              <span className="text-white">{systemStatus.uptime}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Environnement</span>
              <span className="text-white">{systemStatus.environment}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Services Système</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  PID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Mémoire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  CPU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Port
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {services.map((service) => (
                <tr key={service.name} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <ServerIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-white">{service.name}</div>
                        <div className="text-sm text-gray-400">Uptime: {service.uptime}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(service.status)} ${getStatusBg(service.status)}`}>
                      {service.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {service.pid || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {service.memory} MB
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {service.cpu}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {service.port || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {service.status === 'running' ? (
                        <button
                          onClick={() => handleStopService(service.name)}
                          className="text-red-400 hover:text-red-300 p-1"
                          title="Arrêter"
                        >
                          <StopIcon className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRestartService(service.name)}
                          className="text-green-400 hover:text-green-300 p-1"
                          title="Démarrer"
                        >
                          <PlayIcon className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleRestartService(service.name)}
                        className="text-blue-400 hover:text-blue-300 p-1"
                        title="Redémarrer"
                      >
                        <ArrowPathIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 