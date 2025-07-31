"use client";

import { FileText } from "lucide-react";
import { ExcelPreview } from "@/components/excel-preview";
import DataProfiler from "@/components/data-profiler";

interface FilePreviewProps {
  projectId: string;
  selectedFile: string | null;
  fileName?: string;
  fileId?: string;
}

export function FilePreview({
  projectId,
  selectedFile,
  fileName,
  fileId,
}: FilePreviewProps) {
  if (!selectedFile || !fileName) {
    return (
      <div className="h-full bg-white flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-semibold flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            文件预览
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4" />
            <p>请从左侧选择一个文件进行预览</p>
          </div>
        </div>
      </div>
    );
  }

  // 检查是否为Excel文件
  const isExcelFile = fileName.toLowerCase().endsWith('.xlsx') || 
                     fileName.toLowerCase().endsWith('.xls') ||
                     fileName.toLowerCase().endsWith('.csv');

  if (isExcelFile && fileId) {
    return (
      <ExcelPreview
        projectId={projectId}
        fileId={fileId}
        fileName={fileName}
      />
    );
  }

  // 对于非Excel文件，使用数据探查
  return (
    <div className="h-full bg-white flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-semibold flex items-center">
          <FileText className="h-4 w-4 mr-2" />
          文件预览
          <span className="ml-2 text-sm text-gray-500">
            - {fileName}
          </span>
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