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

## AI 开发辅助结构

### `.claude/commands/` — 标准化命令

Claude Code 斜杠命令定义，每个 `.md` 文件对应一个可用命令：

| 命令 | 说明 | 分类 |
|------|------|------|
| `/dev-backend` | 启动后端开发服务器 | development |
| `/dev-frontend` | 启动前端开发服务器 | development |
| `/new-api` | 创建新 API 端点 | development |
| `/new-component` | 创建新 React 组件 | development |
| `/new-model` | 添加/修改数据库模型 | development |
| `/test-all` | 运行全部测试 | testing |
| `/lint` | 代码检查与格式化 | quality |
| `/review` | 代码审查 | quality |
| `/deploy` | Docker 部署 | deployment |
| `/fix-bug` | Bug 修复工作流 | debugging |
| `/db-query` | 数据库查询 | database |

每个命令文件遵循统一格式：YAML 前置元数据（name/description/category/parameters）+ Markdown 执行流程。

### `agents/` — 智能体模块

模块化智能体系统，按职责分层组织：

```
agents/
├── base/                    # 基础框架
│   ├── agent-framework.md   # 智能体生命周期、接口规范、分类定义
│   └── protocols.md         # 交互协议、消息格式、工作流编排
├── capabilities/            # 能力模块（可组合的功能单元）
│   ├── api-development.md   # API 开发能力（路由/Schema/认证/分页/错误处理）
│   ├── frontend-development.md  # 前端开发能力（组件/API集成/状态/样式/路由）
│   ├── database-operations.md   # 数据库操作能力（模型/关联/动态字段/同步）
│   ├── code-review.md       # 代码审查能力（质量/安全/规范/性能）
│   ├── testing.md           # 测试能力（后端/前端/执行/调试/覆盖）
│   ├── deployment.md        # 部署能力（Docker/Compose/CI-CD/Nginx/环境）
│   └── security-audit.md    # 安全审计能力（认证/数据/输入/网络/依赖）
├── interactions/            # 交互逻辑
│   ├── error-handling.md    # 错误处理模式（分类/恢复/自动修复范围）
│   ├── user-communication.md # 用户沟通模式（澄清/确认/进度/汇报/上报）
│   └── workflow-orchestration.md # 工作流编排（新功能/Bug修复/部署/安全加固）
└── config/                  # 配置文件
    ├── agent-registry.json  # 智能体注册表（7个智能体定义）
    ├── capability-map.json  # 能力映射表（能力→智能体→命令→验证）
    └── project-context.json # 项目上下文（技术栈/文件约定/编码规则）
```

**智能体注册表**（`agent-registry.json`）定义了 7 个智能体：
- `agent.backend-developer` — 后端开发（API + 数据库能力）
- `agent.frontend-developer` — 前端开发（组件 + 样式能力）
- `agent.fullstack-developer` — 全栈开发（API + 前端 + 数据库能力）
- `agent.code-reviewer` — 代码审查（审查 + 安全审计能力）
- `agent.test-engineer` — 测试工程师（测试能力）
- `agent.devops-engineer` — 运维工程师（部署能力）
- `agent.bug-fixer` — Bug 修复（API + 前端 + 数据库 + 测试能力）

### 与现有系统集成

- `.claude/commands/` → 命令触发智能体执行
- `agents/config/capability-map.json` → 能力与 `.trae/skill-config.json` 中的技能对应
- `agents/config/project-context.json` → 项目规则与 `.trae/rules/project_rules.md` 同步
- `agents/base/agent-framework.md` → 智能体框架与 `CLAUDE.md` 项目概览对齐

## 重要约定

- **后端**: 使用 Pydantic v2（使用 `model_dump()` 替代 `.dict()`，部分更新用 `model_dump(exclude_unset=True)`）
- **前端**: 路径别名 `@/` 映射到 `src/`
- **数据库**: SQLite 文件 `prompts.db` 首次运行时自动创建
- **CORS**: 开发模式允许所有来源；分页响应头已暴露（`X-Total-Count` 等）
