"use client"

import React, { useState, useEffect, useRef } from "react"
import { getUploadUrl, listFiles, deleteFile } from "../services/fileService"
import type { FileItem } from "../services/fileService"
import "./Home.css"

const Home: React.FC = () => {
  const [file, setFile] = useState<File | null>(null)
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const loadFiles = async () => {
    setLoading(true)
    try {
      const data = await listFiles()
      setFiles(data.files)
    } catch (error: any) {
      alert(`Error: ${error.message}`)
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
      const { uploadUrl, fileId } = await getUploadUrl(file.name, "user123")
      await fetch(uploadUrl, { method: "PUT", body: file })
      await new Promise(res => setTimeout(res, 3000))
      await loadFiles()
      setFile(null)
      alert("✅ File uploaded successfully!")
    } catch (error: any) {
      alert(`Upload error: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (fileId: string) => {
    try {
      setLoading(true)
      await deleteFile(fileId)
      setFiles(prev => prev.filter(f => f.fileId !== fileId))
    } catch (error: any) {
      alert(`Delete error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(e.type === "dragenter" || e.type === "dragover")
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleSelectFile = () => {
    fileInputRef.current?.click()
  }

  const formatFileSize = (bytes: number) => {
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  const getFileStatus = (file: FileItem) => {
    if (file.status === "PENDING") return "⏳ Processing..."
    return "✅ Ready"
  }

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>File Manager</h1>
        <p>Upload, manage and share your files easily</p>
      </header>

      <section className="upload-section">
        <div
          className={`upload-box ${dragActive ? "drag-active" : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleSelectFile}
        >
          <p>{file ? file.name : "Drag & drop your file here"}</p>
          <p className="upload-subtext">
            {file ? formatFileSize(file.size) : "or click to browse"}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            style={{ display: "none" }}
          />
        </div>

        {/* ✅ Buttons with spacing */}
        <div className="button-group">
          <button
            onClick={handleSelectFile}
            className="upload-button select-button"
          >
            📂 Choose a file
          </button>

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="upload-button"
          >
            {uploading ? "⏳ Uploading..." : "📤 Upload"}
          </button>
        </div>
      </section>

      <section className="file-list">
        <h2>📁 My Files</h2>
        {loading ? (
          <div className="loader"></div>
        ) : files.length === 0 ? (
          <p className="no-files">No files found</p>
        ) : (
          files.map((f) => (
            <div key={f.fileId} className="file-item">
              <div className="file-info">
                <span className="file-name">{f.fileName}</span>
                <span className="file-meta">
                  {getFileStatus(f)} • {new Date(f.createdAt).toLocaleDateString()}
                </span>
              </div>
              <button
                onClick={() => handleDelete(f.fileId)}
                className="delete-button"
              >
                🗑️ Delete
              </button>
            </div>
          ))
        )}
      </section>
    </div>
  )
}

export default Home
