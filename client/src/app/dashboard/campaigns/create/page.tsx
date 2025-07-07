'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  TagIcon,
  PhotoIcon,
  DocumentTextIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  GlobeAltIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { campaignsAPI } from '../../../../lib/api'
import { toast } from 'react-hot-toast'

interface CampaignFormData {
  // Informations de base
  name: string
  description: string
  objective: string
  
  // Ciblage
  targetAudience: {
    ageMin: number
    ageMax: number
    genders: string[]
    locations: string[]
    interests: string[]
    languages: string[]
  }
  
  // Budget et planning
  budget: {
    type: 'daily' | 'total'
    amount: number
    daily?: number
    total?: number
    startDate: string
    endDate: string
  }
  
  // Créatifs
  adSets: {
    id: string
    name: string
    headline: string
    description: string
    callToAction: string
    imageUrl?: string
    videoUrl?: string
  }[]
  
  // Suivi
  conversionTracking: {
    enabled: boolean
    pixelId?: string
    conversionEvents: string[]
  }
}

const CAMPAIGN_OBJECTIVES = [
  { id: 'AWARENESS', name: 'Notoriété', description: 'Faire connaître votre marque' },
  { id: 'TRAFFIC', name: 'Trafic', description: 'Diriger les visiteurs vers votre site' },
  { id: 'ENGAGEMENT', name: 'Engagement', description: 'Encourager les interactions' },
  { id: 'LEADS', name: 'Prospects', description: 'Collecter des contacts qualifiés' },
  { id: 'SALES', name: 'Ventes', description: 'Générer des achats directs' },
  { id: 'APP_INSTALLS', name: 'Installations', description: 'Promouvoir votre application' }
]

const CALL_TO_ACTIONS = [
  'En savoir plus', 'Acheter maintenant', 'S\'inscrire', 'Télécharger',
  'Réserver', 'Demander un devis', 'Nous contacter', 'Voir l\'offre'
]

