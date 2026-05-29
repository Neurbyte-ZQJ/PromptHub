# 部署能力模块

## 概述

提供 Docker 容器化、CI/CD 流水线和生产部署的能力。

## 能力标识

- **ID**: `capability.deployment`
- **版本**: 1.0.0
- **作用域**: infra
- **触发关键词**: Docker, 部署, CI/CD, Nginx, 容器, docker-compose, GitHub Actions, 生产环境

## 能力清单

### CAP-DEPLOY-001: Docker 镜像构建

构建后端和前端的 Docker 镜像。

**后端镜像** (`Dockerfile.backend`):
- 基于 Python 3.12
- 暴露 8000 端口
- 安装 requirements.txt 依赖
- 启动命令: `uvicorn backend.main:app --host 0.0.0.0 --port 8000`

**前端镜像** (`frontend/Dockerfile`):
- 多阶段构建: build → nginx
- 构建参数: `VITE_API_BASE=/api`
- Nginx 监听 80 端口
- 映射到宿主机 5173 端口

### CAP-DEPLOY-002: Docker Compose 编排

管理多容器服务编排。

**服务定义**:
```yaml
services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "8000:8000"
    environment:
      - SECRET_KEY=${SECRET_KEY}
    volumes:
      - ./prompts.db:/app/prompts.db

  frontend:
    build:
      context: frontend
    ports:
      - "5173:80"
    depends_on:
      - backend
```

### CAP-DEPLOY-003: CI/CD 流水线

配置 GitHub Actions CI/CD。

**流水线阶段**:
1. Backend Lint: `ruff check` + `ruff format --check`
2. Frontend Lint: `eslint`
3. Frontend Build: `tsc` + `vite build`
4. Docker Build & Push: 构建并推送镜像（仅 main 分支）
5. Deploy: SSH 执行 `docker compose up`（仅 main 分支）

**配置文件**: `.github/workflows/ci-cd.yml`

### CAP-DEPLOY-004: Nginx 配置

管理前端 Nginx 反向代理配置。

**配置文件**: `frontend/nginx.conf`

**关键配置**:
- `/api` 路径代理到后端服务
- 静态资源缓存策略
- SPA 路由回退到 index.html
- Gzip 压缩

### CAP-DEPLOY-005: 环境管理

管理不同环境的配置。

**环境变量**:
| 变量 | 说明 | 默认值 |
|------|------|--------|
| `SECRET_KEY` | JWT 签名密钥 | 无（必须设置） |
| `DATABASE_URL` | 数据库连接字符串 | `sqlite:///./prompts.db` |
| `VITE_API_BASE` | 前端 API 基础路径 | `http://localhost:8000/api` |

**Docker 生产环境**:
- `VITE_API_BASE=/api`（通过 Nginx 反向代理）
- `SECRET_KEY` 通过 `.env` 或环境变量传入

## 验证清单

- [ ] Docker 镜像构建成功
- [ ] 容器启动无报错
- [ ] API 可通过 Nginx 代理访问
- [ ] 前端页面正常加载
- [ ] 数据库 volume 挂载正确
- [ ] CI/CD 流水线通过
