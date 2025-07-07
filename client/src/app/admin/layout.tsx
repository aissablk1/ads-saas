'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import {
  HomeIcon,
  ChartBarIcon,
  UsersIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  ServerIcon,
  CircleStackIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  WrenchScrewdriverIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  BellIcon,
  KeyIcon,
  ArchiveBoxIcon,
  ClockIcon,
  ChartPieIcon,
  CpuChipIcon,
  CloudIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import { AdminAuthProvider, AdminAuthGuard } from '@/components/AdminAuthGuard'
import { Toaster } from 'react-hot-toast'

interface AdminUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role: 'SUPER_ADMIN' | 'ADMIN'
  permissions: string[]
  lastLogin?: string
}

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminAuthProvider children={<AdminLayoutContent children={children} />} />
  )
}

interface AdminLayoutContentProps {
  children: React.ReactNode
}

function AdminLayoutContent({ children }: AdminLayoutContentProps) {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [systemStatus, setSystemStatus] = useState({
    server: 'online',
    database: 'online',
    cache: 'online',
    queue: 'online'
  })
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
    
    // Admin de test pour la navigation
    setAdmin({
      id: 'admin-001',
      email: 'admin@ads-saas.com',
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
      permissions: ['*'],
      lastLogin: new Date().toISOString()
    })
    
    setIsLoading(false)
  }, [])

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUser')
      toast.success('Déconnexion administrateur réussie')
      router.push('/login')
    }
  }

  const navigationItems = [
    {
      name: 'Espace de Contrôle Ultime',
      href: '/admin',
      icon: HomeIcon,
      description: 'Vue d\'ensemble du système'
    },
    {
      name: 'Utilisateurs',
      href: '/admin/users',
      icon: UsersIcon,
      description: 'Gestion des utilisateurs'
    },
    {
      name: 'Système',
      href: '/admin/system',
      icon: ServerIcon,
      description: 'État du système'
    },
    {
      name: 'Base de Données',
      href: '/admin/database',
      icon: CircleStackIcon,
      description: 'Gestion de la base de données'
    },
    {
      name: 'Sécurité',
      href: '/admin/security',
      icon: ShieldCheckIcon,
      description: 'Paramètres de sécurité'
    },
    {
      name: 'Logs & Monitoring',
      href: '/admin/logs',
      icon: DocumentTextIcon,
      description: 'Journaux et surveillance'
    },
    {
      name: 'API & Intégrations',
      href: '/admin/api',
      icon: GlobeAltIcon,
      description: 'Gestion des APIs'
    },
    {
      name: 'Maintenance',
      href: '/admin/maintenance',
      icon: WrenchScrewdriverIcon,
      description: 'Outils de maintenance'
    },
    {
      name: 'Analytics Avancées',
      href: '/admin/analytics',
      icon: ChartPieIcon,
      description: 'Analyses système'
    },
    {
      name: 'Notifications',
      href: '/admin/notifications',
      icon: BellIcon,
      description: 'Gestion des notifications'
    },
    {
      name: 'Clés & Tokens',
      href: '/admin/keys',
      icon: KeyIcon,
      description: 'Gestion des clés API'
    },
    {
      name: 'Archives',
      href: '/admin/archives',
      icon: ArchiveBoxIcon,
      description: 'Données archivées'
    },
    {
      name: 'Tâches Planifiées',
      href: '/admin/scheduler',
      icon: ClockIcon,
      description: 'Cron jobs et tâches'
    },
    {
      name: 'Performance',
      href: '/admin/performance',
      icon: CpuChipIcon,
      description: 'Optimisation des performances'
    },
    {
      name: 'Déploiement',
      href: '/admin/deployment',
      icon: CloudIcon,
      description: 'Gestion des déploiements'
    },
    {
      name: 'Constructeur de Pages',
      href: '/admin/builder',
      icon: DocumentTextIcon,
      description: 'Création visuelle de pages'
    }
  ]

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-300">Initialisation de l'administration...</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-300">Chargement de l'interface admin...</p>
        </div>
      </div>
    )
  }

  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-300">Accès administrateur requis...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {children}
    </div>
  )
} 