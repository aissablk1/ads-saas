'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  UserPlusIcon,
  EnvelopeIcon,
  TrashIcon,
  PencilIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  UsersIcon,
  ShieldCheckIcon,
  EyeIcon,
  PaperAirplaneIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import { teamAPI } from '../../../lib/api'
import { TeamMember, TeamInvitation } from '../../../types'

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [pendingInvitations, setPendingInvitations] = useState<TeamInvitation[]>([])
  const [loading, setLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'EDITOR',
    message: ''
  })

  useEffect(() => {
    fetchTeamData()
  }, [])

  const fetchTeamData = async () => {
    try {
      setLoading(true)
      const [membersData, invitationsData] = await Promise.all([
        teamAPI.getTeamMembers(),
        teamAPI.getPendingInvitations()
      ])
      setTeamMembers(membersData.members || membersData)
      setPendingInvitations(invitationsData.invitations || invitationsData)
    } catch (error) {
      console.error('Erreur lors du chargement de l\'équipe:', error)
      toast.error('Erreur lors du chargement des données de l\'équipe')
    } finally {
      setLoading(false)
    }
  }

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await teamAPI.inviteMember(
        inviteForm.email,
        inviteForm.role,
        inviteForm.message || undefined
      )
      toast.success('Invitation envoyée avec succès')
      setShowInviteModal(false)
      setInviteForm({ email: '', role: 'EDITOR', message: '' })
      fetchTeamData()
    } catch (error) {
      console.error('Erreur lors de l\'invitation:', error)
      toast.error('Erreur lors de l\'envoi de l\'invitation')
    }
  }

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await teamAPI.updateMemberRole(userId, newRole)
      toast.success('Rôle mis à jour avec succès')
      fetchTeamData()
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rôle:', error)
      toast.error('Erreur lors de la mise à jour du rôle')
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer ce membre de l\'équipe ?')) {
      return
    }
    
    try {
      await teamAPI.removeMember(userId)
      toast.success('Membre retiré de l\'équipe')
      fetchTeamData()
    } catch (error) {
      console.error('Erreur lors du retrait du membre:', error)
      toast.error('Erreur lors du retrait du membre')
    }
  }

  const handleResendInvitation = async (invitationId: string) => {
    try {
      await teamAPI.resendInvitation(invitationId)
      toast.success('Invitation renvoyée')
    } catch (error) {
      console.error('Erreur lors du renvoi de l\'invitation:', error)
      toast.error('Erreur lors du renvoi de l\'invitation')
    }
  }

  const handleCancelInvitation = async (invitationId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette invitation ?')) {
      return
    }
    
    try {
      await teamAPI.cancelInvitation(invitationId)
      toast.success('Invitation annulée')
      fetchTeamData()
    } catch (error) {
      console.error('Erreur lors de l\'annulation de l\'invitation:', error)
      toast.error('Erreur lors de l\'annulation de l\'invitation')
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'OWNER': return 'bg-purple-100 text-purple-800'
      case 'ADMIN': return 'bg-red-100 text-red-800'
      case 'EDITOR': return 'bg-blue-100 text-blue-800'
      case 'VIEWER': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'OWNER': return 'Propriétaire'
      case 'ADMIN': return 'Administrateur'
      case 'EDITOR': return 'Éditeur'
      case 'VIEWER': return 'Observateur'
      default: return role
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'pending': return <ClockIcon className="h-5 w-5 text-yellow-500" />
      case 'suspended': return <XCircleIcon className="h-5 w-5 text-red-500" />
      default: return null
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion d'équipe</h1>
          <p className="text-gray-600 mt-1">
            Invitez des collaborateurs et gérez les accès à votre workspace
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="btn-primary flex items-center"
        >
          <UserPlusIcon className="h-5 w-5 mr-2" />
          Inviter un membre
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-blue-500 rounded-md">
              <UsersIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Membres actifs</p>
              <p className="text-2xl font-bold text-gray-900">{teamMembers.filter(m => m.status === 'ACTIVE').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-yellow-500 rounded-md">
              <ClockIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Invitations en cours</p>
              <p className="text-2xl font-bold text-gray-900">{pendingInvitations.filter(i => i.status === 'PENDING').length}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <ShieldCheckIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Administrateurs</p>
              <p className="text-2xl font-bold text-gray-900">{teamMembers.filter(m => m.role === 'ADMIN' || m.role === 'OWNER').length}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <EyeIcon className="h-8 w-8 text-gray-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Observateurs</p>
              <p className="text-2xl font-bold text-gray-900">{teamMembers.filter(m => m.role === 'VIEWER').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Membres de l'équipe</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Membre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière activité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teamMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
                        <span className="text-white font-medium">
                          {member.firstName?.[0] || member.email[0].toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {member.firstName || member.lastName 
                            ? `${member.firstName || ''} ${member.lastName || ''}`.trim()
                            : member.email
                          }
                        </div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(member.role)}`}>
                      {getRoleLabel(member.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      member.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                      member.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {member.status === 'ACTIVE' ? 'Actif' : 
                       member.status === 'PENDING' ? 'En attente' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.lastLogin ? new Date(member.lastLogin).toLocaleDateString('fr-FR') : 'Jamais'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {member.role !== 'OWNER' && (
                        <>
                          <button className="text-primary-600 hover:text-primary-900">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Invitations en cours</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invité par
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Créé le
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expire le
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingInvitations.map((invitation) => (
                  <tr key={invitation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invitation.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(invitation.role)}`}>
                        {getRoleLabel(invitation.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invitation.invitedBy.firstName || invitation.invitedBy.lastName 
                        ? `${invitation.invitedBy.firstName || ''} ${invitation.invitedBy.lastName || ''}`.trim()
                        : invitation.invitedBy.email
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(invitation.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(invitation.expiresAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleResendInvitation(invitation.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Renvoyer l'invitation"
                        >
                          <PaperAirplaneIcon className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleCancelInvitation(invitation.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Annuler l'invitation"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-lg w-full"
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Inviter un membre</h3>
            </div>

            <form onSubmit={handleInviteMember} className="p-6 space-y-6">
              <div>
                <label htmlFor="email" className="form-label">Adresse email</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="form-input"
                  placeholder="collaborateur@example.com"
                />
              </div>

              <div>
                <label htmlFor="role" className="form-label">Rôle</label>
                <select
                  id="role"
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as any })}
                  className="form-input"
                >
                  {['OWNER', 'ADMIN', 'EDITOR', 'VIEWER'].map((role) => (
                    <option key={role} value={role}>
                      {getRoleLabel(role)}
                    </option>
                  ))}
                </select>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    {['OWNER', 'ADMIN', 'EDITOR', 'VIEWER'].find(r => r === inviteForm.role)?.toLowerCase()}
                  </p>
                </div>
              </div>

              <div>
                <label htmlFor="message" className="form-label">Message personnalisé (optionnel)</label>
                <textarea
                  id="message"
                  rows={3}
                  value={inviteForm.message}
                  onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })}
                  className="form-input"
                  placeholder="Message d'accueil pour votre collaborateur..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="btn-secondary"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary relative"
                >
                  {loading && (
                    <div className="absolute left-4">
                      <div className="spinner"></div>
                    </div>
                  )}
                  {loading ? 'Envoi...' : 'Envoyer l\'invitation'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
} 