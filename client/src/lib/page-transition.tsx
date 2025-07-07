'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export const PageTransitionLoader: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [pathname])

  if (!isLoading) return null

  return (
    <div className="page-transition-loader" />
  )
}

export default PageTransitionLoader 