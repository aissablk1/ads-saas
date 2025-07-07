'use client'

import React, { useState, useEffect } from 'react'
import { OptimizedTransition, usePerformanceOptimizer, useTransitionOptimizer } from './optimized-transitions'
import { UserTestingPanel, usePerformanceTesting, useUsabilityTesting, useAccessibilityTesting } from './user-testing'
import { DeploymentPanel, useDeploymentManager, useHealthCheck } from './deployment-manager'
import { useSectionScroll } from './parallax-effect'

// Composant de test pour la Phase 3
export const TestPhase3: React.FC = () => {
  const [activePanel, setActivePanel] = useState<'performance' | 'testing' | 'deployment' | 'all'>('all')
  const [showPanels, setShowPanels] = useState(true)
  
  // Hooks pour les tests
  const performanceTest = usePerformanceTesting()
  const usabilityTest = useUsabilityTesting()
  const accessibilityTest = useAccessibilityTesting()
  const deploymentManager = useDeploymentManager()
  const healthCheck = useHealthCheck('http://localhost:3000/api/health')
  
  // État pour les transitions optimisées
  const [visibleSections, setVisibleSections] = useState<boolean[]>([true, false, false, false])
  const [transitionType, setTransitionType] = useState<'fade' | 'slide' | 'scale'>('fade')
  const [userMode, setUserMode] = useState<'exploration' | 'efficiency' | 'accessibility'>('exploration')
  
  // Sections de test
  const sections = [
    {
      id: 'performance',
      title: 'Tests de Performance',
      content: 'Optimisation des transitions et gestion de la mémoire',
      color: 'bg-blue-500'
    },
    {
      id: 'usability',
      title: 'Tests Utilisateurs',
      content: 'Enregistrement des interactions et analyse comportementale',
      color: 'bg-green-500'
    },
    {
      id: 'deployment',
      title: 'Gestion du Déploiement',
      content: 'Pipeline de déploiement automatisé avec rollback',
      color: 'bg-purple-500'
    },
    {
      id: 'integration',
      title: 'Intégration Complète',
      content: 'Toutes les fonctionnalités de la Phase 3 intégrées',
      color: 'bg-orange-500'
    }
  ]
  
  // Fonction pour basculer la visibilité des sections
  const toggleSection = (index: number) => {
    setVisibleSections(prev => {
      const newSections = [...prev]
      newSections[index] = !newSections[index]
      return newSections
    })
  }
  
  // Fonction pour lancer tous les tests
  const runAllTests = async () => {
    // Test de performance
    performanceTest.startTest()
    
    // Test d'utilisabilité
    usabilityTest.startSession()
    
    // Test d'accessibilité
    accessibilityTest.scanAccessibility()
    
    // Attendre 5 secondes puis arrêter les tests
    setTimeout(() => {
      performanceTest.stopTest()
      usabilityTest.stopSession()
    }, 5000)
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold mb-2">Phase 3 - Tests & Déploiement</h1>
          <p className="text-gray-300">
            Optimisation des performances, tests utilisateurs automatisés et gestion du déploiement
          </p>
        </div>
      </div>
      
      {/* Contrôles principaux */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Panneau de contrôle */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h2 className="text-xl font-semibold mb-4">Contrôles</h2>
            
            {/* Sélection de panneau */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Panneau actif</label>
              <select
                value={activePanel}
                onChange={(e) => setActivePanel(e.target.value as any)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
              >
                <option value="all">Tous les panneaux</option>
                <option value="performance">Performance uniquement</option>
                <option value="testing">Tests utilisateurs uniquement</option>
                <option value="deployment">Déploiement uniquement</option>
              </select>
            </div>
            
            {/* Mode utilisateur */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Mode utilisateur</label>
              <select
                value={userMode}
                onChange={(e) => setUserMode(e.target.value as any)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
              >
                <option value="exploration">Exploration</option>
                <option value="efficiency">Efficacité</option>
                <option value="accessibility">Accessibilité</option>
              </select>
            </div>
            
            {/* Type de transition */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Type de transition</label>
              <select
                value={transitionType}
                onChange={(e) => setTransitionType(e.target.value as any)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
              >
                <option value="fade">Fondu</option>
                <option value="slide">Glissement</option>
                <option value="scale">Échelle</option>
              </select>
            </div>
            
            {/* Boutons d'action */}
            <div className="space-y-2">
              <button
                onClick={runAllTests}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-medium"
              >
                Lancer tous les tests
              </button>
              
              <button
                onClick={() => setShowPanels(!showPanels)}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium"
              >
                {showPanels ? 'Masquer' : 'Afficher'} les panneaux
              </button>
            </div>
          </div>
          
          {/* Statut des services */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h2 className="text-xl font-semibold mb-4">Statut des Services</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Performance Test</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  performanceTest.isRunning ? 'bg-yellow-500' : 'bg-gray-500'
                }`}>
                  {performanceTest.isRunning ? 'En cours' : 'Arrêté'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Usability Test</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  usabilityTest.isRecording ? 'bg-green-500' : 'bg-gray-500'
                }`}>
                  {usabilityTest.isRecording ? 'Enregistrement' : 'Arrêté'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Accessibility Test</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  accessibilityTest.isScanning ? 'bg-purple-500' : 'bg-gray-500'
                }`}>
                  {accessibilityTest.isScanning ? 'Scan en cours' : 'Terminé'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Health Check</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  healthCheck.isHealthy ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {healthCheck.isHealthy ? 'OK' : 'Erreur'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Deployment</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  deploymentManager.isDeploying ? 'bg-orange-500' : 'bg-gray-500'
                }`}>
                  {deploymentManager.isDeploying ? 'En cours' : 'Prêt'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sections avec transitions optimisées */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {sections.map((section, index) => (
            <OptimizedTransition
              key={section.id}
              isVisible={visibleSections[index]}
              type={transitionType}
              direction="up"
              userMode={userMode}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 hover:bg-white/15 transition-colors cursor-pointer"
              onClick={() => toggleSection(index)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{section.title}</h3>
                <div className={`w-4 h-4 rounded-full ${section.color}`} />
              </div>
              <p className="text-gray-300 mb-4">{section.content}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleSection(index)
                }}
                className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-sm"
              >
                {visibleSections[index] ? 'Masquer' : 'Afficher'}
              </button>
            </OptimizedTransition>
          ))}
        </div>
        
        {/* Métriques de performance */}
        {performanceTest.metrics.length > 0 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 mb-8">
            <h2 className="text-xl font-semibold mb-4">Métriques de Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {performanceTest.metrics.map((metric, index) => (
                <div key={index} className="bg-white/5 rounded p-4">
                  <div className="text-sm text-gray-300">{metric.name}</div>
                  <div className={`text-2xl font-bold ${
                    metric.result === 'pass' ? 'text-green-400' :
                    metric.result === 'warning' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {metric.value} {metric.unit}
                  </div>
                  <div className="text-xs text-gray-400">
                    Seuil: {metric.threshold} {metric.unit}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Résultats des tests d'accessibilité */}
        {accessibilityTest.accessibilityIssues.length > 0 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 mb-8">
            <h2 className="text-xl font-semibold mb-4">Problèmes d'Accessibilité</h2>
            <div className="space-y-2">
              {accessibilityTest.accessibilityIssues.map((issue, index) => (
                <div key={index} className="flex items-center space-x-2 text-red-300">
                  <span>⚠️</span>
                  <span>{issue}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Panneaux flottants */}
      {showPanels && (
        <>
          {activePanel === 'all' || activePanel === 'testing' ? (
            <UserTestingPanel />
          ) : null}
          
          {activePanel === 'all' || activePanel === 'deployment' ? (
            <DeploymentPanel />
          ) : null}
        </>
      )}
    </div>
  )
} 