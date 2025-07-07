'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  HomeIcon,
  ChartBarIcon,
  MegaphoneIcon,
  PhotoIcon,
  LinkIcon,
  CurrencyDollarIcon,
  DocumentChartBarIcon,
  UsersIcon,
  UserIcon,
  CogIcon
} from '@heroicons/react/24/outline'

interface RouteTest {
  name: string
  path: string
  icon: any
  tested: boolean
  success: boolean | null
  error?: string
}

export default function DashboardTestPage() {
  const [testResults, setTestResults] = useState<RouteTest[]>([
    { name: 'Tableau de bord', path: '/dashboard', icon: HomeIcon, tested: false, success: null },
    { name: 'Campagnes', path: '/dashboard/campaigns', icon: MegaphoneIcon, tested: false, success: null },
    { name: 'Créer une campagne', path: '/dashboard/campaigns/create', icon: MegaphoneIcon, tested: false, success: null },
    { name: 'Analytics', path: '/dashboard/analytics', icon: ChartBarIcon, tested: false, success: null },
    { name: 'Médias', path: '/dashboard/media', icon: PhotoIcon, tested: false, success: null },
    { name: 'Intégrations', path: '/dashboard/integrations', icon: LinkIcon, tested: false, success: null },
    { name: 'Finances', path: '/dashboard/billing', icon: CurrencyDollarIcon, tested: false, success: null },
    { name: 'Rapports', path: '/dashboard/reports', icon: DocumentChartBarIcon, tested: false, success: null },
    { name: 'Équipe', path: '/dashboard/team', icon: UsersIcon, tested: false, success: null },
    { name: 'Profil', path: '/dashboard/profile', icon: UserIcon, tested: false, success: null },
    { name: 'Paramètres', path: '/dashboard/settings', icon: CogIcon, tested: false, success: null },
    { name: 'Onboarding', path: '/dashboard/onboarding', icon: HomeIcon, tested: false, success: null },
    { name: 'Sitemap', path: '/dashboard/sitemap', icon: DocumentChartBarIcon, tested: false, success: null },
  ])
  
  const [testing, setTesting] = useState(false)

  const testRoute = async (route: RouteTest, index: number) => {
    setTestResults(prev => prev.map((r, i) => 
      i === index ? { ...r, tested: false } : r
    ))

    try {
      const response = await fetch(route.path, { method: 'HEAD' })
      
      setTestResults(prev => prev.map((r, i) => 
        i === index ? { 
          ...r, 
          tested: true, 
          success: response.ok,
          error: response.ok ? undefined : `HTTP ${response.status}`
        } : r
      ))
    } catch (error) {
      setTestResults(prev => prev.map((r, i) => 
        i === index ? { 
          ...r, 
          tested: true, 
          success: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        } : r
      ))
    }
  }

  const testAllRoutes = async () => {
    setTesting(true)
    
    for (let i = 0; i < testResults.length; i++) {
      await testRoute(testResults[i], i)
      // Petit délai pour éviter de surcharger le serveur
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    setTesting(false)
  }

  const getStatusIcon = (route: RouteTest) => {
    if (!route.tested) {
      return <ExclamationTriangleIcon className="h-5 w-5 text-gray-400" />
    }
    if (route.success) {
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />
    }
    return <XCircleIcon className="h-5 w-5 text-red-500" />
  }

  const getStatusColor = (route: RouteTest) => {
    if (!route.tested) return 'bg-gray-100 text-gray-800'
    if (route.success) return 'bg-green-100 text-green-800'
    return 'bg-red-100 text-red-800'
  }

  const successCount = testResults.filter(r => r.tested && r.success).length
  const errorCount = testResults.filter(r => r.tested && !r.success).length
  const totalTested = testResults.filter(r => r.tested).length

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Test des Routes Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Vérification du bon fonctionnement de toutes les routes du dashboard</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-blue-500 rounded-md">
              <HomeIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Routes</div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{testResults.length}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-green-500 rounded-md">
              <CheckCircleIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Succès</div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{successCount}</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-red-500 rounded-md">
              <XCircleIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Erreurs</div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{errorCount}</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-yellow-500 rounded-md">
              <ArrowPathIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Testées</div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{totalTested}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mb-8">
        <button
          onClick={testAllRoutes}
          disabled={testing}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {testing ? (
            <>
              <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
              Test en cours...
            </>
          ) : (
            <>
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Tester toutes les routes
            </>
          )}
        </button>
      </div>

      {/* Results */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Résultats des tests</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Route
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Chemin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {testResults.map((route, index) => (
                <motion.tr
                  key={route.path}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <route.icon className="h-5 w-5 text-gray-400 mr-3" />
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {route.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                      {route.path}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(route)}
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(route)}`}>
                        {!route.tested ? 'Non testé' : route.success ? 'OK' : 'Erreur'}
                      </span>
                      {route.error && (
                        <span className="ml-2 text-xs text-red-600 dark:text-red-400">
                          {route.error}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => testRoute(route, index)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Tester
                      </button>
                      <Link
                        href={route.path}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                      >
                        Visiter
                      </Link>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Test API Translation */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Test API de Traduction</h3>
        <div className="space-y-4">
          <button
            onClick={async () => {
              try {
                const response = await fetch('/api/translate', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    text: 'Bonjour le monde',
                    sourceLang: 'fr',
                    targetLang: 'en'
                  })
                })
                const data = await response.json()
                alert(`Traduction: ${data.translatedText} (Engine: ${data.engine})`)
              } catch (error) {
                alert(`Erreur: ${error}`)
              }
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
          >
            Tester la traduction
          </button>
        </div>
      </div>
    </div>
  )
} 