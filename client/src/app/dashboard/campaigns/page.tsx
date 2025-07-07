'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { campaignsAPI } from '../../../lib/api'
import { Campaign } from '../../../types'
import { toast } from 'react-hot-toast'

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetchCampaigns()
  }, [searchTerm, statusFilter])

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      const params = {
        search: searchTerm,
        status: statusFilter,
        page: 1,
        limit: 20
      }
      const data = await campaignsAPI.getCampaigns(params)
      setCampaigns(data.data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des campagnes:', error)
      // Données de démonstration
      setCampaigns([
        {
          id: '1',
          name: 'Campagne Black Friday 2024',
          description: 'Promotion spéciale pour le Black Friday',
          status: 'ACTIVE',
          budget: 5000,
          spent: 3250.75,
          impressions: 45000,
          clicks: 890,
          conversions: 23,
          startDate: '2024-11-20',
          endDate: '2024-11-30',
          createdAt: '2024-11-01T10:00:00Z',
          updatedAt: '2024-11-20T15:30:00Z',
          userId: '1'
        },
        {
          id: '2',
          name: 'Campagne Noël - Jouets',
          description: 'Publicité pour les jouets de Noël',
          status: 'DRAFT',
          budget: 3000,
          spent: 0,
          impressions: 0,
          clicks: 0,
          conversions: 0,
          startDate: '2024-12-15',
          endDate: '2024-12-25',
          createdAt: '2024-11-15T14:00:00Z',
          updatedAt: '2024-11-15T14:00:00Z',
          userId: '1'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'PAUSED':
        return 'bg-yellow-100 text-yellow-800'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Active'
      case 'PAUSED':
        return 'En pause'
      case 'COMPLETED':
        return 'Terminée'
      case 'CANCELLED':
        return 'Annulée'
      case 'DRAFT':
        return 'Brouillon'
      default:
        return status
    }
  }

  const handleToggleStatus = async (campaignId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
      await campaignsAPI.updateCampaign(campaignId, { status: newStatus })
      toast.success(`Campagne ${newStatus === 'ACTIVE' ? 'activée' : 'mise en pause'}`)
      fetchCampaigns()
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du statut')
    }
  }

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette campagne ?')) {
      return
    }

    try {
      await campaignsAPI.deleteCampaign(campaignId)
      toast.success('Campagne supprimée avec succès')
      fetchCampaigns()
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const CampaignRow = ({ campaign }: { campaign: Campaign }) => {
    const ctr = campaign.impressions > 0 ? (campaign.clicks / campaign.impressions) * 100 : 0
    const conversionRate = campaign.clicks > 0 ? (campaign.conversions / campaign.clicks) * 100 : 0
    const budgetUsed = campaign.budget > 0 ? (campaign.spent / campaign.budget) * 100 : 0

    return (
      <motion.tr
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="hover:bg-gray-50"
      >
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div>
              <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
              <div className="text-sm text-gray-500">{campaign.description}</div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
            {getStatusText(campaign.status)}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          <div>{campaign.impressions.toLocaleString('fr-FR')}</div>
          <div className="text-xs text-gray-500">impressions</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          <div>{campaign.clicks.toLocaleString('fr-FR')}</div>
          <div className="text-xs text-gray-500">CTR: {ctr.toFixed(2)}%</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          <div>{campaign.conversions}</div>
          <div className="text-xs text-gray-500">Taux: {conversionRate.toFixed(2)}%</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          <div>{campaign.spent.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</div>
          <div className="text-xs text-gray-500">
            Budget: {campaign.budget.toLocaleString('fr-FR')} € ({budgetUsed.toFixed(0)}%)
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex items-center space-x-2">
            <Link
              href={`/dashboard/campaigns/${campaign.id}`}
              className="text-blue-600 hover:text-blue-900"
              title="Voir les détails"
            >
              <EyeIcon className="h-4 w-4" />
            </Link>
            <Link
              href={`/dashboard/campaigns/${campaign.id}/edit`}
              className="text-indigo-600 hover:text-indigo-900"
              title="Modifier"
            >
              <PencilIcon className="h-4 w-4" />
            </Link>
            <button
              onClick={() => handleToggleStatus(campaign.id, campaign.status)}
              className={`${
                campaign.status === 'ACTIVE' ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'
              }`}
              title={campaign.status === 'ACTIVE' ? 'Mettre en pause' : 'Activer'}
            >
              {campaign.status === 'ACTIVE' ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
            </button>
            <Link
              href={`/dashboard/campaigns/${campaign.id}/analytics`}
              className="text-purple-600 hover:text-purple-900"
              title="Analytics"
            >
              <ChartBarIcon className="h-4 w-4" />
            </Link>
            <button
              onClick={() => handleDeleteCampaign(campaign.id)}
              className="text-red-600 hover:text-red-900"
              title="Supprimer"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </td>
      </motion.tr>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Campagnes publicitaires</h1>
            <p className="text-gray-600">Gérez et optimisez vos campagnes publicitaires</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Nouvelle campagne</span>
          </button>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une campagne..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 form-input"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-select"
              >
                <option value="">Tous les statuts</option>
                <option value="ACTIVE">Active</option>
                <option value="PAUSED">En pause</option>
                <option value="DRAFT">Brouillon</option>
                <option value="COMPLETED">Terminée</option>
                <option value="CANCELLED">Annulée</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-blue-500 rounded-md">
              <ChartBarIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5">
              <div className="text-sm font-medium text-gray-500">Total campagnes</div>
              <div className="text-2xl font-semibold text-gray-900">{campaigns.length}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-green-500 rounded-md">
              <PlayIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5">
              <div className="text-sm font-medium text-gray-500">Campagnes actives</div>
              <div className="text-2xl font-semibold text-gray-900">
                {campaigns.filter(c => c.status === 'ACTIVE').length}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-purple-500 rounded-md">
              <EyeIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5">
              <div className="text-sm font-medium text-gray-500">Total impressions</div>
              <div className="text-2xl font-semibold text-gray-900">
                {campaigns.reduce((sum, c) => sum + c.impressions, 0).toLocaleString('fr-FR')}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-yellow-500 rounded-md">
              <span className="text-white font-bold">€</span>
            </div>
            <div className="ml-5">
              <div className="text-sm font-medium text-gray-500">Total dépensé</div>
              <div className="text-2xl font-semibold text-gray-900">
                {campaigns.reduce((sum, c) => sum + c.spent, 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des campagnes */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Chargement des campagnes...</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">Aucune campagne trouvée</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 btn-primary"
            >
              Créer votre première campagne
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campagne
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Impressions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clics
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conversions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {campaigns.map((campaign) => (
                  <CampaignRow key={campaign.id} campaign={campaign} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
} 