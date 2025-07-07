'use client'

import React, { useState, useEffect, useCallback } from 'react'

// Types pour le déploiement
type DeploymentStage = 'preparation' | 'build' | 'test' | 'deploy' | 'verification' | 'complete'
type Environment = 'development' | 'staging' | 'production'
type BuildStatus = 'pending' | 'building' | 'success' | 'failed'

interface DeploymentConfig {
  environment: Environment
  buildCommand: string
  testCommand: string
  deployCommand: string
  healthCheckUrl: string
  rollbackEnabled: boolean
}

interface BuildInfo {
  id: string
  timestamp: number
  status: BuildStatus
  duration?: number
  errors?: string[]
  warnings?: string[]
  bundleSize?: {
    total: number
    js: number
    css: number
    images: number
  }
}

interface DeploymentStatus {
  stage: DeploymentStage
  progress: number
  message: string
  buildInfo?: BuildInfo
  errors?: string[]
  warnings?: string[]
}

// Configuration par environnement
const DeploymentConfigs: Record<Environment, DeploymentConfig> = {
  development: {
    environment: 'development',
    buildCommand: 'npm run build',
    testCommand: 'npm run test',
    deployCommand: 'npm run dev',
    healthCheckUrl: 'http://localhost:3000/api/health',
    rollbackEnabled: false
  },
  staging: {
    environment: 'staging',
    buildCommand: 'npm run build:staging',
    testCommand: 'npm run test:staging',
    deployCommand: 'npm run deploy:staging',
    healthCheckUrl: 'https://staging.ads-saas.com/api/health',
    rollbackEnabled: true
  },
  production: {
    environment: 'production',
    buildCommand: 'npm run build:production',
    testCommand: 'npm run test:production',
    deployCommand: 'npm run deploy:production',
    healthCheckUrl: 'https://ads-saas.com/api/health',
    rollbackEnabled: true
  }
}

// Hook pour la gestion du déploiement
export const useDeploymentManager = () => {
  const [currentEnvironment, setCurrentEnvironment] = useState<Environment>('development')
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatus>({
    stage: 'preparation',
    progress: 0,
    message: 'Prêt pour le déploiement'
  })
  const [buildHistory, setBuildHistory] = useState<BuildInfo[]>([])
  const [isDeploying, setIsDeploying] = useState(false)
  
  const config = DeploymentConfigs[currentEnvironment]
  
  // Simuler une étape de déploiement
  const simulateStage = useCallback(async (stage: DeploymentStage, duration: number = 2000) => {
    return new Promise<void>((resolve) => {
      const startTime = Date.now()
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime
        const progress = Math.min((elapsed / duration) * 100, 100)
        
        setDeploymentStatus(prev => ({
          ...prev,
          stage,
          progress,
          message: getStageMessage(stage, progress)
        }))
        
        if (elapsed >= duration) {
          clearInterval(interval)
          resolve()
        }
      }, 100)
    })
  }, [])
  
  const getStageMessage = (stage: DeploymentStage, progress: number): string => {
    const messages = {
      preparation: 'Préparation de l\'environnement...',
      build: `Compilation en cours... ${Math.round(progress)}%`,
      test: `Tests en cours... ${Math.round(progress)}%`,
      deploy: `Déploiement en cours... ${Math.round(progress)}%`,
      verification: 'Vérification du déploiement...',
      complete: 'Déploiement terminé avec succès!'
    }
    return messages[stage]
  }
  
  // Lancer le déploiement
  const startDeployment = useCallback(async () => {
    if (isDeploying) return
    
    setIsDeploying(true)
    setDeploymentStatus({
      stage: 'preparation',
      progress: 0,
      message: 'Démarrage du déploiement...'
    })
    
    try {
      // Étape 1: Préparation
      await simulateStage('preparation', 1000)
      
      // Étape 2: Build
      const buildInfo: BuildInfo = {
        id: `build-${Date.now()}`,
        timestamp: Date.now(),
        status: 'building'
      }
      
      setDeploymentStatus(prev => ({ ...prev, buildInfo }))
      await simulateStage('build', 3000)
      
      // Simuler les résultats du build
      const completedBuild: BuildInfo = {
        ...buildInfo,
        status: 'success',
        duration: 3000,
        bundleSize: {
          total: 2457600,
          js: 1800000,
          css: 450000,
          images: 207600
        },
        warnings: ['Bundle size > 2MB', 'Unused CSS detected']
      }
      
      setBuildHistory(prev => [completedBuild, ...prev.slice(0, 9)])
      setDeploymentStatus(prev => ({ ...prev, buildInfo: completedBuild }))
      
      // Étape 3: Tests
      await simulateStage('test', 2000)
      
      // Étape 4: Déploiement
      await simulateStage('deploy', 4000)
      
      // Étape 5: Vérification
      await simulateStage('verification', 1500)
      
      // Étape 6: Terminé
      setDeploymentStatus({
        stage: 'complete',
        progress: 100,
        message: 'Déploiement terminé avec succès!',
        buildInfo: completedBuild
      })
      
    } catch (error) {
      setDeploymentStatus(prev => ({
        ...prev,
        stage: 'complete',
        progress: 0,
        message: 'Erreur lors du déploiement',
        errors: [error instanceof Error ? error.message : 'Erreur inconnue']
      }))
    } finally {
      setIsDeploying(false)
    }
  }, [isDeploying, simulateStage])
  
  // Rollback
  const rollback = useCallback(async () => {
    if (!config.rollbackEnabled) return
    
    setDeploymentStatus({
      stage: 'preparation',
      progress: 0,
      message: 'Rollback en cours...'
    })
    
    await simulateStage('deploy', 2000)
    
    setDeploymentStatus({
      stage: 'complete',
      progress: 100,
      message: 'Rollback terminé'
    })
  }, [config.rollbackEnabled, simulateStage])
  
  return {
    currentEnvironment,
    setCurrentEnvironment,
    deploymentStatus,
    buildHistory,
    isDeploying,
    startDeployment,
    rollback,
    config
  }
}

