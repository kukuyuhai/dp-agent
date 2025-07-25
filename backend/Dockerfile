FROM python:3.10-slim

# 安装uv
RUN pip install uv

WORKDIR /app

# 复制依赖文件
COPY pyproject.toml uv.lock ./

# 使用uv安装依赖，增加网络超时时间
ENV UV_HTTP_TIMEOUT=300
RUN uv sync --frozen

# 复制应用代码
COPY . .

# 使用uv运行应用
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
