'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  PhotoIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  TrashIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  CloudArrowUpIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { filesAPI } from '../../../lib/api'
import { MediaFile } from '../../../types'
import { toast } from 'react-hot-toast'

export default function MediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  useEffect(() => {
    fetchFiles()
  }, [searchTerm, categoryFilter])

  const fetchFiles = async () => {
    try {
      setLoading(true)
      const response = await filesAPI.getFiles({
        search: searchTerm || undefined,
        category: categoryFilter || undefined,
        limit: 50
      })
      setFiles(response.data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des fichiers:', error)
      toast.error('Erreur lors du chargement des fichiers')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (uploadFiles: FileList | File[]) => {
    try {
      setUploading(true)
      
      const filesArray = Array.from(uploadFiles)
      const uploadPromises = filesArray.map(file => 
        filesAPI.upload(file, getCategoryFromMimeType(file.type))
      )
      
      await Promise.all(uploadPromises)
      toast.success(`${filesArray.length} fichier(s) uploadé(s) avec succès`)
      fetchFiles()
      setShowUploadModal(false)
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error)
      toast.error('Erreur lors de l\'upload des fichiers')
    } finally {
      setUploading(false)
    }
  }

  const getCategoryFromMimeType = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return 'IMAGE'
    if (mimeType.startsWith('video/')) return 'VIDEO'
    if (mimeType.includes('pdf') || mimeType.includes('document')) return 'DOCUMENT'
    return 'OTHER'
  }

  const handleDeleteFiles = async (fileIds: string[]) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${fileIds.length} fichier(s) ?`)) {
      return
    }

    try {
      await Promise.all(fileIds.map(id => filesAPI.deleteFile(id)))
      toast.success('Fichiers supprimés avec succès')
      setSelectedFiles([])
      fetchFiles()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      toast.error('Erreur lors de la suppression des fichiers')
    }
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
    
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files)
    }
  }

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`
    return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'IMAGE': return PhotoIcon
      case 'VIDEO': return VideoCameraIcon
      case 'DOCUMENT': return DocumentTextIcon
      default: return DocumentTextIcon
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'IMAGE': return 'bg-green-100 text-green-800'
      case 'VIDEO': return 'bg-purple-100 text-purple-800'
      case 'DOCUMENT': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    )
  }

  const filteredFiles = files.filter(file => {
    const matchesSearch = !searchTerm || 
      file.originalName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !categoryFilter || file.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bibliothèque de médias</h1>
            <p className="text-gray-600">Gérez vos images, vidéos et documents</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Ajouter des fichiers</span>
          </button>
        </div>
      </div>

      {/* Filters and search */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher des fichiers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="form-select"
            >
              <option value="">Toutes les catégories</option>
              <option value="IMAGE">Images</option>
              <option value="VIDEO">Vidéos</option>
              <option value="DOCUMENT">Documents</option>
              <option value="OTHER">Autres</option>
            </select>
            {selectedFiles.length > 0 && (
              <button
                onClick={() => handleDeleteFiles(selectedFiles)}
                className="btn-danger flex items-center space-x-2"
              >
                <TrashIcon className="h-4 w-4" />
                <span>Supprimer ({selectedFiles.length})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-green-500 rounded-md">
              <PhotoIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5">
              <div className="text-sm font-medium text-gray-500">Images</div>
              <div className="text-2xl font-semibold text-gray-900">
                {files.filter(f => f.category === 'IMAGE').length}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-purple-500 rounded-md">
              <VideoCameraIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5">
              <div className="text-sm font-medium text-gray-500">Vidéos</div>
              <div className="text-2xl font-semibold text-gray-900">
                {files.filter(f => f.category === 'VIDEO').length}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-blue-500 rounded-md">
              <DocumentTextIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5">
              <div className="text-sm font-medium text-gray-500">Documents</div>
              <div className="text-2xl font-semibold text-gray-900">
                {files.filter(f => f.category === 'DOCUMENT').length}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-gray-500 rounded-md">
              <CloudArrowUpIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5">
              <div className="text-sm font-medium text-gray-500">Total</div>
              <div className="text-2xl font-semibold text-gray-900">{files.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Files grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
              <div className="bg-gray-200 h-4 rounded mb-2"></div>
              <div className="bg-gray-200 h-3 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-12">
          <PhotoIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun fichier trouvé</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || categoryFilter 
              ? 'Aucun fichier ne correspond à vos critères de recherche'
              : 'Commencez par ajouter des fichiers à votre bibliothèque'
            }
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-primary"
          >
            Ajouter des fichiers
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFiles.map((file) => {
            const Icon = getCategoryIcon(file.category)
            const isSelected = selectedFiles.includes(file.id)
            
            return (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`bg-white rounded-lg shadow overflow-hidden cursor-pointer border-2 transition-all ${
                  isSelected ? 'border-primary-500 ring-2 ring-primary-200' : 'border-transparent hover:shadow-lg'
                }`}
                onClick={() => toggleFileSelection(file.id)}
              >
                <div className="aspect-square bg-gray-100 relative">
                  {file.category === 'IMAGE' && file.thumbnails?.medium ? (
                    <img
                      src={filesAPI.getFileUrl(file.thumbnails.medium)}
                      alt={file.originalName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleFileSelection(file.id)}
                      className="form-checkbox h-5 w-5"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${getCategoryColor(file.category)}`}>
                      {file.category}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 truncate" title={file.originalName}>
                    {file.originalName}
                  </h3>
                  <div className="mt-2 flex justify-between items-center text-sm text-gray-500">
                    <span>{formatFileSize(file.size)}</span>
                    <span>{new Date(file.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="mt-3 flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setPreviewFile(file)
                      }}
                      className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-2 rounded flex items-center justify-center space-x-1"
                    >
                      <EyeIcon className="h-3 w-3" />
                      <span>Voir</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(filesAPI.getFileUrl(file.filename), '_blank')
                      }}
                      className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-2 rounded flex items-center justify-center space-x-1"
                    >
                      <ArrowDownTrayIcon className="h-3 w-3" />
                      <span>Télécharger</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Ajouter des fichiers</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                dragOver ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <CloudArrowUpIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">
                Glissez-déposez vos fichiers ici ou
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-primary"
                disabled={uploading}
              >
                {uploading ? 'Upload en cours...' : 'Choisir des fichiers'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                className="hidden"
              />
              <p className="text-sm text-gray-500 mt-4">
                Formats supportés: Images (JPG, PNG, GIF), Vidéos (MP4, MOV), Documents (PDF, DOC)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-full overflow-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">{previewFile.originalName}</h3>
              <button
                onClick={() => setPreviewFile(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              {previewFile.category === 'IMAGE' ? (
                <img
                  src={filesAPI.getFileUrl(previewFile.filename)}
                  alt={previewFile.originalName}
                  className="max-w-full h-auto mx-auto"
                />
              ) : previewFile.category === 'VIDEO' ? (
                <video
                  src={filesAPI.getFileUrl(previewFile.filename)}
                  controls
                  className="max-w-full h-auto mx-auto"
                />
              ) : (
                <div className="text-center py-12">
                  <DocumentTextIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">Aperçu non disponible pour ce type de fichier</p>
                  <button
                    onClick={() => window.open(filesAPI.getFileUrl(previewFile.filename), '_blank')}
                    className="btn-primary"
                  >
                    Ouvrir le fichier
                  </button>
                </div>
              )}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Taille:</span>
                    <p>{formatFileSize(previewFile.size)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Type:</span>
                    <p>{previewFile.mimetype}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Catégorie:</span>
                    <p>{previewFile.category}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Ajouté:</span>
                    <p>{new Date(previewFile.createdAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                  {previewFile.metadata?.width && (
                    <div>
                      <span className="font-medium text-gray-600">Dimensions:</span>
                      <p>{previewFile.metadata.width} × {previewFile.metadata.height}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 