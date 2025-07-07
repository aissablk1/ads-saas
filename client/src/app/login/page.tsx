'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { EyeIcon, EyeSlashIcon, UserIcon, ShieldCheckIcon, KeyIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import { checkRateLimit, validateForm, sanitizeFormData, initSessionTimeout } from '../../lib/security'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    twoFactorCode: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [requires2FA, setRequires2FA] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Rate limiting check
    if (!checkRateLimit(`login_${formData.email}`, 5)) {
      return
    }

    // Form validation
    const validationRules = {
      email: {
        required: true,
        type: 'email',
        label: 'Email'
      },
      password: {
        required: true,
        minLength: 6,
        label: 'Mot de passe'
      },
      ...(requires2FA && {
        twoFactorCode: {
          required: true,
          minLength: 6,
          maxLength: 6,
          label: 'Code 2FA'
        }
      })
    }

    const validation = validateForm(formData, validationRules)
    
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0]
      toast.error(firstError)
      return
    }

    setIsLoading(true)

    try {
      // Sanitize form data
      const sanitizedData = sanitizeFormData(formData)
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sanitizedData)
      })

      const data = await response.json()

      if (response.ok) {
        if (data.requires2FA && !requires2FA) {
          // L'utilisateur a la 2FA activée, montrer le champ de code
          setRequires2FA(true)
          toast.success('Veuillez entrer votre code d\'authentification à deux facteurs')
        } else {
          // Connexion réussie
          localStorage.setItem('accessToken', data.accessToken)
          localStorage.setItem('refreshToken', data.refreshToken)
          localStorage.setItem('user', JSON.stringify(data.user))
          
          // Initialize session timeout
          initSessionTimeout(30 * 60 * 1000) // 30 minutes
          
          toast.success('Connexion réussie !')
          router.push('/dashboard')
        }
      } else {
        toast.error(data.error || 'Erreur de connexion')
        // Si erreur de 2FA, rester sur l'étape 2FA
        if (data.error?.includes('2FA') && requires2FA) {
          setFormData(prev => ({ ...prev, twoFactorCode: '' }))
        }
      }
    } catch (error) {
      toast.error('Erreur de connexion au serveur')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      twoFactorCode: ''
    })
    setRequires2FA(false)
  }

  const fillDemoCredentials = (type: 'admin' | 'demo') => {
    if (type === 'admin') {
      setFormData({
        email: 'admin@ads-saas.com',
        password: 'admin123',
        twoFactorCode: ''
      })
      toast.success('Credentials Admin remplis automatiquement')
    } else {
      setFormData({
        email: 'demo@ads-saas.com',
        password: 'demo123',
        twoFactorCode: ''
      })
      toast.success('Credentials Utilisateur Démo remplis automatiquement')
    }
  }

  const handleDemoLogin = async (type: 'admin' | 'demo') => {
    // Remplir les credentials
    fillDemoCredentials(type)
    
    // Attendre un court instant pour que les champs se remplissent
    setTimeout(async () => {
      const credentials = type === 'admin' 
        ? { email: 'admin@ads-saas.com', password: 'admin123' }
        : { email: 'demo@ads-saas.com', password: 'demo123' }
      
      setIsLoading(true)
      
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials)
        })

        const data = await response.json()

        if (response.ok) {
          if (data.requires2FA) {
            setRequires2FA(true)
            toast.success('Ce compte a la 2FA activée. Veuillez entrer votre code d\'authentification.')
          } else {
            localStorage.setItem('accessToken', data.accessToken)
            localStorage.setItem('refreshToken', data.refreshToken)
            localStorage.setItem('user', JSON.stringify(data.user))
            
            initSessionTimeout(30 * 60 * 1000)
            
            toast.success(`Connexion ${type === 'admin' ? 'Admin' : 'Démo'} réussie !`)
            router.push('/dashboard')
          }
        } else {
          toast.error(data.error || 'Erreur de connexion')
        }
      } catch (error) {
        toast.error('Erreur de connexion au serveur')
      } finally {
        setIsLoading(false)
      }
    }, 100)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-primary-600 mb-2">ADS SaaS</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {requires2FA ? 'Authentification à deux facteurs' : 'Connexion à votre compte'}
          </h2>
          <p className="text-gray-600">
            {requires2FA 
              ? 'Entrez le code généré par votre application d\'authentification'
              : 'Accédez à votre tableau de bord publicitaire'
            }
          </p>
        </motion.div>

        {/* Comptes de démo - cachés si 2FA requis */}
        {!requires2FA && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6"
          >
            <p className="text-sm text-blue-800 mb-4 font-semibold text-center">
              🚀 Testez la plateforme instantanément
            </p>
            
            <div className="space-y-3">
              {/* Bouton Admin */}
              <button
                onClick={() => handleDemoLogin('admin')}
                disabled={isLoading}
                className="w-full flex items-center justify-between bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md"
              >
                <div className="flex items-center space-x-3">
                  <ShieldCheckIcon className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">Compte Administrateur</div>
                    <div className="text-xs text-red-100">Accès complet • Gestion utilisateurs</div>
                  </div>
                </div>
                <div className="text-xs bg-red-500 px-2 py-1 rounded">
                  ADMIN
                </div>
              </button>

              {/* Bouton Utilisateur Démo */}
              <button
                onClick={() => handleDemoLogin('demo')}
                disabled={isLoading}
                className="w-full flex items-center justify-between bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md"
              >
                <div className="flex items-center space-x-3">
                  <UserIcon className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">Utilisateur Démo</div>
                    <div className="text-xs text-green-100">Campagnes • Analytics • Rapports</div>
                  </div>
                </div>
                <div className="text-xs bg-green-500 px-2 py-1 rounded">
                  DÉMO
                </div>
              </button>
            </div>

            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
              <p className="text-xs text-blue-700 text-center">
                💡 Les comptes de démonstration incluent des données de test pré-configurées
              </p>
            </div>
          </motion.div>
        )}

        {/* Formulaire */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white p-8 rounded-xl shadow-lg"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email - caché si 2FA requis */}
            {!requires2FA && (
              <div>
                <label htmlFor="email" className="form-label">
                  Adresse email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="votre@email.com"
                />
              </div>
            )}

            {/* Mot de passe - caché si 2FA requis */}
            {!requires2FA && (
              <div>
                <label htmlFor="password" className="form-label">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Code 2FA - affiché si requis */}
            {requires2FA && (
              <div className="space-y-4">
                <div className="text-center bg-blue-50 p-4 rounded-lg">
                  <KeyIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-blue-800 font-medium">
                    Authentification requise pour : {formData.email}
                  </p>
                </div>
                
                <div>
                  <label htmlFor="twoFactorCode" className="form-label">
                    Code d'authentification (6 chiffres)
                  </label>
                                     <input
                     id="twoFactorCode"
                     name="twoFactorCode"
                     type="text"
                     inputMode="numeric"
                     pattern="[0-9]*"
                     autoComplete="one-time-code"
                     required
                     value={formData.twoFactorCode}
                     onChange={handleChange}
                     className="form-input text-center text-2xl tracking-widest font-mono text-gray-900 placeholder-gray-400 bg-white"
                     placeholder="000000"
                     maxLength={6}
                   />
                  <p className="mt-2 text-xs text-gray-600 text-center">
                    Entrez le code généré par votre application d'authentification
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full text-sm text-gray-600 hover:text-gray-900 underline"
                >
                  ← Retour à la connexion
                </button>
              </div>
            )}

            {/* Options - cachées si 2FA requis */}
            {!requires2FA && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Se souvenir de moi
                  </label>
                </div>

                <div className="text-sm">
                  <Link href="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                    Mot de passe oublié ?
                  </Link>
                </div>
              </div>
            )}

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary relative"
            >
              {isLoading && (
                <div className="absolute left-4">
                  <div className="spinner"></div>
                </div>
              )}
              {isLoading ? 'Connexion...' : requires2FA ? 'Vérifier le code' : 'Se connecter'}
            </button>
          </form>

          {/* Mot de passe oublié - caché si 2FA requis */}
          {!requires2FA && (
            <div className="text-center mt-4">
              <Link href="/forgot-password" className="text-sm text-primary-600 hover:text-primary-500">
                Mot de passe oublié ?
              </Link>
            </div>
          )}

          {/* Lien vers l'inscription - caché si 2FA requis */}
          {!requires2FA && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Vous n'avez pas de compte ?{' '}
                <Link href="/register" className="font-medium text-primary-600 hover:text-primary-500">
                  Créer un compte
                </Link>
              </p>
            </div>
          )}
        </motion.div>

        {/* Retour à l'accueil */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
            ← Retour à l'accueil
          </Link>
        </motion.div>
      </div>
    </div>
  )
} 