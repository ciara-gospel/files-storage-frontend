import React from "react";
import { motion } from "framer-motion";

interface FileItemProps {
  fileId: string;
  fileName: string;
  fileSize?: string; // optionnel
  createdAt?: string; // optionnel
  onDownload: (fileId: string) => void;
  onDelete: (fileId: string) => void;
}

const FileItem: React.FC<FileItemProps> = ({
  fileId,
  fileName,
  fileSize,
  createdAt,
  onDownload,
  onDelete,
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white"
    >
      {/* Left: File info */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div className="flex flex-col truncate">
          <span className="font-medium text-slate-900 truncate">{fileName}</span>
          {fileSize && (
            <span className="text-xs text-slate-500">{fileSize}</span>
          )}
          {createdAt && (
            <span className="text-xs text-slate-400">{createdAt}</span>
          )}
        </div>
      </div>

      {/* Right: Buttons */}
      <div className="flex gap-2 mt-3 sm:mt-0">
        <button
          onClick={() => onDownload(fileId)}
          className="px-3 py-1 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          Download
        </button>
        <button
          onClick={() => onDelete(fileId)}
          className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Delete
        </button>
      </div>
    </motion.div>
  );
};

export default FileItem;
