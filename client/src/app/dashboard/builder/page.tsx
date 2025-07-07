'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { VisualPageBuilder } from '@/lib/visual-page-builder'
import {
  EyeIcon,
  EyeSlashIcon,
  DocumentDuplicateIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  CogIcon,
  PlayIcon,
  StopIcon,
  PaintBrushIcon
} from '@heroicons/react/24/outline'

export default function BuilderPage() {
  const [isBuilderActive, setIsBuilderActive] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [builderMode, setBuilderMode] = useState<'edit' | 'preview' | 'export'>('edit')

  return (
    <div className="h-screen flex flex-col">
      {/* Header du builder */}
      <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-900">Builder de Pages</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Mode:</span>
            <select
              value={builderMode}
              onChange={(e) => setBuilderMode(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="edit">Édition</option>
              <option value="preview">Aperçu</option>
              <option value="export">Export</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Bouton d'aperçu */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center space-x-2 px-3 py-2 rounded text-sm ${
              showPreview 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {showPreview ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
            <span>Aperçu</span>
          </button>

          {/* Bouton de sauvegarde */}
          <button className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600">
            <ArrowDownTrayIcon className="w-4 h-4" />
            <span>Sauvegarder</span>
          </button>

          {/* Bouton d'export */}
          <button className="flex items-center space-x-2 px-3 py-2 bg-purple-500 text-white rounded text-sm hover:bg-purple-600">
            <ArrowUpTrayIcon className="w-4 h-4" />
            <span>Exporter</span>
          </button>

          {/* Bouton de paramètres */}
          <button className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200">
            <CogIcon className="w-4 h-4" />
            <span>Paramètres</span>
          </button>
        </div>
      </div>

      {/* Zone de travail */}
      <div className="flex-1 relative">
        {isBuilderActive ? (
          <VisualPageBuilder />
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-50">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <DocumentDuplicateIcon className="w-12 h-12 text-blue-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Builder de Pages Visuel
              </h2>
              
              <p className="text-gray-600 mb-8 max-w-md">
                Créez et modifiez vos pages web de manière visuelle avec notre éditeur drag & drop avancé.
                Glissez-déposez des composants, personnalisez les styles et prévisualisez en temps réel.
              </p>

              <div className="space-y-4">
                <button
                  onClick={() => setIsBuilderActive(true)}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mx-auto"
                >
                  <PlayIcon className="w-5 h-5" />
                  <span>Lancer le Builder</span>
                </button>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                      <DocumentDuplicateIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Drag & Drop</h3>
                    <p className="text-sm text-gray-600">
                      Glissez-déposez des composants pour créer votre mise en page
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mb-3">
                      <PaintBrushIcon className="w-4 h-4 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Personnalisation</h3>
                    <p className="text-sm text-gray-600">
                      Modifiez les styles, couleurs et propriétés en temps réel
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                      <EyeIcon className="w-4 h-4 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Prévisualisation</h3>
                    <p className="text-sm text-gray-600">
                      Voir le résultat final avant de publier
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Barre d'état */}
      <div className="h-8 bg-gray-100 border-t border-gray-200 flex items-center justify-between px-4 text-xs text-gray-600">
        <div className="flex items-center space-x-4">
          <span>Mode: {builderMode === 'edit' ? 'Édition' : builderMode === 'preview' ? 'Aperçu' : 'Export'}</span>
          <span>Composants: 0</span>
          <span>Zoom: 100%</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <span>Dispositif: Desktop</span>
          <span>Thème: Light</span>
          <span>Dernière sauvegarde: Il y a 2 min</span>
        </div>
      </div>
    </div>
  )
} 