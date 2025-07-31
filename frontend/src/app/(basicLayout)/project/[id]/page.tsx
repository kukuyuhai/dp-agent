"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Database, MessageCircle } from "lucide-react";
import { ProjectLayout } from "@/components/project/project-layout";
import { projectAPI, sessionAPI } from "@/lib/api";
import type { Project, Session, Message } from "@/types";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<Array<{ name: string, path: string }>>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [showSessionHistory, setShowSessionHistory] = useState(false);

  const loadProject = useCallback(async () => {
    try {
      const data = await projectAPI.getProject(projectId);
      setProject(data);
    } catch (err) {
      console.error("Error loading project:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const loadSessions = useCallback(async () => {
    try {
      const data = await sessionAPI.getSessions(projectId);
      setSessions(data);
    } catch (err) {
      console.error("Error loading sessions:", err);
    }
  }, [projectId]);

  // Mock function to simulate file upload
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    try {
      // In a real implementation, this would call an API to upload the file
      // For now, we'll just add it to the local state
      const newFile = {
        name: file.name,
        path: `uploads/${projectId}/${file.name}`
      };
      setFiles(prev => [...prev, newFile]);

      // Auto-select the uploaded file
      setSelectedFile(newFile.path);
    } catch (err) {
      console.error("Error uploading file:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (filePath: string) => {
    setSelectedFile(filePath);
  };

  useEffect(() => {
    if (projectId) {
      loadProject();
      loadSessions();
      // Load files for this project (mock implementation)
      // In a real app, this would fetch from an API
      setFiles([
        { name: 'sample_data.xlsx', path: `uploads/${projectId}/sample_data.xlsx` },
        { name: 'customer_data.xlsx', path: `uploads/${projectId}/customer_data.xlsx` }
      ]);
    }
  }, [projectId, loadProject, loadSessions]);

  const handleCreateSession = async () => {
    if (!project) return;

    try {
      const newSession = await sessionAPI.createSession(projectId);
      setSessions((prev) => [newSession, ...prev]);
      setCurrentSession(newSession);
      setMessages([]);
    } catch (err) {
      console.error("Error creating session:", err);
    }
  };

  const handleSessionSelect = (session: Session) => {
    setCurrentSession(session);
    setShowSessionHistory(false);
    // Load messages for the selected session
    loadMessages(session.id);
  };

  const loadMessages = async (sessionId: string) => {
    try {
      const data = await sessionAPI.getMessages(sessionId);
      setMessages(data);
    } catch (err) {
      console.error("Error loading messages:", err);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentSession) return;

    const message = inputMessage.trim();
    setInputMessage('');

    const userMessage = {
      id: Date.now().toString(),
      session_id: currentSession.id,
      role: 'user' as const,
      content: message,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const aiMessage = await sessionAPI.sendMessage(currentSession.id, message);
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error("Error sending message:", err);
      const errorMessage = {
        id: Date.now().toString(),
        session_id: currentSession.id,
        role: 'assistant' as const,
        content: '抱歉，处理您的请求时出现错误。请稍后重试。',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleBackToProjects = () => {
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">项目未找到</h2>
            <Button onClick={handleBackToProjects}>返回项目列表</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToProjects}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>返回项目列表</span>
          </Button>
          <div className="h-6 w-px bg-gray-300" />
          <div>
            <h1 className="text-lg font-semibold">{project.name}</h1>
            <p className="text-sm text-gray-500">
              {project.description || "暂无描述"}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            <Database className="h-3 w-3 mr-1" />
            {files.length} 个文件
          </Badge>
          <Badge variant="outline">
            <MessageCircle className="h-3 w-3 mr-1" />
            {sessions.length} 个对话
          </Badge>
        </div>
      </div>

      {/* Main Content Area - Three Column Layout */}
      <ProjectLayout
        project={project}
        files={files}
        selectedFile={selectedFile}
        onFileSelect={handleFileSelect}
        onFileUpload={handleFileUpload}
        isUploading={isUploading}
        sessions={sessions}
        currentSession={currentSession}
        messages={messages}
        onCreateSession={handleCreateSession}
        onSessionSelect={handleSessionSelect}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}