'use client'

import React, { useState, useEffect } from 'react'
import {
  WrenchScrewdriverIcon,
  TrashIcon,
  ArrowPathIcon,
  CircleStackIcon,
  BoltIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CogIcon,
  DocumentTextIcon,
  CloudIcon,
  ServerIcon,
  ArchiveBoxIcon,
  KeyIcon,
  ShieldCheckIcon,
  FireIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

interface MaintenanceTask {
  id: string
  name: string
  description: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  startTime?: string
  endTime?: string
  logs: string[]
}

interface SystemInfo {
  version: string
  uptime: string
  lastBackup: string
  diskUsage: number
  memoryUsage: number
  databaseSize: string
  logFiles: number
  cacheSize: string
}

export default function AdminMaintenance() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({
    version: '2.1.0',
    uptime: '15 jours, 3 heures',
    lastBackup: '2024-01-14T23:00:00Z',
    diskUsage: 67,
    memoryUsage: 45,
    databaseSize: '2.3 GB',
    logFiles: 156,
    cacheSize: '512 MB'
  })

  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTask, setSelectedTask] = useState<string | null>(null)

  const maintenanceActions = [
    {
      id: 'clear-cache',
      name: 'Vider le Cache',
      description: 'Nettoyer tous les caches système',
      icon: BoltIcon,
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => handleMaintenanceTask('clear-cache', 'Nettoyage du cache système...')
    },
    {
      id: 'optimize-db',
      name: 'Optimiser Base de Données',
      description: 'Défragmenter et optimiser la base de données',
      icon: CircleStackIcon,
      color: 'bg-green-600 hover:bg-green-700',
      action: () => handleMaintenanceTask('optimize-db', 'Optimisation de la base de données...')
    },
    {
      id: 'clean-logs',
      name: 'Nettoyer les Logs',
      description: 'Archiver et nettoyer les anciens fichiers de logs',
      icon: DocumentTextIcon,
      color: 'bg-yellow-600 hover:bg-yellow-700',
      action: () => handleMaintenanceTask('clean-logs', 'Nettoyage des fichiers de logs...')
    },
    {
      id: 'backup-system',
      name: 'Sauvegarde Complète',
      description: 'Créer une sauvegarde complète du système',
      icon: ArchiveBoxIcon,
      color: 'bg-purple-600 hover:bg-purple-700',
      action: () => handleMaintenanceTask('backup-system', 'Création de la sauvegarde...')
    },
    {
      id: 'update-system',
      name: 'Mettre à Jour Système',
      description: 'Vérifier et installer les mises à jour',
      icon: CloudIcon,
      color: 'bg-indigo-600 hover:bg-indigo-700',
      action: () => handleMaintenanceTask('update-system', 'Vérification des mises à jour...')
    },
    {
      id: 'security-scan',
      name: 'Scan de Sécurité',
      description: 'Analyser la sécurité du système',
      icon: ShieldCheckIcon,
      color: 'bg-red-600 hover:bg-red-700',
      action: () => handleMaintenanceTask('security-scan', 'Scan de sécurité en cours...')
    }
  ]

  const handleMaintenanceTask = (taskId: string, description: string) => {
    const task: MaintenanceTask = {
      id: Date.now().toString(),
      name: maintenanceActions.find(a => a.id === taskId)?.name || taskId,
      description,
      status: 'running',
      progress: 0,
      startTime: new Date().toISOString(),
      logs: [`Démarrage de la tâche: ${description}`]
    }

    setMaintenanceTasks(prev => [task, ...prev])
    setSelectedTask(task.id)

    // Simulation de progression
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 20
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        
        setMaintenanceTasks(prev => prev.map(t => 
          t.id === task.id 
            ? { 
                ...t, 
                status: 'completed', 
                progress: 100, 
                endTime: new Date().toISOString(),
                logs: [...t.logs, 'Tâche terminée avec succès']
              }
            : t
        ))
        
        toast.success(`${task.name} terminé avec succès`)
      } else {
        setMaintenanceTasks(prev => prev.map(t => 
          t.id === task.id 
            ? { 
                ...t, 
                progress,
                logs: [...t.logs, `Progression: ${progress.toFixed(1)}%`]
              }
            : t
        ))
      }
    }, 1000)
  }

  const handleEmergencyMode = () => {
    if (confirm('Êtes-vous sûr de vouloir activer le mode maintenance d\'urgence ? Cela limitera l\'accès au système.')) {
      toast.error('Mode maintenance d\'urgence activé')
      // Ici on appellerait l'API pour activer le mode maintenance
    }
  }

  const handleClearAllTasks = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer toutes les tâches terminées ?')) {
      setMaintenanceTasks(prev => prev.filter(task => task.status === 'running'))
      toast.success('Tâches terminées supprimées')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-blue-400'
      case 'completed': return 'text-green-400'
      case 'failed': return 'text-red-400'
      case 'pending': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-900/20'
      case 'completed': return 'bg-green-900/20'
      case 'failed': return 'bg-red-900/20'
      case 'pending': return 'bg-yellow-900/20'
      default: return 'bg-gray-900/20'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Maintenance & Outils Système</h1>
          <p className="text-gray-400">Outils avancés de maintenance et d'administration</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleEmergencyMode}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <ExclamationTriangleIcon className="h-5 w-5" />
            <span>Mode Urgence</span>
          </button>
          <button
            onClick={handleClearAllTasks}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <TrashIcon className="h-5 w-5" />
            <span>Nettoyer Tâches</span>
          </button>
        </div>
      </div>

      {/* Informations système */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center">
            <ServerIcon className="h-8 w-8 text-blue-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Version Système</p>
              <p className="text-2xl font-bold text-white">{systemInfo.version}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-green-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Uptime</p>
              <p className="text-2xl font-bold text-white">{systemInfo.uptime}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center">
            <CircleStackIcon className="h-8 w-8 text-purple-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Taille DB</p>
              <p className="text-2xl font-bold text-white">{systemInfo.databaseSize}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center">
            <DocumentTextIcon className="h-8 w-8 text-yellow-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Fichiers Logs</p>
              <p className="text-2xl font-bold text-white">{systemInfo.logFiles}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions de maintenance */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Actions de Maintenance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {maintenanceActions.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              disabled={isLoading}
              className={`${action.color} text-white p-6 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center space-y-3`}
            >
              <action.icon className="h-8 w-8" />
              <div className="text-center">
                <p className="font-medium text-lg">{action.name}</p>
                <p className="text-sm opacity-90">{action.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tâches de maintenance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Tâches Récentes</h3>
          </div>
          <div className="overflow-y-auto max-h-96">
            {maintenanceTasks.length === 0 ? (
              <div className="p-6 text-center">
                <CogIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400">Aucune tâche de maintenance</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {maintenanceTasks.map((task) => (
                  <div key={task.id} className="p-4 hover:bg-gray-700/50 cursor-pointer" onClick={() => setSelectedTask(task.id)}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">{task.name}</h4>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)} ${getStatusBg(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{task.description}</p>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{task.progress.toFixed(1)}%</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Logs de Tâche</h3>
          </div>
          <div className="p-4">
            {selectedTask ? (
              <div className="space-y-2">
                {maintenanceTasks.find(t => t.id === selectedTask)?.logs.map((log, index) => (
                  <div key={index} className="text-sm text-gray-300 font-mono bg-gray-700 px-3 py-2 rounded">
                    {log}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400">Sélectionnez une tâche pour voir les logs</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Métriques système détaillées */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Métriques Système</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Utilisation Disque</span>
                <span className="text-white">{systemInfo.diskUsage}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${systemInfo.diskUsage > 80 ? 'bg-red-500' : systemInfo.diskUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${systemInfo.diskUsage}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Utilisation Mémoire</span>
                <span className="text-white">{systemInfo.memoryUsage}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${systemInfo.memoryUsage > 80 ? 'bg-red-500' : systemInfo.memoryUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${systemInfo.memoryUsage}%` }}
                ></div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Dernière Sauvegarde</span>
              <span className="text-white">{new Date(systemInfo.lastBackup).toLocaleString('fr-FR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Taille Cache</span>
              <span className="text-white">{systemInfo.cacheSize}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Tâches Actives</span>
              <span className="text-white">{maintenanceTasks.filter(t => t.status === 'running').length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 