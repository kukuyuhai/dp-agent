'use client'

import { useState } from 'react'
import { Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Bot, Folder, Plus, MessageCircle, History, Database } from 'lucide-react'
import ProjectList from '@/components/ProjectList'
import ChatInterface from '@/components/ChatInterface'
import VersionManager from '@/components/VersionManager'
import DataProfiler from '@/components/DataProfiler'
import { type Project, type Session } from '@/lib/api'

export default function Home() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [currentSession, setCurrentSession] = useState<Session | null>(null)
  const [sidebarOpen] = useState(true)

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project)
    setCurrentSession(null) // Reset session when switching projects
  }

  const handleNewSession = async (session: Session) => {
    setCurrentSession(session)
  }

  const handleCreateSession = async () => {
    if (!selectedProject) return
    
    try {
      // In a real app, you would call sessionAPI.createSession here
      const newSession: Session = {
        id: Date.now().toString(),
        project_id: selectedProject.id,
        title: '新对话',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setCurrentSession(newSession)
    } catch (err) {
      console.error('Error creating session:', err)
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-white border-r`}>
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
                <SidebarMenuButton 
                  onClick={() => setSelectedProject(null)}
                  isActive={!selectedProject}
                >
                  <Folder className="h-4 w-4 mr-2" />
                  所有项目
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>

            <Separator className="my-4" />

            {selectedProject && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-600">当前项目</h3>
                  <Badge variant="secondary">{selectedProject.name}</Badge>
                </div>
                
                <Button 
                  onClick={handleCreateSession}
                  className="w-full mb-4"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  新建对话
                </Button>
              </div>
            )}
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
              <h2 className="text-xl font-semibold">
                {selectedProject ? selectedProject.name : '项目列表'}
              </h2>
              <p className="text-sm text-gray-500">
                {selectedProject ? selectedProject.description : '管理您的数据处理项目'}
              </p>
            </div>
            {selectedProject && (
              <div className="flex items-center space-x-2">
                <Badge variant="outline">
                  <MessageCircle className="h-3 w-3 mr-1" />
                  {currentSession ? '对话中' : '未开始'}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {!selectedProject ? (
            <div className="p-6">
              <ProjectList onProjectSelect={handleProjectSelect} />
            </div>
          ) : (
            <div className="h-full p-6">
              <Tabs defaultValue="chat" className="h-full">
                <TabsList className="grid w-full max-w-md grid-cols-3">
                  <TabsTrigger value="chat" className="flex items-center space-x-2">
                    <MessageCircle className="h-4 w-4" />
                    <span>对话</span>
                  </TabsTrigger>
                  <TabsTrigger value="data" className="flex items-center space-x-2">
                    <Database className="h-4 w-4" />
                    <span>数据探查</span>
                  </TabsTrigger>
                  <TabsTrigger value="versions" className="flex items-center space-x-2">
                    <History className="h-4 w-4" />
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
                        project={selectedProject}
                        session={currentSession}
                        onNewSession={handleNewSession}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="data" className="h-[calc(100%-60px)] mt-6">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle>数据探查</CardTitle>
                    </CardHeader>
                    <CardContent className="h-full overflow-y-auto">
                      <DataProfiler projectId={selectedProject.id} />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="versions" className="h-[calc(100%-60px)] mt-6">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle>版本管理</CardTitle>
                    </CardHeader>
                    <CardContent className="h-full overflow-y-auto">
                      <VersionManager 
                        projectId={selectedProject.id} 
                        onRollback={(version) => {
                          console.log('回滚到版本:', version.version)
                        }}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
