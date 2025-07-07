'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  XMarkIcon,
  DocumentArrowDownIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  PhotoIcon,
  CpuChipIcon
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

interface PageExporterProps {
  pageData: PageData
  isOpen: boolean
  onClose: () => void
}

export const PageExporter: React.FC<PageExporterProps> = ({
  pageData,
  isOpen,
  onClose
}) => {
  const [exportFormat, setExportFormat] = useState<'html' | 'react' | 'json' | 'css'>('html')
  const [includeStyles, setIncludeStyles] = useState(true)
  const [includeScripts, setIncludeScripts] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  // Générer le HTML
  const generateHTML = (): string => {
    let html = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageData.name}</title>
    ${includeStyles ? generateCSS() : ''}
</head>
<body>
    <div class="page-container">
`

    pageData.components.forEach(component => {
      html += generateComponentHTML(component)
    })

    html += `
    </div>
    ${includeScripts ? generateJavaScript() : ''}
</body>
</html>`

    return html
  }

  // Générer le CSS
  const generateCSS = (): string => {
    let css = `
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background-color: ${pageData.theme === 'dark' ? '#1f2937' : '#ffffff'};
            color: ${pageData.theme === 'dark' ? '#f9fafb' : '#111827'};
        }
        .page-container { 
            position: relative; 
            min-height: 100vh;
            background-color: ${pageData.theme === 'dark' ? '#1f2937' : '#ffffff'};
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
        css += `            ${property}: ${value};\n`
      })

      css += `        }\n`

      // Styles spécifiques au type de composant
      switch (component.type) {
        case 'heading':
          css += `
            .${className} h1 {
                font-size: ${component.props.fontSize || '2rem'};
                color: ${component.props.color || (pageData.theme === 'dark' ? '#f9fafb' : '#000000')};
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
                color: ${component.props.color || (pageData.theme === 'dark' ? '#d1d5db' : '#333333')};
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
                background-color: ${component.props.backgroundColor || (pageData.theme === 'dark' ? '#374151' : '#ffffff')};
                border-radius: ${component.props.borderRadius || 8}px;
                padding: ${component.props.padding || 20}px;
                box-shadow: ${component.props.shadow || '0 2px 4px rgba(0,0,0,0.1)'};
                border: 1px solid ${pageData.theme === 'dark' ? '#4b5563' : '#e5e7eb'};
            }
            .${className} h3 {
                font-size: 1.25rem;
                font-weight: 600;
                margin-bottom: 0.5rem;
                color: ${pageData.theme === 'dark' ? '#f9fafb' : '#111827'};
            }
            .${className} p {
                color: ${pageData.theme === 'dark' ? '#d1d5db' : '#6b7280'};
                line-height: 1.5;
            }
          `
          break
      }
    })

    css += `
    </style>`

    return css
  }

  // Générer le JavaScript
  const generateJavaScript = (): string => {
    return `
    <script>
        // Scripts pour l'interactivité
        document.addEventListener('DOMContentLoaded', function() {
            // Gestion des formulaires
            const forms = document.querySelectorAll('form');
            forms.forEach(form => {
                form.addEventListener('submit', function(e) {
                    e.preventDefault();
                    console.log('Formulaire soumis:', form);
                    // Ajoutez ici votre logique de soumission
                });
            });

            // Gestion des boutons
            const buttons = document.querySelectorAll('button[data-action]');
            buttons.forEach(button => {
                button.addEventListener('click', function(e) {
                    const action = this.getAttribute('data-action');
                    console.log('Action:', action);
                    // Ajoutez ici votre logique d'action
                });
            });
        });
    </script>`
  }

  // Générer le HTML d'un composant
  const generateComponentHTML = (component: ComponentData): string => {
    const className = `component-${component.id}`

    switch (component.type) {
      case 'heading':
        return `        <div class="${className}">
            <h1>${component.props.text || 'Titre'}</h1>
        </div>\n`

      case 'paragraph':
        return `        <div class="${className}">
            <p>${component.props.text || 'Paragraphe'}</p>
        </div>\n`

      case 'button':
        return `        <div class="${className}">
            <button data-action="${component.props.onClick || 'default'}">${component.props.text || 'Bouton'}</button>
        </div>\n`

      case 'image':
        return `        <div class="${className}">
            <img src="${component.props.src || '/placeholder.jpg'}" alt="${component.props.alt || 'Image'}" />
        </div>\n`

      case 'video':
        return `        <div class="${className}">
            <video src="${component.props.src || ''}" poster="${component.props.poster || ''}" controls>
                Votre navigateur ne supporte pas la lecture de vidéos.
            </video>
        </div>\n`

      case 'container':
        return `        <div class="${className}">
            <!-- Contenu du conteneur -->
        </div>\n`

      case 'grid':
        return `        <div class="${className}">
            <!-- Grille avec ${component.props.columns || 2} colonnes -->
        </div>\n`

      case 'card':
        return `        <div class="${className}">
            <h3>${component.props.title || 'Titre de la carte'}</h3>
            <p>${component.props.content || 'Contenu de la carte'}</p>
        </div>\n`

      case 'form':
        const formFields = component.props.fields?.map((field: any) => `
                <div class="form-field">
                    <label>${field.label}</label>
                    <input type="${field.type}" placeholder="${field.placeholder}" ${field.required ? 'required' : ''} />
                </div>`).join('') || ''
        return `        <div class="${className}">
            <form>
                ${formFields}
                <button type="submit">${component.props.submitText || 'Envoyer'}</button>
            </form>
        </div>\n`

      default:
        return `        <div class="${className}">
            <!-- Composant non reconnu -->
        </div>\n`
    }
  }

  // Générer le code React
  const generateReact = (): string => {
    let react = `import React from 'react';

export const ${pageData.name.replace(/\s+/g, '')}Page: React.FC = () => {
  return (
    <div className="page-container">
`

    pageData.components.forEach(component => {
      react += generateComponentReact(component)
    })

    react += `
    </div>
  );
};

export default ${pageData.name.replace(/\s+/g, '')}Page;`

    return react
  }

  // Générer le code React d'un composant
  const generateComponentReact = (component: ComponentData): string => {
    const className = `component-${component.id}`

    switch (component.type) {
      case 'heading':
        return `      <div className="${className}">
        <h1>${component.props.text || 'Titre'}</h1>
      </div>\n`

      case 'paragraph':
        return `      <div className="${className}">
        <p>${component.props.text || 'Paragraphe'}</p>
      </div>\n`

      case 'button':
        return `      <div className="${className}">
        <button onClick={() => console.log('Action')}>${component.props.text || 'Bouton'}</button>
      </div>\n`

      case 'image':
        return `      <div className="${className}">
        <img src="${component.props.src || '/placeholder.jpg'}" alt="${component.props.alt || 'Image'}" />
      </div>\n`

      case 'video':
        return `      <div className="${className}">
        <video src="${component.props.src || ''}" poster="${component.props.poster || ''}" controls>
          Votre navigateur ne supporte pas la lecture de vidéos.
        </video>
      </div>\n`

      case 'container':
        return `      <div className="${className}">
        {/* Contenu du conteneur */}
      </div>\n`

      case 'grid':
        return `      <div className="${className}">
        {/* Grille avec ${component.props.columns || 2} colonnes */}
      </div>\n`

      case 'card':
        return `      <div className="${className}">
        <h3>${component.props.title || 'Titre de la carte'}</h3>
        <p>${component.props.content || 'Contenu de la carte'}</p>
      </div>\n`

      case 'form':
        const formFields = component.props.fields?.map((field: any) => `
          <div className="form-field">
            <label>${field.label}</label>
            <input type="${field.type}" placeholder="${field.placeholder}" ${field.required ? 'required' : ''} />
          </div>`).join('') || ''
        return `      <div className="${className}">
        <form onSubmit={(e) => { e.preventDefault(); console.log('Formulaire soumis'); }}>
          ${formFields}
          <button type="submit">${component.props.submitText || 'Envoyer'}</button>
        </form>
      </div>\n`

      default:
        return `      <div className="${className}">
        {/* Composant non reconnu */}
      </div>\n`
    }
  }

  // Exporter le fichier
  const handleExport = async () => {
    setIsExporting(true)

    try {
      let content = ''
      let filename = ''
      let mimeType = ''

      switch (exportFormat) {
        case 'html':
          content = generateHTML()
          filename = `${pageData.name.toLowerCase().replace(/\s+/g, '-')}.html`
          mimeType = 'text/html'
          break

        case 'react':
          content = generateReact()
          filename = `${pageData.name.toLowerCase().replace(/\s+/g, '-')}.tsx`
          mimeType = 'text/plain'
          break

        case 'json':
          content = JSON.stringify(pageData, null, 2)
          filename = `${pageData.name.toLowerCase().replace(/\s+/g, '-')}.json`
          mimeType = 'application/json'
          break

        case 'css':
          content = generateCSS().replace('<style>', '').replace('</style>', '').trim()
          filename = `${pageData.name.toLowerCase().replace(/\s+/g, '-')}.css`
          mimeType = 'text/css'
          break
      }

      // Créer et télécharger le fichier
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      // Simuler un délai pour l'export
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error('Erreur lors de l\'export:', error)
    } finally {
      setIsExporting(false)
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
            className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <DocumentArrowDownIcon className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Exporter la page
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 rounded"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Contenu */}
            <div className="p-6 space-y-6">
              {/* Format d'export */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Format d'export
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'html', name: 'HTML', icon: DocumentTextIcon, description: 'Page web complète' },
                    { id: 'react', name: 'React', icon: CodeBracketIcon, description: 'Composant React' },
                    { id: 'json', name: 'JSON', icon: CpuChipIcon, description: 'Données brutes' },
                    { id: 'css', name: 'CSS', icon: PhotoIcon, description: 'Styles uniquement' }
                  ].map(format => (
                    <button
                      key={format.id}
                      onClick={() => setExportFormat(format.id as any)}
                      className={`p-4 border rounded-lg text-left transition-colors ${
                        exportFormat === format.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        {React.createElement(format.icon, { className: "w-5 h-5 text-blue-600" })}
                        <span className="font-medium text-gray-900 dark:text-gray-100">{format.name}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{format.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Options d'export */}
              {exportFormat === 'html' && (
                <div className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={includeStyles}
                      onChange={(e) => setIncludeStyles(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Inclure les styles CSS</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={includeScripts}
                      onChange={(e) => setIncludeScripts(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Inclure les scripts JavaScript</span>
                  </label>
                </div>
              )}

              {/* Informations */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Informations</h4>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>Page: {pageData.name}</p>
                  <p>Composants: {pageData.components.length}</p>
                  <p>Layout: {pageData.layout}</p>
                  <p>Thème: {pageData.theme}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
              >
                Annuler
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Export en cours...</span>
                  </>
                ) : (
                  <>
                    <DocumentArrowDownIcon className="w-4 h-4" />
                    <span>Exporter</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PageExporter 