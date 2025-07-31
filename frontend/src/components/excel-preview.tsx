'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { FileText, Download, Eye, BarChart3, Database } from 'lucide-react'
import { fileAPI, type DataProfile } from '@/lib/api'

interface ExcelPreviewProps {
  projectId: string
  fileId: string
  fileName: string
}

export function ExcelPreview({ projectId, fileId, fileName }: ExcelPreviewProps) {
  const [data, setData] = useState<DataProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('preview')

  useEffect(() => {
    loadData()
  }, [fileId])

  const loadData = async () => {
    try {
      setLoading(true)
      const profile = await fileAPI.previewFile(projectId, fileId)
      setData(profile)
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const renderDataTable = () => {
    if (!data?.preview) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <Database className="h-12 w-12 mb-4" />
          <p>无法预览此文件</p>
        </div>
      )
    }

    const { headers, rows } = data.preview

    return (
      <div className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((header: string, index: number) => (
                <TableHead key={index} className="font-medium">
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.slice(0, 100).map((row: any, rowIndex: number) => (
              <TableRow key={rowIndex}>
                {Array.isArray(row) ? (
                  row.map((cell: any, cellIndex: number) => (
                    <TableCell key={cellIndex} className="text-sm">
                      {cell !== null && cell !== undefined ? String(cell) : '-'}
                    </TableCell>
                  ))
                ) : (
                  <TableCell colSpan={headers.length} className="text-sm text-gray-500">
                    {typeof row === 'object' && row !== null ? JSON.stringify(row) : String(row)}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {rows.length > 100 && (
          <div className="text-center py-4 text-sm text-gray-500">
            显示前100行，共{rows.length}行
          </div>
        )}
      </div>
    )
  }

  const renderDataInsights = () => {
    if (!data) return null

    return (
      <div className="space-y-6">
        {/* 基本信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              数据概览
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">总行数</p>
                <p className="text-xl font-semibold">{data.shape?.rows || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">总列数</p>
                <p className="text-xl font-semibold">{data.shape?.columns || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">内存使用</p>
                <p className="text-lg font-semibold">{data.memory_usage || '未知'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">数据质量</p>
                <p className="text-lg font-semibold">{data.quality?.score || 0}%</p>
              </div>
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
                {Object.entries(data.columns || {}).map(([column, stats]) => (
                  <Card key={column} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center justify-between">
                        <span>{column}</span>
                        <Badge variant="outline">{stats.type}</Badge>
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
                          <p className="font-semibold">{(stats.duplicate_rate * 100).toFixed(1)}%</p>
                        </div>
                      </div>
                      {stats.numeric_stats && (
                        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
                            <p className="font-semibold">{stats.numeric_stats.mean.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">标准差</p>
                            <p className="font-semibold">{stats.numeric_stats.std.toFixed(2)}</p>
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

        {/* 数据质量问题 */}
        {data.quality?.issues && data.quality.issues.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>数据质量问题</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.quality.issues.map((issue, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <Badge variant="outline" className="bg-orange-50">
                      {issue}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4" />
          <h2 className="font-semibold">{fileName}</h2>
          <Badge variant="outline" className="text-xs">
            Excel文件
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            下载
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="m-4">
            <TabsTrigger value="preview">数据预览</TabsTrigger>
            <TabsTrigger value="insights">数据洞察</TabsTrigger>
          </TabsList>
          
          <TabsContent value="preview" className="h-[calc(100%-60px)] m-0">
            <ScrollArea className="h-full p-4">
              {renderDataTable()}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="insights" className="h-[calc(100%-60px)] m-0">
            <ScrollArea className="h-full p-4">
              {renderDataInsights()}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}