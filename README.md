# PromptHub - AI 提示词资产管理库

PromptHub 是一个用于管理和组织 AI 提示词（Prompt）的全栈 Web 应用。它提供了用户认证、提示词的创建与编辑、搜索、标签分类、版本管理、变量填充、权限控制和删除等功能，帮助团队高效地管理和复用 AI 提示词资产。

## 目录

- [项目架构](#项目架构)
- [技术栈](#技术栈)
- [功能特性](#功能特性)
- [快速开始](#快速开始)
- [API 接口文档](#api-接口文档)
- [数据模型](#数据模型)
- [前端组件说明](#前端组件说明)
- [开发指南](#开发指南)

## 项目架构

```
PromptHub/
├── backend/                        # 后端服务 (Python / FastAPI)
│   ├── __init__.py                 # 包初始化
│   ├── main.py                     # 应用入口、CORS 配置与全部 API 路由
│   ├── database.py                 # 数据库连接与会话管理 (SQLite)
│   ├── models.py                   # SQLAlchemy ORM 数据模型定义
│   ├── schemas.py                  # Pydantic 请求/响应数据校验模型
│   ├── auth.py                     # JWT 认证、密码哈希、用户鉴权
│   ├── routers/
│   │   ├── __init__.py
│   │   └── prompts.py              # 提示词路由模块（备用）
│   └── __pycache__/                # Python 编译缓存
├── frontend/                       # 前端应用 (React / TypeScript / Vite)
│   ├── index.html                  # HTML 入口
│   ├── package.json                # 依赖与脚本配置
│   ├── package-lock.json           # 依赖锁定文件
│   ├── vite.config.ts              # Vite 构建配置（含路径别名 @/）
│   ├── tsconfig.json               # TypeScript 编译配置
│   ├── tsconfig.node.json          # Node 环境 TS 配置
│   ├── tailwind.config.js          # Tailwind CSS 配置（含 shadcn/ui 主题）
│   ├── postcss.config.js           # PostCSS 配置
│   └── src/
│       ├── main.tsx                # 应用入口（挂载 React 根节点 + ToastProvider + AuthProvider）
│       ├── App.tsx                 # 根组件（路由配置 + 认证守卫）
│       ├── api.ts                  # 后端 API 请求封装（含 Token 鉴权）
│       ├── index.css               # 全局样式（Tailwind 指令 + CSS 变量主题）
│       ├── lib/
│       │   └── utils.ts            # 工具函数（cn 类名合并）
│       ├── hooks/
│       │   └── useApi.ts           # API 调用 Hook（自动注入 Token + 401 处理）
│       ├── contexts/
│       │   └── AuthContext.tsx      # 认证上下文（用户状态、登录/登出、localStorage 持久化）
│       ├── pages/
│       │   ├── LoginPage.tsx       # 登录页面
│       │   └── RegisterPage.tsx    # 注册页面
│       └── components/
│           ├── Layout.tsx          # 主布局（搜索栏 + 卡片网格 + 侧边栏 + 用户信息 + 删除确认）
│           ├── Sidebar.tsx         # 侧边栏（标签筛选导航）
│           ├── PromptCard.tsx      # 提示词卡片（含删除按钮 + 公开标记 + 创建者）
│           ├── PromptForm.tsx      # 新建/编辑提示词弹窗表单（含公开选项）
│           ├── PromptDetail.tsx    # 提示词详情弹窗（版本切换 + 变量填充 + 复制 + 删除）
│           └── ui/                 # shadcn/ui 基础组件
│               ├── badge.tsx
│               ├── button.tsx
│               ├── card.tsx
│               ├── checkbox.tsx
│               ├── dialog.tsx
│               ├── input.tsx
│               ├── label.tsx
│               ├── select.tsx
│               ├── separator.tsx
│               ├── textarea.tsx
│               └── toast.tsx
├── screenshots/                    # 项目截图
│   ├── 首页.png
│   ├── 新建提示词.png
│   ├── 搜索功能.png
│   └── 标签筛选.png
├── requirements.txt                # Python 依赖清单
├── prompts.db                      # SQLite 数据库文件（运行后自动生成）
└── README.md
```

## 技术栈

### 后端

| 技术             | 版本      | 说明                                     |
| ---------------- | --------- | ---------------------------------------- |
| FastAPI          | 0.104.1   | 高性能异步 Python Web 框架               |
| Uvicorn          | 0.24.0    | ASGI 服务器，支持热重载                  |
| SQLAlchemy       | 2.0.23    | Python ORM，支持声明式模型映射           |
| Pydantic         | 2.5.2     | 数据校验与 JSON 序列化                   |
| python-jose      | 3.3.0     | JWT Token 编解码（HS256 算法）           |
| passlib[bcrypt]  | 1.7.4     | 密码哈希（bcrypt 算法）                  |
| python-multipart | 0.0.6     | 处理 multipart 表单请求                  |
| SQLite           | -         | 轻量级文件数据库，零配置                 |

### 前端

| 技术                     | 版本      | 说明                              |
| ------------------------ | --------- | --------------------------------- |
| React                    | 18.2.0    | 声明式 UI 框架                    |
| React Router DOM         | 7.15.0    | 客户端路由（含路由守卫）          |
| TypeScript               | 5.2+      | JavaScript 类型超集               |
| Vite                     | 5.1.0     | 下一代前端构建工具                |
| Tailwind CSS             | 3.4.1     | 原子化 CSS 框架                   |
| Radix UI                 | 多版本    | 无障碍 Headless UI 组件库         |
| Lucide React             | 0.344.0   | 开源图标库                        |
| class-variance-authority | 0.7.0     | 组件变体样式管理                  |
| clsx + tailwind-merge    | -         | 条件类名与 Tailwind 类合并        |

## 功能特性

### 用户认证

- **用户注册** — 填写用户名、邮箱、密码创建账号，注册成功后自动登录
- **用户登录** — 通过邮箱 + 密码登录，后端返回 JWT Token
- **Token 鉴权** — 所有提示词相关 API 均需携带 Bearer Token，未认证返回 401
- **自动登出** — Token 过期或无效时，前端自动清除登录状态并跳转登录页
- **登录持久化** — Token 和用户信息存储在 localStorage，刷新页面保持登录

### 提示词管理

- **创建提示词** — 填写名称、适用场景、内容、变量说明，选择或新建标签，设置是否公开
- **编辑提示词** — 仅可编辑自己创建的提示词，内容变更时自动生成新版本
- **查看详情** — 弹窗展示提示词完整信息，支持版本切换查看历史内容
- **删除提示词** — 仅可删除自己创建的提示词，操作前弹出确认对话框

### 权限控制

- **私有提示词** — 默认创建为私有，仅创建者可见
- **公开到团队** — 勾选"公开到团队"后，所有用户可见该提示词
- **所有权校验** — 编辑和删除操作校验 `user_id`，非所有者返回 403
- **可见范围** — 提示词列表返回当前用户的私有提示词 + 所有公开提示词

### 标签分类

- **标签关联** — 为提示词关联多个已有标签
- **新建标签** — 在创建/编辑表单中直接输入新标签名称，回车即可添加
- **标签筛选** — 左侧边栏按标签过滤提示词列表，点击"全部"查看所有

### 全文搜索

- 在顶部搜索框输入关键词，实时按标题和内容进行模糊匹配过滤
- 搜索与标签筛选可同时生效

### 版本管理

- 每次编辑提示词内容时，系统自动保存一个新版本（版本号递增）
- 在详情弹窗中通过下拉框切换查看任意历史版本
- 选择"最新版本"可查看当前内容

### 变量填充与复制

- 自动识别提示词内容中的变量占位符（支持 `{{变量名}}` 和 `[变量名]` 两种格式）
- 在详情弹窗中为每个变量提供输入框，填入实际值
- 点击"复制"按钮时，自动将变量替换为实际值后复制到剪贴板
- 复制成功/失败均有 Toast 提示

## 快速开始

### 环境要求

| 工具    | 最低版本 |
| ------- | -------- |
| Python  | 3.10+    |
| Node.js | 18+      |
| npm     | 9+       |

### 1. 克隆项目

```bash
git clone <仓库地址>
cd PromptHub
```

### 2. 启动后端

```bash
# 进入项目根目录
cd PromptHub

# 创建 Python 虚拟环境
python -m venv venv

# 激活虚拟环境
# Windows:
venv\Scripts\activate
# macOS / Linux:
source venv/bin/activate

# 在虚拟环境中安装 Python 依赖
pip install -r requirements.txt

# 启动后端开发服务器（支持热重载）
uvicorn backend.main:app --reload
```

> 激活虚拟环境后，终端提示符前会出现 `(venv)` 标识。后续每次开发前都需要先激活虚拟环境。

后端默认运行在 http://localhost:8000

- API 交互文档（Swagger UI）：http://localhost:8000/docs
- API 数据文档（ReDoc）：http://localhost:8000/redoc
- 首次启动时自动创建 SQLite 数据库文件 `prompts.db`

如需退出虚拟环境：

```bash
deactivate
```

### 3. 启动前端

```bash
# 进入前端目录
cd frontend

# 安装 npm 依赖
npm install

# 启动前端开发服务器
npm run dev
```

前端默认运行在 http://localhost:5173 ，打开浏览器访问即可使用。

> 前端通过 `http://localhost:8000/api` 访问后端 API，请确保后端已启动。

### 4. 构建前端生产版本

```bash
cd frontend

# 类型检查 + 构建
npm run build

# 本地预览构建产物
npm run preview
```

构建产物输出到 `frontend/dist/` 目录。

## API 接口文档

基础路径：`http://localhost:8000/api`

> 除注册、登录和获取标签外，所有接口均需在请求头中携带 `Authorization: Bearer <token>`。

### 认证接口

#### 用户注册

```
POST /api/auth/register
```

请求体：

```json
{
  "username": "zhangsan",
  "email": "zhangsan@example.com",
  "password": "your_password"
}
```

响应体：

```json
{
  "id": 1,
  "username": "zhangsan",
  "email": "zhangsan@example.com",
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### 用户登录

```
POST /api/auth/login
```

请求体：

```json
{
  "email": "zhangsan@example.com",
  "password": "your_password"
}
```

响应体：

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

#### 获取当前用户信息

```
GET /api/auth/me
```

> 需要认证

响应体：

```json
{
  "id": 1,
  "username": "zhangsan",
  "email": "zhangsan@example.com",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### 提示词接口

> 以下接口均需要认证

#### 创建提示词

```
POST /api/prompts
```

请求体：

```json
{
  "title": "代码审查助手",
  "scenario": "代码审查场景",
  "content": "你是一个专业的代码审查员，请审查以下{{language}}代码：\n{{code}}",
  "variables": "language: 编程语言\ncode: 待审查代码",
  "is_public": false,
  "tag_ids": [1, 2],
  "new_tags": ["新标签"]
}
```

| 字段       | 类型       | 必填 | 说明                               |
| ---------- | ---------- | ---- | ---------------------------------- |
| title      | string     | 是   | 提示词名称                         |
| scenario   | string     | 否   | 适用场景                           |
| content    | string     | 是   | 提示词内容                         |
| variables  | string     | 否   | 变量说明                           |
| is_public  | boolean    | 否   | 是否公开到团队，默认 false         |
| tag_ids    | int[]      | 否   | 已有标签 ID 列表                   |
| new_tags   | string[]   | 否   | 新建标签名称列表                   |

响应体：

```json
{
  "id": 1,
  "title": "代码审查助手",
  "scenario": "代码审查场景",
  "content": "你是一个专业的代码审查员，请审查以下{{language}}代码：\n{{code}}",
  "variables": "language: 编程语言\ncode: 待审查代码",
  "user_id": 1,
  "owner_username": "zhangsan",
  "is_public": false,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": null,
  "tags": [
    { "id": 1, "name": "开发" },
    { "id": 2, "name": "审查" }
  ],
  "versions": [
    {
      "id": 1,
      "prompt_id": 1,
      "content": "你是一个专业的代码审查员...",
      "version_number": 1,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### 获取提示词列表

```
GET /api/prompts
```

返回当前用户的私有提示词 + 所有公开提示词。

| 查询参数 | 类型   | 必填 | 说明                     |
| -------- | ------ | ---- | ------------------------ |
| search   | string | 否   | 按标题或内容模糊搜索     |
| tag_id   | int    | 否   | 按标签 ID 筛选           |

示例：`GET /api/prompts?search=代码&tag_id=1`

响应体：`PromptListItem[]` 数组（不含 versions 字段）

#### 获取提示词详情

```
GET /api/prompts/{prompt_id}
```

- 公开提示词：所有已认证用户可访问
- 私有提示词：仅创建者可访问，否则返回 403

响应体：`PromptResponse` 对象（含 versions 字段）

#### 更新提示词

```
PUT /api/prompts/{prompt_id}
```

仅创建者可更新，否则返回 403。请求体所有字段可选，仅传需要更新的字段：

```json
{
  "title": "高级代码审查助手",
  "content": "你是一个资深代码审查员...",
  "is_public": true,
  "tag_ids": [1, 3],
  "new_tags": ["新标签"]
}
```

> 当 `content` 字段发生变更时，系统自动创建一个新版本记录。

#### 删除提示词

```
DELETE /api/prompts/{prompt_id}
```

仅创建者可删除，否则返回 403。

响应体：

```json
{
  "message": "删除成功"
}
```

### 标签接口

#### 获取标签列表

```
GET /api/tags
```

> 无需认证

响应体：

```json
[
  { "id": 1, "name": "开发" },
  { "id": 2, "name": "审查" },
  { "id": 3, "name": "写作" }
]
```

## 数据模型

### User（用户）

| 字段            | 类型        | 必填 | 说明                       |
| --------------- | ----------- | ---- | -------------------------- |
| id              | Integer     | 自增 | 主键                       |
| username        | String(100) | 是   | 用户名（唯一）             |
| email           | String(255) | 是   | 邮箱（唯一）               |
| hashed_password | String(255) | 是   | bcrypt 加密后的密码        |
| created_at      | DateTime    | 自动 | 创建时间                   |

### Prompt（提示词）

| 字段            | 类型                  | 必填 | 说明                           |
| --------------- | --------------------- | ---- | ------------------------------ |
| id              | Integer               | 自增 | 主键                           |
| title           | String(255)           | 是   | 提示词名称                     |
| scenario        | String(255)           | 否   | 适用场景描述                   |
| content         | Text                  | 是   | 提示词正文内容                 |
| variables       | Text                  | 否   | 变量说明文本                   |
| user_id         | Integer               | 否   | 创建者 ID（外键 → users.id）   |
| is_public       | Boolean               | 否   | 是否公开到团队，默认 false     |
| created_at      | DateTime              | 自动 | 创建时间                       |
| updated_at      | DateTime              | 自动 | 最后更新时间                   |
| owner           | User                  | -    | 创建者对象（多对一）           |
| owner_username  | String                | -    | 创建者用户名（hybrid property）|
| tags            | List[Tag]             | -    | 关联的标签列表（多对多）       |
| versions        | List[PromptVersion]   | -    | 历史版本列表（一对多）         |

### Tag（标签）

| 字段 | 类型        | 必填 | 说明               |
| ---- | ----------- | ---- | ------------------ |
| id   | Integer     | 自增 | 主键               |
| name | String(100) | 是   | 标签名称（唯一）   |

### PromptVersion（提示词版本）

| 字段           | 类型     | 必填 | 说明                     |
| -------------- | -------- | ---- | ------------------------ |
| id             | Integer  | 自增 | 主键                     |
| prompt_id      | Integer  | 是   | 所属提示词 ID（外键）    |
| content        | Text     | 是   | 该版本的提示词内容快照   |
| version_number | Integer  | 是   | 版本号（递增）           |
| created_at     | DateTime | 自动 | 版本创建时间             |

### 表关系

- **User → Prompt**：一对多关系，一个用户可创建多个提示词
- **Prompt ↔ Tag**：多对多关系，通过 `prompt_tag_association` 中间表关联
- **Prompt → PromptVersion**：一对多关系，删除 Prompt 时级联删除所有版本

## 前端组件说明

| 组件             | 文件                  | 说明                                                         |
| ---------------- | --------------------- | ------------------------------------------------------------ |
| App              | `App.tsx`             | 根组件，配置路由（登录/注册/主页）和认证守卫（ProtectedRoute / AuthRoute） |
| Layout           | `Layout.tsx`          | 主布局容器，管理搜索、标签筛选、卡片列表、弹窗、用户信息与退出登录 |
| Sidebar          | `Sidebar.tsx`         | 左侧边栏，展示标签列表并支持按标签筛选                       |
| PromptCard       | `PromptCard.tsx`      | 提示词卡片，展示标题、内容摘要、标签、公开标记、创建者和悬浮删除按钮 |
| PromptForm       | `PromptForm.tsx`      | 新建/编辑提示词的弹窗表单，含标签选择、新建标签和"公开到团队"选项 |
| PromptDetail     | `PromptDetail.tsx`    | 提示词详情弹窗，含版本切换、变量填充、一键复制、删除确认功能 |
| LoginPage        | `pages/LoginPage.tsx` | 登录页面，邮箱 + 密码表单                                    |
| RegisterPage     | `pages/RegisterPage.tsx` | 注册页面，用户名 + 邮箱 + 密码表单，注册成功后自动登录   |
| AuthContext      | `contexts/AuthContext.tsx` | 认证上下文，管理用户状态、Token、登录/登出、localStorage 持久化 |
| useApi           | `hooks/useApi.ts`     | API 调用 Hook，自动注入 Token，处理 401 自动登出            |
| ui/*             | `ui/*.tsx`            | shadcn/ui 基础组件（Button, Card, Dialog, Checkbox, Input, Select 等） |

## 开发指南

### 后端开发

后端采用 FastAPI 框架，项目结构遵循以下约定：

- **路由定义**：全部 API 路由定义在 `backend/main.py` 中
- **认证模块**：`backend/auth.py` 提供 JWT Token 生成/验证、密码哈希/校验、当前用户获取
- **数据模型**：使用 SQLAlchemy 2.0 声明式映射（`Mapped` + `mapped_column`），`hybrid_property` 实现计算属性
- **数据校验**：使用 Pydantic v2 模型，通过 `model_dump(exclude_unset=True)` 实现部分更新
- **权限校验**：通过 `Depends(get_current_user)` 注入当前用户，API 内部校验 `user_id` 和 `is_public`
- **数据库**：默认使用 SQLite，连接配置在 `backend/database.py`，首次启动自动建表
- **CORS**：开发模式下允许所有来源跨域访问

启动开发服务器（支持热重载）：

```bash
uvicorn backend.main:app --reload
```

### 前端开发

前端基于 Vite + React + TypeScript，采用 shadcn/ui 组件体系：

- **路由守卫**：`ProtectedRoute` 包裹需登录的页面，`AuthRoute` 包裹登录/注册页面（已登录则跳转首页）
- **路径别名**：`@/` 映射到 `src/` 目录（在 `vite.config.ts` 和 `tsconfig.json` 中配置）
- **样式方案**：Tailwind CSS + CSS 变量主题（支持亮色/暗色模式切换）
- **组件规范**：UI 基础组件位于 `components/ui/`，业务组件位于 `components/`，页面位于 `pages/`
- **状态管理**：认证状态通过 `AuthContext` 全局管理，API 调用通过 `useApi` Hook 统一处理
- **API 调用**：底层封装在 `api.ts`，`useApi` Hook 自动注入 Token 并处理 401 登出逻辑

常用命令：

```bash
cd frontend

# 启动开发服务器
npm run dev

# 代码检查
npm run lint

# 类型检查 + 生产构建
npm run build

# 预览生产构建
npm run preview
```

### 依赖版本

**Python 依赖** (`requirements.txt`)：

```
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
pydantic==2.5.2
python-multipart==0.0.6
passlib[bcrypt]==1.7.4
python-jose[cryptography]==3.3.0
```

**Node.js 依赖**（主要依赖）：

```
react: ^18.2.0
react-router-dom: ^7.15.0
@radix-ui/react-dialog: ^1.0.5
@radix-ui/react-select: ^2.0.0
lucide-react: ^0.344.0
tailwindcss: ^3.4.1
vite: ^5.1.0
typescript: ^5.2.2
```
