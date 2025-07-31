"use client";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { DocumentRepository } from "./document-repository";
import { FilePreview } from "./file-preview";
import { ChatInterface } from "./chat-interface";
import type { Project, Session, Message, FileItem } from "@/types";

interface ProjectLayoutProps {
  project: Project;
  files: FileItem[];
  selectedFile: string | null;
  onFileSelect: (path: string) => void;
  onFileUpload: (file: File) => void;
  isUploading?: boolean;
  sessions: Session[];
  currentSession: Session | null;
  messages: Message[];
  onCreateSession: () => void;
  onSessionSelect: (session: Session) => void;
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

export function ProjectLayout({
  project,
  files,
  selectedFile,
  onFileSelect,
  onFileUpload,
  isUploading = false,
  sessions,
  currentSession,
  messages,
  onCreateSession,
  onSessionSelect,
  onSendMessage,
  isLoading = false,
}: ProjectLayoutProps) {
  return (
    <ResizablePanelGroup direction="horizontal" className="flex-1">
      {/* Left Column - Document Repository */}
      <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
        <DocumentRepository
          files={files}
          selectedFile={selectedFile}
          onFileSelect={onFileSelect}
          onFileUpload={onFileUpload}
          isUploading={isUploading}
        />
      </ResizablePanel>

      <ResizableHandle />

      {/* Middle Column - File Preview */}
      <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
        <FilePreview
          projectId={project.id}
          selectedFile={selectedFile}
          fileName={files.find(f => f.path === selectedFile)?.name}
        />
      </ResizablePanel>

      <ResizableHandle />

      {/* Right Column - Chat Interface */}
      <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
        <ChatInterface
          project={project}
          sessions={sessions}
          currentSession={currentSession}
          messages={messages}
          onCreateSession={onCreateSession}
          onSessionSelect={onSessionSelect}
          onSendMessage={onSendMessage}
          isLoading={isLoading}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}