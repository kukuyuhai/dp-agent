'use client'

import { useState } from 'react'
import { Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Bot, Folder } from 'lucide-react'
import ProjectList from '@/components/ProjectList'

export default function Home() {
  const [sidebarOpen] = useState(true)





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
                  onClick={() => window.location.href = '/'}
                  isActive={true}
                >
                  <Folder className="h-4 w-4 mr-2" />
                  所有项目
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>

            <Separator className="my-4" />


          </SidebarContent>


        </Sidebar>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                项目列表
              </h2>
              <p className="text-sm text-gray-500">
                管理您的数据处理项目
              </p>
            </div>

          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <div className="p-6">
            <ProjectList />
          </div>
        </div>
      </div>
    </div>
  )
}