export default function CreateCampaignPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    description: '',
    objective: '',
    targetAudience: {
      ageMin: 18,
      ageMax: 65,
      genders: [],
      locations: ['France'],
      interests: [],
      languages: ['fr']
    },
    budget: {
      type: 'total',
      amount: 1000,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    adSets: [{
      id: '1',
      name: 'Annonce principale',
      headline: '',
      description: '',
      callToAction: 'En savoir plus'
    }],
    conversionTracking: {
      enabled: false,
      conversionEvents: []
    }
  })

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const updateNestedData = (path: string[], value: any) => {
    setFormData(prev => {
      const newData = { ...prev }
      let current = newData as any
      
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]]
      }
      current[path[path.length - 1]] = value
      
      return newData
    })
  }

  const addAdSet = () => {
    const newAdSet = {
      id: Date.now().toString(),
      name: `Annonce ${formData.adSets.length + 1}`,
      headline: '',
      description: '',
      callToAction: 'En savoir plus'
    }
    updateFormData('adSets', [...formData.adSets, newAdSet])
  }

  const removeAdSet = (id: string) => {
    updateFormData('adSets', formData.adSets.filter(ad => ad.id !== id))
  }

  const updateAdSet = (id: string, field: string, value: string) => {
    const updatedAdSets = formData.adSets.map(ad => 
      ad.id === id ? { ...ad, [field]: value } : ad
    )
    updateFormData('adSets', updatedAdSets)
  }

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.name.trim() && formData.objective
      case 2:
        return formData.targetAudience.locations.length > 0
      case 3:
        return formData.budget.amount > 0 && formData.budget.startDate && formData.budget.endDate
      case 4:
        return formData.adSets.every(ad => ad.headline.trim() && ad.description.trim())
      default:
        return true
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return
    
    try {
      setLoading(true)
      
      // Prepare campaign data
      const campaignData = {
        name: formData.name,
        description: formData.description,
        budget: formData.budget.amount,
        startDate: formData.budget.startDate,
        endDate: formData.budget.endDate,
        // Additional campaign data will be handled by extended API
        metadata: {
          objective: formData.objective,
          budgetType: formData.budget.type,
          targeting: formData.targetAudience,
          ads: formData.adSets
        }
      }
      
      // Create campaign via API
      const response = await campaignsAPI.createCampaign(campaignData)
      
      toast.success('Campagne créée avec succès !')
      
      // Redirect to campaigns list or campaign detail
      router.push(`/dashboard/campaigns/${response.campaign.id}`)
      
    } catch (error) {
      console.error('Erreur lors de la création de la campagne:', error)
      toast.error('Erreur lors de la création de la campagne')
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { number: 1, name: 'Informations', icon: DocumentTextIcon },
    { number: 2, name: 'Ciblage', icon: TagIcon },
    { number: 3, name: 'Budget', icon: CurrencyDollarIcon },
    { number: 4, name: 'Créatifs', icon: PhotoIcon },
    { number: 5, name: 'Révision', icon: CheckIcon }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="text-gray-400 hover:text-gray-600"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Créer une campagne</h1>
            </div>
            <div className="text-sm text-gray-500">
              Étape {currentStep} sur {steps.length}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.number
                    ? 'bg-primary-600 border-primary-600 text-white'
                    : 'border-gray-300 text-gray-400'
                }`}>
                  {currentStep > step.number ? (
                    <CheckIcon className="h-6 w-6" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <div className="ml-2 mr-8 hidden sm:block">
                  <div className={`text-sm font-medium ${
                    currentStep >= step.number ? 'text-primary-600' : 'text-gray-400'
                  }`}>
                    {step.name}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 ${
                    currentStep > step.number ? 'bg-primary-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-lg shadow p-8"
        >
          {/* Étape 1: Informations de base */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Informations de base</h2>
                <p className="text-gray-600">Définissez l'identité et l'objectif de votre campagne</p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="form-label">Nom de la campagne *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    className="form-input"
                    placeholder="Ex: Promotion Black Friday 2024"
                  />
                </div>

                <div>
                  <label className="form-label">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => updateFormData('description', e.target.value)}
                    className="form-input"
                    rows={3}
                    placeholder="Décrivez l'objectif et le contenu de votre campagne..."
                  />
                </div>

                <div>
                  <label className="form-label">Objectif de campagne *</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    {CAMPAIGN_OBJECTIVES.map((objective) => (
                      <div
                        key={objective.id}
                        onClick={() => updateFormData('objective', objective.id)}
                        className={`cursor-pointer p-4 border-2 rounded-lg transition-all ${
                          formData.objective === objective.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium text-gray-900">{objective.name}</div>
                        <div className="text-sm text-gray-500">{objective.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Étape 2: Ciblage */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Ciblage de l'audience</h2>
                <p className="text-gray-600">Définissez qui verra vos annonces</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Âge</label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <input
                        type="number"
                        min="13"
                        max="100"
                        value={formData.targetAudience.ageMin}
                        onChange={(e) => updateNestedData(['targetAudience', 'ageMin'], parseInt(e.target.value))}
                        className="form-input"
                        placeholder="Min"
                      />
                    </div>
                    <span className="text-gray-500">à</span>
                    <div className="flex-1">
                      <input
                        type="number"
                        min="13"
                        max="100"
                        value={formData.targetAudience.ageMax}
                        onChange={(e) => updateNestedData(['targetAudience', 'ageMax'], parseInt(e.target.value))}
                        className="form-input"
                        placeholder="Max"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="form-label">Genre</label>
                  <div className="space-y-2">
                    {['Tous', 'Hommes', 'Femmes'].map((gender) => (
                      <label key={gender} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={
                            gender === 'Tous' 
                              ? formData.targetAudience.genders.length === 0
                              : formData.targetAudience.genders.includes(gender.toLowerCase())
                          }
                          onChange={(e) => {
                            if (gender === 'Tous') {
                              updateNestedData(['targetAudience', 'genders'], [])
                            } else {
                              const currentGenders = formData.targetAudience.genders
                              const genderValue = gender.toLowerCase()
                              if (e.target.checked) {
                                updateNestedData(['targetAudience', 'genders'], [...currentGenders, genderValue])
                              } else {
                                updateNestedData(['targetAudience', 'genders'], currentGenders.filter(g => g !== genderValue))
                              }
                            }
                          }}
                          className="form-checkbox"
                        />
                        <span className="ml-2 text-sm text-gray-700">{gender}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="form-label">Localisation</label>
                  <select
                    multiple
                    value={formData.targetAudience.locations}
                    onChange={(e) => {
                      const values = Array.from(e.target.selectedOptions, option => option.value)
                      updateNestedData(['targetAudience', 'locations'], values)
                    }}
                    className="form-select h-32"
                  >
                    <option value="France">France</option>
                    <option value="Belgique">Belgique</option>
                    <option value="Suisse">Suisse</option>
                    <option value="Canada">Canada</option>
                    <option value="Maroc">Maroc</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Maintenez Ctrl/Cmd pour sélectionner plusieurs pays</p>
                </div>

                <div>
                  <label className="form-label">Langues</label>
                  <select
                    multiple
                    value={formData.targetAudience.languages}
                    onChange={(e) => {
                      const values = Array.from(e.target.selectedOptions, option => option.value)
                      updateNestedData(['targetAudience', 'languages'], values)
                    }}
                    className="form-select h-20"
                  >
                    <option value="fr">Français</option>
                    <option value="en">Anglais</option>
                    <option value="es">Espagnol</option>
                    <option value="de">Allemand</option>
                    <option value="ar">Arabe</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Centres d'intérêt (optionnel)</label>
                <input
                  type="text"
                  placeholder="Ex: technologie, mode, cuisine... (séparés par des virgules)"
                  className="form-input"
                  onChange={(e) => {
                    const interests = e.target.value.split(',').map(i => i.trim()).filter(i => i)
                    updateNestedData(['targetAudience', 'interests'], interests)
                  }}
                />
              </div>
            </div>
          )}

          {/* Étape 3: Budget et planning */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Budget et planning</h2>
                <p className="text-gray-600">Définissez votre investissement et la durée de votre campagne</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Type de budget</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="budgetType"
                        value="daily"
                        checked={formData.budget.type === 'daily'}
                        onChange={(e) => updateFormData('budget.type', e.target.value)}
                        className="form-radio"
                      />
                      <span className="ml-2 text-sm text-gray-700">Budget quotidien</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="budgetType"
                        value="total"
                        checked={formData.budget.type === 'total'}
                        onChange={(e) => updateFormData('budget.type', e.target.value)}
                        className="form-radio"
                      />
                      <span className="ml-2 text-sm text-gray-700">Budget total</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="form-label">
                    Montant ({formData.budget.type === 'daily' ? 'par jour' : 'total'}) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      value={formData.budget.amount}
                      onChange={(e) => updateFormData('budget.amount', parseFloat(e.target.value))}
                      className="form-input pl-8"
                      placeholder="1000"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">€</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="form-label">Date de début *</label>
                  <input
                    type="date"
                    value={formData.budget.startDate}
                    onChange={(e) => updateFormData('budget.startDate', e.target.value)}
                    className="form-input"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="form-label">Date de fin *</label>
                  <input
                    type="date"
                    value={formData.budget.endDate}
                    onChange={(e) => updateFormData('budget.endDate', e.target.value)}
                    className="form-input"
                    min={formData.budget.startDate}
                  />
                </div>
              </div>

              {/* Estimation de portée */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Estimation de portée</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-blue-700 font-medium">Portée estimée</div>
                    <div className="text-blue-900">50K - 150K personnes</div>
                  </div>
                  <div>
                    <div className="text-blue-700 font-medium">CPM estimé</div>
                    <div className="text-blue-900">8€ - 15€</div>
                  </div>
                  <div>
                    <div className="text-blue-700 font-medium">Clics estimés</div>
                    <div className="text-blue-900">1K - 3K clics</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Étape 4: Créatifs */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Créatifs publicitaires</h2>
                  <p className="text-gray-600">Créez vos annonces qui seront diffusées</p>
                </div>
                <button
                  onClick={addAdSet}
                  className="btn-secondary"
                >
                  Ajouter une annonce
                </button>
              </div>

              <div className="space-y-6">
                {formData.adSets.map((adSet, index) => (
                  <motion.div
                    key={adSet.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 rounded-lg p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Annonce {index + 1}</h3>
                      {formData.adSets.length > 1 && (
                        <button
                          onClick={() => removeAdSet(adSet.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Supprimer
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">Nom de l'annonce</label>
                        <input
                          type="text"
                          value={adSet.name}
                          onChange={(e) => updateAdSet(adSet.id, 'name', e.target.value)}
                          className="form-input"
                          placeholder="Nom interne de l'annonce"
                        />
                      </div>

                      <div>
                        <label className="form-label">Appel à l'action</label>
                        <select
                          value={adSet.callToAction}
                          onChange={(e) => updateAdSet(adSet.id, 'callToAction', e.target.value)}
                          className="form-select"
                        >
                          {CALL_TO_ACTIONS.map(cta => (
                            <option key={cta} value={cta}>{cta}</option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="form-label">Titre principal *</label>
                        <input
                          type="text"
                          value={adSet.headline}
                          onChange={(e) => updateAdSet(adSet.id, 'headline', e.target.value)}
                          className="form-input"
                          placeholder="Titre accrocheur de votre annonce (max 125 caractères)"
                          maxLength={125}
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          {adSet.headline.length}/125 caractères
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="form-label">Description *</label>
                        <textarea
                          value={adSet.description}
                          onChange={(e) => updateAdSet(adSet.id, 'description', e.target.value)}
                          className="form-input"
                          rows={3}
                          placeholder="Description détaillée de votre offre (max 500 caractères)"
                          maxLength={500}
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          {adSet.description.length}/500 caractères
                        </div>
                      </div>
                    </div>

                    {/* Preview de l'annonce */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-700 mb-2">Aperçu de l'annonce</div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4 max-w-sm">
                        <div className="w-full h-32 bg-gray-200 rounded mb-3 flex items-center justify-center">
                          <PhotoIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="font-semibold text-gray-900 text-sm mb-1">
                          {adSet.headline || 'Titre de votre annonce'}
                        </div>
                        <div className="text-gray-600 text-xs mb-3">
                          {adSet.description || 'Description de votre annonce...'}
                        </div>
                        <button className="bg-primary-600 text-white text-xs px-3 py-1 rounded">
                          {adSet.callToAction}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Étape 5: Révision */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Révision de la campagne</h2>
                <p className="text-gray-600">Vérifiez tous les paramètres avant de lancer votre campagne</p>
              </div>

              <div className="space-y-6">
                {/* Résumé des informations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">Informations générales</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Nom:</span> {formData.name}</div>
                      <div><span className="font-medium">Objectif:</span> {CAMPAIGN_OBJECTIVES.find(o => o.id === formData.objective)?.name}</div>
                      <div><span className="font-medium">Description:</span> {formData.description || 'Aucune'}</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">Budget et planning</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Budget:</span> {formData.budget.amount}€ ({formData.budget.type === 'daily' ? 'quotidien' : 'total'})</div>
                      <div><span className="font-medium">Début:</span> {new Date(formData.budget.startDate).toLocaleDateString('fr-FR')}</div>
                      <div><span className="font-medium">Fin:</span> {new Date(formData.budget.endDate).toLocaleDateString('fr-FR')}</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">Ciblage</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Âge:</span> {formData.targetAudience.ageMin} - {formData.targetAudience.ageMax} ans</div>
                      <div><span className="font-medium">Localisation:</span> {formData.targetAudience.locations.join(', ')}</div>
                      <div><span className="font-medium">Langues:</span> {formData.targetAudience.languages.join(', ')}</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">Créatifs</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Nombre d'annonces:</span> {formData.adSets.length}</div>
                      <div><span className="font-medium">Première annonce:</span> {formData.adSets[0]?.headline}</div>
                    </div>
                  </div>
                </div>

                {/* Options finales */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <input
                      type="checkbox"
                      id="conversionTracking"
                      checked={formData.conversionTracking.enabled}
                      onChange={(e) => updateNestedData(['conversionTracking', 'enabled'], e.target.checked)}
                      className="form-checkbox"
                    />
                    <label htmlFor="conversionTracking" className="font-medium text-blue-900">
                      Activer le suivi des conversions
                    </label>
                  </div>
                  <p className="text-blue-700 text-sm">
                    Recommandé pour mesurer l'efficacité de votre campagne et optimiser les performances.
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Précédent</span>
          </button>

          {currentStep < steps.length ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!validateStep(currentStep)}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <span>Suivant</span>
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || !validateStep(currentStep)}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Création en cours...</span>
                </>
              ) : (
                <>
                  <CheckIcon className="h-4 w-4" />
                  <span>Créer la campagne</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
} 