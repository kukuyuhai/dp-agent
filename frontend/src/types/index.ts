// 通用类型定义

export interface FileItem {
  id: string;
  name: string;
  path: string;
  size?: number;
  uploaded_at?: string;
  file_type?: string;
}

// 项目相关类型
export interface Project {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at?: string;
}

// 会话相关类型
export interface Session {
  id: string;
  project_id: string;
  title?: string;
  created_at: string;
  updated_at: string;
  messages?: Message[];
}

export interface Message {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}