'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { 
  PlayIcon, 
  ArrowRightIcon, 
  SparklesIcon, 
  RocketLaunchIcon,
  ChartBarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { GradientButton, GlassmorphicCard, NotificationBubble } from './design-system'

interface CinematicHeroProps {
  onGetStarted?: () => void
  onWatchDemo?: () => void
}

export const CinematicHero: React.FC<CinematicHeroProps> = ({
  onGetStarted,
  onWatchDemo
}) => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [currentMetric, setCurrentMetric] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  // Transformations basées sur le scroll
  const y = useTransform(scrollYProgress, [0, 1], [0, -300])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8])

  // Métriques animées pour la preuve sociale
  const metrics = [
    { value: 15000, label: 'Clients satisfaits', icon: UsersIcon },
    { value: 250, label: 'Million € générés', icon: CurrencyDollarIcon },
    { value: 98, label: '% de satisfaction', icon: ChartBarIcon },
    { value: 24, label: 'Heures de support', icon: ShieldCheckIcon }
  ]

  // Animation des métriques
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMetric((prev) => (prev + 1) % metrics.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [metrics.length])

  // Notification de nouveau client
  useEffect(() => {
    const interval = setInterval(() => {
      setShowNotification(true)
      setTimeout(() => setShowNotification(false), 4000)
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  const handleGetStarted = () => {
    onGetStarted?.()
  }

  const handleWatchDemo = () => {
    setIsVideoPlaying(true)
    onWatchDemo?.()
  }

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden">
      {/* Arrière-plan animé */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900"
        style={{ y, opacity, scale }}
      >
        {/* Particules flottantes */}
        <div className="absolute inset-0">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Grille animée */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px] animate-gradient-shift" />
        </div>

        {/* Formes morphiques */}
        <motion.div
          className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-3xl"
          animate={{
            borderRadius: [
              '60% 40% 30% 70%/60% 30% 70% 40%',
              '30% 60% 70% 40%/50% 60% 30% 60%',
              '60% 40% 30% 70%/60% 30% 70% 40%'
            ],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <motion.div
          className="absolute bottom-20 left-20 w-48 h-48 bg-gradient-to-r from-pink-500/30 to-orange-500/30 rounded-full blur-3xl"
          animate={{
            borderRadius: [
              '30% 60% 70% 40%/50% 60% 30% 60%',
              '60% 40% 30% 70%/60% 30% 70% 40%',
              '30% 60% 70% 40%/50% 60% 30% 60%'
            ],
            scale: [1.2, 1, 1.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </motion.div>

      {/* Contenu principal */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="max-w-7xl mx-auto text-center">
          {/* Badge de nouveauté */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-8"
          >
            <div className="w-4 h-4 text-yellow-400">
              {React.createElement(SparklesIcon)}
            </div>
            <span className="text-white/90 text-sm font-medium">
              Nouveau : IA d'optimisation avancée
            </span>
          </motion.div>

          {/* Titre principal */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Gérez vos campagnes avec
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient-shift">
              l'intelligence artificielle
            </span>
          </motion.h1>

          {/* Sous-titre */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Optimisez automatiquement vos publicités, analysez vos performances en temps réel 
            et maximisez votre ROI avec notre plateforme SaaS révolutionnaire.
          </motion.p>

          {/* Boutons d'action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <GradientButton
              size="lg"
              onClick={handleGetStarted}
              className="group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center">
                Commencer gratuitement
                <div className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform">
                  {React.createElement(ArrowRightIcon)}
                </div>
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
            </GradientButton>

            <div
              className="p-0 overflow-hidden cursor-pointer"
              onClick={handleWatchDemo}
            >
              <GlassmorphicCard className="p-0 overflow-hidden">
                <button className="flex items-center gap-3 px-8 py-4 text-white">
                  <div className="relative">
                    <div className="w-6 h-6">
                      {React.createElement(PlayIcon)}
                    </div>
                    <motion.div
                      className="absolute inset-0 bg-white/20 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                  <span className="font-semibold">Voir la démo</span>
                </button>
              </GlassmorphicCard>
            </div>
          </motion.div>

          {/* Métriques de preuve sociale */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            {metrics.map((metric, index) => (
              <motion.div
                key={index}
                className="text-center"
                animate={{
                  scale: currentMetric === index ? 1.05 : 1,
                  opacity: currentMetric === index ? 1 : 0.7,
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-center mb-2">
                  <div className="w-6 h-6 text-blue-400 mr-2">
                    {React.createElement(metric.icon)}
                  </div>
                  <motion.span
                    className="text-2xl md:text-3xl font-bold text-white"
                    key={metric.value}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {metric.value.toLocaleString()}
                    {index === 1 && 'M'}
                    {index === 2 && '%'}
                    {index === 3 && 'h'}
                  </motion.span>
                </div>
                <p className="text-white/70 text-sm">{metric.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Badges de confiance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="flex flex-wrap justify-center gap-6 mt-12"
          >
            {[
              { text: 'Sécurité RGPD', color: 'text-green-400' },
              { text: '99.9% Uptime', color: 'text-blue-400' },
              { text: 'Support 24/7', color: 'text-purple-400' },
              { text: 'Certifié ISO', color: 'text-orange-400' }
            ].map((badge, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className={`w-2 h-2 rounded-full ${badge.color}`} />
                <span className="text-white/80 text-sm">{badge.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Indicateur de scroll */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <motion.div
            className="w-1 h-3 bg-white/60 rounded-full mt-2"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>

      {/* Notification de nouveau client */}
      <AnimatePresence>
        {showNotification && (
          <NotificationBubble
            type="success"
            position="bottom-left"
            duration={4000}
            onClose={() => setShowNotification(false)}
          >
            <div className="flex items-center gap-2">
              <div className="w-4 h-4">
                {React.createElement(UsersIcon)}
              </div>
              <span>Nouveau client : TechCorp vient de rejoindre ADS SaaS !</span>
            </div>
          </NotificationBubble>
        )}
      </AnimatePresence>

      {/* Modal vidéo */}
      <AnimatePresence>
        {isVideoPlaying && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsVideoPlaying(false)}
          >
            <motion.div
              className="relative w-full max-w-4xl mx-4 aspect-video bg-gray-900 rounded-xl overflow-hidden"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-16 h-16 mx-auto mb-4 text-blue-400">
                    {React.createElement(RocketLaunchIcon)}
                  </div>
                  <p className="text-lg">Démo vidéo en cours de chargement...</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Découvrez comment ADS SaaS révolutionne la gestion publicitaire
                  </p>
                </div>
              </div>
              <button
                className="absolute top-4 right-4 text-white hover:text-gray-300"
                onClick={() => setIsVideoPlaying(false)}
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CinematicHero 