# PromptHub - AI 提示词资产管理库

## 项目概述

PromptHub 是一个全栈 Web 应用，用于管理和共享 AI 提示词（Prompt）。用户可以创建、编辑、收藏、分类提示词，支持版本管理、标签筛选、变量模板填充、Excel 批量导入/导出等功能。

## 技术栈

### 后端
- **语言**: Python 3.12+
- **框架**: FastAPI 0.104+
- **ORM**: SQLAlchemy 2.0（声明式映射，`Mapped` / `mapped_column` 风格）
- **数据验证**: Pydantic v2（`model_dump` / `from_attributes = True`）
- **数据库**: SQLite（开发）/ 可切换其他数据库
- **认证**: JWT（python-jose, HS256）+ bcrypt（passlib）
- **文件处理**: openpyxl（Excel 导入/导出）
- **服务器**: Uvicorn

### 前端
- **语言**: TypeScript
- **框架**: React 18（函数式组件 + Hooks）
- **构建工具**: Vite 5
- **路由**: React Router DOM v7
- **样式**: Tailwind CSS 3 + tailwindcss-animate
- **UI 组件**: Radix UI 原语 + shadcn/ui 风格封装（`components/ui/`）
- **工具函数**: cn()（clsx + tailwind-merge）
- **图标**: Lucide React
- **状态管理**: React Context（AuthContext）
- **HTTP 客户端**: 原生 fetch API
- **通知**: 自定义 Toast 组件（`components/ui/toast.tsx`）
- **测试**: Vitest + Testing Library + jsdom

### 部署
- **容器化**: Docker + Docker Compose
- **CI/CD**: GitHub Actions（lint → build → Docker push → SSH 部署）
- **前端服务**: Nginx 反向代理
- **Node.js**: 20.x

## 项目结构

```
PromptHub/
├── backend/               # FastAPI 后端
│   ├── main.py           # 应用入口 + 所有 API 路由（认证/Prompt/Tag/Category/Favorite/导入导出）
│   ├── models.py         # SQLAlchemy ORM 模型（User/Prompt/Tag/Category/Favorite/PromptVersion）
│   ├── schemas.py        # Pydantic 请求/响应 schema
│   ├── auth.py           # JWT 认证（签发/验证/密码哈希/get_current_user 依赖）
│   ├── database.py       # 数据库引擎、会话工厂、Base 声明
│   └── routers/          # 路由模块（早期拆分，当前未使用，主路由在 main.py）
├── frontend/             # React 前端
│   ├── src/
│   │   ├── api.ts        # API 调用函数 + 所有 TypeScript 类型/接口定义
│   │   ├── App.tsx       # 根组件（AuthProvider + BrowserRouter + 路由守卫）
│   │   ├── main.tsx      # 入口文件
│   │   ├── components/
│   │   │   ├── Layout.tsx       # 主布局（搜索/新建/导入导出/PromptCard网格/对话框管理）
│   │   │   ├── Sidebar.tsx      # 侧边栏（分类树/标签筛选/收藏切换）
│   │   │   ├── PromptCard.tsx   # 提示词卡片（标题/摘要/标签/收藏/删除）
│   │   │   ├── PromptForm.tsx   # 创建/编辑表单（分类多选/标签/新建标签）
│   │   │   ├── PromptDetail.tsx # 详情弹窗（版本选择/变量填充/复制）
│   │   │   └── ui/             # shadcn/ui 基础组件（badge/button/card/checkbox/dialog/input/label/select/separator/textarea/toast）
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx  # 认证上下文（token/user 持久化至 localStorage）
│   │   ├── hooks/
│   │   │   └── useApi.ts       # 封装 API 调用 + 自动 401 处理
│   │   ├── lib/
│   │   │   └── utils.ts        # cn() 工具函数
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx   # 登录页
│   │   │   └── RegisterPage.tsx# 注册页
│   │   └── test/               # 前端测试
│   ├── .eslintrc.cjs     # ESLint 配置
│   ├── vite.config.ts    # Vite 配置（路径别名 @ → src/）
│   ├── vitest.config.ts  # Vitest 配置
│   ├── tailwind.config.js# Tailwind 配置
│   ├── tsconfig.json     # TypeScript 配置
│   ├── Dockerfile        # 前端 Docker 镜像
│   └── nginx.conf        # Nginx 配置
├── tests/                # 后端 pytest 测试
│   ├── conftest.py       # 测试 fixtures（db/client/test_user/auth_client/second_user）
│   ├── test_auth.py
│   ├── test_prompts.py
│   ├── test_categories.py
│   └── test_favorites.py
├── .github/workflows/
│   └── ci-cd.yml         # CI/CD 流水线
├── docker-compose.yml    # Docker 编排
├── Dockerfile.backend    # 后端 Docker 镜像
├── pyproject.toml        # Ruff Lint/Format 配置
└── requirements.txt      # Python 依赖
```