// Composant de panneau de déploiement
export const DeploymentPanel: React.FC = () => {
  const {
    currentEnvironment,
    setCurrentEnvironment,
    deploymentStatus,
    buildHistory,
    isDeploying,
    startDeployment,
    rollback,
    config
  } = useDeploymentManager()
  
  const getStageColor = (stage: DeploymentStage) => {
    const colors = {
      preparation: 'bg-blue-500',
      build: 'bg-yellow-500',
      test: 'bg-purple-500',
      deploy: 'bg-orange-500',
      verification: 'bg-indigo-500',
      complete: 'bg-green-500'
    }
    return colors[stage]
  }
  
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
  
  return (
    <div className="fixed top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 w-96 max-h-screen overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4">Gestionnaire de Déploiement</h3>
      
      {/* Sélection d'environnement */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Environnement</label>
        <select
          value={currentEnvironment}
          onChange={(e) => setCurrentEnvironment(e.target.value as Environment)}
          disabled={isDeploying}
          className="w-full px-3 py-2 border rounded-md disabled:opacity-50"
        >
          <option value="development">Développement</option>
          <option value="staging">Staging</option>
          <option value="production">Production</option>
        </select>
      </div>
      
      {/* Statut du déploiement */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Statut</span>
          <span className={`px-2 py-1 rounded text-xs text-white ${getStageColor(deploymentStatus.stage)}`}>
            {deploymentStatus.stage}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getStageColor(deploymentStatus.stage)}`}
            style={{ width: `${deploymentStatus.progress}%` }}
          />
        </div>
        
        <p className="text-sm text-gray-600 mt-2">{deploymentStatus.message}</p>
      </div>
      
      {/* Informations du build */}
      {deploymentStatus.buildInfo && (
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <h4 className="font-medium mb-2">Informations du Build</h4>
          <div className="text-sm space-y-1">
            <div>ID: {deploymentStatus.buildInfo.id}</div>
            <div>Durée: {deploymentStatus.buildInfo.duration}ms</div>
            {deploymentStatus.buildInfo.bundleSize && (
              <div>
                Taille: {formatBytes(deploymentStatus.buildInfo.bundleSize.total)}
                <div className="text-xs text-gray-500 ml-2">
                  JS: {formatBytes(deploymentStatus.buildInfo.bundleSize.js)} | 
                  CSS: {formatBytes(deploymentStatus.buildInfo.bundleSize.css)} | 
                  Images: {formatBytes(deploymentStatus.buildInfo.bundleSize.images)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Boutons d'action */}
      <div className="space-y-2 mb-4">
        <button
          onClick={startDeployment}
          disabled={isDeploying}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isDeploying ? 'Déploiement en cours...' : 'Déployer'}
        </button>
        
        {config.rollbackEnabled && (
          <button
            onClick={rollback}
            disabled={isDeploying}
            className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          >
            Rollback
          </button>
        )}
      </div>
      
      {/* Historique des builds */}
      {buildHistory.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Historique des Builds</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {buildHistory.map((build) => (
              <div key={build.id} className="p-2 bg-gray-50 rounded text-sm">
                <div className="flex justify-between items-center">
                  <span>{build.id}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    build.status === 'success' ? 'bg-green-100 text-green-800' :
                    build.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {build.status}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(build.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Hook pour la vérification de santé
export const useHealthCheck = (url: string) => {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null)
  const [lastCheck, setLastCheck] = useState<number>(0)
  const [responseTime, setResponseTime] = useState<number>(0)
  
  const checkHealth = useCallback(async () => {
    const startTime = Date.now()
    
    try {
      const response = await fetch(url, { method: 'GET' })
      const endTime = Date.now()
      
      setIsHealthy(response.ok)
      setResponseTime(endTime - startTime)
      setLastCheck(endTime)
    } catch (error) {
      setIsHealthy(false)
      setLastCheck(Date.now())
    }
  }, [url])
  
  useEffect(() => {
    checkHealth()
    const interval = setInterval(checkHealth, 30000) // Vérifier toutes les 30 secondes
    
    return () => clearInterval(interval)
  }, [checkHealth])
  
  return {
    isHealthy,
    lastCheck,
    responseTime,
    checkHealth
  }
} 