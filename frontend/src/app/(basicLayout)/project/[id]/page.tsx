"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Bot,
  MessageCircle,
  ArrowLeft,
  Plus,
  ArrowRight,
} from "lucide-react";
import { projectAPI, sessionAPI, type Project, type Session } from "@/lib/api";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (projectId) {
      loadProject();
      loadSessions();
    }
  }, [projectId, loadProject, loadSessions]);

  const handleCreateSession = async () => {
    if (!project) return;

    try {
      const newSession = await sessionAPI.createSession(projectId);
      setSessions((prev) => [newSession, ...prev]);
      router.push(`/session/${newSession.id}`);
    } catch (err) {
      console.error("Error creating session:", err);
    }
  };

  const handleSessionSelect = (session: Session) => {
    router.push(`/session/${session.id}`);
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
    <SidebarProvider
      style={
        {
          "--sidebar-width": "16rem",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r">
          <Sidebar className="h-full">
            <SidebarHeader className="border-b px-4 py-3">
              <div className="flex items-center space-x-3">
                <Bot className="h-8 w-8 text-blue-500" />
                <div>
                  <h1 className="text-lg font-semibold">DP Agent</h1>
                  <p className="text-xs text-gray-500">数据处理助手</p>
                </div>
              </div>
            </SidebarHeader>

            <SidebarContent className="p-4">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={handleBackToProjects}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    返回项目列表
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>

              <Separator className="my-4" />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-600">当前项目</h3>
                  <Badge variant="secondary">{project.name}</Badge>
                </div>

                <Button
                  onClick={handleCreateSession}
                  className="w-full mb-4"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  新建对话
                </Button>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-600">历史对话</h4>
                  {sessions.length === 0 ? (
                    <p className="text-sm text-gray-500">暂无对话记录</p>
                  ) : (
                    <div className="space-y-1">
                      {sessions.map((session) => (
                        <Button
                          key={session.id}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-left"
                          onClick={() => handleSessionSelect(session)}
                        >
                          <MessageCircle className="h-3 w-3 mr-2" />
                          <span className="truncate">{session.title}</span>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </SidebarContent>
          </Sidebar>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{project.name}</h2>
                <p className="text-sm text-gray-500">
                  {project.description || "暂无描述"}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">
                  <MessageCircle className="h-3 w-3 mr-1" />
                  {sessions.length} 个对话
                </Badge>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>开始数据处理对话</CardTitle>
                  <p className="text-sm text-gray-500">
                    与AI助手进行自然语言对话，完成数据清洗、转换和分析任务
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">快速开始</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          创建新会话并上传数据文件
                        </p>
                        <Button onClick={handleCreateSession} className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          创建新会话
                        </Button>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">继续对话</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          从历史会话中选择继续
                        </p>
                        <Button
                          variant="outline"
                          className="w-full"
                          disabled={sessions.length === 0}
                          onClick={() =>
                            sessions.length > 0 &&
                            handleSessionSelect(sessions[0])
                          }
                        >
                          查看最新对话
                        </Button>
                      </div>
                    </div>

                    {sessions.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3">最近对话</h4>
                        <div className="space-y-2">
                          {sessions.slice(0, 3).map((session) => (
                            <div
                              key={session.id}
                              className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                              onClick={() => handleSessionSelect(session)}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">{session.title}</p>
                                  <p className="text-sm text-gray-500">
                                    {new Date(
                                      session.updated_at
                                    ).toLocaleString()}
                                  </p>
                                </div>
                                <ArrowRight className="h-4 w-4 text-gray-400" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}