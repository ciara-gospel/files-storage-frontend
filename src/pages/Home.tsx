"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { getUploadUrl, listFiles, getDownloadUrl, deleteFile } from "../services/fileService"
import type { FileItem } from "../services/fileService"

const Home: React.FC = () => {
  const [file, setFile] = useState<File | null>(null)
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const loadFiles = async () => {
    setLoading(true)
    try {
      const data = await listFiles()
      setFiles(data.files)
    } catch (error: any) {
      console.error('Erreur lors du chargement des fichiers:', error)
      alert(`Erreur lors du chargement: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFiles()
  }, [])

  const handleUpload = async () => {
  if (!file) return
  
  setUploading(true)
  try {
    // 1. Générer l'URL d'upload
    const { uploadUrl, fileId } = await getUploadUrl(file.name, "user123")
    
    // 2. Upload le fichier vers S3
    await fetch(uploadUrl, { 
      method: "PUT", 
      body: file, 
      headers: { "Content-Type": "application/octet-stream" }
    })
    
    console.log('✅ Fichier uploadé avec succès, fileId:', fileId)
    
    // 3. Attendre 3 secondes pour que S3 soit cohérent
    console.log('⏳ Attente de 3 secondes pour la synchronisation S3...')
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // 4. Recharger la liste
    await loadFiles()
    
    setFile(null)
    alert('Fichier uploadé avec succès! Vous pouvez maintenant le télécharger.')
    
  } catch (error: any) {
    console.error('❌ Erreur lors de l\'upload:', error)
    alert(`Erreur lors de l'upload: ${error.message}`)
  } finally {
    setUploading(false)
  }
}

  const handleDownload = async (fileId: string, filename: string) => {
    setDownloadingFile(fileId)
    try {
      console.log('📥 Début du téléchargement pour fileId:', fileId)
      
      const url = await getDownloadUrl(fileId)
      
      console.log('✅ URL de téléchargement obtenue, ouverture...')
      
      // Créer un lien de téléchargement propre
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      
    } catch (error: any) {
      console.error('❌ Erreur lors du téléchargement:', error)
      alert(`Erreur lors du téléchargement: ${error.message}`)
    } finally {
      setDownloadingFile(null)
    }
  }

  const handleDelete = async (fileId: string) => {
    try {
      setLoading(true)
      console.log('🗑️ Suppression du fichier:', fileId)
      await deleteFile(fileId)
      console.log('✅ Fichier supprimé avec succès')
      
      // Mettre à jour la liste localement
      setFiles(prev => prev.filter(f => f.fileId !== fileId))
      
    } catch (error: any) {
      console.error('❌ Erreur lors de la suppression:', error)
      alert(`Erreur lors de la suppression: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  const getFileStatus = (file: FileItem) => {
    if (file.status === 'PENDING') return '⏳ En traitement...'
    if (file.status === 'UPLOADED') return '✅ Prêt'
    return '✅ Prêt'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-slate-900 mb-3 text-balance">Gestionnaire de Fichiers</h1>
          <p className="text-lg text-slate-600">Téléchargez, gérez et partagez vos fichiers en toute simplicité</p>
        </div>

        <div className="mb-8 bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="p-8">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
                dragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100"
              }`}
            >
              <div className="flex justify-center mb-4">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                    dragActive ? "bg-blue-100" : "bg-slate-200"
                  }`}
                >
                  <svg
                    className={`w-8 h-8 transition-colors ${dragActive ? "text-blue-600" : "text-slate-600"}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-lg font-semibold text-slate-700 mb-1">
                  {file ? file.name : "Glissez-déposez votre fichier ici"}
                </p>
                <p className="text-sm text-slate-500">
                  {file ? formatFileSize(file.size) : "ou cliquez pour parcourir"}
                </p>
              </div>

              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                {uploading ? 'Upload en cours...' : 'Upload a File'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900">Mes Fichiers</h2>
          </div>

          <div className="p-8">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <p className="text-slate-500 text-lg">Aucun fichier trouvé</p>
                <p className="text-slate-400 text-sm mt-1">Commencez par télécharger votre premier fichier</p>
              </div>
            ) : (
              <div className="space-y-3">
                {files.map((f) => (
                  <div
                    key={f.fileId}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-100 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-slate-900 truncate">{f.fileName}</div>
                        <div className="text-xs text-slate-500">
                          {getFileStatus(f)} • {new Date(f.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleDownload(f.fileId, f.fileName)}
                        disabled={downloadingFile === f.fileId}
                        className="px-4 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 disabled:bg-slate-100 disabled:text-slate-400 transition-colors duration-200"
                      >
                        {downloadingFile === f.fileId ? 'Téléchargement...' : 'Télécharger'}
                      </button>
                      <button
                        onClick={() => handleDelete(f.fileId)}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 disabled:bg-slate-100 disabled:text-slate-400 transition-colors duration-200"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home