'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  EnvelopeIcon,
  ClockIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

function VerifyEmailContent() {
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading')
  const [isResending, setIsResending] = useState(false)
  const [email, setEmail] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const emailParam = searchParams.get('email')

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam)
    }

    if (!token) {
      setVerificationStatus('error')
      return
    }

    // Vérifier l'email avec le token
    const verifyEmail = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token })
        })

        const data = await response.json()

        if (response.ok) {
          setVerificationStatus('success')
          toast.success('Email vérifié avec succès !')
          
          // Rediriger vers le dashboard après 3 secondes
          setTimeout(() => {
            router.push('/dashboard')
          }, 3000)
        } else {
          if (data.error?.includes('expired')) {
            setVerificationStatus('expired')
          } else {
            setVerificationStatus('error')
          }
          toast.error(data.error || 'Erreur lors de la vérification')
        }
      } catch (error) {
        setVerificationStatus('error')
        toast.error('Erreur de connexion au serveur')
      }
    }

    verifyEmail()
  }, [token, emailParam, router])

  const handleResendVerification = async () => {
    if (!email) {
      toast.error('Adresse email manquante')
      return
    }

    setIsResending(true)

    try {
      const response = await fetch('http://localhost:8000/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Email de vérification renvoyé !')
      } else {
        toast.error(data.error || 'Erreur lors de l\'envoi')
      }
    } catch (error) {
      toast.error('Erreur de connexion au serveur')
    } finally {
      setIsResending(false)
    }
  }

  // Loading state
  if (verificationStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full mx-4"
        >
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ArrowPathIcon className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Vérification en cours...</h2>
          <p className="text-gray-600">
            Nous vérifions votre adresse email. Veuillez patienter.
          </p>
        </motion.div>
      </div>
    )
  }

  // Success state
  if (verificationStatus === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full mx-4"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Email vérifié !</h2>
          <p className="text-gray-600 mb-6">
            Votre adresse email a été vérifiée avec succès. 
            Vous allez être redirigé vers votre tableau de bord...
          </p>

          <div className="space-y-4">
            <Link href="/dashboard" className="btn-primary w-full block text-center">
              Accéder au tableau de bord
            </Link>
            
            <div className="flex items-center justify-center space-x-1">
              <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // Expired state
  if (verificationStatus === 'expired') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full mx-4"
        >
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ClockIcon className="h-8 w-8 text-orange-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Lien expiré</h2>
          <p className="text-gray-600 mb-6">
            Ce lien de vérification a expiré. Nous pouvons vous envoyer un nouveau lien de vérification.
          </p>

          {email && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">
                Renvoyer le lien à : <strong>{email}</strong>
              </p>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleResendVerification}
              disabled={isResending || !email}
              className="w-full btn-primary relative"
            >
              {isResending && (
                <div className="absolute left-4">
                  <div className="spinner"></div>
                </div>
              )}
              {isResending ? 'Envoi...' : 'Renvoyer le lien de vérification'}
            </button>
            
            <Link href="/login" className="block text-center text-primary-600 hover:text-primary-700 font-medium">
              Retour à la connexion
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  // Error state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full mx-4"
      >
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircleIcon className="h-8 w-8 text-red-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Erreur de vérification</h2>
        <p className="text-gray-600 mb-6">
          Ce lien de vérification est invalide ou a déjà été utilisé.
        </p>

        <div className="space-y-4">
          {email && (
            <button
              onClick={handleResendVerification}
              disabled={isResending}
              className="w-full btn-primary relative"
            >
              {isResending && (
                <div className="absolute left-4">
                  <div className="spinner"></div>
                </div>
              )}
              {isResending ? 'Envoi...' : 'Demander un nouveau lien'}
            </button>
          )}
          
          <Link href="/register" className="block text-center btn-secondary">
            Créer un nouveau compte
          </Link>
          
          <Link href="/login" className="block text-center text-primary-600 hover:text-primary-700 font-medium">
            Déjà un compte ? Se connecter
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}

// Composant pour afficher la page sans token (accès direct)
function VerifyEmailInfo() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full mx-4"
      >
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <EnvelopeIcon className="h-8 w-8 text-blue-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Vérifiez votre email</h2>
        <p className="text-gray-600 mb-6">
          Un email de vérification a été envoyé à votre adresse. 
          Cliquez sur le lien dans l'email pour activer votre compte.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Vous ne voyez pas l'email ?</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Vérifiez votre dossier spam</li>
            <li>• L'email peut prendre quelques minutes</li>
            <li>• Vérifiez l'orthographe de votre email</li>
          </ul>
        </div>

        <div className="space-y-4">
          <Link href="/register" className="btn-primary w-full block text-center">
            Créer un nouveau compte
          </Link>
          
          <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Retour à la connexion
          </Link>
        </div>
      </motion.div>
    </div>
  )
} 