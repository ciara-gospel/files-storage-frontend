import React, { useState } from "react";
import { motion } from "framer-motion";
import { getUploadUrl } from "../services/fileService";

const Upload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files ? e.target.files[0] : null);
    setProgress(0);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      // Utilisez un ID utilisateur statique pour les tests ou gérez l'authentification
      const userId = "test-user";
      const { uploadUrl } = await getUploadUrl(file.name, userId);

      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      alert("✅ File uploaded successfully!");
      setFile(null);
      setProgress(0);
    } catch (error) {
      console.error(error);
      alert("❌ Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-lg mx-auto flex flex-col space-y-4">
      <h2 className="text-xl font-semibold">Upload a File</h2>
      <input
        type="file"
        onChange={handleFileChange}
        className="border p-2 rounded"
      />

      {file && (
        <motion.div
          className="h-4 bg-green-500 rounded"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      )}

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className={`p-2 rounded text-white font-medium transition-colors ${
          uploading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
};

export default Upload;
