import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface Project {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

export interface Session {
  id: string
  project_id: string
  title?: string
  created_at: string
  updated_at: string
  messages?: Message[]
}

export interface Message {
  id: string
  session_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface Version {
  id: string
  project_id: string
  version: string
  message?: string
  description?: string
  code?: string
  data_snapshot_path?: string
  metadata?: {
    rows?: number
    columns?: number
    column_names?: string[]
    dtypes?: Record<string, string>
    null_counts?: Record<string, number>
    file_size?: number
    [key: string]: string | number | string[] | Record<string, string> | Record<string, number> | undefined
  }
  author?: string
  type?: string
  created_at: string
  updated_at: string
}

export const projectAPI = {
  getProjects: async (): Promise<Project[]> => {
    const response = await api.get('/projects')
    return response.data
  },

  createProject: async (name: string, description?: string): Promise<Project> => {
    const response = await api.post('/projects', { name, description })
    return response.data
  },

  getProject: async (id: string): Promise<Project> => {
    const response = await api.get(`/projects/${id}`)
    return response.data
  },

  updateProject: async (id: string, data: Partial<Project>): Promise<Project> => {
    const response = await api.put(`/projects/${id}`, data)
    return response.data
  },

  deleteProject: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`)
  },
}

export const sessionAPI = {
  createSession: async (projectId: string, title?: string, initialMessage?: string): Promise<Session> => {
    const formData = new URLSearchParams();
    formData.append('project_id', projectId);
    formData.append('title', title || '新对话');
    if (initialMessage) {
      formData.append('initial_message', initialMessage);
    }
    
    const response = await api.post('/sessions', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  getSession: async (id: string): Promise<Session> => {
    const response = await api.get(`/sessions/${id}`)
    return response.data
  },

  getSessions: async (projectId: string): Promise<Session[]> => {
    const response = await api.get(`/sessions?project_id=${projectId}`)
    return response.data
  },

  sendMessage: async (sessionId: string, content: string): Promise<Message> => {
    const response = await api.post('/chat', { session_id: sessionId, message: content })
    // 将ChatResponse转换为Message格式
    return {
      id: Date.now().toString(),
      session_id: sessionId,
      role: 'assistant',
      content: response.data.message,
      created_at: new Date().toISOString()
    }
  },

  getMessages: async (sessionId: string): Promise<Message[]> => {
    const response = await api.get(`/sessions/${sessionId}/history`)
    return response.data.map((msg: any) => ({
      id: msg.id,
      session_id: sessionId,
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      created_at: msg.created_at
    }))
  },
}

export const versionAPI = {
  getVersions: async (projectId: string): Promise<Version[]> => {
    const response = await api.get(`/projects/${projectId}/versions`)
    return response.data
  },

  createVersion: async (projectId: string, message: string, code?: string, dataSnapshot?: Record<string, unknown>): Promise<Version> => {
    const response = await api.post(`/projects/${projectId}/versions`, {
      message,
      code,
      data_snapshot: dataSnapshot,
    })
    return response.data
  },

  rollbackVersion: async (projectId: string, versionId: string): Promise<void> => {
    await api.post(`/projects/${projectId}/versions/${versionId}/rollback`)
  },

  getVersion: async (projectId: string, versionId: string): Promise<Version> => {
    const response = await api.get(`/projects/${projectId}/versions/${versionId}`)
    return response.data
  },

  compareVersions: async (projectId: string, version1Id: string, version2Id: string): Promise<Record<string, unknown>> => {
    const response = await api.get(`/projects/${projectId}/versions/compare/${version1Id}/${version2Id}`)
    return response.data
  },

  downloadVersion: async (projectId: string, versionId: string): Promise<Blob> => {
    const response = await api.get(`/projects/${projectId}/versions/${versionId}/download`, {
      responseType: 'blob'
    })
    return response.data
  }
}

// 数据探查相关接口
export interface DataProfile {
  shape: {
    rows: number
    columns: number
  }
  memory_usage: string
  columns: Record<string, ColumnStats>
  quality: {
    score: number
    issues: string[]
  }
}

export interface ColumnStats {
  type: string
  non_null_count: number
  null_count: number
  unique_count: number
  duplicate_rate: number
  numeric_stats?: {
    min: number
    max: number
    mean: number
    std: number
  }
  top_values?: Array<[string | number, number]>
}

export const dataAPI = {
  profileData: async (filePath: string): Promise<DataProfile> => {
    const response = await api.post('/data/profile', { file_path: filePath })
    return response.data
  },

  previewData: async (filePath: string, limit: number = 100): Promise<Record<string, unknown>[]> => {
    const response = await api.post('/data/preview', { file_path: filePath, limit })
    return response.data
  },
}

export default api