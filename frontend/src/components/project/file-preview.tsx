"use client";

import { FileText } from "lucide-react";
import DataProfiler from "@/components/data-profiler";

interface FilePreviewProps {
  projectId: string;
  selectedFile: string | null;
  fileName?: string;
}

export function FilePreview({
  projectId,
  selectedFile,
  fileName,
}: FilePreviewProps) {
  return (
    <div className="h-full bg-white flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-semibold flex items-center">
          <FileText className="h-4 w-4 mr-2" />
          文件预览
          {selectedFile && fileName && (
            <span className="ml-2 text-sm text-gray-500">
              - {fileName}
            </span>
          )}
        </h2>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <DataProfiler 
          projectId={projectId} 
          filePath={selectedFile || undefined} 
        />
      </div>
    </div>
  );
}