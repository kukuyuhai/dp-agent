import type { Metadata } from 'next'
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import ProjectList from '@/components/project-list'

export const metadata: Metadata = {
  title: "控制台 - DP Agent",
  description: "DP Agent 控制台页面，管理和监控您的数据处理项目和工作流",
  keywords: ["控制台", "项目管理", "数据处理控制台", "工作流管理"],
  openGraph: {
    title: "控制台 - DP Agent",
    description: "管理和监控您的数据处理项目和工作流",
  },
};

export default function Page() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="space-y-6 p-4">
                <h2 className="text-xl font-semibold text-gray-900">项目列表</h2>
                <ProjectList />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
