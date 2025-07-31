"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Bot, MessageCircle, Plus, History, Settings, User, ChevronRight } from "lucide-react";
import type { Session, Message, Project } from "@/types";

interface ChatInterfaceProps {
  project: Project;
  sessions: Session[];
  currentSession: Session | null;
  messages: Message[];
  onCreateSession: () => void;
  onSessionSelect: (session: Session) => void;
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

export function ChatInterface({
  project,
  sessions,
  currentSession,
  messages,
  onCreateSession,
  onSessionSelect,
  onSendMessage,
  isLoading = false,
}: ChatInterfaceProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [showSessionHistory, setShowSessionHistory] = useState(false);

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !currentSession) return;
    onSendMessage(inputMessage.trim());
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full bg-white border-l flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold flex items-center">
          <Bot className="h-4 w-4 mr-2" />
          会话
        </h2>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCreateSession}
            title="新建会话"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Sheet open={showSessionHistory} onOpenChange={setShowSessionHistory}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" title="会话历史">
                <History className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>会话历史</SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-full mt-4">
                <div className="space-y-2">
                  {sessions.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">
                      暂无会话记录
                    </p>
                  ) : (
                    sessions.map((session) => (
                      <div
                        key={session.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          currentSession?.id === session.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => {
                          onSessionSelect(session);
                          setShowSessionHistory(false);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium truncate">
                              {session.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(session.updated_at).toLocaleString()}
                            </p>
                          </div>
                          {currentSession?.id === session.id && (
                            <ChevronRight className="h-4 w-4 text-blue-500" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" title="配置信息">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>配置信息</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">项目信息</h3>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">项目名称:</span> {project.name}</p>
                    <p><span className="font-medium">项目ID:</span> {project.id}</p>
                    <p><span className="font-medium">创建时间:</span> {new Date(project.created_at).toLocaleString()}</p>
                    {project.description && (
                      <p><span className="font-medium">描述:</span> {project.description}</p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">当前会话</h3>
                  {currentSession ? (
                    <div className="text-sm space-y-1">
                      <p><span className="font-medium">会话标题:</span> {currentSession.title}</p>
                      <p><span className="font-medium">会话ID:</span> {currentSession.id}</p>
                      <p><span className="font-medium">更新时间:</span> {new Date(currentSession.updated_at).toLocaleString()}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">暂无活跃会话</p>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {currentSession ? (
            messages.length === 0 ? (
              <div className="text-center py-8">
                <Bot className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-sm text-gray-500">开始与AI助手对话</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-xs lg:max-w-md`}>
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0 mr-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    {message.role === 'user' && (
                      <div className="flex-shrink-0 ml-2">
                        <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )
          ) : (
            <div className="text-center py-8">
              <Bot className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">开始新的对话</h3>
              <p className="text-gray-500 mb-4">点击右上角新建会话按钮开始</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Chat Input */}
      {currentSession && (
        <div className="border-t p-4">
          <div className="flex space-x-2">
            <Input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入您的问题..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
            >
              {isLoading ? '发送中...' : '发送'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}