# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此仓库中工作时提供指导。

## 项目概览

PromptHub 是一个 AI 提示词资产管理库——用于管理和共享 AI 提示词的全栈 Web 应用。

- **后端**: Python + FastAPI + SQLAlchemy (SQLite)
- **前端**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **部署**: Docker + Docker Compose + GitHub Actions CI/CD

## 架构要点

### 后端结构

- 所有 API 路由都定义在 `backend/main.py` 中（目前没有独立的 routers 模块）
- 数据模型: `backend/models.py`（SQLAlchemy 2.0 声明式风格，使用 `Mapped`）
- 认证: `backend/auth.py`（JWT token、bcrypt 密码哈希）
- 数据库: `backend/database.py`（SQLite，启动时自动建表）
- Pydantic 模式: `backend/schemas.py`（Pydantic v2）

**动态字段**: `favorite_count` 和 `is_favorited` 通过 `attach_favorite_info()` 在查询时附加到 Prompt 对象上，不存储在数据库中。

### 前端结构

- `src/App.tsx`: 路由 + 认证守卫
- `src/contexts/AuthContext.tsx`: 全局认证状态 + localStorage 持久化
- `src/hooks/useApi.ts`: 自动注入 token 和处理 401 的 API 调用
- `src/api.ts`: API 客户端 + TypeScript 类型定义
- `src/components/Layout.tsx`: 主布局（搜索、筛选、卡片网格）
- `src/components/Sidebar.tsx`: 分类树 + 标签筛选 + 收藏切换
- `src/components/PromptCard.tsx` / `PromptForm.tsx` / `PromptDetail.tsx`: 提示词相关组件

## 开发命令

### 后端

```bash
# 运行开发服务器（支持热重载）
uvicorn backend.main:app --reload

# Lint 检查
ruff check backend/

# 格式化代码
ruff format backend/

# 运行测试
pytest
pytest tests/test_auth.py          # 运行指定测试文件
```

### 前端

```bash
cd frontend

# 运行开发服务器
npm run dev

# 生产环境构建
npm run build

# Lint 检查
npm run lint

# 运行测试
npm run test
npm run test:watch                 # 监听模式
```

### Docker

```bash
# 先设置必需的环境变量
export SECRET_KEY="your-secret-key"

# 启动所有服务
docker compose up -d

# 查看日志
docker compose logs -f

# 停止服务
docker compose down
```

## 测试

- 后端测试: `tests/` 目录（pytest + FastAPI TestClient）
  - `tests/conftest.py` 中的 fixtures: `client`、`auth_client`、`test_user`、`db_session`
- 前端测试: `frontend/src/test/`（Vitest + Testing Library）

## CI/CD 流水线（GitHub Actions）

配置在 `.github/workflows/ci-cd.yml`:

1. **Backend Lint**: Ruff 检查 + Ruff 格式化检查
2. **Frontend Lint**: ESLint
3. **Frontend Build**: 类型检查 + Vite 构建
4. **Docker Build & Push**: 构建并推送镜像到 Docker Hub（仅 main 分支）
5. **Deploy**: SSH 到服务器执行 `docker compose up`（仅 main 分支）

## 重要约定

- **后端**: 使用 Pydantic v2（使用 `model_dump()` 替代 `.dict()`，部分更新用 `model_dump(exclude_unset=True)`）
- **前端**: 路径别名 `@/` 映射到 `src/`
- **数据库**: SQLite 文件 `prompts.db` 首次运行时自动创建
- **CORS**: 开发模式允许所有来源；分页响应头已暴露（`X-Total-Count` 等）
