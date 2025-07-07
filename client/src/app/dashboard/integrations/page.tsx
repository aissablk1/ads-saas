'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  LinkIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  PlusIcon,
  EyeIcon,
  EyeSlashIcon,
  CloudIcon,
  ChartBarIcon,
  EnvelopeIcon,
  UsersIcon,
  CogIcon
} from '@heroicons/react/24/outline'
import { integrationsAPI } from '../../../lib/api'
import { Integration, IntegrationPlatform } from '../../../types'
import { toast } from 'react-hot-toast'

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [platforms, setPlatforms] = useState<IntegrationPlatform[]>([])
  const [categories, setCategories] = useState<Record<string, any>>({})
  const [platformsByCategory, setPlatformsByCategory] = useState<Record<string, IntegrationPlatform[]>>({})
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<IntegrationPlatform | null>(null)
  const [credentials, setCredentials] = useState<Record<string, string>>({})
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
  const [connecting, setConnecting] = useState(false)
  const [testing, setTesting] = useState<string | null>(null)
  const [syncing, setSyncing] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [integrationsData, platformsData] = await Promise.all([
        integrationsAPI.getIntegrations(),
        integrationsAPI.getAvailablePlatforms()
      ])
      setIntegrations(integrationsData.integrations || integrationsData)
      setPlatforms(platformsData.platforms || platformsData)
      setCategories(platformsData.categories || {})
      setPlatformsByCategory(platformsData.platformsByCategory || {})
    } catch (error) {
      console.error('Erreur lors du chargement des intégrations:', error)
      toast.error('Erreur lors du chargement des intégrations')
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPlatform) return

    try {
      setConnecting(true)
      await integrationsAPI.connectIntegration(selectedPlatform.id, credentials)
      toast.success(`Integration ${selectedPlatform.name} connectée avec succès`)
      setShowConnectModal(false)
      setSelectedPlatform(null)
      setCredentials({})
      fetchData()
    } catch (error) {
      console.error('Erreur lors de la connexion:', error)
      toast.error('Erreur lors de la connexion à l\'intégration')
    } finally {
      setConnecting(false)
    }
  }

  const handleTestConnection = async (integrationId: string) => {
    try {
      setTesting(integrationId)
      const response = await integrationsAPI.testConnection(integrationId)
      
      if (response.success) {
        toast.success('Connexion testée avec succès')
      } else {
        toast.error('Échec du test de connexion')
      }
    } catch (error) {
      console.error('Erreur lors du test:', error)
      toast.error('Erreur lors du test de connexion')
    } finally {
      setTesting(null)
    }
  }

  const handleSync = async (integrationId: string) => {
    try {
      setSyncing(integrationId)
      await integrationsAPI.syncIntegration(integrationId)
      toast.success('Synchronisation lancée avec succès')
      fetchData()
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error)
      toast.error('Erreur lors de la synchronisation')
    } finally {
      setSyncing(null)
    }
  }

  const handleDisconnect = async (integrationId: string, platformName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir déconnecter ${platformName} ?`)) {
      return
    }

    try {
      await integrationsAPI.disconnectIntegration(integrationId)
      toast.success('Intégration déconnectée avec succès')
      fetchData()
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
      toast.error('Erreur lors de la déconnexion')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONNECTED': return 'bg-green-100 text-green-800'
      case 'ERROR': return 'bg-red-100 text-red-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONNECTED': return CheckCircleIcon
      case 'ERROR': return XCircleIcon
      case 'PENDING': return ExclamationTriangleIcon
      default: return XCircleIcon
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ADVERTISING': return ChartBarIcon
      case 'EMAIL': return EnvelopeIcon
      case 'CRM': return UsersIcon
      case 'COMMUNICATION': return CloudIcon
      case 'ANALYTICS': return ChartBarIcon
      default: return CogIcon
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ADVERTISING': return 'bg-blue-100 text-blue-800'
      case 'EMAIL': return 'bg-green-100 text-green-800'
      case 'CRM': return 'bg-purple-100 text-purple-800'
      case 'COMMUNICATION': return 'bg-yellow-100 text-yellow-800'
      case 'ANALYTICS': return 'bg-indigo-100 text-indigo-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const openConnectModal = (platform: IntegrationPlatform) => {
    setSelectedPlatform(platform)
    setCredentials({})
    setShowConnectModal(true)
  }

  const togglePasswordVisibility = (fieldName: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }))
  }

  const connectedPlatformIds = integrations.map(int => int.platform)
  const availablePlatforms = platforms.filter(p => !connectedPlatformIds.includes(p.id as any))
  
  const getFilteredPlatforms = () => {
    if (selectedCategory === 'all') {
      return availablePlatforms
    }
    return availablePlatforms.filter(p => p.category === selectedCategory)
  }

  const filteredPlatforms = getFilteredPlatforms()

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Intégrations</h1>
            <p className="text-gray-600">Connectez vos outils et plateformes tierces</p>
          </div>
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
              <div className="text-sm font-medium text-gray-500">Connectées</div>
              <div className="text-2xl font-semibold text-gray-900">
                {integrations.filter(i => i.status === 'CONNECTED').length}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-red-500 rounded-md">
              <XCircleIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5">
              <div className="text-sm font-medium text-gray-500">En erreur</div>
              <div className="text-2xl font-semibold text-gray-900">
                {integrations.filter(i => i.status === 'ERROR').length}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-blue-500 rounded-md">
              <LinkIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5">
              <div className="text-sm font-medium text-gray-500">Total</div>
              <div className="text-2xl font-semibold text-gray-900">{integrations.length}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-gray-500 rounded-md">
              <CloudIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5">
              <div className="text-sm font-medium text-gray-500">Disponibles</div>
              <div className="text-2xl font-semibold text-gray-900">{availablePlatforms.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Connected Integrations */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Intégrations connectées</h2>
        {integrations.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <LinkIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune intégration connectée</h3>
            <p className="text-gray-500">Connectez vos premiers outils pour commencer</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plateforme
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dernière sync
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {integrations.map((integration) => {
                    const platform = platforms.find(p => p.id === integration.platform)
                    const StatusIcon = getStatusIcon(integration.status)
                    
                    return (
                      <tr key={integration.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 p-2 bg-gray-100 rounded-lg">
                              {platform && (
                                <img
                                  src={platform.icon}
                                  alt={platform.name}
                                  className="h-8 w-8"
                                  onError={(e) => {
                                    const Icon = getCategoryIcon(platform.category)
                                    if (e.currentTarget instanceof HTMLElement) {
                                      e.currentTarget.style.display = 'none'
                                      const nextElement = e.currentTarget.nextElementSibling
                                      if (nextElement instanceof HTMLElement) {
                                        nextElement.style.display = 'block'
                                      }
                                    }
                                  }}
                                />
                              )}
                              <div className="h-8 w-8 hidden">
                                {platform && React.createElement(getCategoryIcon(platform.category), {
                                  className: "h-8 w-8 text-gray-400"
                                })}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {platform?.name || integration.platform}
                              </div>
                              <div className="text-sm text-gray-500">
                                {platform?.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <StatusIcon className="h-5 w-5 mr-2 text-gray-400" />
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(integration.status)}`}>
                              {integration.status === 'CONNECTED' ? 'Connectée' :
                               integration.status === 'ERROR' ? 'Erreur' :
                               integration.status === 'PENDING' ? 'En attente' : 'Déconnectée'}
                            </span>
                          </div>
                          {integration.errorMessage && (
                            <div className="text-xs text-red-600 mt-1">{integration.errorMessage}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {integration.lastSync
                            ? new Date(integration.lastSync).toLocaleDateString('fr-FR')
                            : 'Jamais'
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleTestConnection(integration.id)}
                              disabled={testing === integration.id}
                              className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                              title="Tester la connexion"
                            >
                              {testing === integration.id ? (
                                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircleIcon className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleSync(integration.id)}
                              disabled={syncing === integration.id}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50"
                              title="Synchroniser"
                            >
                              {syncing === integration.id ? (
                                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                              ) : (
                                <ArrowPathIcon className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDisconnect(integration.id, platform?.name || integration.platform)}
                              className="text-red-600 hover:text-red-900"
                              title="Déconnecter"
                            >
                              <XCircleIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Category Filters */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Plateformes disponibles</h2>
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Toutes ({availablePlatforms.length})
          </button>
          {Object.entries(categories).map(([key, category]) => {
            const count = availablePlatforms.filter(p => p.category === key).length
            if (count === 0) return null
            
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center space-x-2 ${
                  selectedCategory === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name} ({count})</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Available Platforms */}
      <div>
        {filteredPlatforms.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            {availablePlatforms.length === 0 ? (
              <>
                <CheckCircleIcon className="h-12 w-12 mx-auto text-green-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Toutes les intégrations sont connectées</h3>
                <p className="text-gray-500">Vous avez connecté toutes les plateformes disponibles</p>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">{categories[selectedCategory]?.icon || '🔍'}</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucune plateforme dans cette catégorie
                </h3>
                <p className="text-gray-500">
                  Toutes les plateformes {categories[selectedCategory]?.name.toLowerCase()} sont déjà connectées
                </p>
              </>
            )}
          </div>
        ) : (
          <>
            {selectedCategory !== 'all' && (
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{categories[selectedCategory]?.icon}</div>
                  <div>
                    <h3 className="font-semibold text-blue-900">{categories[selectedCategory]?.name}</h3>
                    <p className="text-sm text-blue-700">{categories[selectedCategory]?.description}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlatforms.map((platform, index) => {
                const CategoryIcon = getCategoryIcon(platform.category)
                
                return (
                  <motion.div
                    key={platform.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-blue-200 group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="flex-shrink-0 p-3 rounded-xl transition-all group-hover:scale-105"
                          style={{ backgroundColor: `${platform.color}15` }}
                        >
                          <img
                            src={platform.icon}
                            alt={platform.name}
                            className="h-8 w-8"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                              (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block';
                            }}
                          />
                          <div className="h-8 w-8 hidden">
                            <CategoryIcon className="h-8 w-8 text-gray-400" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{platform.name}</h3>
                          <span 
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${categories[platform.category]?.color || 'bg-gray-100 text-gray-800'}`}
                          >
                            {categories[platform.category]?.name || platform.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">{platform.description}</p>
                    
                    {platform.instructions && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-xs text-blue-800 leading-relaxed">{platform.instructions}</p>
                      </div>
                    )}
                    
                    <div className="pt-4 border-t border-gray-100">
                      <button
                        onClick={() => openConnectModal(platform)}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 group-hover:scale-105"
                      >
                        <PlusIcon className="h-4 w-4" />
                        <span>Connecter</span>
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Connect Modal */}
      {showConnectModal && selectedPlatform && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                Connecter {selectedPlatform.name}
              </h3>
              <button
                onClick={() => setShowConnectModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleConnect} className="space-y-6">
              {selectedPlatform.instructions && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">{selectedPlatform.instructions}</p>
                </div>
              )}

              {selectedPlatform.requiredFields.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <input
                      type={field.type === 'password' && !showPasswords[field.name] ? 'password' : field.type}
                      required={field.required}
                      value={credentials[field.name] || ''}
                      onChange={(e) => setCredentials(prev => ({
                        ...prev,
                        [field.name]: e.target.value
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                      placeholder={field.placeholder}
                    />
                    {field.type === 'password' && (
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility(field.name)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords[field.name] ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowConnectModal(false)}
                  className="btn-secondary"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={connecting}
                  className="btn-primary"
                >
                  {connecting ? 'Connexion...' : 'Connecter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 