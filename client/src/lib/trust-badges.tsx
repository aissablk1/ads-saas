'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  ShieldCheckIcon, 
  ClockIcon, 
  ChatBubbleLeftRightIcon,
  GlobeAltIcon,
  CheckBadgeIcon,
  StarIcon
} from '@heroicons/react/24/outline'

interface TrustBadge {
  icon: React.ReactNode
  title: string
  description: string
  color: string
}

const trustBadges: TrustBadge[] = [
  {
    icon: <ShieldCheckIcon className="w-6 h-6" />,
    title: 'RGPD Conforme',
    description: 'Vos données sont protégées',
    color: 'text-green-600'
  },
  {
    icon: <ClockIcon className="w-6 h-6" />,
    title: '99.9% Uptime',
    description: 'Service toujours disponible',
    color: 'text-blue-600'
  },
  {
    icon: <ChatBubbleLeftRightIcon className="w-6 h-6" />,
    title: 'Support 24/7',
    description: 'Assistance en temps réel',
    color: 'text-purple-600'
  },
  {
    icon: <GlobeAltIcon className="w-6 h-6" />,
    title: 'ISO 27001',
    description: 'Certification sécurité',
    color: 'text-orange-600'
  },
  {
    icon: <CheckBadgeIcon className="w-6 h-6" />,
    title: 'Made in France',
    description: 'Développé en France',
    color: 'text-red-600'
  },
  {
    icon: <StarIcon className="w-6 h-6" />,
    title: '4.9/5',
    description: 'Note clients',
    color: 'text-yellow-600'
  }
]

export const TrustBadges: React.FC = () => {
  return (
    <div className="py-8 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="text-center mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Ils nous font confiance
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Plus de 15 000 entreprises nous font confiance pour leurs campagnes publicitaires
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {trustBadges.map((badge, index) => (
            <motion.div
              key={badge.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className={`${badge.color} mb-2`}>
                {badge.icon}
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white text-sm text-center mb-1">
                {badge.title}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                {badge.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Badge de confiance compact pour les headers
export const CompactTrustBadge: React.FC<{ type: 'rgpd' | 'uptime' | 'support' | 'iso' | 'france' | 'rating' }> = ({ type }) => {
  const badge = trustBadges.find(b => b.title.toLowerCase().includes(type))
  
  if (!badge) return null
  
  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className={badge.color}>
        {badge.icon}
      </div>
      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
        {badge.title}
      </span>
    </div>
  )
}

// Bandeau de réassurance pour les pages de conversion
export const ReassuranceBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-b border-green-200 dark:border-green-800">
      <div className="container mx-auto px-4 lg:px-6 py-3">
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="w-4 h-4 text-green-600" />
            <span className="text-green-800 dark:text-green-300">RGPD Conforme</span>
          </div>
          <div className="flex items-center gap-2">
            <ClockIcon className="w-4 h-4 text-blue-600" />
            <span className="text-blue-800 dark:text-blue-300">99.9% Uptime</span>
          </div>
          <div className="flex items-center gap-2">
            <ChatBubbleLeftRightIcon className="w-4 h-4 text-purple-600" />
            <span className="text-purple-800 dark:text-purple-300">Support 24/7</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckBadgeIcon className="w-4 h-4 text-red-600" />
            <span className="text-red-800 dark:text-red-300">Made in France</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrustBadges 