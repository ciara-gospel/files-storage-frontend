import React from "react";
import FileItem from "./FileItem";

interface File {
  fileId: string;
  fileName: string;
}

interface FileListProps {
  files: File[];
  onDownload: (fileId: string) => void;
  onDelete: (fileId: string) => void;
}

const FileList: React.FC<FileListProps> = ({ files, onDownload, onDelete }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {files.map((file) => (
        <FileItem
          key={file.fileId}
          fileId={file.fileId}
          fileName={file.fileName}
          onDownload={onDownload}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default FileList;
