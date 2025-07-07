'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import {
  HomeIcon,
  ChartBarIcon,
  MegaphoneIcon,
  UserIcon,
  UsersIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  CurrencyDollarIcon,
  DocumentChartBarIcon,
  PhotoIcon,
  LinkIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import { ThemeToggle } from '@/lib/theme-toggle'

// Définir le type User localement pour éviter les problèmes d'import
interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role?: 'USER' | 'ADMIN'
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  createdAt?: string
  lastLogin?: string
  twoFactorEnabled?: boolean
  emailVerified?: boolean
}

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
    
    // Utilisateur de test pour la navigation
    setUser({
      id: 'test-user',
      email: 'test@ads-saas.com',
      firstName: 'Utilisateur',
      lastName: 'Test'
    } as User)
    
    setIsLoading(false)
  }, [])

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      toast.success('Déconnexion réussie')
      router.push('/login')
    }
  }

  const navigationItems = [
    { name: 'Tableau de bord', href: '/dashboard', icon: HomeIcon },
    { name: 'Campagnes', href: '/dashboard/campaigns', icon: MegaphoneIcon },
    { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon },
    { name: 'Médias', href: '/dashboard/media', icon: PhotoIcon },
    { name: 'Builder', href: '/dashboard/builder', icon: DocumentDuplicateIcon },
    { name: 'Intégrations', href: '/dashboard/integrations', icon: LinkIcon },
    { name: 'Finances', href: '/dashboard/billing', icon: CurrencyDollarIcon },
    { name: 'Rapports', href: '/dashboard/reports', icon: DocumentChartBarIcon },
    { name: 'Équipe', href: '/dashboard/team', icon: UsersIcon },
    { name: 'Profil', href: '/dashboard/profile', icon: UserIcon },
    { name: 'Paramètres', href: '/dashboard/settings', icon: CogIcon },
  ]

  // Éviter l'hydratation en attendant que le composant soit monté
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Initialisation...</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirection vers la connexion...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center px-4 py-5">
            <h1 className="text-2xl font-bold text-blue-600">ADS SaaS</h1>
          </div>
          <nav className="flex-1 px-4 space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-blue-100 text-blue-900 border-r-2 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.firstName?.[0] || user.email[0].toUpperCase()}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">
                    {user.firstName || 'Utilisateur'} {user.lastName || ''}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1 text-gray-400 hover:text-gray-500"
                title="Se déconnecter"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Bienvenue {user.firstName || 'sur votre dashboard'}
            </h2>
            <div className="flex items-center gap-4">
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-1 rounded text-sm">
                Mode Test - Authentification désactivée
              </div>
              <ThemeToggle size="sm" />
            </div>
          </div>
        </div>

        {/* Contenu */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
} 