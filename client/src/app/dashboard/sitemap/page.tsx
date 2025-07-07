'use client'

import React, { useState, useEffect } from 'react'
import { 
  ClockIcon, 
  GlobeAltIcon, 
  DocumentTextIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface SitemapUrl {
  url: string
  lastModified: string
  changeFrequency: string
  priority: number
}

interface SitemapStatus {
  lastGenerated: string
  totalUrls: number
  staticUrls: number
  dynamicUrls: number
  status: 'active' | 'generating' | 'error'
  nextUpdate: string
}

export default function SitemapPage() {
  const [status, setStatus] = useState<SitemapStatus | null>(null)
  const [urls, setUrls] = useState<SitemapUrl[]>([])
  const [loading, setLoading] = useState(true)
  const [regenerating, setRegenerating] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    fetchSitemapData()
  }, [])

  const fetchSitemapData = async () => {
    try {
      setLoading(true)
      
      // Récupérer le statut et les URLs en parallèle
      const [statusResponse, urlsResponse] = await Promise.all([
        fetch('/api/sitemap/status'),
        fetch('/api/sitemap/urls')
      ])

      if (statusResponse.ok) {
        const statusData = await statusResponse.json()
        setStatus(statusData)
      } else {
        throw new Error('Erreur lors de la récupération du statut')
      }

      if (urlsResponse.ok) {
        const urlsData = await urlsResponse.json()
        setUrls(urlsData.urls)
      } else {
        throw new Error('Erreur lors de la récupération des URLs')
      }
    } catch (error) {
      console.error('Erreur:', error)
      setMessage({ type: 'error', text: 'Erreur lors de la récupération des données du sitemap' })
    } finally {
      setLoading(false)
    }
  }

  const regenerateSitemap = async () => {
    try {
      setRegenerating(true)
      
      const response = await fetch('/api/sitemap/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        setMessage({ type: 'success', text: 'Sitemap régénéré avec succès!' })
        
        // Rafraîchir les données après une courte pause
        setTimeout(() => {
          fetchSitemapData()
        }, 2000)
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Erreur lors de la régénération')
      }
    } catch (error) {
      console.error('Erreur:', error)
      setMessage({ type: 'error', text: `Erreur: ${error.message}` })
    } finally {
      setRegenerating(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'generating': return 'text-yellow-600 bg-yellow-100'
      case 'error': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: number) => {
    if (priority >= 0.8) return 'text-green-600 bg-green-100'
    if (priority >= 0.5) return 'text-yellow-600 bg-yellow-100'
    return 'text-gray-600 bg-gray-100'
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gestion du Sitemap
        </h1>
        <p className="text-gray-600">
          Gérez et surveillez le sitemap automatique de votre site
        </p>
      </div>

      {/* Message de feedback */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircleIcon className="h-5 w-5" />
          ) : (
            <ExclamationTriangleIcon className="h-5 w-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Statut du sitemap */}
      {status && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Statut du Sitemap</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status.status)}`}>
              {status.status === 'active' ? 'Actif' : 
               status.status === 'generating' ? 'Génération...' : 'Erreur'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total URLs</p>
                <p className="text-2xl font-bold text-gray-900">{status.totalUrls}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <GlobeAltIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">URLs Statiques</p>
                <p className="text-2xl font-bold text-gray-900">{status.staticUrls}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ArrowPathIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">URLs Dynamiques</p>
                <p className="text-2xl font-bold text-gray-900">{status.dynamicUrls}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Dernière génération</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(status.lastGenerated)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Prochaine mise à jour: {formatDate(status.nextUpdate)}
            </p>
            
            <button
              onClick={regenerateSitemap}
              disabled={regenerating}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowPathIcon className={`h-4 w-4 mr-2 ${regenerating ? 'animate-spin' : ''}`} />
              {regenerating ? 'Régénération...' : 'Régénérer'}
            </button>
          </div>
        </div>
      )}

      {/* Liste des URLs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            URLs du Sitemap ({urls.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priorité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fréquence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière modification
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {urls.map((url, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <a 
                      href={url.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {url.url}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(url.priority)}`}>
                      {url.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {url.changeFrequency}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(url.lastModified)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {urls.length === 0 && (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune URL trouvée</h3>
            <p className="mt-1 text-sm text-gray-500">
              Le sitemap ne contient aucune URL actuellement.
            </p>
          </div>
        )}
      </div>

      {/* Informations sur le sitemap */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <DocumentTextIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              À propos du sitemap automatique
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Le sitemap est accessible à l'adresse: <code>/sitemap.xml</code></li>
                <li>Les robots peuvent le trouver via: <code>/robots.txt</code></li>
                <li>Les URLs sont automatiquement mises à jour toutes les 24h</li>
                <li>Les pages privées (dashboard, API) sont exclues automatiquement</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 