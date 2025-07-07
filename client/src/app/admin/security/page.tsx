'use client'

import React, { useState, useEffect } from 'react'
import {
  ShieldCheckIcon,
  KeyIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  CogIcon,
  DocumentTextIcon,
  FireIcon,
  GlobeAltIcon,
  ServerIcon,
  WrenchScrewdriverIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

interface SecuritySettings {
  twoFactorRequired: boolean
  passwordMinLength: number
  passwordComplexity: boolean
  sessionTimeout: number
  maxLoginAttempts: number
  ipWhitelist: string[]
  maintenanceMode: boolean
  apiRateLimit: number
  sslEnabled: boolean
  backupEncryption: boolean
}

interface SecurityEvent {
  id: string
  type: 'login' | 'logout' | 'failed_login' | 'password_change' | 'admin_action' | 'security_alert'
  user: string
  ip: string
  timestamp: string
  details: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

interface ActiveSession {
  id: string
  user: string
  ip: string
  userAgent: string
  lastActivity: string
  expiresAt: string
}

export default function AdminSecurity() {
  const [settings, setSettings] = useState<SecuritySettings>({
    twoFactorRequired: true,
    passwordMinLength: 12,
    passwordComplexity: true,
    sessionTimeout: 3600,
    maxLoginAttempts: 5,
    ipWhitelist: ['192.168.1.1', '10.0.0.1'],
    maintenanceMode: false,
    apiRateLimit: 1000,
    sslEnabled: true,
    backupEncryption: true
  })

  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([
    {
      id: '1',
      type: 'failed_login',
      user: 'john.doe@example.com',
      ip: '192.168.1.100',
      timestamp: '2024-01-15T10:30:00Z',
      details: 'Tentative de connexion échouée - mot de passe incorrect',
      severity: 'medium'
    },
    {
      id: '2',
      type: 'admin_action',
      user: 'admin@ads-saas.com',
      ip: '192.168.1.1',
      timestamp: '2024-01-15T09:15:00Z',
      details: 'Modification des paramètres de sécurité',
      severity: 'high'
    },
    {
      id: '3',
      type: 'security_alert',
      user: 'system',
      ip: '0.0.0.0',
      timestamp: '2024-01-15T08:45:00Z',
      details: 'Détection d\'activité suspecte - multiple tentatives de connexion',
      severity: 'critical'
    }
  ])

  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([
    {
      id: 'session1',
      user: 'admin@ads-saas.com',
      ip: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      lastActivity: '2024-01-15T10:30:00Z',
      expiresAt: '2024-01-15T11:30:00Z'
    },
    {
      id: 'session2',
      user: 'john.doe@example.com',
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      lastActivity: '2024-01-15T10:25:00Z',
      expiresAt: '2024-01-15T11:25:00Z'
    }
  ])

  const handleToggleSetting = (key: keyof SecuritySettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
    toast.success(`Paramètre ${key} mis à jour`)
  }

  const handleUpdateSetting = (key: keyof SecuritySettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
    toast.success(`Paramètre ${key} mis à jour`)
  }

  const handleTerminateSession = (sessionId: string) => {
    if (confirm('Êtes-vous sûr de vouloir terminer cette session ?')) {
      setActiveSessions(prev => prev.filter(session => session.id !== sessionId))
      toast.success('Session terminée')
    }
  }

  const handleTerminateAllSessions = () => {
    if (confirm('Êtes-vous sûr de vouloir terminer toutes les sessions actives ?')) {
      setActiveSessions([])
      toast.success('Toutes les sessions ont été terminées')
    }
  }

  const handleAddIpToWhitelist = () => {
    const ip = prompt('Entrez l\'adresse IP à ajouter à la liste blanche:')
    if (ip && ip.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/)) {
      setSettings(prev => ({
        ...prev,
        ipWhitelist: [...prev.ipWhitelist, ip]
      }))
      toast.success(`IP ${ip} ajoutée à la liste blanche`)
    } else if (ip) {
      toast.error('Adresse IP invalide')
    }
  }

  const handleRemoveIpFromWhitelist = (ip: string) => {
    setSettings(prev => ({
      ...prev,
      ipWhitelist: prev.ipWhitelist.filter(ipAddr => ipAddr !== ip)
    }))
    toast.success(`IP ${ip} retirée de la liste blanche`)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-900/20'
      case 'high': return 'text-orange-400 bg-orange-900/20'
      case 'medium': return 'text-yellow-400 bg-yellow-900/20'
      case 'low': return 'text-green-400 bg-green-900/20'
      default: return 'text-gray-400 bg-gray-900/20'
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'failed_login': return <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
      case 'admin_action': return <CogIcon className="h-5 w-5 text-blue-400" />
      case 'security_alert': return <FireIcon className="h-5 w-5 text-orange-400" />
      case 'login': return <CheckCircleIcon className="h-5 w-5 text-green-400" />
      case 'logout': return <UserIcon className="h-5 w-5 text-gray-400" />
      default: return <DocumentTextIcon className="h-5 w-5 text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Sécurité & Contrôle d'Accès</h1>
          <p className="text-gray-400">Configuration avancée de la sécurité et monitoring des accès</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => handleToggleSetting('maintenanceMode')}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
              settings.maintenanceMode 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-gray-600 hover:bg-gray-700 text-white'
            }`}
          >
            <WrenchScrewdriverIcon className="h-5 w-5" />
            <span>Mode Maintenance</span>
          </button>
          <button
            onClick={handleTerminateAllSessions}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <FireIcon className="h-5 w-5" />
            <span>Terminer Toutes les Sessions</span>
          </button>
        </div>
      </div>

      {/* Paramètres de sécurité */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Paramètres d'Authentification</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">2FA Obligatoire</p>
                <p className="text-sm text-gray-400">Exiger l'authentification à deux facteurs</p>
              </div>
              <button
                onClick={() => handleToggleSetting('twoFactorRequired')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.twoFactorRequired ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.twoFactorRequired ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Complexité des Mots de Passe</p>
                <p className="text-sm text-gray-400">Exiger des mots de passe complexes</p>
              </div>
              <button
                onClick={() => handleToggleSetting('passwordComplexity')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.passwordComplexity ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.passwordComplexity ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div>
              <label className="text-white font-medium">Longueur Min. Mot de Passe</label>
              <input
                type="number"
                value={settings.passwordMinLength}
                onChange={(e) => handleUpdateSetting('passwordMinLength', parseInt(e.target.value))}
                className="mt-1 w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="8"
                max="32"
              />
            </div>

            <div>
              <label className="text-white font-medium">Timeout de Session (secondes)</label>
              <input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleUpdateSetting('sessionTimeout', parseInt(e.target.value))}
                className="mt-1 w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="300"
                max="86400"
              />
            </div>

            <div>
              <label className="text-white font-medium">Tentatives de Connexion Max</label>
              <input
                type="number"
                value={settings.maxLoginAttempts}
                onChange={(e) => handleUpdateSetting('maxLoginAttempts', parseInt(e.target.value))}
                className="mt-1 w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="3"
                max="10"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Paramètres Système</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">SSL/TLS Activé</p>
                <p className="text-sm text-gray-400">Chiffrement des communications</p>
              </div>
              <button
                onClick={() => handleToggleSetting('sslEnabled')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.sslEnabled ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.sslEnabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Chiffrement des Sauvegardes</p>
                <p className="text-sm text-gray-400">Chiffrer les sauvegardes de données</p>
              </div>
              <button
                onClick={() => handleToggleSetting('backupEncryption')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.backupEncryption ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.backupEncryption ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div>
              <label className="text-white font-medium">Limite de Taux API (req/min)</label>
              <input
                type="number"
                value={settings.apiRateLimit}
                onChange={(e) => handleUpdateSetting('apiRateLimit', parseInt(e.target.value))}
                className="mt-1 w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="100"
                max="10000"
              />
            </div>

            <div>
              <label className="text-white font-medium">Liste Blanche IP</label>
              <div className="mt-2 space-y-2">
                {settings.ipWhitelist.map((ip, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-700 px-3 py-2 rounded">
                    <span className="text-white">{ip}</span>
                    <button
                      onClick={() => handleRemoveIpFromWhitelist(ip)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <ExclamationTriangleIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={handleAddIpToWhitelist}
                  className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                >
                  + Ajouter IP
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sessions actives */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Sessions Actives</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  IP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Dernière Activité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Expire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {activeSessions.map((session) => (
                <tr key={session.id} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{session.user}</div>
                    <div className="text-sm text-gray-400">{session.userAgent}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {session.ip}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {new Date(session.lastActivity).toLocaleString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {new Date(session.expiresAt).toLocaleString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleTerminateSession(session.id)}
                      className="text-red-400 hover:text-red-300 p-1"
                      title="Terminer la session"
                    >
                      <FireIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Événements de sécurité */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Événements de Sécurité</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  IP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Détails
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Sévérité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {securityEvents.map((event) => (
                <tr key={event.id} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getEventIcon(event.type)}
                      <span className="ml-2 text-sm font-medium text-white capitalize">
                        {event.type.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {event.user}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {event.ip}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {event.details}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(event.severity)}`}>
                      {event.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {new Date(event.timestamp).toLocaleString('fr-FR')}
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