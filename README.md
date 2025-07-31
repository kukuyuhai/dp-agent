# DP Agent - 数据处理智能体系统

基于自然语言的数据处理和分析平台，通过对话式交互实现复杂的数据处理任务。

## 🚀 功能特性

### 核心功能
- **自然语言处理**: 用自然语言描述数据处理需求，系统自动生成代码
- **Git-like版本控制**: 完整的数据版本历史记录和回滚功能
- **Docker沙箱执行**: 安全的代码执行环境，隔离用户代码
- **多轮对话**: 支持上下文感知的连续对话处理
- **数据质量探查**: 自动分析数据质量和生成统计报告
- **对象存储**: 基于MinIO的分布式文件存储
- **实时监控**: 完整的操作日志和性能监控

### 前端增强功能
- **现代化UI**: 基于Radix UI和Tailwind CSS的响应式设计
- **Excel预览**: 支持Excel文件的在线预览和编辑
- **交互式数据表格**: 可排序、过滤、分页的数据展示
- **拖拽上传**: 支持文件拖拽上传功能
- **实时数据可视化**: 集成Recharts图表库
- **主题切换**: 支持深色/浅色模式切换
- **响应式设计**: 完美适配桌面和移动设备

### 开发者体验
- **类型安全**: 完整的TypeScript支持
- **热重载**: 前后端开发模式支持热重载
- **API文档**: 自动生成Swagger/OpenAPI文档
- **代码格式化**: 集成ESLint和Prettier
- **测试覆盖**: 单元测试和集成测试

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

### 后端
- **框架**: FastAPI + SQLAlchemy + PostgreSQL
- **AI/LLM**: OpenAI GPT-4o-mini + LangChain
- **数据处理**: Polars + Pandas + NumPy
- **文件处理**: openpyxl (Excel) + python-multipart
- **对象存储**: MinIO
- **容器化**: Docker + Docker SDK
- **包管理**: UV (Python包管理器)
- **配置管理**: Pydantic Settings + python-dotenv
- **数据库迁移**: Alembic

### 前端
- **框架**: Next.js 15.4.3 + React 19.1.0 + TypeScript
- **UI组件**: Radix UI + Tailwind CSS v4 + shadcn/ui
- **状态管理**: React Hooks + Zod
- **数据可视化**: Recharts + Tabler Icons
- **交互**: DnD Kit (拖拽) + React Resizable Panels
- **HTTP客户端**: Axios
- **主题**: next-themes (深色/浅色模式)
- **构建工具**: pnpm + ESLint 9

### 基础设施
- **容器**: Docker + Docker Compose
- **数据库**: PostgreSQL 15+
- **存储**: MinIO (S3兼容对象存储)
- **监控**: 结构化日志 + 健康检查
- **部署**: Vercel (前端) + Docker (后端)

## 📁 项目结构

```
dp-agent/
├── backend/                     # FastAPI后端
│   ├── app/
│   │   ├── api/               # API路由层
│   │   │   ├── v1/            # API版本1
│   │   │   └── deps.py        # 依赖注入
│   │   ├── core/              # 核心组件
│   │   │   ├── config.py      # 配置管理
│   │   │   ├── security.py    # 安全相关
│   │   │   └── logging.py     # 日志配置
│   │   ├── models/            # 数据模型
│   │   │   ├── project.py     # 项目模型
│   │   │   ├── session.py     # 会话模型
│   │   │   └── data_version.py # 数据版本模型
│   │   ├── services/          # 业务逻辑层
│   │   │   ├── llm_service.py # LLM服务
│   │   │   ├── data_service.py # 数据处理服务
│   │   │   └── docker_service.py # Docker沙箱服务
│   │   └── main.py            # 主应用文件
│   ├── alembic/               # 数据库迁移
│   ├── tests/                 # 测试文件
│   ├── requirements.txt       # Python依赖
│   ├── pyproject.toml         # 项目配置
│   └── Dockerfile            # Docker配置
├── frontend/                  # Next.js前端
│   ├── src/
│   │   ├── app/               # Next.js App Router
│   │   ├── components/        # React组件
│   │   │   ├── ui/           # UI组件库
│   │   │   ├── excel-preview.tsx # Excel预览组件
│   │   │   └── data-table.tsx    # 数据表格组件
│   │   ├── hooks/             # 自定义Hooks
│   │   ├── lib/               # 工具函数
│   │   └── types/             # TypeScript类型定义
│   ├── public/                # 静态资源
│   ├── package.json           # 前端依赖
│   ├── next.config.ts         # Next.js配置
│   └── Dockerfile            # 前端Docker配置
├── docs/                      # 项目文档
├── docker-compose.yml         # 服务编排
├── .env.example              # 环境变量示例
└── README.md                 # 项目说明
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

1. **安装依赖**：### 安装依赖

```bash
cd backend
uv sync  # 使用uv安装所有依赖
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

