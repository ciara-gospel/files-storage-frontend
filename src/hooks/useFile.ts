import { useState, useEffect } from 'react';
import { listFiles, getUploadUrl, deleteFile as deleteFileApi } from '../services/fileService';

export interface FileItem {
  fileId: string;
  fileName: string;
  createdAt: string;
  downloadUrl?: string;
}

export function useFile(userId: string) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 📄 Liste tous les fichiers depuis l'API
  const fetchFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listFiles();
      setFiles(data.files || []);
    } catch (err: any) {
      console.error('Erreur lors du listing des fichiers', err);
      setError('Impossible de récupérer les fichiers');
    } finally {
      setLoading(false);
    }
  };

  // 📤 Upload d'un fichier
  const uploadFile = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const { uploadUrl, fileId } = await getUploadUrl(file.name, userId);

      // Upload réel vers S3
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      // Recharger la liste des fichiers
      await fetchFiles();
      return fileId;
    } catch (err: any) {
      console.error('Erreur lors de l\'upload', err);
      setError('Échec de l\'upload du fichier');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ Supprimer un fichier
  const deleteFile = async (fileId: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteFileApi(fileId);
      setFiles(prev => prev.filter(f => f.fileId !== fileId));
    } catch (err: any) {
      console.error('Erreur lors de la suppression', err);
      setError('Échec de la suppression');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Charger la liste automatiquement au montage
  useEffect(() => {
    fetchFiles();
  }, []);

  return {
    files,
    loading,
    error,
    fetchFiles,
    uploadFile,
    deleteFile,
  };
}