## API 约定

### 基础路径
所有 API 端点以 `/api` 为前缀。前端通过 `VITE_API_BASE` 环境变量配置，默认 `http://localhost:8000/api`。

### 认证
- 使用 OAuth2 Bearer Token（JWT）
- Token 通过 `Authorization: Bearer <token>` 请求头传递
- JWT 有效期 60 分钟，算法 HS256，`sub` 字段为用户 ID（字符串形式）
- Token 签发：`POST /api/auth/login` → 返回 `{"access_token": "...", "token_type": "bearer"}`
- 前端存储：localStorage（`prompthub_token` + `prompthub_user`）
- 401 自动处理：`useApi` hook 中检测到 401 自动调用 `logout()`

### 数据可见性
- 提示词列表：返回用户自己的 + 所有 `is_public=True` 的提示词
- 提示词详情：所有者或公开提示词可查看，私有提示词仅所有者可访问
- 修改/删除：仅所有者可操作
- 分类：用户自己的 + 全局分类（`user_id=None`）

### 分页
支持两种分页方式（二选一）：
1. **页码分页**: `page` + `page_size`（page 从 1 开始，page_size 默认 20，最大 100）
2. **偏移分页**: `skip` + `limit`（limit 最大 100）

分页元信息通过响应头返回：
- `X-Total-Count`: 总记录数
- `X-Page`: 当前页码
- `X-Page-Size`: 每页数量
- `X-Total-Pages`: 总页数

### 排序
- `sort_by`: 排序字段（created_at / updated_at / title / id）
- `sort_order`: 排序方向（asc / desc）
- 默认按 `created_at desc` 排序，次排序为 `id desc`

### 筛选
- `search`: 按标题或内容模糊搜索（ILIKE）
- `tag_id`: 按标签 ID 筛选
- `category_id`: 按分类 ID 筛选（包含所有子分类下的提示词）
- `favorites_only`: 仅返回收藏的提示词

### 响应格式
- 成功响应直接返回 JSON 数据
- 错误响应: `{"detail": "错误信息"}`
- HTTP 状态码：200 / 201 / 400 / 401 / 403 / 404
- CORS 允许所有来源，暴露分页响应头

### API 端点列表

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | /api/auth/register | 用户注册（用户名+邮箱+密码） | 否 |
| POST | /api/auth/login | 用户登录（邮箱+密码→JWT） | 否 |
| GET | /api/auth/me | 获取当前用户信息 | 是 |
| GET | /api/prompts | 提示词列表（分页/搜索/筛选/排序） | 是 |
| POST | /api/prompts | 创建提示词（支持 new_tags 自动创建标签） | 是 |
| GET | /api/prompts/{id} | 提示词详情（含版本历史） | 是 |
| PUT | /api/prompts/{id} | 更新提示词（内容变更自动生成新版本） | 是 |
| DELETE | /api/prompts/{id} | 删除提示词 | 是 |
| POST | /api/prompts/{id}/favorite | 切换收藏（已收藏则取消，未收藏则添加） | 是 |
| GET | /api/prompts/export | 导出当前用户所有提示词为 Excel | 是 |
| GET | /api/prompts/import-template | 下载 Excel 导入模板（含填写说明） | 是 |
| POST | /api/prompts/import | 从 Excel 批量导入提示词 | 是 |
| GET | /api/tags | 标签列表（全局共享） | 否 |
| GET | /api/categories | 分类列表（树形结构，含全局+用户私有） | 是 |
| POST | /api/categories | 创建分类（支持 parent_id 嵌套） | 是 |
| PUT | /api/categories/{id} | 更新分类（防循环引用校验） | 是 |
| DELETE | /api/categories/{id} | 删除分类（子分类提升一级） | 是 |

### 数据模型关系
- User → Prompt: 一对多（`user_id`，SET NULL on delete）
- Prompt ↔ Tag: 多对多（`prompt_tag_association`，CASCADE on delete）
- Prompt ↔ Category: 多对多（`prompt_category_association`，CASCADE on delete）
- Prompt → PromptVersion: 一对多（版本历史，CASCADE on delete）
- User ↔ Prompt: 多对多收藏（`Favorite` 表，CASCADE on delete）
- Category ↔ Category: 自引用（`parent_id`，树形结构，CASCADE on delete）

