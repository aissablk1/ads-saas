'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export const PageLoader: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    setIsLoading(true)
    setProgress(0)

    // Animation de progression
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(timer)
          return 90
        }
        return prev + Math.random() * 30
      })
    }, 100)

    // Fin du chargement
    const finishTimer = setTimeout(() => {
      setProgress(100)
      setTimeout(() => {
        setIsLoading(false)
        setProgress(0)
      }, 200)
    }, 500)

    return () => {
      clearInterval(timer)
      clearTimeout(finishTimer)
    }
  }, [pathname])

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-gradient-to-r from-primary-500 via-primary-600 to-purple-600"
          style={{
            width: `${progress}%`,
            transition: 'width 0.3s ease-out'
          }}
        >
          <div className="h-full bg-white/20 animate-pulse" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PageLoader 