'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UserIcon,
  PencilIcon,
  KeyIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  CalendarIcon,
  CameraIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  CheckCircleIcon,
  XCircleIcon,
  PhotoIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { usersAPI, filesAPI } from '../../../lib/api'
import { User } from '../../../types'
import { toast } from 'react-hot-toast'

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    avatar: null as string | null
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  })

  useEffect(() => {
    fetchUserProfile()
  }, [])

  useEffect(() => {
    validatePassword(passwordData.newPassword)
  }, [passwordData.newPassword])

  const validatePassword = (password: string) => {
    setPasswordValidation({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    })
  }

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      const response = await usersAPI.getProfile()
      // Le serveur retourne { user: {...}, stats: {...} }
      const userData = response.user || response
      setUser(userData)
      setProfileData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email,
        avatar: userData.avatar || null
      })
    } catch (error) {
      const userData = localStorage.getItem('user')
      if (userData) {
        const user = JSON.parse(userData)
        setUser(user)
        setProfileData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email,
          avatar: user.avatar || null
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await usersAPI.updateProfile(profileData)
      // Le serveur retourne { message: '...', user: {...} }
      const updatedUser = response.user || response
      setUser(updatedUser)
      setIsEditing(false)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      toast.success('Profil mis à jour avec succès')
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du profil')
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }

    const isPasswordValid = Object.values(passwordValidation).every(valid => valid)
    if (!isPasswordValid) {
      toast.error('Le mot de passe ne respecte pas tous les critères de sécurité')
      return
    }

    try {
      await usersAPI.changePassword(passwordData.currentPassword, passwordData.newPassword)
      setShowPasswordChange(false)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      toast.success('Mot de passe modifié avec succès')
    } catch (error) {
      toast.error('Erreur lors de la modification du mot de passe')
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image')
      return
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 5MB')
      return
    }

    try {
      setUploadingAvatar(true)
      const uploadResult = await filesAPI.upload(file, 'avatar')
      
      // Mettre à jour le profil avec la nouvelle avatar URL
      const response = await usersAPI.updateProfile({ 
        ...profileData, 
        avatar: uploadResult.url 
      })
      
      const updatedUser = response.user || response
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      toast.success('Photo de profil mise à jour avec succès')
    } catch (error) {
      toast.error('Erreur lors du téléchargement de l\'image')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleRemoveAvatar = async () => {
    try {
      const response = await usersAPI.updateProfile({ 
        ...profileData, 
        avatar: null 
      })
      
      const updatedUser = response.user || response
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      toast.success('Photo de profil supprimée')
    } catch (error) {
      toast.error('Erreur lors de la suppression de la photo')
    }
  }

  const getInitials = (firstName?: string, lastName?: string, email?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase()
    }
    if (firstName) {
      return firstName[0].toUpperCase()
    }
    if (email) {
      return email[0].toUpperCase()
    }
    return 'U'
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse max-w-4xl mx-auto">
          <div className="bg-gray-200 h-48 rounded-xl mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-200 h-96 rounded-xl"></div>
            <div className="bg-gray-200 h-96 rounded-xl"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-8">
        <div className="text-center max-w-md mx-auto">
          <div className="p-6 bg-red-50 rounded-xl">
            <XCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">Erreur de chargement</h3>
            <p className="text-red-700">Impossible de charger les informations du profil</p>
            <button 
              onClick={fetchUserProfile}
              className="mt-4 btn-primary"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* En-tête avec photo de profil */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl overflow-hidden mb-8"
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative p-8">
          <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Photo de profil */}
            <div className="relative group">
              <div className="relative">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Photo de profil"
                    className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="h-32 w-32 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                    <span className="text-white text-4xl font-bold">
                      {getInitials(user.firstName, user.lastName, user.email)}
                    </span>
                  </div>
                )}
                
                {/* Overlay pour modification */}
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                      title="Changer la photo"
                    >
                      {uploadingAvatar ? (
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      ) : (
                        <CameraIcon className="h-5 w-5" />
                      )}
                    </button>
                    {user.avatar && (
                      <button
                        onClick={handleRemoveAvatar}
                        className="p-2 bg-red-500/20 backdrop-blur-sm rounded-full text-white hover:bg-red-500/30 transition-colors"
                        title="Supprimer la photo"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>

            {/* Informations utilisateur */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-white mb-2">
                {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'Nom non défini'}
              </h1>
              <p className="text-blue-100 text-lg mb-3">{user.email}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm">
                  {user.role === 'ADMIN' ? 'Administrateur' : 'Utilisateur'}
                </span>
                <span className="px-3 py-1 bg-green-500/20 backdrop-blur-sm rounded-full text-white text-sm flex items-center">
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  {user.status === 'ACTIVE' ? 'Actif' : 'Inactif'}
                </span>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm">
                  Membre depuis {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-6 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center space-x-2"
              >
                <PencilIcon className="h-4 w-4" />
                <span>{isEditing ? 'Annuler' : 'Modifier'}</span>
              </button>
              <button
                onClick={() => setShowPasswordChange(!showPasswordChange)}
                className="px-6 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg font-medium hover:bg-white/30 transition-colors flex items-center space-x-2"
              >
                <LockClosedIcon className="h-4 w-4" />
                <span>Mot de passe</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Informations personnelles */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-xl font-semibold text-gray-900">Informations personnelles</h3>
          </div>
          
          <div className="p-6">
            {isEditing ? (
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Votre prénom"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Votre nom"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Adresse email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="votre@email.com"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button 
                    type="submit" 
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <CheckCircleIcon className="h-5 w-5" />
                    <span>Sauvegarder</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <UserIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">Prénom</div>
                      <div className="text-gray-900 font-medium">
                        {user.firstName || 'Non renseigné'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <UserIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">Nom</div>
                      <div className="text-gray-900 font-medium">
                        {user.lastName || 'Non renseigné'}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <EnvelopeIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Email</div>
                    <div className="text-gray-900 font-medium">{user.email}</div>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <CalendarIcon className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Membre depuis</div>
                    <div className="text-gray-900 font-medium">
                      {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Statistiques et sécurité */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Statistiques */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">Statistiques</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <UserIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {user._count?.campaigns || 0}
                  </div>
                  <div className="text-sm text-gray-500">Campagnes</div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <KeyIcon className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {user._count?.apiKeys || 0}
                  </div>
                  <div className="text-sm text-gray-500">Clés API</div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <ShieldCheckIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {user.lastLogin 
                      ? new Date(user.lastLogin).toLocaleDateString('fr-FR')
                      : 'Jamais'
                    }
                  </div>
                  <div className="text-sm text-gray-500">Dernière connexion</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sécurité */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">Sécurité</h3>
            </div>
            <div className="p-6 space-y-4">
              {/* Alerte 2FA non activée */}
              {!user.twoFactorEnabled && (
                <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-md">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <ExclamationTriangleIcon className="h-5 w-5 text-orange-400" />
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-orange-800">
                        🔒 Authentification 2FA recommandée
                      </p>
                      <p className="mt-2 text-sm text-orange-700">
                        Protégez votre compte avec l'authentification à deux facteurs. 
                        Cette mesure de sécurité supplémentaire est fortement recommandée.
                      </p>
                      <div className="mt-3">
                        <a
                          href="/dashboard/settings"
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-orange-800 bg-orange-100 hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                        >
                          <ShieldCheckIcon className="h-4 w-4 mr-1" />
                          Configurer maintenant
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <LockClosedIcon className={`h-5 w-5 ${user.twoFactorEnabled ? 'text-green-500' : 'text-red-500'}`} />
                    {!user.twoFactorEnabled && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-sm text-gray-700">Authentification 2FA</span>
                    {!user.twoFactorEnabled && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        ULTRA RECOMMANDÉ
                      </span>
                    )}
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  user.twoFactorEnabled 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user.twoFactorEnabled ? 'Activée' : 'Désactivée'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ShieldCheckIcon className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-700">Email vérifié</span>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Vérifié
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modal changement de mot de passe */}
      <AnimatePresence>
        {showPasswordChange && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPasswordChange(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Changer le mot de passe</h3>
              
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe actuel
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  
                  {/* Validation du mot de passe */}
                  {passwordData.newPassword && (
                    <div className="mt-3 space-y-2 text-sm">
                      <div className={`flex items-center space-x-2 ${passwordValidation.length ? 'text-green-600' : 'text-red-600'}`}>
                        {passwordValidation.length ? <CheckCircleIcon className="h-4 w-4" /> : <XCircleIcon className="h-4 w-4" />}
                        <span>Au moins 8 caractères</span>
                      </div>
                      <div className={`flex items-center space-x-2 ${passwordValidation.uppercase ? 'text-green-600' : 'text-red-600'}`}>
                        {passwordValidation.uppercase ? <CheckCircleIcon className="h-4 w-4" /> : <XCircleIcon className="h-4 w-4" />}
                        <span>Une majuscule</span>
                      </div>
                      <div className={`flex items-center space-x-2 ${passwordValidation.lowercase ? 'text-green-600' : 'text-red-600'}`}>
                        {passwordValidation.lowercase ? <CheckCircleIcon className="h-4 w-4" /> : <XCircleIcon className="h-4 w-4" />}
                        <span>Une minuscule</span>
                      </div>
                      <div className={`flex items-center space-x-2 ${passwordValidation.number ? 'text-green-600' : 'text-red-600'}`}>
                        {passwordValidation.number ? <CheckCircleIcon className="h-4 w-4" /> : <XCircleIcon className="h-4 w-4" />}
                        <span>Un chiffre</span>
                      </div>
                      <div className={`flex items-center space-x-2 ${passwordValidation.special ? 'text-green-600' : 'text-red-600'}`}>
                        {passwordValidation.special ? <CheckCircleIcon className="h-4 w-4" /> : <XCircleIcon className="h-4 w-4" />}
                        <span>Un caractère spécial</span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmer le nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>
                  {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600">Les mots de passe ne correspondent pas</p>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={!Object.values(passwordValidation).every(valid => valid) || passwordData.newPassword !== passwordData.confirmPassword}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Changer le mot de passe
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPasswordChange(false)}
                    className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}