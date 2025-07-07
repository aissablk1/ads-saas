'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  PlusIcon,
  TrashIcon,
  EyeIcon,
  PaintBrushIcon,
  CursorArrowRaysIcon,
  PhotoIcon,
  DocumentTextIcon,
  RectangleStackIcon,
  DocumentDuplicateIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  CogIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

// Types pour le builder
interface ComponentData {
  id: string
  type: string
  props: Record<string, any>
  position: { x: number; y: number }
  size: { width: number; height: number }
  styles: Record<string, any>
}

interface PageData {
  id: string
  name: string
  components: ComponentData[]
}

interface BuilderState {
  currentPage: PageData
  selectedComponent: string | null
  showComponentPanel: boolean
  showStylePanel: boolean
  showLayersPanel: boolean
  history: PageData[]
  historyIndex: number
}

// Composants disponibles (simplifiés)
const AVAILABLE_COMPONENTS = [
  {
    id: 'heading',
    name: 'Titre',
    icon: 'DocumentTextIcon',
    defaultProps: {
      text: 'Nouveau titre',
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#000000'
    }
  },
  {
    id: 'paragraph',
    name: 'Paragraphe',
    icon: 'DocumentTextIcon',
    defaultProps: {
      text: 'Nouveau paragraphe',
      fontSize: '1rem',
      color: '#333333'
    }
  },
  {
    id: 'button',
    name: 'Bouton',
    icon: 'CursorArrowRaysIcon',
    defaultProps: {
      text: 'Cliquez ici',
      backgroundColor: '#3b82f6',
      color: '#ffffff'
    }
  },
  {
    id: 'image',
    name: 'Image',
    icon: 'PhotoIcon',
    defaultProps: {
      src: '/placeholder-image.jpg',
      alt: 'Description de l\'image'
    }
  },
  {
    id: 'container',
    name: 'Conteneur',
    icon: 'RectangleStackIcon',
    defaultProps: {
      backgroundColor: '#f3f4f6',
      padding: 20
    }
  }
]

// Mapping des icônes
const ICON_MAP = {
  DocumentTextIcon,
  CursorArrowRaysIcon,
  PhotoIcon,
  RectangleStackIcon
}

