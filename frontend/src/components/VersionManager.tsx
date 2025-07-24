'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  History, 
  RotateCcw, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  Download,
  GitBranch,
  Clock,
  User
} from 'lucide-react'
import { versionAPI, type Version } from '@/lib/api'

interface VersionManagerProps {
  projectId: string
  onRollback?: (version: Version) => void
}

export default function VersionManager({ projectId, onRollback }: VersionManagerProps) {
  const [versions, setVersions] = useState<Version[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showRollbackModal, setShowRollbackModal] = useState(false)

  useEffect(() => {
    if (projectId) {
      fetchVersions()
    }
  }, [projectId])

  const fetchVersions = async () => {
    try {
      setLoading(true)
      const data = await versionAPI.getVersions(projectId)
      setVersions(data || [])
    } catch (error) {
      console.error('获取版本历史失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRollback = async (version: Version) => {
    try {
      await versionAPI.rollback(version.id)
      setShowRollbackModal(false)
      setSelectedVersion(null)
      
      if (onRollback) {
        onRollback(version)
      }
      
      // 刷新版本列表
      await fetchVersions()
    } catch (error) {
      console.error('版本回滚失败:', error)
    }
  }

  const getOperationColor = (type: string) => {
    const colors: Record<string, string> = {
      'create': 'bg-green-500',
      'update': 'bg-blue-500',
      'delete': 'bg-red-500',
      'transform': 'bg-orange-500',
      'rollback': 'bg-purple-500',
    }
    return colors[type] || 'bg-gray-500'
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-4 w-4" />
            版本历史
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              版本历史
            </CardTitle>
            <Button onClick={fetchVersions} size="sm" variant="outline">
              <History className="h-4 w-4 mr-2" />
              刷新
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {versions.length === 0 ? (
            <div className="text-center py-8">
              <GitBranch className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">暂无版本记录</p>
              <p className="text-sm text-gray-400 mt-2">开始处理数据后将自动生成版本</p>
            </div>
          ) : (
            <div className="space-y-4">
              {versions.map((version, index) => (
                <div key={version.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full ${getOperationColor(version.type || 'update')} flex items-center justify-center`}>
                          <GitBranch className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-lg">{version.message || '数据处理'}</h3>
                          <Badge variant="outline" className="text-xs">
                            v{version.version}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>{version.author || '系统'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(version.created_at)}</span>
                          </div>
                        </div>

                        {version.metadata && (
                          <div className="text-sm text-gray-500 space-y-1">
                            <p>数据规模: {version.metadata.rows || 0} 行 × {version.metadata.columns || 0} 列</p>
                            {version.metadata.file_size && (
                              <p>文件大小: {formatFileSize(version.metadata.file_size)}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedVersion(version)
                          setShowDetailModal(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedVersion(version)
                          setShowRollbackModal(true)
                        }}
                        disabled={index === 0}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 版本详情模态框 */}
      {showDetailModal && selectedVersion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <CardHeader>
              <CardTitle>版本详情</CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">版本信息</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">版本号:</span>
                      <span className="ml-2 font-mono">{selectedVersion.version}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">作者:</span>
                      <span className="ml-2">{selectedVersion.author || '系统'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">创建时间:</span>
                      <span className="ml-2">{formatDate(selectedVersion.created_at)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">类型:</span>
                      <span className="ml-2">{selectedVersion.type || 'update'}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2">描述</h4>
                  <p className="text-sm text-gray-700">{selectedVersion.message || '无描述信息'}</p>
                </div>

                {selectedVersion.metadata && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">数据信息</h4>
                      <div className="space-y-2 text-sm">
                        {Object.entries(selectedVersion.metadata).map(([key, value]) => (
                          <div key={key}>
                            <span className="text-gray-600 capitalize">{key}:</span>
                            <span className="ml-2">{JSON.stringify(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {selectedVersion.code && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">处理代码</h4>
                      <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                        <code>{selectedVersion.code}</code>
                      </pre>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
            <div className="p-4 border-t flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                关闭
              </Button>
              <Button onClick={() => setShowRollbackModal(true)} disabled={selectedVersion.id === versions[0]?.id}>
                <RotateCcw className="h-4 w-4 mr-2" />
                回滚到此版本
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* 回滚确认模态框 */}
      {showRollbackModal && selectedVersion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>确认回滚</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                您确定要将项目回滚到版本 <strong>{selectedVersion.version}</strong> 吗？
              </p>
              <p className="text-sm text-gray-600">
                此操作将创建一个新的版本记录，不会删除现有版本。
              </p>
            </CardContent>
            <div className="p-4 border-t flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowRollbackModal(false)}>
                取消
              </Button>
              <Button onClick={() => handleRollback(selectedVersion)} variant="destructive">
                <RotateCcw className="h-4 w-4 mr-2" />
                确认回滚
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}