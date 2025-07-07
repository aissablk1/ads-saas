'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import { ThemeToggle } from '@/lib/theme-toggle'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: 'general',
    message: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const subjects = [
    { value: 'general', label: 'Question générale' },
    { value: 'sales', label: 'Ventes et tarifs' },
    { value: 'support', label: 'Support technique' },
    { value: 'billing', label: 'Facturation' },
    { value: 'partnership', label: 'Partenariat' },
    { value: 'media', label: 'Presse et médias' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success('Message envoyé avec succès ! Nous vous répondrons dans les 24h.')
      setFormData({ name: '', email: '', company: '', subject: 'general', message: '' })
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du message')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6 gap-4">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              ADS SaaS
            </Link>
            <div className="flex items-center space-x-4 gap-4">
              <Link href="/login" className="text-gray-600 hover:text-gray-900">
                Se connecter
              </Link>
              <Link href="/register" className="btn-primary">
                Essai gratuit
              </Link>
              <ThemeToggle size="sm" />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Contactez-nous
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Notre équipe est là pour vous aider. Posez-nous vos questions, demandez une démo, 
              ou discutons de vos besoins en publicité digitale.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-xl shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Envoyez-nous un message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="form-label">Nom complet *</label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="form-input"
                      placeholder="Votre nom"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="form-label">Email *</label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="form-input"
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="company" className="form-label">Entreprise</label>
                    <input
                      id="company"
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="form-input"
                      placeholder="Nom de votre entreprise"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="form-label">Sujet *</label>
                    <select
                      id="subject"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="form-input"
                    >
                      {subjects.map((subject) => (
                        <option key={subject.value} value={subject.value}>
                          {subject.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="form-label">Message *</label>
                  <textarea
                    id="message"
                    rows={6}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="form-input"
                    placeholder="Décrivez votre demande en détail..."
                  />
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
                  {isLoading ? 'Envoi...' : 'Envoyer le message'}
                </button>
              </form>
            </motion.div>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Cards */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations de contact</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <EnvelopeIcon className="h-6 w-6 text-primary-600 mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <p className="text-gray-600">contact@ads-saas.com</p>
                    <p className="text-sm text-gray-500">Réponse sous 4h en moyenne</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <PhoneIcon className="h-6 w-6 text-primary-600 mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Téléphone</p>
                    <p className="text-gray-600">+33 1 23 45 67 89</p>
                    <p className="text-sm text-gray-500">Lun-Ven 9h-18h (CET)</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPinIcon className="h-6 w-6 text-primary-600 mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Adresse</p>
                    <p className="text-gray-600">123 Avenue de la Technologie<br />75001 Paris, France</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <ClockIcon className="h-6 w-6 text-primary-600 mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Heures d'ouverture</p>
                    <p className="text-gray-600">Lundi - Vendredi : 9h - 18h<br />Support 24/7 pour les urgences</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Accès rapide</h3>
              
              <div className="space-y-3">
                <Link href="/help" className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
                  <QuestionMarkCircleIcon className="h-5 w-5 text-primary-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Centre d'aide</p>
                    <p className="text-sm text-gray-600">FAQ et documentation</p>
                  </div>
                </Link>

                <Link href="/chat" className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 text-primary-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Chat en direct</p>
                    <p className="text-sm text-gray-600">Support immédiat</p>
                  </div>
                </Link>

                <Link href="/demo" className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
                  <EnvelopeIcon className="h-5 w-5 text-primary-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Demander une démo</p>
                    <p className="text-sm text-gray-600">Présentation personnalisée</p>
                  </div>
                </Link>
              </div>
            </motion.div>

            {/* FAQ Preview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-blue-50 border border-blue-200 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Questions fréquentes</h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-blue-900">Puis-je essayer gratuitement ?</p>
                  <p className="text-blue-800">Oui, 14 jours d'essai gratuit sans carte bancaire.</p>
                </div>
                <div>
                  <p className="font-medium text-blue-900">Combien coûte ADS SaaS ?</p>
                  <p className="text-blue-800">À partir de 29€/mois. Plan gratuit disponible.</p>
                </div>
                <div>
                  <p className="font-medium text-blue-900">Support inclus ?</p>
                  <p className="text-blue-800">Support email inclus, téléphone sur plans payants.</p>
                </div>
              </div>
              
              <Link href="/help" className="text-blue-600 hover:text-blue-700 font-medium text-sm mt-4 inline-block">
                Voir toutes les FAQ →
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
} 