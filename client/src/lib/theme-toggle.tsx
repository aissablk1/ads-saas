'use client'

import React, { useEffect, useState } from 'react'
import { useTheme, useMounted } from './theme-context'

// Icônes SVG pour soleil, lune et système
const SunIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
    />
  </svg>
)

const MoonIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
    />
  </svg>
)

const SystemIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25"
    />
  </svg>
)

interface ThemeToggleProps {
  variant?: 'button' | 'switch'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ThemeToggle({ 
  variant = 'button', 
  size = 'md',
  className = '' 
}: ThemeToggleProps) {
  const { theme, toggleTheme, resolvedTheme } = useTheme()
  const mounted = useMounted()

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  }

  const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  // Éviter les erreurs d'hydratation
  if (!mounted) {
    return (
      <button
        className={`
          ${sizeClasses[size]}
          inline-flex items-center justify-center
          rounded-full
          bg-gray-200
          text-gray-400
          border border-gray-300
          ${className}
        `}
        disabled
      >
        <SystemIcon className={iconSizeClasses[size]} />
      </button>
    )
  }

  const getIcon = () => {
    if (theme === 'system') return <SystemIcon className={`${iconSizeClasses[size]} animate-theme-switch`} />
    if (theme === 'light') return <SunIcon className={`${iconSizeClasses[size]} animate-theme-switch`} />
    return <MoonIcon className={`${iconSizeClasses[size]} animate-theme-switch`} />
  }

  const getToggleLabel = () => {
    if (theme === 'light') return 'Passer au thème sombre'
    if (theme === 'dark') return 'Passer au thème automatique'
    return 'Passer au thème clair'
  }

  if (variant === 'switch') {
    return (
      <button
        onClick={toggleTheme}
        className={`theme-toggle ${
          resolvedTheme === 'dark' ? 'theme-toggle-dark' : 'theme-toggle-light'
        } ${className}`}
        aria-label={getToggleLabel()}
      >
        <span
          className={`theme-toggle-button ${
            resolvedTheme === 'dark' 
              ? 'theme-toggle-button-right' 
              : 'theme-toggle-button-left'
          }`}
        >
          {getIcon()}
        </span>
      </button>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className={`
        ${sizeClasses[size]}
        inline-flex items-center justify-center
        rounded-full
        bg-background-secondary
        text-foreground-secondary
        hover:bg-background
        hover:text-foreground
        focus:outline-none
        focus:ring-2
        focus:ring-primary-500
        focus:ring-offset-2
        transition-all duration-200
        border border-border
        ${className}
      `}
      aria-label={getToggleLabel()}
    >
      <div className="relative">
        {getIcon()}
      </div>
    </button>
  )
}

// Composant de sélection de thème avec menu déroulant
export function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const mounted = useMounted()

  // Éviter les erreurs d'hydratation
  if (!mounted) {
    return (
      <select className="form-select pr-10 appearance-none cursor-pointer" disabled>
        <option value="system">Automatique</option>
      </select>
    )
  }

  const themes = [
    { value: 'system', label: 'Automatique (Système)', icon: SystemIcon },
    { value: 'light', label: 'Clair', icon: SunIcon },
    { value: 'dark', label: 'Sombre', icon: MoonIcon },
  ]

  const currentTheme = themes.find(t => t.value === theme) || themes[0]

  return (
    <div className="relative">
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
        className="form-select pr-10 appearance-none cursor-pointer bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      >
        {themes.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <currentTheme.icon className="h-4 w-4 text-gray-400" />
      </div>
    </div>
  )
}

// Composant de menu de thème avec options avancées
export function ThemeMenu() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [isOpen, setIsOpen] = React.useState(false)
  const mounted = useMounted()

  // Éviter les erreurs d'hydratation
  if (!mounted) {
    return (
      <button className="btn-secondary flex items-center space-x-2" disabled>
        <SystemIcon className="h-4 w-4" />
        <span>Thème</span>
      </button>
    )
  }

  const themes = [
    {
      value: 'system',
      label: 'Automatique',
      description: 'Suit les préférences système',
      icon: SystemIcon,
    },
    {
      value: 'light',
      label: 'Thème clair',
      description: 'Interface lumineuse',
      icon: SunIcon,
    },
    {
      value: 'dark',
      label: 'Thème sombre',
      description: 'Interface sombre',
      icon: MoonIcon,
    },
  ]

  const currentTheme = themes.find(t => t.value === theme) || themes[0]
} 