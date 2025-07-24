'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { BarChart3, Database, Hash, Calendar, FileText } from 'lucide-react'
import { dataAPI, type DataProfile, type ColumnStats } from '@/lib/api'

interface DataProfilerProps {
  filePath?: string
}

const DataProfiler: React.FC<DataProfilerProps> = ({ filePath }) => {
  const [profile, setProfile] = useState<DataProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [previewData, setPreviewData] = useState<any[]>([])

  useEffect(() => {
    if (filePath) {
      fetchProfile()
      fetchPreview()
    }
  }, [filePath])

  const fetchProfile = async () => {
    if (!filePath) return
    
    try {
      setLoading(true)
      const data = await dataAPI.profileData(filePath)
      setProfile(data)
    } catch (error) {
      console.error('数据探查失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPreview = async () => {
    if (!filePath) return
    
    try {
      const data = await dataAPI.previewData(filePath, 10)
      setPreviewData(data || [])
    } catch (error) {
      console.error('获取预览数据失败:', error)
    }
  }

  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      'int64': 'blue',
      'float64': 'green',
      'object': 'orange',
      'datetime64': 'purple',
      'bool': 'red',
    }
    return colors[type] || 'default'
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'int64':
      case 'float64':
        return <Hash className="h-4 w-4" />
      case 'datetime64':
        return <Calendar className="h-4 w-4" />
      default:
        return <Database className="h-4 w-4" />
    }
  }

  const renderQualityIndicator = (quality?: DataProfile['quality']) => {
    const score = quality?.score || 0
    const color = score >= 80 ? 'text-green-500' : score >= 60 ? 'text-yellow-500' : 'text-red-500'
    
    return (
      <div className="text-center">
        <div className={`text-2xl font-bold ${color}`}>{score}%</div>
        <Progress value={score} className="w-20" />
      </div>
    )
  }

  if (!profile && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <FileText className="h-12 w-12 mb-4" />
        <p>选择文件以查看数据探查结果</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              数据探查
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="data-profiler space-y-4">
      {/* 基本信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            数据概览
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">文件路径</p>
              <p className="text-sm font-mono bg-gray-100 p-1 rounded">{filePath}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">总行数</p>
              <p className="text-lg font-semibold">{profile.shape?.rows || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">总列数</p>
              <p className="text-lg font-semibold">{profile.shape?.columns || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">内存使用</p>
              <p className="text-lg font-semibold">{profile.memory_usage || '未知'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 数据质量 */}
      <Card>
        <CardHeader>
          <CardTitle>数据质量评估</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">整体质量</p>
              {renderQualityIndicator(profile.quality)}
            </div>
            {profile.quality?.issues && profile.quality.issues.length > 0 && (
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-2">发现的问题：</p>
                <div className="flex flex-wrap gap-2">
                  {profile.quality.issues.map((issue, index) => (
                    <Badge key={index} variant="outline" className="bg-orange-50">
                      {issue}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 列信息 */}
      <Card>
        <CardHeader>
          <CardTitle>列信息统计</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {Object.entries(profile.columns || {}).map(([column, stats]) => (
                <Card key={column} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      {getTypeIcon(stats.type)}
                      <span>{column}</span>
                      <Badge variant={getTypeColor(stats.type)}>
                        {stats.type}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">非空值</p>
                        <p className="font-semibold">{stats.non_null_count}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">空值</p>
                        <p className="font-semibold text-red-600">{stats.null_count}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">唯一值</p>
                        <p className="font-semibold">{stats.unique_count}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">重复率</p>
                        <p className="font-semibold">{stats.duplicate_rate}%</p>
                      </div>
                    </div>
                    
                    {stats.numeric_stats && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-3 pt-3 border-t">
                        <div>
                          <p className="text-gray-500">最小值</p>
                          <p className="font-semibold">{stats.numeric_stats.min}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">最大值</p>
                          <p className="font-semibold">{stats.numeric_stats.max}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">平均值</p>
                          <p className="font-semibold">{stats.numeric_stats.mean?.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">标准差</p>
                          <p className="font-semibold">{stats.numeric_stats.std?.toFixed(2)}</p>
                        </div>
                      </div>
                    )}
                    
                    {stats.top_values && stats.top_values.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-gray-500 mb-2">Top 5 值：</p>
                        <div className="flex flex-wrap gap-2">
                          {stats.top_values.slice(0, 5).map(([value, count]) => (
                            <Badge key={String(value)} variant="outline">
                              {String(value)} ({count})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

export default DataProfiler