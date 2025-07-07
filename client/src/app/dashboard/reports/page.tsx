'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  DocumentChartBarIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { reportsAPI, campaignsAPI } from '../../../lib/api'
import { Report, Campaign } from '../../../types'
import { toast } from 'react-hot-toast'

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [generating, setGenerating] = useState<string | null>(null)
  const [newReport, setNewReport] = useState({
    name: '',
    type: 'CAMPAIGN_PERFORMANCE',
    filters: {
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      },
      campaigns: [] as string[],
      metrics: ['impressions', 'clicks', 'conversions', 'cost', 'revenue'],
      groupBy: 'day' as 'day' | 'week' | 'month'
    },
    schedule: {
      frequency: 'WEEKLY' as 'DAILY' | 'WEEKLY' | 'MONTHLY',
      enabled: false
    }
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [reportsData, campaignsData] = await Promise.all([
        reportsAPI.getReports().catch(() => ({ data: [] })), // Graceful fallback
        campaignsAPI.getCampaigns({ limit: 100 }).catch(() => ({ data: [] }))
      ])
      
      // S'assurer que reports est toujours un tableau
      const reportsArray = Array.isArray(reportsData) ? reportsData : 
                          (reportsData?.reports && Array.isArray(reportsData.reports)) ? reportsData.reports :
                          (reportsData?.data && Array.isArray(reportsData.data)) ? reportsData.data : []
      
      const campaignsArray = Array.isArray(campaignsData) ? campaignsData :
                            (campaignsData?.campaigns && Array.isArray(campaignsData.campaigns)) ? campaignsData.campaigns :
                            (campaignsData?.data && Array.isArray(campaignsData.data)) ? campaignsData.data : []
      
      setReports(reportsArray)
      setCampaigns(campaignsArray)
    } catch (error) {
      console.error('Erreur lors du chargement des rapports:', error)
      toast.error('Erreur lors du chargement des rapports')
      // En cas d'erreur, s'assurer que les états restent des tableaux
      setReports([])
      setCampaigns([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await reportsAPI.createReport({
        name: newReport.name,
        type: newReport.type,
        filters: newReport.filters,
        schedule: newReport.schedule.enabled ? newReport.schedule.frequency : undefined
      })
      toast.success('Rapport créé avec succès')
      setShowCreateModal(false)
      setNewReport({
        name: '',
        type: 'CAMPAIGN_PERFORMANCE',
        filters: {
          dateRange: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            end: new Date().toISOString().split('T')[0]
          },
          campaigns: [],
          metrics: ['impressions', 'clicks', 'conversions', 'cost', 'revenue'],
          groupBy: 'day'
        },
        schedule: {
          frequency: 'WEEKLY',
          enabled: false
        }
      })
      fetchData()
    } catch (error) {
      console.error('Erreur lors de la création du rapport:', error)
      toast.error('Erreur lors de la création du rapport')
    }
  }

  const handleGenerateReport = async (reportId: string) => {
    try {
      setGenerating(reportId)
      await reportsAPI.generateReport(reportId)
      toast.success('Génération du rapport lancée')
      fetchData()
    } catch (error) {
      console.error('Erreur lors de la génération:', error)
      toast.error('Erreur lors de la génération du rapport')
    } finally {
      setGenerating(null)
    }
  }

  const handleDownloadReport = async (reportId: string, format: string) => {
    try {
      const blob = await reportsAPI.downloadReport(reportId, format)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `rapport_${reportId}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Téléchargement du rapport lancé')
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error)
      toast.error('Erreur lors du téléchargement du rapport')
    }
  }

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) {
      return
    }

    try {
      await reportsAPI.deleteReport(reportId)
      toast.success('Rapport supprimé avec succès')
      fetchData()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      toast.error('Erreur lors de la suppression du rapport')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'GENERATING': return 'bg-yellow-100 text-yellow-800'
      case 'FAILED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return CheckCircleIcon
      case 'GENERATING': return ClockIcon
      case 'FAILED': return XCircleIcon
      default: return ClockIcon
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'CAMPAIGN_PERFORMANCE': return 'Performance des campagnes'
      case 'AUDIENCE_INSIGHTS': return 'Insights audience'
      case 'BUDGET_ANALYSIS': return 'Analyse budgétaire'
      case 'COMPETITIVE_ANALYSIS': return 'Analyse concurrentielle'
      case 'CUSTOM': return 'Personnalisé'
      default: return type
    }
  }

  const formatFileSize = (size?: number) => {
    if (!size) return 'N/A'
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Rapports</h1>
            <p className="text-gray-600">Générez et planifiez vos rapports d'analyse</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Nouveau rapport</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-green-500 rounded-md">
              <CheckCircleIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5">
              <div className="text-sm font-medium text-gray-500">Terminés</div>
              <div className="text-2xl font-semibold text-gray-900">
                {reports.filter(r => r.status === 'COMPLETED').length}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-yellow-500 rounded-md">
              <ClockIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5">
              <div className="text-sm font-medium text-gray-500">En cours</div>
              <div className="text-2xl font-semibold text-gray-900">
                {reports.filter(r => r.status === 'GENERATING').length}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-purple-500 rounded-md">
              <CalendarIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5">
              <div className="text-sm font-medium text-gray-500">Planifiés</div>
              <div className="text-2xl font-semibold text-gray-900">
                {reports.filter(r => r.schedule?.enabled).length}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-blue-500 rounded-md">
              <DocumentChartBarIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5">
              <div className="text-sm font-medium text-gray-500">Total</div>
              <div className="text-2xl font-semibold text-gray-900">{reports.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Mes rapports</h3>
        </div>
        
        {reports.length === 0 ? (
          <div className="p-6 text-center">
            <DocumentChartBarIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun rapport</h3>
            <p className="text-gray-500 mb-6">Créez votre premier rapport pour commencer</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Créer un rapport
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rapport
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Taille
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Créé le
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report) => {
                  const StatusIcon = getStatusIcon(report.status)
                  
                  return (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg">
                            <DocumentChartBarIcon className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{report.name}</div>
                            {report.schedule?.enabled && (
                              <div className="text-sm text-gray-500">
                                Planifié ({report.schedule.frequency.toLowerCase()})
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getTypeLabel(report.type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <StatusIcon className="h-5 w-5 mr-2 text-gray-400" />
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                            {report.status === 'COMPLETED' ? 'Terminé' :
                             report.status === 'GENERATING' ? 'En cours' : 'Échec'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatFileSize(report.fileSize)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(report.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {report.status === 'COMPLETED' && report.fileUrl && (
                            <>
                              <button
                                onClick={() => handleDownloadReport(report.id, 'pdf')}
                                className="text-blue-600 hover:text-blue-900"
                                title="Télécharger PDF"
                              >
                                <ArrowDownTrayIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDownloadReport(report.id, 'xlsx')}
                                className="text-green-600 hover:text-green-900"
                                title="Télécharger Excel"
                              >
                                <ArrowDownTrayIcon className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleGenerateReport(report.id)}
                            disabled={generating === report.id}
                            className="text-purple-600 hover:text-purple-900 disabled:opacity-50"
                            title="Régénérer"
                          >
                            {generating === report.id ? (
                              <ArrowPathIcon className="h-4 w-4 animate-spin" />
                            ) : (
                              <ArrowPathIcon className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteReport(report.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Supprimer"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Report Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-full overflow-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Créer un nouveau rapport</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Nom du rapport *</label>
                  <input
                    type="text"
                    required
                    value={newReport.name}
                    onChange={(e) => setNewReport(prev => ({ ...prev, name: e.target.value }))}
                    className="form-input"
                    placeholder="Nom de votre rapport"
                  />
                </div>
                <div>
                  <label className="form-label">Type de rapport *</label>
                  <select
                    value={newReport.type}
                    onChange={(e) => setNewReport(prev => ({ ...prev, type: e.target.value as any }))}
                    className="form-select"
                  >
                    <option value="CAMPAIGN_PERFORMANCE">Performance des campagnes</option>
                    <option value="AUDIENCE_INSIGHTS">Insights audience</option>
                    <option value="BUDGET_ANALYSIS">Analyse budgétaire</option>
                    <option value="COMPETITIVE_ANALYSIS">Analyse concurrentielle</option>
                    <option value="CUSTOM">Personnalisé</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Date de début</label>
                  <input
                    type="date"
                    value={newReport.filters.dateRange.start}
                    onChange={(e) => setNewReport(prev => ({
                      ...prev,
                      filters: {
                        ...prev.filters,
                        dateRange: { ...prev.filters.dateRange, start: e.target.value }
                      }
                    }))}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Date de fin</label>
                  <input
                    type="date"
                    value={newReport.filters.dateRange.end}
                    onChange={(e) => setNewReport(prev => ({
                      ...prev,
                      filters: {
                        ...prev.filters,
                        dateRange: { ...prev.filters.dateRange, end: e.target.value }
                      }
                    }))}
                    className="form-input"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Campagnes à inclure</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-40 overflow-y-auto p-3 border border-gray-300 rounded-md">
                  {campaigns.map((campaign) => (
                    <label key={campaign.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newReport.filters.campaigns.includes(campaign.id)}
                        onChange={(e) => {
                          const campaigns = e.target.checked
                            ? [...newReport.filters.campaigns, campaign.id]
                            : newReport.filters.campaigns.filter(id => id !== campaign.id)
                          setNewReport(prev => ({
                            ...prev,
                            filters: { ...prev.filters, campaigns }
                          }))
                        }}
                        className="form-checkbox"
                      />
                      <span className="text-sm">{campaign.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="form-label">Groupement des données</label>
                <select
                  value={newReport.filters.groupBy}
                  onChange={(e) => setNewReport(prev => ({
                    ...prev,
                    filters: { ...prev.filters, groupBy: e.target.value as any }
                  }))}
                  className="form-select"
                >
                  <option value="day">Par jour</option>
                  <option value="week">Par semaine</option>
                  <option value="month">Par mois</option>
                </select>
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <input
                    type="checkbox"
                    checked={newReport.schedule.enabled}
                    onChange={(e) => setNewReport(prev => ({
                      ...prev,
                      schedule: { ...prev.schedule, enabled: e.target.checked }
                    }))}
                    className="form-checkbox"
                  />
                  <label className="form-label mb-0">Planifier ce rapport</label>
                </div>
                {newReport.schedule.enabled && (
                  <select
                    value={newReport.schedule.frequency}
                    onChange={(e) => setNewReport(prev => ({
                      ...prev,
                      schedule: { ...prev.schedule, frequency: e.target.value as any }
                    }))}
                    className="form-select"
                  >
                    <option value="DAILY">Quotidien</option>
                    <option value="WEEKLY">Hebdomadaire</option>
                    <option value="MONTHLY">Mensuel</option>
                  </select>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Créer le rapport
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 
