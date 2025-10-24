import React, { useState } from "react";

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
  };

  const handleUpload = async () => {
    if (!file) return alert("Choisis un fichier d'abord");
    setLoading(true);

    try {
      // 1️⃣ Récupérer les URL depuis ton backend
      const res = await fetch(
        `https://7387isryu3.execute-api.us-east-1.amazonaws.com/prod/generatePresignedUrl?filename=${encodeURIComponent(file.name)}&userId=user123`
      );
      const data = await res.json();

      const { uploadUrl, downloadUrl, fileKey } = data;

      // 2️⃣ Envoyer le fichier sur S3
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");

      alert("✅ Fichier uploadé avec succès !");

      // 3️⃣ Télécharger automatiquement (sans ouvrir un nouvel onglet)
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error(err);
      alert("❌ Erreur pendant l’upload ou le download");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <input type="file" onChange={handleFileChange} />
      <button
        onClick={handleUpload}
        disabled={loading || !file}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Chargement..." : "Uploader et Télécharger"}
      </button>
    </div>
  );
}
