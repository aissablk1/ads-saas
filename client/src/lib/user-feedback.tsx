'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  HeartIcon, 
  HandThumbUpIcon, 
  StarIcon,
  ChatBubbleLeftIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import { useNotifications } from './notification-system'

interface FeedbackProps {
  type: 'like' | 'rating' | 'comment' | 'heart'
  onFeedback?: (value: any) => void
  className?: string
}

// Composant de like avec animation
export const LikeButton: React.FC<FeedbackProps> = ({ onFeedback, className = '' }) => {
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(42)
  const { showNotification } = useNotifications()

  const handleLike = useCallback(() => {
    setIsLiked(!isLiked)
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1)
    
    if (!isLiked) {
      showNotification({
        type: 'success',
        title: 'Merci !',
        message: 'Votre like nous motive à continuer !',
        duration: 3000
      })
    }
    
    onFeedback?.(!isLiked)
  }, [isLiked, onFeedback, showNotification])

  return (
    <motion.button
      onClick={handleLike}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 hover:border-primary-300 transition-colors ${className}`}
    >
      <motion.div
        animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        {isLiked ? (
          <HeartSolidIcon className="w-5 h-5 text-red-500" />
        ) : (
          <HeartIcon className="w-5 h-5 text-gray-500" />
        )}
      </motion.div>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {likeCount}
      </span>
    </motion.button>
  )
}

// Composant de notation avec étoiles
export const RatingStars: React.FC<FeedbackProps> = ({ onFeedback, className = '' }) => {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const { showNotification } = useNotifications()

  const handleRating = useCallback((value: number) => {
    setRating(value)
    showNotification({
      type: 'success',
      title: 'Merci pour votre note !',
      message: `Vous avez donné ${value} étoile${value > 1 ? 's' : ''}`,
      duration: 3000
    })
    onFeedback?.(value)
  }, [onFeedback, showNotification])

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          onClick={() => handleRating(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="text-gray-300 hover:text-yellow-400 transition-colors"
        >
          <StarIcon 
            className={`w-6 h-6 ${
              star <= (hoverRating || rating) ? 'text-yellow-400 fill-current' : ''
            }`} 
          />
        </motion.button>
      ))}
    </div>
  )
}

// Composant de commentaire rapide
export const QuickComment: React.FC<FeedbackProps> = ({ onFeedback, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [comment, setComment] = useState('')
  const { showNotification } = useNotifications()

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (comment.trim()) {
      showNotification({
        type: 'success',
        title: 'Commentaire envoyé !',
        message: 'Merci pour votre feedback, nous en tenons compte.',
        duration: 4000
      })
      onFeedback?.(comment)
      setComment('')
      setIsOpen(false)
    }
  }, [comment, onFeedback, showNotification])

  return (
    <div className={className}>
      {!isOpen ? (
        <motion.button
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 hover:border-primary-300 transition-colors"
        >
          <ChatBubbleLeftIcon className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Commenter
          </span>
        </motion.button>
      ) : (
        <AnimatePresence>
          <motion.form
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onSubmit={handleSubmit}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Votre commentaire..."
              className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              autoFocus
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <PaperAirplaneIcon className="w-4 h-4" />
            </motion.button>
          </motion.form>
        </AnimatePresence>
      )}
    </div>
  )
}

// Composant de satisfaction globale
export const SatisfactionWidget: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [showFeedback, setShowFeedback] = useState(false)
  const { showNotification } = useNotifications()

  const handleSatisfaction = useCallback((satisfied: boolean) => {
    setShowFeedback(false)
    showNotification({
      type: satisfied ? 'success' : 'info',
      title: satisfied ? 'Super !' : 'Nous pouvons mieux faire',
      message: satisfied 
        ? 'Merci pour votre satisfaction !' 
        : 'Nous travaillons pour améliorer votre expérience.',
      duration: 4000
    })
  }, [showNotification])

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <AnimatePresence>
        {!showFeedback ? (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            onClick={() => setShowFeedback(true)}
            className="bg-primary-600 text-white p-3 rounded-full shadow-lg hover:bg-primary-700 transition-colors"
          >
            <HandThumbUpIcon className="w-6 h-6" />
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4"
          >
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Êtes-vous satisfait ?
            </p>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSatisfaction(true)}
                className="flex-1 px-3 py-2 bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-600 transition-colors"
              >
                👍 Oui
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSatisfaction(false)}
                className="flex-1 px-3 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 transition-colors"
              >
                👎 Non
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default {
  LikeButton,
  RatingStars,
  QuickComment,
  SatisfactionWidget
} 