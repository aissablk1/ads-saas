'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { EnvelopeIcon, ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Veuillez saisir votre adresse email')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:8000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        setEmailSent(true)
        toast.success('Email de récupération envoyé !')
      } else {
        toast.error(data.error || 'Erreur lors de l\'envoi de l\'email')
      }
    } catch (error) {
      toast.error('Erreur de connexion au serveur')
      console.error('Forgot password error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const resendEmail = () => {
    setEmailSent(false)
    handleSubmit({ preventDefault: () => {} } as React.FormEvent)
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
            {emailSent ? 'Email envoyé !' : 'Mot de passe oublié ?'}
          </h2>
          <p className="text-gray-600">
            {emailSent 
              ? 'Vérifiez votre boîte email pour réinitialiser votre mot de passe'
              : 'Saisissez votre email pour recevoir un lien de réinitialisation'
            }
          </p>
        </motion.div>

        {emailSent ? (
          /* Success State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-8 rounded-xl shadow-lg text-center"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Email envoyé avec succès
            </h3>
            
            <p className="text-gray-600 mb-6">
              Nous avons envoyé un lien de réinitialisation à <strong>{email}</strong>.
              Cliquez sur le lien dans l'email pour créer un nouveau mot de passe.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Vous ne voyez pas l'email ?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Vérifiez votre dossier spam/courrier indésirable</li>
                <li>• L'email peut prendre quelques minutes à arriver</li>
                <li>• Assurez-vous que l'adresse email est correcte</li>
              </ul>
            </div>

            <div className="space-y-4">
              <button
                onClick={resendEmail}
                disabled={isLoading}
                className="w-full btn-primary"
              >
                {isLoading ? 'Envoi...' : 'Renvoyer l\'email'}
              </button>
              
              <Link href="/login" className="block text-center text-primary-600 hover:text-primary-700 font-medium">
                Retour à la connexion
              </Link>
            </div>
          </motion.div>
        ) : (
          /* Form State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white p-8 rounded-xl shadow-lg"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="form-label">
                  Adresse email
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 form-input"
                    placeholder="votre@email.com"
                  />
                  <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>

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
                {isLoading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Ou</span>
                </div>
              </div>

              <div className="mt-6 text-center space-y-4">
                <Link href="/login" className="flex items-center justify-center text-primary-600 hover:text-primary-700 font-medium">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Retour à la connexion
                </Link>
                
                <p className="text-sm text-gray-600">
                  Vous n'avez pas de compte ?{' '}
                  <Link href="/register" className="font-medium text-primary-600 hover:text-primary-500">
                    Créer un compte
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <div className="bg-gray-100 rounded-lg p-4">
            <p className="text-xs text-gray-600">
              🔒 Pour votre sécurité, le lien de réinitialisation expirera dans 24 heures
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 