### 关键业务逻辑
- **版本管理**: 更新提示词内容时自动创建新版本（version_number 递增）
- **新建标签**: 创建/更新提示词时可通过 `new_tags` 字段传入标签名，系统自动创建不存在的标签
- **收藏切换**: POST 同一端点，已收藏则删除，未收藏则创建
- **分类删除**: 删除分类时子分类的 `parent_id` 设为被删分类的 `parent_id`（提升一级）
- **分类移动**: 更新分类 `parent_id` 时校验循环引用（不能移到自己的子分类下）
- **变量模板**: 提示词内容支持 `{{变量名}}` 和 `[变量名]` 两种变量占位符，前端详情页提供变量填充输入框

## 编码规范

### 后端 Python 规范
- **格式化工具**: Ruff（target-version = py312, line-length = 120）
- **Lint 规则**: E, F, I, W（忽略 E501 行长度限制）
- **Import 排序**: isort，first-party 标记为 `backend`
- **类型注解**: SQLAlchemy 2.0 的 `Mapped` / `mapped_column` 风格
- **Pydantic 模型**: v2 语法（`model_dump` 替代 `dict()`，`from_attributes = True` 替代 `orm_mode`）
- **异步模式**: 当前使用同步 SQLAlchemy Session（非 async session）
- **路由定义**: 所有路由当前定义在 `main.py` 中（`routers/` 目录为早期拆分残留）
- **错误处理**: 使用 `HTTPException`，中文错误消息
- **命名规范**: 函数/变量使用 snake_case，Pydantic 模型使用 PascalCase
- **依赖注入**: FastAPI 的 `Depends` 模式（`get_db`, `get_current_user`）
- **CORS 配置**: 允许所有来源，暴露 `X-Total-Count/X-Page/X-Page-Size/X-Total-Pages` 响应头

### 前端 TypeScript/React 规范
- **Lint**: ESLint + @typescript-eslint/recommended + react-hooks/recommended
- **组件模式**: 函数式组件 + Hooks，无 class 组件
- **样式方案**: Tailwind CSS + `cn()` 工具函数（clsx + tailwind-merge）
- **路径别名**: `@` 映射到 `src/`（Vite + tsconfig 同步配置）
- **API 层**: `src/api.ts` 统一管理所有 API 调用和 TypeScript 接口定义
- **自定义 Hook**: `useApi()` 封装认证 API 调用，自动注入 token + 处理 401
- **认证状态**: `AuthContext` + `useAuth()` hook，token/user 持久化至 localStorage
- **路由守卫**: `ProtectedRoute`（需认证）和 `AuthRoute`（仅未认证）两层守卫
- **UI 组件**: 遵循 shadcn/ui 模式，放在 `components/ui/` 下，业务组件放在 `components/` 下
- **状态管理**: 优先使用 React Context + useState，不引入额外状态库
- **弹窗管理**: Layout 组件集中管理所有 Dialog 状态（创建/编辑/删除/分类/导入）
- **Toast 通知**: 自定义 Toast 组件，`useToast()` hook
- **测试**: Vitest + @testing-library/react + jsdom
- **前端筛选**: 标签/分类/搜索/收藏的客户端二次筛选在 Layout 中执行

### 通用规范
- **语言**: UI 文案和 API 错误消息使用中文
- **代码注释**: 不添加冗余注释，代码应自解释
- **Git 分支**: main（生产）/ develop（开发）
- **环境变量**:
  - `SECRET_KEY`: JWT 签名密钥（必须，Docker 部署时通过 .env 或环境变量传入）
  - `DATABASE_URL`: 数据库连接字符串（默认 `sqlite:///./prompts.db`）
  - `VITE_API_BASE`: 前端 API 基础路径（默认 `http://localhost:8000/api`，Docker 部署时为 `/api`）

## 开发命令

### 后端
```bash
pip install -r requirements.txt
uvicorn backend.main:app --reload      # 启动开发服务器
ruff check backend/                     # Lint 检查
ruff format backend/                    # 格式化
pytest                                  # 运行后端测试
```

### 前端
```bash
cd frontend
npm install
npm run dev                             # 启动开发服务器
npm run build                           # 生产构建（tsc + vite build）
npm run lint                            # ESLint 检查
npm run test                            # 运行前端测试
```

### Docker
```bash
docker compose up -d                    # 启动所有服务
docker compose build                    # 重新构建镜像
```

## 架构注意事项

- `backend/routers/prompts.py` 为早期路由拆分残留，未与 `main.py` 同步更新，主路由逻辑以 `main.py` 为准
- 前端 `Layout.tsx` 承担了较多状态管理和对话框编排职责，如需扩展应考虑拆分
- 标签（Tag）为全局共享资源，无用户归属；分类（Category）区分全局（`user_id=None`）和用户私有
- Prompt 的 `owner_username` 通过 SQLAlchemy `hybrid_property` 从关联 User 获取
- `favorite_count` 和 `is_favorited` 为动态计算字段，通过 `attach_favorite_info()` 函数在查询时附加，非数据库持久化
