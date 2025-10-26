import { BASE_URL } from './api';

export interface FileItem {
  fileId: string;
  fileName: string;
  createdAt: string;
  downloadUrl?: string;
  status?: string; // Ajout du statut
}

// 🔹 Liste tous les fichiers
export const listFiles = async (): Promise<{ files: FileItem[] }> => {
  try {
    const res = await fetch(`${BASE_URL}/files`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Erreur lors du listing des fichiers: ${res.status} ${errorText}`);
    }

    return res.json();
  } catch (error) {
    console.error('❌ Erreur lors du listing des fichiers:', error);
    throw error;
  }
};

// 🔹 Obtenir l'URL signée pour l'upload
export const getUploadUrl = async (
  filename: string,
  userId: string
): Promise<{ uploadUrl: string; fileId: string }> => {
  const cleanFilename = filename.replace(/\s+/g, '_');

  const res = await fetch(
    `${BASE_URL}/generate-upload-url?filename=${encodeURIComponent(cleanFilename)}&userId=${encodeURIComponent(userId)}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Impossible de générer l'URL d'upload: ${res.status} ${errorText}`);
  }

  return res.json();
};

// 🔹 Obtenir l'URL de téléchargement d'un fichier avec polling court
// 🔥 NOUVELLE FONCTION POUR TÉLÉCHARGEMENT DIRECT
export const downloadFile = async (fileId: string): Promise<Blob> => {
  console.log('📥 Direct download for fileId:', fileId);
  
  const res = await fetch(`${BASE_URL}/download/${fileId}`, {
    method: 'GET',
    mode: 'cors',
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Download failed: ${res.status} ${errorText}`);
  }

  return await res.blob();
};

// 🔹 Supprimer un fichier
export const deleteFile = async (fileId: string): Promise<void> => {
  const res = await fetch(`${BASE_URL}/files/${fileId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    mode: 'cors',
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Impossible de supprimer le fichier: ${res.status} ${errorText}`);
  }
};