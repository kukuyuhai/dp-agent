'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Folder, Database, MoreVertical, Clock, FileText, ArrowRight } from 'lucide-react'
import { projectAPI, type Project } from '@/lib/api'

interface ProjectListProps {
  onProjectSelect?: (project: Project) => void
}

export default function ProjectList({ onProjectSelect }: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const data = await projectAPI.getProjects()
      setProjects(data)
    } catch (err) {
      setError('加载项目失败')
      console.error('Error loading projects:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async () => {
    const name = prompt('请输入项目名称:')
    if (!name) return

    const description = prompt('请输入项目描述（可选）:')
    
    try {
      const newProject = await projectAPI.createProject(name, description || undefined)
      setProjects(prev => [...prev, newProject])
    } catch (err) {
      alert('创建项目失败')
      console.error('Error creating project:', err)
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-red-500">{error}</p>
            <Button onClick={loadProjects} className="mt-4">
              重试
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {projects.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="h-16 w-16 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                <Database className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">暂无项目</h3>
              <p className="text-slate-600 mb-4">创建您的第一个数据处理项目开始智能分析</p>
              <Button 
                onClick={handleCreateProject}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                创建项目
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map(project => (
            <Card 
              key={project.id} 
              className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-slate-200 hover:border-slate-300" 
              onClick={() => {
                if (onProjectSelect) {
                  onProjectSelect(project)
                } else {
                  window.location.href = `/project/${project.id}`
                }
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {project.name}
                    </CardTitle>
                    <CardDescription className="text-sm text-slate-600 line-clamp-2">
                      {project.description || '暂无描述'}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="bg-green-100 text-green-800 hover:bg-green-200"
                  >
                    活跃
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-slate-600">
                    <Folder className="h-4 w-4 mr-2 text-slate-400" />
                    <span>创建于 {new Date(project.created_at).toLocaleDateString('zh-CN')}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-slate-600">
                    <FileText className="h-4 w-4 mr-2 text-slate-400" />
                    <span>{project.sessions_count || 0} 个会话</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-slate-600">
                    <Clock className="h-4 w-4 mr-2 text-slate-400" />
                    <span>更新于 {new Date(project.updated_at).toLocaleDateString('zh-CN')}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">点击查看详情</span>
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center group-hover:from-blue-100 group-hover:to-purple-100 transition-colors">
                      <ArrowRight className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}