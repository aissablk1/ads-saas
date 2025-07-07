'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  CalendarIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  ChartBarIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
} from 'chart.js'
import { analyticsAPI } from '../../../lib/api'
import { DashboardData } from '../../../types'
import AdvancedAnalytics from '../../../lib/advanced-analytics'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
)

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [selectedCampaign, setSelectedCampaign] = useState('all')
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  })

  useEffect(() => {
    fetchAnalyticsData()
  }, [selectedPeriod, selectedCampaign])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      const data = await analyticsAPI.getDashboard(selectedPeriod)
      setAnalyticsData(data)
    } catch (error) {
      console.error('Erreur lors du chargement des analytics:', error)
      // Données de démonstration
      setAnalyticsData({
        overview: {
          totalCampaigns: 12,
          activeCampaigns: 8,
          totalAds: 45,
          totalSpent: 15420.50
        },
        metrics: {
          impressions: 234500,
          clicks: 4892,
          conversions: 127,
          ctr: 2.08,
          conversionRate: 2.59,
          budgetUtilization: 78.2,
          averageCpc: 3.15,
          averageCpa: 121.42
        },
        charts: {
          dailyStats: Array.from({ length: 30 }, (_, i) => {
            const date = new Date()
            date.setDate(date.getDate() - (29 - i))
            return {
              date: date.toISOString().split('T')[0],
              impressions: Math.floor(Math.random() * 10000) + 5000,
              clicks: Math.floor(Math.random() * 200) + 100,
              conversions: Math.floor(Math.random() * 10) + 2,
              cost: Math.floor(Math.random() * 500) + 200,
              revenue: Math.floor(Math.random() * 1000) + 500
            }
          }),
          topCampaigns: []
        },
        recentActivities: []
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const params = {
        format,
        campaignId: selectedCampaign !== 'all' ? selectedCampaign : undefined,
        startDate: dateRange.start,
        endDate: dateRange.end
      }
      await analyticsAPI.exportData(params)
      // Normalement ici on téléchargerait le fichier
      alert(`Export ${format.toUpperCase()} en cours...`)
    } catch (error) {
      console.error('Erreur lors de l\'export:', error)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-200 h-96 rounded-lg"></div>
            <div className="bg-gray-200 h-96 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="p-8">
        <div className="text-center">
          <p className="text-gray-500">Impossible de charger les données d'analytics</p>
        </div>
      </div>
    )
  }

  // Configuration des graphiques
  const performanceData = {
    labels: analyticsData.charts.dailyStats.map(d => {
      const date = new Date(d.date)
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
    }),
    datasets: [
      {
        label: 'Impressions',
        data: analyticsData.charts.dailyStats.map(d => d.impressions),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        yAxisID: 'y',
      },
      {
        label: 'Clics',
        data: analyticsData.charts.dailyStats.map(d => d.clicks),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        yAxisID: 'y1',
      },
      {
        label: 'Conversions',
        data: analyticsData.charts.dailyStats.map(d => d.conversions),
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        yAxisID: 'y1',
      }
    ]
  }

  const costRevenueData = {
    labels: analyticsData.charts.dailyStats.map(d => {
      const date = new Date(d.date)
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
    }),
    datasets: [
      {
        label: 'Coût',
        data: analyticsData.charts.dailyStats.map(d => d.cost),
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
      },
      {
        label: 'Revenus',
        data: analyticsData.charts.dailyStats.map(d => d.revenue),
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
      }
    ]
  }

  const conversionFunnelData = {
    labels: ['Impressions', 'Clics', 'Conversions'],
    datasets: [
      {
        data: [
          analyticsData.metrics.impressions,
          analyticsData.metrics.clicks,
          analyticsData.metrics.conversions
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(245, 158, 11, 0.7)'
        ],
        borderWidth: 0,
      }
    ]
  }

  const performanceRadarData = {
    labels: ['CTR', 'Taux de conversion', 'Utilisation budget', 'CPC', 'Qualité annonces'],
    datasets: [
      {
        label: 'Performance',
        data: [
          analyticsData.metrics.ctr * 10, // Normaliser pour le radar
          analyticsData.metrics.conversionRate * 10,
          analyticsData.metrics.budgetUtilization,
          100 - (analyticsData.metrics.averageCpc * 10), // Inverser car moins c'est mieux
          85 // Score fictif de qualité
        ],
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgb(59, 130, 246)',
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(59, 130, 246)'
      }
    ]
  }

  return (
    <div className="p-8">
      <AdvancedAnalytics />
    </div>
  )
} 