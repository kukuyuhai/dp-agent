# DP Agent Backend

## 使用 UV 构建和管理项目

本项目已迁移到使用 [uv](https://github.com/astral-sh/uv) 进行依赖管理和构建。

### 安装 uv

```bash
pip install uv
```

### 开发环境设置

1. **创建虚拟环境并安装依赖**
   ```bash
   uv sync
   ```

2. **激活虚拟环境**
   ```bash
   source .venv/bin/activate  # Linux/Mac
   .venv\Scripts\activate   # Windows
   ```

3. **运行开发服务器**
   ```bash
   uv run uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

### 常用命令

- **安装依赖**
  ```bash
  uv add package_name
  ```

- **安装开发依赖**
  ```bash
  uv add --dev package_name
  ```

- **运行测试**
  ```bash
  uv run pytest
  ```

- **更新锁文件**
  ```bash
  uv lock
  ```

- **构建项目**
  ```bash
  uv build
  ```

### Docker 构建

项目已更新为使用 uv 构建 Docker 镜像：

```bash
docker build -t dp-agent-backend .
docker run -p 8000:8000 dp-agent-backend
```

### 项目结构

```
backend/
├── app/
│   ├── api/
│   ├── core/
│   ├── models/
│   └── services/
├── pyproject.toml    # 项目配置和依赖
├── uv.lock          # 依赖锁文件
├── Dockerfile       # Docker 构建配置
└── README.md        # 项目说明
```

### 从 pip 迁移

如果你之前使用 pip 和 requirements.txt，可以通过以下命令迁移：

```bash
# 安装 uv
pip install uv

# 从 requirements.txt 创建虚拟环境
uv sync

# 删除旧的 requirements.txt（可选）
rm requirements.txt
```

### 注意事项

- uv 会自动创建和管理虚拟环境
- 所有依赖版本都已锁定在 uv.lock 文件中
- 使用 `uv run` 命令会自动激活虚拟环境
- 开发时建议使用 `--reload` 参数实现热重载