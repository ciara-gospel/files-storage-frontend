import React from "react";
import { motion } from "framer-motion";

interface FileItemProps {
  fileId: string;
  fileName: string;
  onDownload: (fileId: string) => void;
  onDelete: (fileId: string) => void;
}

const FileItem: React.FC<FileItemProps> = ({ fileId, fileName, onDownload, onDelete }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="flex justify-between items-center p-4 border rounded shadow-sm hover:shadow-lg transition-shadow bg-white"
    >
      <span className="font-medium">{fileName}</span>
      <div className="space-x-2">
        <button
          onClick={() => onDownload(fileId)}
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Download
        </button>
        <button
          onClick={() => onDelete(fileId)}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Delete
        </button>
      </div>
    </motion.div>
  );
};

export default FileItem;
