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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, MessageCircle, ArrowLeft, ArrowRight } from "lucide-react";
import ChatInterface from "@/components/chat-interface";
import { projectAPI, sessionAPI, type Project, type Session } from "@/lib/api";

export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSession = useCallback(async () => {
    try {
      const sessionData = await sessionAPI.getSession(sessionId);
      setSession(sessionData);

      if (sessionData.project_id) {
        const projectData = await projectAPI.getProject(sessionData.project_id);
        setProject(projectData);
      }
    } catch (err) {
      console.error("Error loading session:", err);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (sessionId) {
      loadSession();
    }
  }, [sessionId, loadSession]);

  const handleBackToProject = () => {
    if (project) {
      router.push(`/project/${project.id}`);
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

  if (!session || !project) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">会话或项目未找到</h2>
            <div className="space-x-2">
              <Button onClick={handleBackToProject}>返回项目</Button>
              <Button onClick={handleBackToProjects} variant="outline">
                返回项目列表
              </Button>
            </div>
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
                    项目列表
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={handleBackToProject}>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    返回项目
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>

              <Separator className="my-4" />

              <div>
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-600 mb-1">
                    项目
                  </h3>
                  <p className="text-sm font-medium">{project.name}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">
                    当前对话
                  </h4>
                  <p className="text-sm text-gray-700">{session.title}</p>
                  <p className="text-xs text-gray-500">
                    创建于 {new Date(session.created_at).toLocaleDateString()}
                  </p>
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
                <h2 className="text-xl font-semibold">{session.title}</h2>
                <p className="text-sm text-gray-500">
                  项目: {project.name} • 创建于{" "}
                  {new Date(session.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-green-50">
                  <MessageCircle className="h-3 w-3 mr-1" />
                  对话中
                </Badge>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            <Tabs defaultValue="chat" className="h-full">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="chat" className="flex items-center space-x-2">
                  <MessageCircle className="h-4 w-4" />
                  <span>对话</span>
                </TabsTrigger>
                <TabsTrigger value="data" className="flex items-center space-x-2">
                  <Bot className="h-4 w-4" />
                  <span>数据探查</span>
                </TabsTrigger>
                <TabsTrigger value="versions" className="flex items-center space-x-2">
                  <Bot className="h-4 w-4" />
                  <span>版本历史</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="h-[calc(100%-60px)] mt-6">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>对话界面</CardTitle>
                  </CardHeader>
                  <CardContent className="h-full p-0">
                    <ChatInterface
                      project={project}
                      session={session}
                      onNewSession={() => { }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}