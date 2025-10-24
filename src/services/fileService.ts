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
export const getDownloadUrl = async (fileId: string, maxAttempts = 5): Promise<string> => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const res = await fetch(`${BASE_URL}/files/${fileId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
      });

      if (res.status === 200) {
        const data = await res.json();
        console.log('✅ Download URL obtained after', attempt + 1, 'attempts');
        return data.downloadUrl;
      } else if (res.status === 425) {
        // File not ready yet, wait and retry
        const delay = 1000; // 1 seconde seulement
        console.log(`🔄 File still uploading (${attempt + 1}/${maxAttempts}), retry in ${delay}ms...`);
        
        if (attempt < maxAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        } else {
          throw new Error('File upload taking too long - please try again in a moment');
        }
      } else {
        const errorText = await res.text();
        throw new Error(`Impossible de récupérer l'URL: ${res.status} ${errorText}`);
      }
    } catch (error) {
      if (attempt === maxAttempts - 1) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  throw new Error('Unexpected error');
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