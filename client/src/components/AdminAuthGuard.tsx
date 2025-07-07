'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

interface AdminUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role: string
  status: string
  lastLogin?: string
}

interface AdminAuthContextType {
  user: AdminUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  refreshSession: () => Promise<void>
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider')
  }
  return context
}

interface AdminAuthProviderProps {
  children: React.ReactNode
}

export const AdminAuthProvider: React.FC<AdminAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  const verifySession = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('adminToken')
      if (!token) {
        return false
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/verify-session`, {
        headers: getAuthHeaders()
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setIsAuthenticated(true)
        return true
      } else {
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminUser')
        return false
      }
    } catch (error) {
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUser')
      return false
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('adminToken', data.token)
        localStorage.setItem('adminUser', JSON.stringify(data.user))
        setUser(data.user)
        setIsAuthenticated(true)
        toast.success('Connexion réussie')
        return true
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Erreur de connexion')
        return false
      }
    } catch (error) {
      toast.error('Erreur de connexion au serveur')
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    setUser(null)
    setIsAuthenticated(false)
    router.push('/admin/login')
    toast.success('Déconnexion réussie')
  }

  const refreshSession = async () => {
    const success = await verifySession()
    if (!success) {
      logout()
    }
  }

  useEffect(() => {
    const initAuth = async () => {
      const success = await verifySession()
      if (!success) {
        router.push('/admin/login')
      }
      setIsLoading(false)
    }

    initAuth()
  }, [router])

  const value: AdminAuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshSession
  }

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  )
}

interface AdminAuthGuardProps {
  children: React.ReactNode
}

export const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({ children }) => {
  const { isLoading, isAuthenticated } = useAdminAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login')
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Vérification de l'authentification...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
} 