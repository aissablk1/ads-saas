'use client'

import React, { useState, useEffect } from 'react'
import {
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  EyeIcon,
  ShieldCheckIcon,
  UserIcon,
  ServerIcon,
  CogIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import { getAuditLogs, exportAuditLogs, AUDIT_ACTIONS } from '@/lib/admin-audit'

interface AuditLog {
  id: string
  userId: string
  sessionId: string
  action: string
  details: any
  ipAddress?: string
  userAgent?: string
  timestamp: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [severityFilter, setSeverityFilter] = useState<string>('')
  const [actionFilter, setActionFilter] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalLogs, setTotalLogs] = useState(0)
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const logsPerPage = 50

  useEffect(() => {
    loadLogs()
  }, [currentPage, severityFilter, actionFilter])

  const loadLogs = async () => {
    try {
      setIsLoading(true)
      const params: any = {
        limit: logsPerPage,
        offset: (currentPage - 1) * logsPerPage
      }
      
      if (severityFilter) params.severity = severityFilter
      if (actionFilter) params.action = actionFilter

      const response = await getAuditLogs(params)
      setLogs(response.logs)
      setTotalLogs(response.total)
    } catch (error) {
      toast.error('Erreur lors du chargement des logs')
      console.error('Erreur chargement logs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      await exportAuditLogs(format)
      toast.success(`Export ${format.toUpperCase()} réussi`)
    } catch (error) {
      toast.error('Erreur lors de l\'export')
    }
  }

  const handleClearLogs = async () => {
    if (!confirm('Êtes-vous sûr de vouloir effacer tous les logs d\'audit ?')) {
      return
    }

    try {
      // En production, appeler une API pour effacer les logs
      toast.success('Logs effacés')
      loadLogs()
    } catch (error) {
      toast.error('Erreur lors de l\'effacement')
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getActionIcon = (action: string) => {
    if (action.includes('login') || action.includes('logout')) return UserIcon
    if (action.includes('system')) return ServerIcon
    if (action.includes('security')) return ShieldCheckIcon
    if (action.includes('config') || action.includes('settings')) return CogIcon
    if (action.includes('analytics')) return ChartBarIcon
    return DocumentTextIcon
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const filteredLogs = logs.filter(log =>
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(totalLogs / logsPerPage)

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Journal d'Audit</h1>
              <p className="text-gray-400">
                Historique complet des actions administrateur
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => handleExport('json')}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                Export JSON
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                Export CSV
              </button>
              <button
                onClick={handleClearLogs}
                className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                <TrashIcon className="h-5 w-5 mr-2" />
                Effacer
              </button>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Recherche */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filtre sévérité */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toutes les sévérités</option>
              <option value="critical">Critique</option>
              <option value="high">Élevée</option>
              <option value="medium">Moyenne</option>
              <option value="low">Faible</option>
            </select>

            {/* Filtre action */}
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toutes les actions</option>
              <option value="login">Connexions</option>
              <option value="user">Gestion utilisateurs</option>
              <option value="system">Actions système</option>
              <option value="security">Sécurité</option>
              <option value="config">Configuration</option>
            </select>

            {/* Bouton rafraîchir */}
            <button
              onClick={loadLogs}
              className="flex items-center justify-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <ArrowDownTrayIcon className="h-5 w-5 rotate-180" />
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-gray-400 text-sm">Total Logs</p>
                <p className="text-2xl font-bold">{totalLogs}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="text-gray-400 text-sm">Critiques</p>
                <p className="text-2xl font-bold">
                  {logs.filter(log => log.severity === 'critical').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center">
              <ShieldCheckIcon className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-gray-400 text-sm">Sécurité</p>
                <p className="text-2xl font-bold">
                  {logs.filter(log => log.action.includes('security')).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center">
              <UserIcon className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <p className="text-gray-400 text-sm">Connexions</p>
                <p className="text-2xl font-bold">
                  {logs.filter(log => log.action.includes('login')).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Table des logs */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Sévérité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    IP
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-400">
                      Aucun log trouvé
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => {
                    const ActionIcon = getActionIcon(log.action)
                    return (
                      <tr key={log.id} className="hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <ActionIcon className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                              <p className="text-sm font-medium text-white">
                                {log.action.replace('admin.', '').replace('.', ' ')}
                              </p>
                              <p className="text-xs text-gray-400">
                                {log.sessionId.slice(0, 8)}...
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(log.severity)}`}>
                            {log.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {log.userId.slice(0, 8)}...
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {formatTimestamp(log.timestamp)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {log.ipAddress || 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => {
                              setSelectedLog(log)
                              setShowDetails(true)
                            }}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-400">
              Page {currentPage} sur {totalPages} ({totalLogs} logs)
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 rounded-lg transition-colors"
              >
                Précédent
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 rounded-lg transition-colors"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal détails */}
      {showDetails && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Détails du Log</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Action</label>
                  <p className="text-white">{selectedLog.action}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Sévérité</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(selectedLog.severity)}`}>
                    {selectedLog.severity}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Timestamp</label>
                  <p className="text-white">{formatTimestamp(selectedLog.timestamp)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Utilisateur ID</label>
                  <p className="text-white font-mono">{selectedLog.userId}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Session ID</label>
                  <p className="text-white font-mono">{selectedLog.sessionId}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">IP Address</label>
                  <p className="text-white">{selectedLog.ipAddress || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">User Agent</label>
                  <p className="text-white text-sm">{selectedLog.userAgent || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Détails</label>
                  <pre className="bg-gray-900 p-3 rounded-lg text-sm text-white overflow-x-auto">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 