### 🔧 开发环境设置

#### 后端开发

1. **使用 UV 包管理器**:
   ```bash
   cd backend
   
   # 安装依赖（使用uv）
   uv sync
   
   # 或激活虚拟环境
   source .venv/bin/activate
   
   # 开发模式安装
   uv pip install -e .
   ```

2. **数据库初始化**:
   ```bash
   # 创建数据库表
   python init_db.py
   
   # 运行数据库迁移
   alembic upgrade head
   ```

3. **启动开发服务器**:
   ```bash
   # 开发模式（自动重载）
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   
   # 或使用脚本
   python main.py
   ```

#### 前端开发

1. **使用 pnpm（推荐）**:
   ```bash
   cd frontend
   
   # 安装 pnpm（如果未安装）
   npm install -g pnpm
   
   # 安装依赖
   pnpm install
   
   # 启动开发服务器
   pnpm dev
   ```

2. **使用 npm/yarn**:
   ```bash
   # npm
   npm install
   npm run dev
   
   # yarn
   yarn install
   yarn dev
   ```

3. **构建生产版本**:
   ```bash
   pnpm build
   pnpm start  # 启动生产服务器
   ```

#### 环境变量配置

**后端环境变量** (`backend/.env`):
```bash
# 必需
OPENAI_API_KEY=your-openai-api-key

# 数据库
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dp_agent

# MinIO 配置
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=dp-agent

# 可选配置
LOG_LEVEL=INFO
DEBUG=true
```

#### UV使用说明

**UV基本命令**:
```bash
# 安装uv（如果未安装）
pip install uv

# 创建虚拟环境并安装依赖
uv sync

# 激活虚拟环境
source .venv/bin/activate  # Linux/Mac
# 或 .venv\Scripts\activate  # Windows

# 添加新依赖
uv add package-name

# 更新依赖
uv lock

# 运行脚本
uv run python main.py
```

**前端环境变量** (`frontend/.env.local`):
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📊 API 文档 & 前端路由

### 后端 API

完整的 API 文档可通过 Swagger UI 访问：

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

#### 主要端点

**项目管理**:
- `POST /api/v1/projects` - 创建项目
- `GET /api/v1/projects` - 获取项目列表
- `GET /api/v1/projects/{id}` - 获取项目详情
- `DELETE /api/v1/projects/{id}` - 删除项目

**文件管理**:
- `POST /api/v1/projects/{id}/upload` - 上传文件
- `GET /api/v1/projects/{id}/files` - 获取文件列表
- `DELETE /api/v1/files/{id}` - 删除文件

**会话管理**:
- `POST /api/v1/sessions` - 创建会话
- `GET /api/v1/sessions/{project_id}` - 获取项目会话列表
- `POST /api/v1/chat` - 处理对话消息
- `GET /api/v1/chat/{session_id}/history` - 获取会话历史

