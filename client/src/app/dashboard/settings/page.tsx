'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BellIcon,
  ShieldCheckIcon,
  KeyIcon,
  GlobeAltIcon,
  MoonIcon,
  SunIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  QrCodeIcon,
  ClipboardDocumentIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { notificationsAPI, usersAPI } from '../../../lib/api'
import { NotificationSettings, TwoFactorAuth } from '../../../types'
import { useTheme } from '../../../lib/theme-context'
import { toast } from 'react-hot-toast'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: {
      campaign_status: true,
      budget_alerts: true,
      performance_alerts: true,
      team_invitations: true,
      payment_issues: true,
      reports: true
    },
    push: {
      campaign_status: false,
      budget_alerts: true,
      performance_alerts: true,
      team_invitations: true,
      payment_issues: true,
      reports: false
    }
  })
  
  const [preferences, setPreferences] = useState({
    language: 'fr',
    timezone: 'Europe/Paris',
    currency: 'EUR'
  })

  const [twoFA, setTwoFA] = useState<TwoFactorAuth>({
    enabled: false
  })

  const [showDeleteAccount, setShowDeleteAccount] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [show2FASetup, setShow2FASetup] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      
      // Récupérer les paramètres de notification
      const notificationSettings = await notificationsAPI.getSettings()
      const settings = notificationSettings.settings || notificationSettings
      
      // Statut 2FA temporaire (non implémenté)
      let twoFAStatus = { enabled: false }
      
      // Mettre à jour le statut 2FA
      setTwoFA({
        enabled: twoFAStatus.enabled || false
      })
      
      // Paramètres par défaut pour garantir la cohérence
      const defaultEmailSettings = {
        campaign_status: true,
        budget_alerts: true,
        performance_alerts: true,
        team_invitations: true,
        payment_issues: true,
        reports: true
      }

      const defaultPushSettings = {
        campaign_status: false,
        budget_alerts: true,
        performance_alerts: true,
        team_invitations: true,
        payment_issues: true,
        reports: false
      }
      
      // S'assurer que la structure est correcte et complète
      const validatedSettings = {
        email: {
          ...defaultEmailSettings,
          ...(settings?.email || {})
        },
        push: {
          ...defaultPushSettings,
          ...(settings?.push || {})
        }
      }
      
      setNotifications(validatedSettings)
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error)
      toast.error('Erreur lors du chargement des paramètres')
      
      // En cas d'erreur, utiliser les paramètres par défaut
      setNotifications({
        email: {
          campaign_status: true,
          budget_alerts: true,
          performance_alerts: true,
          team_invitations: true,
          payment_issues: true,
          reports: true
        },
        push: {
          campaign_status: false,
          budget_alerts: true,
          performance_alerts: true,
          team_invitations: true,
          payment_issues: true,
          reports: false
        }
      })
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationChange = async (category: 'email' | 'push', key: string, value: boolean) => {
    try {
      // S'assurer que les objets email et push sont complets avec toutes les propriétés requises
      const defaultEmailSettings = {
        campaign_status: true,
        budget_alerts: true,
        performance_alerts: true,
        team_invitations: true,
        payment_issues: true,
        reports: true
      }

      const defaultPushSettings = {
        campaign_status: false,
        budget_alerts: true,
        performance_alerts: true,
        team_invitations: true,
        payment_issues: true,
        reports: false
      }

      const newSettings = {
        email: {
          ...(notifications.email || defaultEmailSettings),
          ...(category === 'email' ? { [key]: value } : {})
        },
        push: {
          ...(notifications.push || defaultPushSettings),
          ...(category === 'push' ? { [key]: value } : {})
        }
      }
      
      // Optimistic update
      setNotifications(newSettings)
      
      console.log('Envoi des paramètres:', JSON.stringify(newSettings, null, 2))
      
      await notificationsAPI.updateSettings(newSettings)
      toast.success('Préférences de notification mises à jour')
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error)
      
      // Afficher les détails de l'erreur si disponibles
      if (error.response?.data?.details) {
        if (Array.isArray(error.response.data.details)) {
          // Afficher les erreurs de validation
          const errorMessages = error.response.data.details.map((err: any) => 
            `${err.field}: ${err.message}`
          ).join(', ')
          toast.error(`Erreur de validation: ${errorMessages}`)
        } else {
          toast.error(`Erreur: ${error.response.data.details}`)
        }
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error)
      } else {
        toast.error('Erreur lors de la mise à jour des notifications')
      }
      
      // Revert changes
      fetchSettings()
    }
  }

  const handlePreferenceChange = (key: string, value: string) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
    toast.success('Préférences mises à jour')
  }

  const handleEnable2FA = async () => {
    try {
      setSaving(true)
      // 2FA non implémenté - simulation
      toast.error('Fonctionnalité 2FA en cours de développement')
    } catch (error) {
      console.error('Erreur lors de l\'activation 2FA:', error)
      toast.error('Erreur lors de l\'activation de l\'authentification 2FA')
    } finally {
      setSaving(false)
    }
  }

  const handleVerify2FA = async (token: string) => {
    try {
      setSaving(true)
      // 2FA non implémenté - simulation
      toast.error('Fonctionnalité 2FA en cours de développement')
    } catch (error) {
      console.error('Erreur lors de la vérification:', error)
      toast.error('Code de vérification incorrect')
    } finally {
      setSaving(false)
    }
  }

  const handleDisable2FA = async () => {
    if (!confirm('Êtes-vous sûr de vouloir désactiver l\'authentification 2FA ?')) {
      return
    }

    try {
      setSaving(true)
      // 2FA non implémenté - simulation
      toast.error('Fonctionnalité 2FA en cours de développement')
    } catch (error) {
      console.error('Erreur lors de la désactivation:', error)
      toast.error('Erreur lors de la désactivation de l\'authentification 2FA')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'SUPPRIMER') {
      toast.error('Veuillez taper "SUPPRIMER" pour confirmer')
      return
    }
    
    try {
      const password = prompt('Veuillez entrer votre mot de passe pour confirmer la suppression :')
      if (!password) return

      await usersAPI.deleteAccount(password)
      toast.success('Demande de suppression envoyée')
      // Redirection vers la page de login
      window.location.href = '/login'
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      toast.error('Erreur lors de la suppression du compte')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copié dans le presse-papiers')
  }

  const getNotificationLabel = (key: string) => {
    const labels: Record<string, string> = {
      campaign_status: 'Changements de statut des campagnes',
      budget_alerts: 'Alertes de budget',
      performance_alerts: 'Alertes de performance',
      team_invitations: 'Invitations d\'équipe',
      payment_issues: 'Problèmes de paiement',
      reports: 'Rapports prêts'
    }
    return labels[key] || key
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="bg-gray-200 h-32 rounded-lg mb-6"></div>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-48 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-600">Gérez vos préférences et paramètres de compte</p>
      </div>

      <div className="space-y-8">
        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <BellIcon className="h-6 w-6 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Notifications par email</h4>
                <div className="space-y-3">
                  {notifications.email && Object.entries(notifications.email).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{getNotificationLabel(key)}</div>
                      </div>
                      <button
                        onClick={() => handleNotificationChange('email', key, !value)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          value ? 'bg-primary-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            value ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Notifications push</h4>
                <div className="space-y-3">
                  {notifications.push && Object.entries(notifications.push).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{getNotificationLabel(key)}</div>
                      </div>
                      <button
                        onClick={() => handleNotificationChange('push', key, !value)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          value ? 'bg-primary-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            value ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Préférences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <GlobeAltIcon className="h-6 w-6 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900">Préférences</h3>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Langue</label>
                <select
                  value={preferences.language}
                  onChange={(e) => handlePreferenceChange('language', e.target.value)}
                  className="form-select"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                </select>
              </div>

              <div>
                <label className="form-label">Fuseau horaire</label>
                <select
                  value={preferences.timezone}
                  onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                  className="form-select"
                >
                  <option value="Europe/Paris">Europe/Paris</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="America/New_York">America/New_York</option>
                </select>
              </div>

                                            <div>
                <label className="form-label">Thème</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
                  className="form-select"
                >
                  <option value="system">🔄 Automatique (Système)</option>
                  <option value="light">☀️ Clair</option>
                  <option value="dark">🌙 Sombre</option>
                </select>
              </div>

              <div>
                <label className="form-label">Devise</label>
                <select
                  value={preferences.currency}
                  onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                  className="form-select"
                >
                  <option value="EUR">Euro (€)</option>
                  <option value="USD">Dollar ($)</option>
                  <option value="GBP">Livre (£)</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sécurité */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <ShieldCheckIcon className="h-6 w-6 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900">Sécurité</h3>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {/* Alerte 2FA ultra recommandée */}
            {!twoFA.enabled && (
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-400 p-4 rounded-md">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-sm font-bold text-red-800">
                        🔒 SÉCURITÉ PRIORITAIRE
                      </h4>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                        ULTRA RECOMMANDÉ
                      </span>
                    </div>
                    <p className="text-sm text-red-700 mb-3">
                      <strong>Votre compte n'est pas suffisamment protégé.</strong> L'authentification à deux facteurs (2FA) 
                      est essentielle pour sécuriser vos données publicitaires et empêcher les accès non autorisés.
                    </p>
                    <div className="bg-red-100 rounded-md p-3 mb-3">
                      <h5 className="text-xs font-medium text-red-800 mb-2">Pourquoi activer la 2FA ?</h5>
                      <ul className="text-xs text-red-700 space-y-1">
                        <li>• Protection contre le piratage de compte</li>
                        <li>• Sécurisation de vos budgets publicitaires</li>
                        <li>• Conformité aux standards de sécurité</li>
                        <li>• Tranquillité d'esprit totale</li>
                      </ul>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleEnable2FA}
                        disabled={saving}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors shadow-lg"
                      >
                        <ShieldCheckIcon className="h-4 w-4 mr-2" />
                        {saving ? 'Configuration...' : 'Activer maintenant'}
                      </button>
                      <div className="text-xs text-red-600">
                        ⚡ Configuration en 2 minutes
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <KeyIcon className="h-6 w-6 text-gray-400" />
                <div>
                  <div className="font-medium text-gray-900">Mot de passe</div>
                  <div className="text-sm text-gray-500">Dernière modification il y a 30 jours</div>
                </div>
              </div>
              <button className="btn-secondary">
                Modifier
              </button>
            </div>

            <div className={`flex items-center justify-between p-4 border rounded-lg ${
              twoFA.enabled 
                ? 'border-green-200 bg-green-50' 
                : 'border-red-200 bg-red-50'
            }`}>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <ShieldCheckIcon className={`h-6 w-6 ${twoFA.enabled ? 'text-green-500' : 'text-red-500'}`} />
                  {!twoFA.enabled && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                  )}
                </div>
                <div>
                  <div className={`font-medium ${twoFA.enabled ? 'text-green-900' : 'text-red-900'}`}>
                    Authentification à deux facteurs
                  </div>
                  <div className={`text-sm ${twoFA.enabled ? 'text-green-700' : 'text-red-700'}`}>
                    {twoFA.enabled ? 'Votre compte est sécurisé ✓' : 'Votre compte est vulnérable ⚠️'}
                  </div>
                  {!twoFA.enabled && (
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-800 animate-pulse">
                        ACTION REQUISE
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {twoFA.enabled ? (
                <div className="flex flex-col items-end">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 mb-2">
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                    Sécurisé
                  </span>
                  <button 
                    onClick={handleDisable2FA}
                    disabled={saving}
                    className="btn-danger text-sm"
                  >
                    {saving ? 'Désactivation...' : 'Désactiver'}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-end">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-800 mb-2">
                    <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                    Vulnérable
                  </span>
                  <button 
                    onClick={handleEnable2FA}
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors shadow-lg"
                  >
                    <ShieldCheckIcon className="h-4 w-4 mr-1" />
                    {saving ? 'Configuration...' : 'Configurer'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Zone de danger */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow border-l-4 border-red-500"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
              <h3 className="text-lg font-medium text-gray-900">Zone de danger</h3>
            </div>
          </div>
          <div className="p-6">
            {!showDeleteAccount ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Supprimer le compte</div>
                  <div className="text-sm text-gray-500">
                    Cette action est irréversible. Toutes vos données seront perdues.
                  </div>
                </div>
                <button
                  onClick={() => setShowDeleteAccount(true)}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center space-x-2"
                >
                  <TrashIcon className="h-4 w-4" />
                  <span>Supprimer le compte</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <h4 className="text-red-800 font-medium mb-2">⚠️ Attention</h4>
                  <p className="text-red-700 text-sm">
                    Cette action supprimera définitivement votre compte et toutes les données associées.
                    Cette action ne peut pas être annulée.
                  </p>
                </div>
                <div>
                  <label className="form-label">
                    Tapez "SUPPRIMER" pour confirmer
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    className="form-input"
                    placeholder="SUPPRIMER"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmation !== 'SUPPRIMER'}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirmer la suppression
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteAccount(false)
                      setDeleteConfirmation('')
                    }}
                    className="btn-secondary"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* 2FA Setup Modal */}
      {show2FASetup && twoFA.qrCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4">
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <ShieldCheckIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                🔒 Sécurisez votre compte
              </h3>
              <p className="text-gray-600 text-sm">
                Configurez l'authentification à deux facteurs pour une protection maximale
              </p>
              <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                Recommandé par les experts en sécurité
              </div>
            </div>

            <div className="mb-6">
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">📱 Étape 1 : Installez une application</h4>
                <p className="text-xs text-blue-800">
                  Téléchargez Google Authenticator, Authy ou Microsoft Authenticator sur votre téléphone.
                </p>
              </div>
              
              <div className="text-center mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">📷 Étape 2 : Scannez le QR code</h4>
                <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-300 inline-block shadow-inner">
                  <img src={twoFA.qrCode} alt="QR Code 2FA" className="w-48 h-48" />
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Utilisez votre application d'authentification pour scanner ce code
                </p>
              </div>
            </div>

            {twoFA.secret && (
              <div className="mb-6">
                <label className="form-label">Clé secrète (si vous ne pouvez pas scanner)</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={twoFA.secret}
                    readOnly
                    className="form-input text-sm font-mono"
                  />
                  <button
                    onClick={() => copyToClipboard(twoFA.secret!)}
                    className="btn-secondary p-2"
                    title="Copier"
                  >
                    <ClipboardDocumentIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const token = formData.get('token') as string
              handleVerify2FA(token)
            }}>
              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-medium text-green-900 mb-3">🔢 Étape 3 : Entrez le code de vérification</h4>
                <input
                  type="text"
                  name="token"
                  required
                  className="w-full px-4 py-3 text-center text-2xl tracking-widest font-mono border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
                  placeholder="000000"
                  maxLength={6}
                />
                <p className="text-xs text-green-700 mt-2 text-center">
                  Saisissez le code à 6 chiffres généré par votre application
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShow2FASetup(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Vérification...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-4 w-4 mr-2 inline" />
                      Sécuriser mon compte
                    </>
                  )}
                </button>
              </div>
            </form>

            {twoFA.backupCodes && twoFA.backupCodes.length > 0 && (
              <div className="mt-6 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <KeyIcon className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="ml-3 flex-1">
                    <h4 className="text-amber-800 font-bold mb-2">💾 Codes de sauvegarde importants</h4>
                    <p className="text-amber-700 text-sm mb-4">
                      <strong>IMPORTANT :</strong> Sauvegardez ces codes dans un endroit sûr. 
                      Ils vous permettront d'accéder à votre compte si vous perdez votre téléphone.
                    </p>
                    <div className="bg-white rounded-lg p-3 border border-amber-200">
                      <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                        {twoFA.backupCodes.map((code, index) => (
                          <div key={index} className="bg-gray-50 p-2 rounded text-center border">
                            {code}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-amber-700 bg-amber-100 rounded p-2">
                      <strong>💡 Conseil :</strong> Imprimez ces codes ou sauvegardez-les dans un gestionnaire de mots de passe sécurisé.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 