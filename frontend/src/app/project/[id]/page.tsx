'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Bot, MessageCircle, ArrowLeft, Plus } from 'lucide-react'
import { projectAPI, sessionAPI, type Project, type Session } from '@/lib/api'

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  const loadProject = useCallback(async () => {
    try {
      const data = await projectAPI.getProject(projectId)
      setProject(data)
    } catch (err) {
      console.error('Error loading project:', err)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  const loadSessions = useCallback(async () => {
    try {
      const data = await sessionAPI.getSessions(projectId)
      setSessions(data)
    } catch (err) {
      console.error('Error loading sessions:', err)
    }
  }, [projectId])

  useEffect(() => {
    if (projectId) {
      loadProject()
      loadSessions()
    }
  }, [projectId, loadProject, loadSessions])

  const handleCreateSession = async () => {
    if (!project) return
    
    try {
      const newSession = await sessionAPI.createSession(projectId)
      setSessions(prev => [newSession, ...prev])
      router.push(`/session/${newSession.id}`)
    } catch (err) {
      console.error('Error creating session:', err)
    }
  }

  const handleSessionSelect = (session: Session) => {
    router.push(`/session/${session.id}`)
  }

  const handleBackToProjects = () => {
    router.push('/')
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
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
    )
  }

  return (
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
                    {sessions.map(session => (
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

          <div className="border-t p-4">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">用户</p>
                <p className="text-xs text-gray-500">在线</p>
              </div>
            </div>
          </div>
        </Sidebar>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">{project.name}</h2>
              <p className="text-sm text-gray-500">{project.description || '暂无描述'}</p>
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
          <div className="text-center py-12">
            <Bot className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">开始数据处理</h3>
            <p className="text-gray-500 mb-4">点击左侧"新建对话"按钮开始新的数据处理会话</p>
            <Button onClick={handleCreateSession}>
              <Plus className="h-4 w-4 mr-2" />
              新建对话
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}