**数据处理**:
- `POST /api/v1/data/profile` - 数据质量分析
- `GET /api/v1/data/{file_id}/preview` - 数据预览
- `POST /api/v1/data/{file_id}/process` - 数据处理

**版本控制**:
- `GET /api/v1/versions/{project_id}` - 获取版本历史
- `POST /api/v1/versions/rollback` - 版本回滚
- `GET /api/v1/versions/{version_id}/diff` - 版本差异对比

### 前端路由

**主要页面**:
- `/` - 项目列表页
- `/projects/new` - 创建新项目
- `/projects/[id]` - 项目详情页
- `/projects/[id]/files` - 文件管理
- `/projects/[id]/chat` - 对话界面
- `/projects/[id]/versions` - 版本历史

**功能页面**:
- `/data/[fileId]/preview` - 数据预览
- `/settings` - 系统设置
- `/api-docs` - API文档重定向

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

## 🚀 部署指南

### 生产环境部署

#### 1. 服务器要求
- **CPU**: 4核心以上
- **内存**: 8GB以上
- **存储**: 100GB以上SSD
- **网络**: 稳定公网IP

#### 2. 环境准备
```bash
# 安装Docker和Docker Compose
sudo apt update && sudo apt install docker.io docker-compose-plugin

# 创建应用目录
sudo mkdir -p /opt/dp-agent
cd /opt/dp-agent
```

#### 3. 配置生产环境变量
```bash
# 复制生产环境配置
cp .env.example .env.production

# 编辑生产环境配置
nano .env.production
```

#### 4. 启动生产服务
```bash
# 使用生产环境配置
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 或使用脚本
./scripts/deploy.sh
```

#### 5. 配置反向代理（Nginx）
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 云平台部署

#### Vercel（前端）
```bash
# 安装Vercel CLI
npm i -g vercel

# 部署前端
vercel --prod
```

#### Docker Hub（后端）
```bash
# 构建并推送镜像
docker build -t your-org/dp-agent-backend:latest ./backend
docker push your-org/dp-agent-backend:latest
```

## ⚡ 性能优化

### 后端优化
- **数据库连接池**: 配置合适的连接池大小
- **缓存策略**: Redis缓存热点数据
- **异步处理**: 使用Celery处理耗时任务
- **文件上传**: 分片上传大文件

### 前端优化
- **代码分割**: Next.js自动代码分割
- **图片优化**: 使用Next.js Image组件
- **CDN加速**: 静态资源使用CDN
- **PWA支持**: 渐进式Web应用

### 监控指标
- **响应时间**: API响应时间 < 500ms
- **并发用户**: 支持100+并发用户
- **文件处理**: 支持1GB以下文件处理
- **内存使用**: 容器内存使用 < 2GB

## 🤝 贡献指南

### 开发流程
1. Fork项目到个人账户
2. 创建功能分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'Add amazing feature'`
4. 推送到分支: `git push origin feature/amazing-feature`
5. 创建Pull Request

### 代码规范
- **后端**: 遵循PEP 8规范
- **前端**: 遵循TypeScript和React最佳实践
- **提交信息**: 使用Conventional Commits格式
- **代码审查**: 所有PR需要至少一个审查

### 测试
```bash
# 后端测试
cd backend
pytest tests/ -v

# 前端测试
cd frontend
pnpm test
```

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [FastAPI](https://fastapi.tiangolo.com/) - 高性能Web框架
- [Next.js](https://nextjs.org/) - React全栈框架
- [OpenAI](https://openai.com/) - GPT模型支持
- [MinIO](https://min.io/) - 对象存储解决方案

## 📞 支持与联系

- **文档**: [docs](./docs)
- **问题反馈**: [GitHub Issues](https://github.com/your-org/dp-agent/issues)
- **讨论**: [GitHub Discussions](https://github.com/your-org/dp-agent/discussions)
- **邮箱**: support@dp-agent.com