// Hook principal du builder (simplifié)
export const useVisualPageBuilder = () => {
  const [state, setState] = useState<BuilderState>({
    currentPage: {
      id: 'page-1',
      name: 'Page d\'accueil',
      components: []
    },
    selectedComponent: null,
    showComponentPanel: true,
    showStylePanel: false,
    showLayersPanel: false,
    history: [],
    historyIndex: -1
  })

  // Sauvegarder dans l'historique
  const saveToHistory = useCallback((pageData: PageData) => {
    setState(prev => {
      const newHistory = [...prev.history.slice(0, prev.historyIndex + 1), pageData]
      return {
        ...prev,
        history: newHistory,
        historyIndex: newHistory.length - 1
      }
    })
  }, [])

  // Ajouter un composant
  const addComponent = useCallback((componentType: string, position: { x: number; y: number }) => {
    const componentDef = AVAILABLE_COMPONENTS.find(c => c.id === componentType)
    if (!componentDef) return

    const newComponent: ComponentData = {
      id: `component-${Date.now()}`,
      type: componentType,
      props: { ...componentDef.defaultProps },
      position,
      size: { width: 200, height: 100 },
      styles: {}
    }

    setState(prev => {
      const newPage = {
        ...prev.currentPage,
        components: [...prev.currentPage.components, newComponent]
      }
      saveToHistory(newPage)
      return {
        ...prev,
        currentPage: newPage,
        selectedComponent: newComponent.id
      }
    })
  }, [saveToHistory])

  // Supprimer un composant
  const removeComponent = useCallback((componentId: string) => {
    setState(prev => {
      const newPage = {
        ...prev.currentPage,
        components: prev.currentPage.components.filter(c => c.id !== componentId)
      }
      saveToHistory(newPage)
      return {
        ...prev,
        currentPage: newPage,
        selectedComponent: null
      }
    })
  }, [saveToHistory])

  // Mettre à jour un composant
  const updateComponent = useCallback((componentId: string, updates: Partial<ComponentData>) => {
    setState(prev => {
      const newPage = {
        ...prev.currentPage,
        components: prev.currentPage.components.map(c =>
          c.id === componentId ? { ...c, ...updates } : c
        )
      }
      saveToHistory(newPage)
      return {
        ...prev,
        currentPage: newPage
      }
    })
  }, [saveToHistory])

  // Dupliquer un composant
  const duplicateComponent = useCallback((componentId: string) => {
    setState(prev => {
      const component = prev.currentPage.components.find(c => c.id === componentId)
      if (!component) return prev

      const newComponent: ComponentData = {
        ...component,
        id: `component-${Date.now()}`,
        position: {
          x: component.position.x + 20,
          y: component.position.y + 20
        }
      }

      const newPage = {
        ...prev.currentPage,
        components: [...prev.currentPage.components, newComponent]
      }
      saveToHistory(newPage)
      return {
        ...prev,
        currentPage: newPage,
        selectedComponent: newComponent.id
      }
    })
  }, [saveToHistory])

  // Annuler/Rétablir
  const undo = useCallback(() => {
    setState(prev => {
      if (prev.historyIndex > 0) {
        const newIndex = prev.historyIndex - 1
        return {
          ...prev,
          currentPage: prev.history[newIndex],
          historyIndex: newIndex
        }
      }
      return prev
    })
  }, [])

  const redo = useCallback(() => {
    setState(prev => {
      if (prev.historyIndex < prev.history.length - 1) {
        const newIndex = prev.historyIndex + 1
        return {
          ...prev,
          currentPage: prev.history[newIndex],
          historyIndex: newIndex
        }
      }
      return prev
    })
  }, [])

  // Sauvegarder/Charger
  const savePage = useCallback(() => {
    const data = JSON.stringify(state.currentPage)
    localStorage.setItem('visual-builder-page', data)
    alert('Page sauvegardée !')
  }, [state.currentPage])

  const loadPage = useCallback(() => {
    const data = localStorage.getItem('visual-builder-page')
    if (data) {
      const page = JSON.parse(data)
      setState(prev => ({
        ...prev,
        currentPage: page,
        selectedComponent: null
      }))
      alert('Page chargée !')
    } else {
      alert('Aucune page sauvegardée trouvée')
    }
  }, [])

  // Raccourcis clavier simplifiés
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault()
            if (e.shiftKey) redo()
            else undo()
            break
          case 'd':
            e.preventDefault()
            if (state.selectedComponent) {
              duplicateComponent(state.selectedComponent)
            }
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, duplicateComponent, state.selectedComponent])

  return {
    state,
    setState,
    addComponent,
    removeComponent,
    updateComponent,
    duplicateComponent,
    undo,
    redo,
    savePage,
    loadPage,
    AVAILABLE_COMPONENTS
  }
}

