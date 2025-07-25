'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Folder, Database } from 'lucide-react'
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">所有项目</h2>
          <p className="text-gray-500">管理您的数据处理项目</p>
        </div>
        <Button onClick={handleCreateProject}>
          <Plus className="h-4 w-4 mr-2" />
          新建项目
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Database className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">暂无项目</h3>
              <p className="text-gray-500 mb-4">创建您的第一个数据处理项目</p>
              <Button onClick={handleCreateProject}>
                <Plus className="h-4 w-4 mr-2" />
                创建项目
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map(project => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
              if (onProjectSelect) {
                onProjectSelect(project)
              } else {
                window.location.href = `/project/${project.id}`
              }
            }}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <Badge variant="secondary">活跃</Badge>
                </div>
                <CardDescription>
                  {project.description || '暂无描述'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-gray-500">
                  <Folder className="h-4 w-4 mr-2" />
                  <span>创建于 {new Date(project.created_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}