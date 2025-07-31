"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Database, FileText, ChevronRight, Upload } from "lucide-react";
import type { FileItem } from "@/types";

interface DocumentRepositoryProps {
  files: FileItem[];
  selectedFile: string | null;
  onFileSelect: (path: string) => void;
  onFileUpload: (file: File) => void;
  isUploading?: boolean;
}

export function DocumentRepository({
  files,
  selectedFile,
  onFileSelect,
  onFileUpload,
  isUploading = false,
}: DocumentRepositoryProps) {
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFile(true);
    onFileUpload(file);
    setIsUploadingFile(false);
    e.target.value = '';
  };

  return (
    <div className="h-full bg-white border-r flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center">
            <Database className="h-4 w-4 mr-2" />
            资料库
          </h2>
        </div>
        
        {/* File Upload */}
        <div className="space-y-2">
          <Input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload-repo"
            disabled={isUploading || isUploadingFile}
          />
          <Button 
            className="w-full" 
            size="sm"
            onClick={() => document.getElementById('file-upload-repo')?.click()}
            disabled={isUploading || isUploadingFile}
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading || isUploadingFile ? '上传中...' : '上传文件'}
          </Button>
        </div>
      </div>

      {/* File List */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2">
          {files.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              暂无文件，请上传数据文件
            </p>
          ) : (
            files.map((file) => (
              <div
                key={file.path}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedFile === file.path
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onFileSelect(file.path)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium truncate">
                      {file.name}
                    </span>
                  </div>
                  {selectedFile === file.path && (
                    <ChevronRight className="h-4 w-4 text-blue-500" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}