// Composant principal du builder
export const VisualPageBuilder: React.FC = () => {
  const {
    state,
    setState,
    addComponent,
    removeComponent,
    updateComponent,
    duplicateComponent,
    undo,
    redo,
    savePage,
    loadPage,
    AVAILABLE_COMPONENTS
  } = useVisualPageBuilder()

  const [showPreview, setShowPreview] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)
  const [dragOver, setDragOver] = useState(false)

  // Gestion du drag & drop
  const handleDragStart = (e: React.DragEvent, componentType: string) => {
    e.dataTransfer.setData('componentType', componentType)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const componentType = e.dataTransfer.getData('componentType')
    if (!componentType || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const position = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }

    addComponent(componentType, position)
  }

  // Rendu des composants
  const renderComponent = (component: ComponentData) => {
    const isSelected = state.selectedComponent === component.id
    const componentDef = AVAILABLE_COMPONENTS.find(c => c.id === component.type)

    const componentStyle = {
      position: 'absolute' as const,
      left: component.position.x,
      top: component.position.y,
      width: component.size.width,
      height: component.size.height,
      ...component.styles,
      border: isSelected ? '2px solid #ef4444' : '1px solid transparent',
      cursor: 'pointer'
    }

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation()
      setState(prev => ({ ...prev, selectedComponent: component.id }))
    }

    return (
      <motion.div
        key={component.id}
        style={componentStyle}
        onClick={handleClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`bg-white rounded shadow-sm transition-all duration-200 ${isSelected ? 'ring-2 ring-red-400' : ''}`}
        drag
        dragMomentum={false}
        dragElastic={0}
        onDragEnd={(e, info) => {
          const newPosition = {
            x: component.position.x + info.offset.x,
            y: component.position.y + info.offset.y
          }
          updateComponent(component.id, { position: newPosition })
        }}
      >
        {/* Contenu du composant selon son type */}
        {component.type === 'heading' && (
          <div className="p-2">
            <h1 style={{ 
              fontSize: component.props.fontSize || '2rem', 
              color: component.props.color || '#000000', 
              fontWeight: component.props.fontWeight || 'bold',
              margin: 0,
              padding: 0
            }}>
              {component.props.text || 'Nouveau titre'}
            </h1>
          </div>
        )}

        {component.type === 'paragraph' && (
          <div className="p-2">
            <p style={{ 
              fontSize: component.props.fontSize || '1rem', 
              color: component.props.color || '#333333', 
              margin: 0,
              padding: 0
            }}>
              {component.props.text || 'Nouveau paragraphe'}
            </p>
          </div>
        )}

        {component.type === 'button' && (
          <div className="p-2">
            <button 
              className="px-4 py-2 rounded transition-colors hover:opacity-80" 
              style={{ 
                background: component.props.backgroundColor || '#3b82f6',
                color: component.props.color || '#ffffff'
              }}
            >
              {component.props.text || 'Bouton'}
            </button>
          </div>
        )}

        {component.type === 'image' && (
          <div className="p-2">
            <img
              src={component.props.src}
              alt={component.props.alt}
              className="w-full h-full object-cover rounded"
            />
          </div>
        )}

        {component.type === 'container' && (
          <div className="p-2 border-2 border-dashed border-gray-300">
            <div className="text-gray-500 text-sm">Conteneur</div>
          </div>
        )}

        {/* Contrôles de sélection */}
        {isSelected && (
          <div className="absolute -top-8 left-0 bg-red-500 text-white px-2 py-1 rounded text-xs">
            {componentDef?.name}
          </div>
        )}
      </motion.div>
    )
  }

  return (
    <div className="h-full flex bg-gray-100 relative">
      {/* Barre d'outils */}
      <div className="w-16 bg-gray-800 border-r border-gray-700 flex flex-col items-center py-4 space-y-4">
        <button
          onClick={() => setShowPreview(true)}
          className="p-2 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white"
          title="Aperçu"
        >
          <div className="w-5 h-5 bg-current" />
        </button>

        <button
          onClick={() => setState(prev => ({ ...prev, showComponentPanel: !prev.showComponentPanel }))}
          className={`p-2 rounded ${state.showComponentPanel ? 'bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white'}`}
          title="Composants"
        >
          <div className="w-5 h-5">
            <PlusIcon />
          </div>
        </button>

        <button
          onClick={() => setState(prev => ({ ...prev, showStylePanel: !prev.showStylePanel }))}
          className={`p-2 rounded ${state.showStylePanel ? 'bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white'}`}
          title="Styles"
        >
          <div className="w-5 h-5">
            <PaintBrushIcon />
          </div>
        </button>

        <button
          onClick={() => setState(prev => ({ ...prev, showLayersPanel: !prev.showLayersPanel }))}
          className={`p-2 rounded ${state.showLayersPanel ? 'bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white'}`}
          title="Calques"
        >
          <div className="w-5 h-5">
            <RectangleStackIcon />
          </div>
        </button>
      </div>

      {/* Panneau des composants */}
      {state.showComponentPanel && (
        <div className="w-64 bg-gray-800 border-r border-gray-700 p-4">
          <h3 className="font-semibold mb-4 text-white">Composants</h3>
          <div className="space-y-2">
            {AVAILABLE_COMPONENTS.map(component => (
              <div
                key={component.id}
                draggable
                onDragStart={(e) => handleDragStart(e, component.id)}
                className="flex items-center p-2 border border-gray-600 rounded cursor-move hover:bg-gray-700 text-gray-300 hover:text-white"
              >
                <div className="mr-2 text-gray-400 w-4 h-4">
                  {React.createElement(ICON_MAP[component.icon as keyof typeof ICON_MAP])}
                </div>
                <span className="text-sm">{component.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Zone de travail principale */}
      <div className="flex-1 flex flex-col">
        {/* Barre d'outils supérieure */}
        <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center px-4 space-x-4">
          <div className="flex space-x-2">
            <button
              onClick={undo}
              className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded flex items-center space-x-1"
              title="Annuler (Ctrl+Z)"
            >
              <div className="w-3 h-3">
                <ArrowPathIcon />
              </div>
              <span>Annuler</span>
            </button>
            <button
              onClick={redo}
              className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded flex items-center space-x-1"
              title="Rétablir (Ctrl+Shift+Z)"
            >
              <div className="w-3 h-3 rotate-180">
                <ArrowPathIcon />
              </div>
              <span>Rétablir</span>
            </button>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={savePage}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              Sauvegarder
            </button>
            <button
              onClick={loadPage}
              className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Charger
            </button>
          </div>
        </div>

        {/* Zone de dessin */}
        <div className="flex-1 flex items-center justify-center p-8 relative">
          <div
            ref={canvasRef}
            className="w-full max-w-6xl h-96 bg-white shadow-lg relative border border-gray-200 overflow-hidden"
            style={{ 
              position: 'relative',
              backgroundImage: 'linear-gradient(90deg, #f3f4f6 1px, transparent 1px), linear-gradient(180deg, #f3f4f6 1px, transparent 1px)', 
              backgroundSize: '32px 32px' 
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => setState(prev => ({ ...prev, selectedComponent: null }))}
          >
            {dragOver && (
              <div className="absolute inset-0 bg-blue-100 border-2 border-dashed border-blue-500 flex items-center justify-center">
                <span className="text-blue-600 font-medium">Déposez le composant ici</span>
              </div>
            )}

            {state.currentPage.components.map(renderComponent)}
          </div>
        </div>
      </div>

      {/* Panneau des propriétés */}
      {state.showStylePanel && state.selectedComponent && (
        <div className="w-80 bg-gray-800 border-l border-gray-700 p-4">
          <h3 className="font-semibold mb-4 text-white">Propriétés</h3>
          <ComponentPropertiesPanel
            component={state.currentPage.components.find(c => c.id === state.selectedComponent)!}
            onUpdate={(updates) => updateComponent(state.selectedComponent!, updates)}
            onDelete={() => removeComponent(state.selectedComponent!)}
            onDuplicate={() => duplicateComponent(state.selectedComponent!)}
          />
        </div>
      )}

      {/* Panneau des calques */}
      {state.showLayersPanel && (
        <div className="w-64 bg-gray-800 border-l border-gray-700 p-4">
          <h3 className="font-semibold mb-4 text-white">Calques</h3>
          <LayersPanel
            components={state.currentPage.components}
            selectedComponent={state.selectedComponent}
            onSelect={(id) => setState(prev => ({ ...prev, selectedComponent: id }))}
            onDelete={removeComponent}
            onDuplicate={duplicateComponent}
          />
        </div>
      )}

      {/* Prévisualisation simple */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Aperçu de la page</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <div className="w-6 h-6">
                  <XMarkIcon />
                </div>
              </button>
            </div>
            <div className="bg-white border rounded p-4">
              {state.currentPage.components.map(component => {
                const componentDef = AVAILABLE_COMPONENTS.find(c => c.id === component.type)
                return (
                  <div key={component.id} className="mb-4">
                    <h3 className="font-medium text-sm text-gray-600 mb-2">{componentDef?.name}</h3>
                    <div className="p-2 border rounded">
                      {component.type === 'heading' && (
                        <h1 style={{ fontSize: component.props.fontSize, color: component.props.color }}>
                          {component.props.text}
                        </h1>
                      )}
                      {component.type === 'paragraph' && (
                        <p style={{ fontSize: component.props.fontSize, color: component.props.color }}>
                          {component.props.text}
                        </p>
                      )}
                      {component.type === 'button' && (
                        <button 
                          style={{ 
                            background: component.props.backgroundColor,
                            color: component.props.color 
                          }}
                          className="px-4 py-2 rounded"
                        >
                          {component.props.text}
                        </button>
                      )}
                      {component.type === 'image' && (
                        <img src={component.props.src} alt={component.props.alt} className="max-w-full h-auto" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Composant pour les propriétés (simplifié)
const ComponentPropertiesPanel: React.FC<{
  component: ComponentData
  onUpdate: (updates: Partial<ComponentData>) => void
  onDelete: () => void
  onDuplicate: () => void
}> = ({ component, onUpdate, onDelete, onDuplicate }) => {
  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <button
          onClick={onDuplicate}
          className="flex-1 px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded"
        >
          Dupliquer
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
        >
          <div className="w-4 h-4">
            <TrashIcon />
          </div>
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-gray-300">Position</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            value={component.position.x}
            onChange={(e) => onUpdate({
              position: { ...component.position, x: Number(e.target.value) }
            })}
            className="px-2 py-1 text-sm border border-gray-600 bg-gray-700 text-gray-300 rounded"
            placeholder="X"
          />
          <input
            type="number"
            value={component.position.y}
            onChange={(e) => onUpdate({
              position: { ...component.position, y: Number(e.target.value) }
            })}
            className="px-2 py-1 text-sm border border-gray-600 bg-gray-700 text-gray-300 rounded"
            placeholder="Y"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-gray-300">Taille</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            value={component.size.width}
            onChange={(e) => onUpdate({
              size: { ...component.size, width: Number(e.target.value) }
            })}
            className="px-2 py-1 text-sm border border-gray-600 bg-gray-700 text-gray-300 rounded"
            placeholder="Largeur"
          />
          <input
            type="number"
            value={component.size.height}
            onChange={(e) => onUpdate({
              size: { ...component.size, height: Number(e.target.value) }
            })}
            className="px-2 py-1 text-sm border border-gray-600 bg-gray-700 text-gray-300 rounded"
            placeholder="Hauteur"
          />
        </div>
      </div>

      {/* Propriétés spécifiques au type de composant */}
      {(component.type === 'heading' || component.type === 'paragraph') && (
        <div className="space-y-2">
          <label className="block text-sm font-medium mb-2 text-gray-300">Texte</label>
          <textarea
            value={component.props.text}
            onChange={(e) => onUpdate({
              props: { ...component.props, text: e.target.value }
            })}
            className="w-full px-2 py-1 text-sm border border-gray-600 bg-gray-700 text-gray-300 rounded mb-2"
            rows={component.type === 'heading' ? 1 : 3}
          />
          <div className="flex items-center space-x-2 mb-2">
            <label className="text-xs text-gray-300">Taille</label>
            <input
              type="number"
              value={parseInt(component.props.fontSize) || (component.type === 'heading' ? 32 : 16)}
              min={8}
              max={96}
              onChange={e => onUpdate({ props: { ...component.props, fontSize: e.target.value + 'px' } })}
              className="w-16 px-1 py-1 text-xs border border-gray-600 bg-gray-700 text-gray-300 rounded"
            />
            <label className="text-xs text-gray-300">Couleur</label>
            <input
              type="color"
              value={component.props.color || '#000000'}
              onChange={e => onUpdate({ props: { ...component.props, color: e.target.value } })}
              className="w-8 h-8 border border-gray-600 rounded"
            />
          </div>
        </div>
      )}

      {/* Propriétés pour les boutons */}
      {component.type === 'button' && (
        <div className="space-y-2">
          <label className="block text-sm font-medium mb-2 text-gray-300">Texte du bouton</label>
          <input
            type="text"
            value={component.props.text}
            onChange={(e) => onUpdate({
              props: { ...component.props, text: e.target.value }
            })}
            className="w-full px-2 py-1 text-sm border border-gray-600 bg-gray-700 text-gray-300 rounded"
          />
          <div className="flex items-center space-x-2 mb-2">
            <label className="text-xs text-gray-300">Couleur de fond</label>
            <input
              type="color"
              value={component.props.backgroundColor || '#3b82f6'}
              onChange={e => onUpdate({ props: { ...component.props, backgroundColor: e.target.value } })}
              className="w-8 h-8 border border-gray-600 rounded"
            />
            <label className="text-xs text-gray-300">Couleur du texte</label>
            <input
              type="color"
              value={component.props.color || '#ffffff'}
              onChange={e => onUpdate({ props: { ...component.props, color: e.target.value } })}
              className="w-8 h-8 border border-gray-600 rounded"
            />
          </div>
        </div>
      )}

      {/* Propriétés pour les images */}
      {component.type === 'image' && (
        <div className="space-y-2">
          <label className="block text-sm font-medium mb-2 text-gray-300">URL de l'image</label>
          <input
            type="text"
            value={component.props.src}
            onChange={(e) => onUpdate({
              props: { ...component.props, src: e.target.value }
            })}
            className="w-full px-2 py-1 text-sm border border-gray-600 bg-gray-700 text-gray-300 rounded"
            placeholder="https://..."
          />
          <label className="block text-sm font-medium mb-2 text-gray-300">Texte alternatif</label>
          <input
            type="text"
            value={component.props.alt}
            onChange={(e) => onUpdate({
              props: { ...component.props, alt: e.target.value }
            })}
            className="w-full px-2 py-1 text-sm border border-gray-600 bg-gray-700 text-gray-300 rounded"
            placeholder="Description de l'image"
          />
        </div>
      )}
    </div>
  )
}

// Composant pour les calques (simplifié)
const LayersPanel: React.FC<{
  components: ComponentData[]
  selectedComponent: string | null
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
}> = ({ components, selectedComponent, onSelect, onDelete, onDuplicate }) => {
  return (
    <div className="space-y-2">
      {components.map(component => {
        const componentDef = AVAILABLE_COMPONENTS.find(c => c.id === component.type)
        const isSelected = selectedComponent === component.id

        return (
          <div
            key={component.id}
            className={`p-2 border rounded cursor-pointer ${
              isSelected ? 'border-red-500 bg-red-900/20' : 'border-gray-600 hover:bg-gray-700'
            }`}
            onClick={() => onSelect(component.id)}
          >
                          <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {componentDef?.icon && (
                    <div className="w-4 h-4 text-gray-400">
                      {React.createElement(ICON_MAP[componentDef.icon as keyof typeof ICON_MAP])}
                    </div>
                  )}
                  <span className="text-sm text-gray-300">{componentDef?.name}</span>
                </div>
              <div className="flex space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDuplicate(component.id)
                  }}
                  className="p-1 text-gray-400 hover:text-gray-300"
                >
                  <div className="w-3 h-3">
                    <DocumentDuplicateIcon />
                  </div>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(component.id)
                  }}
                  className="p-1 text-gray-400 hover:text-red-400"
                >
                  <div className="w-3 h-3">
                    <TrashIcon />
                  </div>
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
} 