'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  UsersIcon, 
  StarIcon, 
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'
import { GlassmorphicCard, NotificationBubble } from './design-system'

interface SocialProofProps {
  className?: string
}

interface LiveMetric {
  id: string
  value: number
  label: string
  icon: any
  color: string
}

interface Testimonial {
  id: string
  name: string
  role: string
  company: string
  content: string
  rating: number
  avatar: string
  location: string
  verified: boolean
}

export const SocialProof: React.FC<SocialProofProps> = ({ className = '' }) => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [showLiveNotification, setShowLiveNotification] = useState(false)
  const [liveMetrics, setLiveMetrics] = useState<LiveMetric[]>([
    { id: '1', value: 15420, label: 'Clients actifs', icon: UsersIcon, color: 'text-blue-500' },
    { id: '2', value: 250, label: 'Million € générés', icon: BuildingOfficeIcon, color: 'text-green-500' },
    { id: '3', value: 98, label: '% de satisfaction', icon: StarIcon, color: 'text-yellow-500' },
    { id: '4', value: 24, label: 'Heures de support', icon: ClockIcon, color: 'text-purple-500' }
  ])

  const testimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Marie Dubois',
      role: 'Directrice Marketing',
      company: 'TechCorp',
      content: 'ADS SaaS a révolutionné notre approche publicitaire. +150% de ROI en 3 mois ! L\'interface est intuitive et les résultats exceptionnels.',
      rating: 5,
      avatar: '/api/placeholder/40/40',
      location: 'Paris, France',
      verified: true
    },
    {
      id: '2',
      name: 'Pierre Martin',
      role: 'CEO',
      company: 'StartupInc',
      content: 'Interface intuitive et résultats exceptionnels. Je recommande vivement. Le support client est au top !',
      rating: 5,
      avatar: '/api/placeholder/40/40',
      location: 'Lyon, France',
      verified: true
    },
    {
      id: '3',
      name: 'Sophie Chen',
      role: 'Growth Manager',
      company: 'E-commerce Pro',
      content: 'Les analytics sont incroyables. On voit enfin clairement ce qui fonctionne. ROI multiplié par 3 !',
      rating: 5,
      avatar: '/api/placeholder/40/40',
      location: 'Marseille, France',
      verified: true
    },
    {
      id: '4',
      name: 'Alexandre Moreau',
      role: 'Marketing Director',
      company: 'Digital Agency',
      content: 'L\'IA d\'optimisation est bluffante. Nos campagnes sont maintenant 40% plus efficaces automatiquement.',
      rating: 5,
      avatar: '/api/placeholder/40/40',
      location: 'Bordeaux, France',
      verified: true
    }
  ]

  const newClients = [
    { name: 'TechCorp', location: 'Paris', time: '2 min' },
    { name: 'StartupInc', location: 'Lyon', time: '5 min' },
    { name: 'E-commerce Pro', location: 'Marseille', time: '8 min' },
    { name: 'Digital Agency', location: 'Bordeaux', time: '12 min' },
    { name: 'Innovation Lab', location: 'Toulouse', time: '15 min' }
  ]

  // Animation des métriques en temps réel
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMetrics(prev => prev.map(metric => ({
        ...metric,
        value: metric.value + Math.floor(Math.random() * 10)
      })))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Rotation des témoignages
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [testimonials.length])

  // Notifications de nouveaux clients
  useEffect(() => {
    const interval = setInterval(() => {
      setShowLiveNotification(true)
      setTimeout(() => setShowLiveNotification(false), 4000)
    }, 12000)
    return () => clearInterval(interval)
  }, [])

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Métriques en temps réel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {liveMetrics.map((metric, index) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="text-center"
          >
            <GlassmorphicCard className="p-6">
              <div className="flex items-center justify-center mb-3">
                <metric.icon className={`w-8 h-8 ${metric.color}`} />
              </div>
              <motion.div
                key={metric.value}
                className="text-3xl font-bold text-gray-900 dark:text-white mb-1"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {formatNumber(metric.value)}
              </motion.div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {metric.label}
              </div>
              <motion.div
                className="w-full h-1 bg-gray-200 rounded-full mt-3 overflow-hidden"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1, delay: index * 0.1 }}
              >
                <div className={`h-full ${metric.color.replace('text-', 'bg-')} rounded-full`} />
              </motion.div>
            </GlassmorphicCard>
          </motion.div>
        ))}
      </div>

      {/* Témoignages carrousel */}
      <div className="relative">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ce que disent nos clients
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Rejoignez des milliers d'entreprises qui font confiance à ADS SaaS
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <GlassmorphicCard className="p-8">
                <div className="flex items-start gap-6">
                  {/* Avatar et infos */}
                  <div className="flex-shrink-0">
                    {testimonials[currentTestimonial].avatar ? (
                      <img
                        src={testimonials[currentTestimonial].avatar}
                        alt={testimonials[currentTestimonial].name}
                        className="w-16 h-16 rounded-full object-cover border-4 border-primary-200 shadow-md"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {testimonials[currentTestimonial].name.charAt(0)}
                      </div>
                    )}
                    {testimonials[currentTestimonial].verified && (
                      <div className="flex items-center justify-center mt-2">
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      </div>
                    )}
                  </div>

                  {/* Contenu */}
                  <div className="flex-1">
                    {/* Note */}
                    <div className="flex items-center gap-1 mb-3">
                      {Array.from({ length: testimonials[currentTestimonial].rating }).map((_, i) => (
                        <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>

                    {/* Témoignage */}
                    <blockquote className="text-lg text-gray-700 dark:text-gray-300 mb-4 italic">
                      "{testimonials[currentTestimonial].content}"
                    </blockquote>

                    {/* Auteur */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {testimonials[currentTestimonial].name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {testimonials[currentTestimonial].role} chez {testimonials[currentTestimonial].company}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPinIcon className="w-4 h-4" />
                        {testimonials[currentTestimonial].location}
                      </div>
                    </div>
                  </div>
                </div>
              </GlassmorphicCard>
            </motion.div>
          </AnimatePresence>

          {/* Indicateurs */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentTestimonial
                    ? 'bg-blue-500 scale-125'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Nouveaux clients en temps réel */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 overflow-x-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Nouveaux clients cette heure
          </h3>
        </div>
        <div className="flex flex-col md:flex-row md:gap-6 gap-3 ticker-animation">
          {newClients.slice(0, 3).map((client, index) => (
            <motion.div
              key={client.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm min-w-[220px] shadow-md hover:scale-105 transition-transform"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow">
                  {client.name.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {client.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {client.location}
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Il y a {client.time}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Badges de confiance */}
      <div className="text-center">
        <div className="flex flex-wrap justify-center gap-6">
          {[
            { text: 'Sécurité RGPD', icon: '🔒', color: 'text-green-600' },
            { text: '99.9% Uptime', icon: '⚡', color: 'text-blue-600' },
            { text: 'Support 24/7', icon: '🛟', color: 'text-purple-600' },
            { text: 'Certifié ISO', icon: '🏆', color: 'text-orange-600' },
            { text: 'Hébergé en France', icon: '🇫🇷', color: 'text-red-600' }
          ].map((badge, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 300 }}
              className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full border border-gray-200 dark:border-gray-700"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-lg">{badge.icon}</span>
              <span className={`text-sm font-medium ${badge.color}`}>
                {badge.text}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Notification de nouveau client */}
      <AnimatePresence>
        {showLiveNotification && (
          <NotificationBubble
            type="success"
            position="bottom-left"
            duration={4000}
            onClose={() => setShowLiveNotification(false)}
          >
            <div className="flex items-center gap-2">
              <UsersIcon className="w-4 h-4" />
              <span>Nouveau client : {newClients[Math.floor(Math.random() * newClients.length)].name} vient de rejoindre ADS SaaS !</span>
            </div>
          </NotificationBubble>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SocialProof 