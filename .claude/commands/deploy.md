---
name: deploy
description: 执行 Docker 容器化部署
category: deployment
parameters:
  - name: environment
    description: 部署环境（dev/staging/production）
    required: false
---

# Docker 部署

构建并部署 PromptHub 的 Docker 容器化服务。

## 输入参数

- **部署环境**: $ARGUMENTS（默认 production）

## 执行步骤

### 1. 环境检查

- 确认 `SECRET_KEY` 环境变量已设置
- 确认 Docker 和 Docker Compose 已安装
- 确认数据库备份已执行（生产环境）

### 2. 构建镜像

```bash
docker compose build
```

包含两个服务：
- **backend**: `Dockerfile.backend`，暴露 8000 端口
- **frontend**: `frontend/Dockerfile`，Nginx 监听 80 端口

### 3. 启动服务

```bash
docker compose up -d
```

### 4. 验证部署

- 检查容器状态：`docker compose ps`
- 检查日志：`docker compose logs -f`
- 验证 API 可达：`curl http://localhost:8000/docs`
- 验证前端可达：`curl http://localhost:5173`

### 5. CI/CD 流水线（GitHub Actions）

配置在 `.github/workflows/ci-cd.yml`：
1. Backend Lint → Frontend Lint → Frontend Build
2. Docker Build & Push（仅 main 分支）
3. SSH Deploy（仅 main 分支）

## 注意事项

- `SECRET_KEY` 必须通过环境变量或 `.env` 文件传入
- 数据库文件通过 volume 挂载：`./prompts.db:/app/prompts.db`
- 前端构建参数 `VITE_API_BASE=/api`（生产环境通过 Nginx 反向代理）
- 生产部署前确保所有测试通过
