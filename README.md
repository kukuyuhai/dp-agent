# DP Agent - 数据处理智能体系统

基于自然语言的数据处理和分析平台，通过对话式交互实现复杂的数据处理任务。

## 🚀 功能特性

- **自然语言处理**: 用自然语言描述数据处理需求，系统自动生成代码
- **Git-like版本控制**: 完整的数据版本历史记录和回滚功能
- **Docker沙箱执行**: 安全的代码执行环境，隔离用户代码
- **多轮对话**: 支持上下文感知的连续对话处理
- **数据质量探查**: 自动分析数据质量和生成统计报告
- **对象存储**: 基于MinIO的分布式文件存储
- **实时监控**: 完整的操作日志和性能监控

## 🏗️ 系统架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端 (React)   │────│  后端 (FastAPI)  │────│  数据库 (PostgreSQL) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                       ┌─────────────────┐
                       │   MinIO存储     │
                       └─────────────────┘
                                │
                       ┌─────────────────┐
                       │ Docker沙箱      │
                       └─────────────────┘
```

## 🛠️ 技术栈

- **后端**: FastAPI + SQLAlchemy + PostgreSQL
- **前端**: React + TypeScript + Ant Design
- **AI**: OpenAI GPT-4o-mini
- **存储**: MinIO (对象存储)
- **容器**: Docker + Docker Compose
- **数据处理**: Polars + Pandas

## 目录结构

```
.
├── backend/         # FastAPI后端
├── frontend/        # React前端
├── docker-compose.yml
└── README.md
```

## 快速开始

1. 安装 Docker、Node.js、Python 3.10+
2. 克隆本项目，进入根目录
3. 启动服务
   ```bash
   docker-compose up --build
   ```
4. 访问前端页面（默认 http://localhost:3000 ）
5. API文档地址：http://localhost:8000/docs

## 📋 环境要求

- Docker & Docker Compose
- Python 3.9+
- PostgreSQL 15+
- MinIO
- OpenAI API Key

## 🚀 快速开始

### 1. 环境配置

复制环境变量模板：

```bash
cp backend/.env.example backend/.env
```

编辑 `backend/.env` 文件，配置必要的环境变量：

```bash
# 必填
OPENAI_API_KEY=your-openai-api-key

# 可选 - 使用默认值即可
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dp_agent
MINIO_ENDPOINT=localhost:9000
```

### 2. 启动服务

使用 Docker Compose 启动所有服务：

```bash
docker-compose up -d
```

服务启动后：
- 前端: http://localhost:3000
- 后端 API: http://localhost:8000
- API文档: http://localhost:8000/docs
- MinIO控制台: http://localhost:9001 (minioadmin/minioadmin)

### 3. 验证安装

检查服务状态：

```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f backend

# 测试API
curl http://localhost:8000/health
```

## 📖 使用指南

### 1. 创建项目

通过 API 创建新项目：

```bash
curl -X POST http://localhost:8000/api/v1/projects \
  -H "Content-Type: application/json" \
  -d '{"name": "销售数据分析", "description": "2024年销售数据处理"}'
```

### 2. 上传数据

上传 CSV 或 Excel 文件：

```bash
curl -X POST http://localhost:8000/api/v1/projects/{project_id}/upload \
  -F "file=@data.csv"
```

### 3. 开始对话

创建会话并开始数据处理：

```bash
# 创建会话
curl -X POST http://localhost:8000/api/v1/sessions \
  -H "Content-Type: application/json" \
  -d '{"project_id": "{project_id}"}'

# 发送指令
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "{session_id}",
    "message": "请删除空值行并按销售额降序排序"
  }'
```

### 4. 版本管理

查看版本历史：

```bash
# 获取版本历史
curl http://localhost:8000/api/v1/versions/{project_id}

# 回滚到指定版本
curl -X POST http://localhost:8000/api/v1/versions/rollback \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "{session_id}",
    "version_id": "{version_id}"
  }'
```

### 5. 数据探查

分析数据质量：

```bash
curl -X POST http://localhost:8000/api/v1/data/profile \
  -H "Content-Type: application/json" \
  -d '{"file_path": "/path/to/data.csv"}'
```

## 🔧 开发指南

### 本地开发

1. **安装依赖**：

```bash
cd backend
pip install -r requirements.txt
```

2. **启动数据库**：

```bash
docker-compose up -d db minio
```

3. **运行后端**：

```bash
cd backend
python main.py
```

4. **运行前端**：

```bash
cd frontend
pnpm install
pnpm start
```

### 项目结构

```
dp-agent/
├── backend/
│   ├── app/
│   │   ├── api/           # API路由
│   │   ├── core/          # 核心组件
│   │   ├── models/        # 数据模型
│   │   └── services/      # 业务逻辑
│   ├── main.py            # 主应用文件
│   └── requirements.txt   # 依赖列表
├── frontend/              # React前端应用
├── data/                  # 数据文件
├── uploads/               # 上传文件
├── docker-compose.yml     # 服务配置
└── README.md
```

## 📊 API 文档

完整的 API 文档可通过 Swagger UI 访问：

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### 主要端点

- `POST /api/v1/projects` - 创建项目
- `GET /api/v1/projects` - 获取项目列表
- `POST /api/v1/projects/{id}/upload` - 上传文件
- `POST /api/v1/sessions` - 创建会话
- `POST /api/v1/chat` - 处理对话
- `GET /api/v1/versions/{project_id}` - 获取版本历史
- `POST /api/v1/versions/rollback` - 版本回滚

## 🔐 安全配置

### 环境变量

确保以下环境变量已正确配置：

```bash
# 生产环境必须配置
OPENAI_API_KEY=your-secure-api-key
DATABASE_URL=postgresql://user:password@host:5432/dbname
MINIO_ACCESS_KEY=your-access-key
MINIO_SECRET_KEY=your-secret-key
```

### 安全建议

1. **API密钥**: 使用强密码和定期轮换
2. **网络**: 限制容器间网络访问
3. **存储**: 加密敏感数据存储
4. **日志**: 启用审计日志记录

## 🐛 故障排除

### 常见问题

1. **Docker容器无法启动**：
   ```bash
   docker-compose down
   docker-compose up -d
   ```

2. **数据库连接失败**：
   ```bash
   # 检查PostgreSQL状态
   docker-compose logs db
   
   # 重置数据库
   docker-compose down -v
   docker-compose up -d
   ```

3. **MinIO访问问题**：
   ```bash
   # 检查MinIO状态
   docker-compose logs minio
   
   # 访问控制台
   open http://localhost:9001
   ```

4. **OpenAI API错误**：
   - 检查API密钥是否正确
   - 验证网络连接
   - 查看API配额限制

### 日志查看

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
```
