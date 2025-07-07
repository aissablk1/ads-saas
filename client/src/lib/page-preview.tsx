'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  EyeIcon,
  EyeSlashIcon,
  DevicePhoneMobileIcon,
  DeviceTabletIcon,
  ComputerDesktopIcon,
  XMarkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

interface ComponentData {
  id: string
  type: string
  props: Record<string, any>
  children?: ComponentData[]
  position: { x: number; y: number }
  size: { width: number; height: number }
  styles: Record<string, any>
  content?: string
}

interface PageData {
  id: string
  name: string
  components: ComponentData[]
  layout: 'desktop' | 'tablet' | 'mobile'
  theme: 'light' | 'dark' | 'auto'
}

interface PagePreviewProps {
  pageData: PageData
  isOpen: boolean
  onClose: () => void
  isLivePreview?: boolean
}

export const PagePreview: React.FC<PagePreviewProps> = ({
  pageData,
  isOpen,
  onClose,
  isLivePreview = false
}) => {
  const [previewLayout, setPreviewLayout] = useState<'desktop' | 'tablet' | 'mobile'>(pageData.layout)
  const [previewTheme, setPreviewTheme] = useState<'light' | 'dark'>(pageData.theme === 'auto' ? 'light' : pageData.theme)
  const [isLoading, setIsLoading] = useState(false)

  // Générer les styles CSS pour la prévisualisation
  const generatePreviewCSS = (): string => {
    let css = `
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        background-color: ${previewTheme === 'dark' ? '#1f2937' : '#ffffff'};
        color: ${previewTheme === 'dark' ? '#f9fafb' : '#111827'};
      }
      .preview-container { 
        position: relative; 
        min-height: 100vh;
        background-color: ${previewTheme === 'dark' ? '#1f2937' : '#ffffff'};
      }
    `

    pageData.components.forEach(component => {
      const className = `component-${component.id}`
      css += `
        .${className} {
          position: absolute;
          left: ${component.position.x}px;
          top: ${component.position.y}px;
          width: ${component.size.width}px;
          height: ${component.size.height}px;
      `

      // Styles spécifiques au composant
      Object.entries(component.styles).forEach(([property, value]) => {
        css += `          ${property}: ${value};\n`
      })

      css += `        }\n`

      // Styles spécifiques au type de composant
      switch (component.type) {
        case 'heading':
          css += `
            .${className} h1 {
              font-size: ${component.props.fontSize || '2rem'};
              color: ${component.props.color || (previewTheme === 'dark' ? '#f9fafb' : '#000000')};
              font-weight: ${component.props.fontWeight || 'bold'};
              text-align: ${component.props.align || 'left'};
              margin: 0;
            }
          `
          break

        case 'paragraph':
          css += `
            .${className} p {
              font-size: ${component.props.fontSize || '1rem'};
              color: ${component.props.color || (previewTheme === 'dark' ? '#d1d5db' : '#333333')};
              line-height: ${component.props.lineHeight || '1.6'};
              text-align: ${component.props.align || 'left'};
              margin: 0;
            }
          `
          break

        case 'button':
          css += `
            .${className} button {
              padding: 8px 16px;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-size: 14px;
              transition: all 0.2s;
              background-color: ${component.props.variant === 'primary' ? '#3b82f6' : '#6b7280'};
              color: white;
              font-weight: 500;
            }
            .${className} button:hover {
              background-color: ${component.props.variant === 'primary' ? '#2563eb' : '#4b5563'};
              transform: translateY(-1px);
            }
            .${className} button:active {
              transform: translateY(0);
            }
          `
          break

        case 'image':
          css += `
            .${className} img {
              width: 100%;
              height: 100%;
              object-fit: ${component.props.objectFit || 'cover'};
              border-radius: ${component.props.borderRadius || 0}px;
              display: block;
            }
          `
          break

        case 'video':
          css += `
            .${className} video {
              width: 100%;
              height: 100%;
              object-fit: cover;
              border-radius: ${component.props.borderRadius || 0}px;
            }
          `
          break

        case 'container':
          css += `
            .${className} {
              padding: ${component.props.padding || 20}px;
              background-color: ${component.props.backgroundColor || 'transparent'};
              border-radius: ${component.props.borderRadius || 0}px;
              border: ${component.props.border || 'none'};
            }
          `
          break

        case 'grid':
          css += `
            .${className} {
              display: grid;
              grid-template-columns: repeat(${component.props.columns || 2}, 1fr);
              gap: ${component.props.gap || 20}px;
              padding: ${component.props.padding || 20}px;
              background-color: ${component.props.backgroundColor || 'transparent'};
            }
          `
          break

        case 'card':
          css += `
            .${className} {
              background-color: ${component.props.backgroundColor || (previewTheme === 'dark' ? '#374151' : '#ffffff')};
              border-radius: ${component.props.borderRadius || 8}px;
              padding: ${component.props.padding || 20}px;
              box-shadow: ${component.props.shadow || '0 2px 4px rgba(0,0,0,0.1)'};
              border: 1px solid ${previewTheme === 'dark' ? '#4b5563' : '#e5e7eb'};
            }
            .${className} h3 {
              font-size: 1.25rem;
              font-weight: 600;
              margin-bottom: 0.5rem;
              color: ${previewTheme === 'dark' ? '#f9fafb' : '#111827'};
            }
            .${className} p {
              color: ${previewTheme === 'dark' ? '#d1d5db' : '#6b7280'};
              line-height: 1.5;
            }
          `
          break

        case 'form':
          css += `
            .${className} form {
              background-color: ${component.props.backgroundColor || (previewTheme === 'dark' ? '#374151' : '#ffffff')};
              padding: ${component.props.padding || 20}px;
              border-radius: 8px;
              border: 1px solid ${previewTheme === 'dark' ? '#4b5563' : '#e5e7eb'};
            }
            .${className} .form-field {
              margin-bottom: 1rem;
            }
            .${className} label {
              display: block;
              margin-bottom: 0.5rem;
              font-weight: 500;
              color: ${previewTheme === 'dark' ? '#f9fafb' : '#374151'};
            }
            .${className} input {
              width: 100%;
              padding: 0.5rem;
              border: 1px solid ${previewTheme === 'dark' ? '#4b5563' : '#d1d5db'};
              border-radius: 4px;
              background-color: ${previewTheme === 'dark' ? '#1f2937' : '#ffffff'};
              color: ${previewTheme === 'dark' ? '#f9fafb' : '#111827'};
            }
            .${className} input:focus {
              outline: none;
              border-color: #3b82f6;
              box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            .${className} button[type="submit"] {
              background-color: #3b82f6;
              color: white;
              padding: 0.5rem 1rem;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-weight: 500;
            }
            .${className} button[type="submit"]:hover {
              background-color: #2563eb;
            }
          `
          break
      }
    })

    // CSS responsive
    css += `
      @media (max-width: 768px) {
        .preview-container {
          padding: 1rem;
        }
    `

    pageData.components.forEach(component => {
      const className = `component-${component.id}`
      css += `
        .${className} {
          position: relative !important;
          left: auto !important;
          top: auto !important;
          width: 100% !important;
          margin-bottom: 1rem;
        }
      `
    })

    css += `}`

    return css
  }

  // Rendre un composant pour la prévisualisation
  const renderComponent = (component: ComponentData) => {
    const className = `component-${component.id}`

    switch (component.type) {
      case 'heading':
        return (
          <div key={component.id} className={className}>
            <h1>{component.props.text || 'Titre'}</h1>
          </div>
        )

      case 'paragraph':
        return (
          <div key={component.id} className={className}>
            <p>{component.props.text || 'Paragraphe'}</p>
          </div>
        )

      case 'button':
        return (
          <div key={component.id} className={className}>
            <button onClick={() => console.log('Bouton cliqué:', component.id)}>
              {component.props.text || 'Bouton'}
            </button>
          </div>
        )

      case 'image':
        return (
          <div key={component.id} className={className}>
            <img
              src={component.props.src || '/placeholder-image.jpg'}
              alt={component.props.alt || 'Image'}
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzliOWE5YiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg=='
              }}
            />
          </div>
        )

      case 'video':
        return (
          <div key={component.id} className={className}>
            <video
              src={component.props.src || ''}
              poster={component.props.poster || ''}
              controls={component.props.controls}
              autoPlay={component.props.autoplay}
              loop={component.props.loop}
              muted={component.props.muted}
            />
          </div>
        )

      case 'container':
        return (
          <div key={component.id} className={className}>
            <div className="container-content">
              {component.children?.map(renderComponent)}
            </div>
          </div>
        )

      case 'grid':
        return (
          <div key={component.id} className={className}>
            <div className="grid-content">
              {component.children?.map(renderComponent)}
            </div>
          </div>
        )

      case 'card':
        return (
          <div key={component.id} className={className}>
            <h3>{component.props.title || 'Titre de la carte'}</h3>
            <p>{component.props.content || 'Contenu de la carte'}</p>
          </div>
        )

      case 'form':
        return (
          <div key={component.id} className={className}>
            <form onSubmit={(e) => {
              e.preventDefault()
              console.log('Formulaire soumis:', component.id)
            }}>
              {component.props.fields?.map((field: any, index: number) => (
                <div key={index} className="form-field">
                  <label>{field.label}</label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                </div>
              ))}
              <button type="submit">{component.props.submitText || 'Envoyer'}</button>
            </form>
          </div>
        )

      default:
        return (
          <div key={component.id} className={className}>
            {/* Composant non reconnu */}
          </div>
        )
    }
  }

  // Recharger la prévisualisation
  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 500)
  }

  // Obtenir la largeur du conteneur selon le layout
  const getContainerWidth = () => {
    switch (previewLayout) {
      case 'mobile':
        return 'w-80'
      case 'tablet':
        return 'w-96'
      case 'desktop':
        return 'w-full max-w-4xl'
      default:
        return 'w-full max-w-4xl'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Prévisualisation - {pageData.name}
                </h2>
                {isLivePreview && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Temps réel
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {/* Contrôles de layout */}
                <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  {(['desktop', 'tablet', 'mobile'] as const).map(device => (
                    <button
                      key={device}
                      onClick={() => setPreviewLayout(device)}
                      className={`p-2 rounded ${
                        previewLayout === device
                          ? 'bg-white dark:bg-gray-600 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      title={device === 'desktop' ? 'Desktop' : device === 'tablet' ? 'Tablet' : 'Mobile'}
                    >
                      {device === 'desktop' && <ComputerDesktopIcon className="w-4 h-4" />}
                      {device === 'tablet' && <DeviceTabletIcon className="w-4 h-4" />}
                      {device === 'mobile' && <DevicePhoneMobileIcon className="w-4 h-4" />}
                    </button>
                  ))}
                </div>

                {/* Contrôles de thème */}
                <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  {(['light', 'dark'] as const).map(theme => (
                    <button
                      key={theme}
                      onClick={() => setPreviewTheme(theme)}
                      className={`px-3 py-1 rounded text-sm ${
                        previewTheme === theme
                          ? 'bg-white dark:bg-gray-600 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {theme === 'light' ? '☀️' : '🌙'}
                    </button>
                  ))}
                </div>

                {/* Bouton de rafraîchissement */}
                <button
                  onClick={handleRefresh}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded"
                  title="Rafraîchir"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                </button>

                {/* Bouton de fermeture */}
                <button
                  onClick={onClose}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded"
                  title="Fermer"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Zone de prévisualisation */}
            <div className="flex-1 flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-900 overflow-auto">
              <div className={`${getContainerWidth()} bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden`}>
                <style>{generatePreviewCSS()}</style>
                
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center h-64"
                    >
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="preview-container"
                    >
                      {pageData.components.map(renderComponent)}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Barre d'état */}
            <div className="h-8 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex items-center justify-between px-4 text-xs text-gray-500">
              <div className="flex items-center space-x-4">
                <span>Layout: {previewLayout}</span>
                <span>Thème: {previewTheme}</span>
                <span>Composants: {pageData.components.length}</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <span>Largeur: {previewLayout === 'mobile' ? '320px' : previewLayout === 'tablet' ? '384px' : '100%'}</span>
                <span>Dernière mise à jour: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PagePreview 