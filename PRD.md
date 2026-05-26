# PromptHub — 产品需求文档（PRD）

> **版本**: v1.0  
> **日期**: 2026-05-27  
> **状态**: 已发布  
> **范围**: 当前系统现状文档  

---

## 1. 执行摘要

### 1.1 问题陈述

AI 从业者在日常工作中积累了大量高质量提示词（Prompt），但缺乏统一的资产管理工具。提示词散落在聊天记录、文档和笔记中，难以检索、复用和团队共享，导致重复劳动和知识流失。

### 1.2 解决方案

PromptHub 是一个全栈 Web 应用，为用户提供提示词的集中管理平台。用户可以创建、编辑、收藏、分类提示词，支持版本管理、标签筛选、变量填充与复制、Excel 批量导入/导出等功能，实现提示词资产的规范化管理。

### 1.3 成功指标

| 指标 | 目标值 | 说明 |
|------|--------|------|
| 用户注册转化率 | ≥ 60% | 访问注册页后完成注册的用户比例 |
| 提示词创建率 | ≥ 80% | 注册用户在 7 天内至少创建 1 条提示词 |
| 提示词复用率 | ≥ 40% | 提示词被创建者本人或他人再次查看/复制的比例 |
| 搜索命中率 | ≥ 85% | 用户使用搜索功能后成功找到目标提示词的比例 |
| 导入/导出使用率 | ≥ 20% | 活跃用户使用 Excel 导入或导出功能的比例 |

---

## 2. 用户体验与功能

### 2.1 用户画像

#### 画像 A：AI 应用开发者 — 张明

- **角色**: 全栈开发者，日常使用 ChatGPT/Claude 辅助编程
- **痛点**: 积累了上百条编程相关的提示词，散落在不同对话中，无法快速找到之前调优过的版本
- **需求**: 版本管理、分类归档、变量填充后一键复制到 AI 对话框
- **使用频率**: 每天 5-10 次

#### 画像 B：提示词工程师 — 李薇

- **角色**: 专职 Prompt Engineer，为团队编写和优化业务提示词
- **痛点**: 需要将提示词模板分享给团队成员，团队成员不知道如何正确使用变量占位符
- **需求**: 公开分享、变量说明、Excel 批量导入已有提示词库
- **使用频率**: 每天 10-20 次

#### 画像 C：团队管理者 — 王浩

- **角色**: 产品团队负责人，管理团队 AI 使用规范
- **痛点**: 团队成员各自维护提示词，无法沉淀为组织资产
- **需求**: 公共分类体系、批量导出备份、收藏精选
- **使用频率**: 每周 3-5 次

### 2.2 用户故事与验收标准

#### US-01: 用户注册与登录

**故事**: 作为一个新用户，我想要注册账号并登录系统，以便使用提示词管理功能。

**验收标准**:
- 用户可通过用户名、邮箱和密码完成注册
- 系统校验用户名和邮箱的唯一性，重复时返回明确错误提示
- 注册成功后可使用邮箱和密码登录
- 登录成功后系统签发 JWT 令牌（有效期 60 分钟），自动跳转至主页面
- 未登录用户无法访问任何提示词管理功能，自动重定向至登录页
- 已登录用户访问登录/注册页时自动重定向至主页面

#### US-02: 创建提示词

**故事**: 作为已登录用户，我想要创建新的提示词条目，以便记录和管理我的提示词。

**验收标准**:
- 必填字段：名称、提示词内容
- 选填字段：适用场景、变量说明
- 可为提示词选择已有分类（多选）和已有标签（多选）
- 可在创建时直接新建标签（输入标签名后回车或点击添加）
- 可设置提示词为"公开到团队"或"私有"
- 创建成功后自动生成 v1 版本记录
- 创建成功后列表即时刷新显示新条目

#### US-03: 编辑提示词

**故事**: 作为提示词所有者，我想要编辑我的提示词内容和元信息，以便持续优化。

**验收标准**:
- 可编辑所有字段（名称、场景、内容、变量说明、分类、标签、公开状态）
- 仅提示词所有者可编辑
- 内容字段发生变更时自动创建新版本记录，版本号自增
- 内容未变更时不生成新版本
- 编辑时可新增标签
- 编辑成功后详情面板即时更新

#### US-04: 删除提示词

**故事**: 作为提示词所有者，我想要删除不再需要的提示词，以便保持库的整洁。

**验收标准**:
- 仅提示词所有者可删除
- 删除前弹出确认对话框
- 删除后级联删除所有版本记录和收藏记录
- 删除后列表即时移除该条目

#### US-05: 查看提示词列表

**故事**: 作为已登录用户，我想要浏览所有可见的提示词，以便发现和复用有价值的提示词。

**验收标准**:
- 展示用户自己创建的所有提示词（含私有）
- 展示其他用户公开的提示词
- 每条提示词卡片显示：名称、创建者、公开状态、内容预览（截断3行）、分类标签、收藏数
- 鼠标悬停卡片时显示收藏和删除操作按钮
- 默认按创建时间倒序排列

#### US-06: 搜索提示词

**故事**: 作为用户，我想要通过关键词搜索提示词，以便快速找到目标内容。

**验收标准**:
- 支持按标题和内容进行模糊搜索（不区分大小写）
- 搜索在客户端实时过滤，输入即时响应
- 搜索结果为空时显示无结果提示

#### US-07: 标签筛选

**故事**: 作为用户，我想要按标签筛选提示词，以便快速定位特定领域的提示词。

**验收标准**:
- 侧边栏展示所有标签列表
- 点击标签筛选显示含该标签的提示词
- 再次点击同一标签取消筛选
- 筛选在客户端实时生效

#### US-08: 分类筛选

**故事**: 作为用户，我想要按分类筛选提示词，以便按项目或主题组织浏览。

**验收标准**:
- 侧边栏展示分类树形目录，支持展开/折叠
- 点击分类筛选显示该分类及其所有子分类下的提示词（递归包含）
- 支持"全部提示词"和"我的收藏"快捷筛选
- 筛选在客户端实时生效

#### US-09: 收藏提示词

**故事**: 作为用户，我想要收藏有价值的提示词，以便快速访问常用提示词。

**验收标准**:
- 点击收藏按钮切换收藏状态（toggle 模式：有则取消，无则添加）
- 收藏后卡片上显示已收藏标识
- 可通过"我的收藏"筛选仅查看已收藏的提示词
- 不能收藏其他用户的私有提示词
- 收藏操作使用乐观更新，UI 即时响应

#### US-10: 查看提示词详情与版本

**故事**: 作为用户，我想要查看提示词的完整内容、版本历史和变量信息，以便了解和复用。

**验收标准**:
- 点击提示词卡片打开详情面板
- 显示完整内容、适用场景、变量说明、分类、标签、公开状态
- 提供版本下拉选择器，可切换查看历史版本内容
- 版本按版本号倒序排列
- 详情面板提供编辑和删除操作入口

#### US-11: 变量填充与复制

**故事**: 作为用户，我想要将提示词模板中的变量替换为实际值并复制，以便直接粘贴到 AI 对话中使用。

**验收标准**:
- 自动提取 `{{变量名}}` 和 `[变量名]` 格式的变量
- 为每个变量提供输入框
- 用户填写变量值后，点击复制按钮将替换后的内容复制到剪贴板
- 复制成功显示 toast 提示
- 未填写变量时原样保留变量占位符

#### US-12: 分类管理

**故事**: 作为用户，我想要创建和管理分类体系，以便按自己的逻辑组织提示词。

**验收标准**:
- 可创建顶级分类和子分类（指定父分类）
- 分类以树形结构展示，支持展开/折叠
- 可重命名分类
- 可删除分类（子分类自动提升到父级）
- 系统防止循环引用（分类不能成为自身或其后代的子分类）
- 支持公共分类（无所有者）和用户私有分类
- 右键分类节点弹出操作菜单（新建子分类/重命名/删除）

#### US-13: Excel 导出

**故事**: 作为用户，我想要将提示词导出为 Excel 文件，以便备份或离线查看。

**验收标准**:
- 点击导出按钮下载当前用户所有提示词的 Excel 文件
- Excel 包含：名称、场景、内容、变量说明、标签（逗号分隔）、分类（逗号分隔）、公开状态、创建时间、更新时间
- 文件格式为 `.xlsx`

#### US-14: Excel 导入

**故事**: 作为用户，我想要从 Excel 文件批量导入提示词，以便快速迁移已有提示词库。

**验收标准**:
- 提供导入模板下载功能（含示例数据和填写说明两个 Sheet）
- 上传 `.xlsx` 文件后系统解析并批量创建提示词
- 自动创建不存在的标签和分类
- 导入完成后显示结果统计（成功导入数、跳过数）
- 重复导入相同数据会创建重复记录（无去重机制）

#### US-15: 用户认证与会话管理

**故事**: 作为用户，我想要系统管理我的登录状态，以便无需频繁重新登录。

**验收标准**:
- 登录后 JWT 令牌存储在浏览器 localStorage
- 关闭浏览器后重新打开无需重新登录（令牌未过期）
- 令牌过期（60 分钟）后自动登出并重定向至登录页
- 用户可手动点击退出登录，清除令牌和用户信息

### 2.3 非目标（当前版本不包含）

| 功能 | 说明 |
|------|------|
| 管理员后台 | 无管理员角色、无用户管理界面 |
| 提示词版本回滚 | 虽可查看历史版本，但无一键回滚操作 |
| 密码修改/重置 | 用户无法自行修改密码或找回密码 |
| 团队/组织管理 | 无团队概念，"公开"仅为个人到所有用户 |
| 令牌自动刷新 | 无 Refresh Token 机制，过期需重新登录 |
| 暗色模式 | 虽定义了暗色 CSS 变量，但无切换入口 |
| 协同编辑 | 无实时协作功能 |
| 提示词评分/评论 | 无社区互动功能 |
| 分享链接 | 无独立分享 URL |
| 服务端分页/排序 | 前端一次性加载全部数据后客户端过滤 |

---

## 3. 技术规格

### 3.1 架构概览

```
┌──────────────────────────────────────────────────────┐
│                    用户浏览器                          │
│  React 18 SPA (Vite 5 + TypeScript + Tailwind CSS)   │
└────────────────────┬─────────────────────────────────┘
                     │ HTTP / fetch API
                     ▼
┌──────────────────────────────────────────────────────┐
│              Nginx (生产环境反向代理)                   │
│  /api/* → 后端    /* → 前端静态资源                     │
└────────────────────┬─────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│  前端静态资源     │    │  FastAPI 后端    │
│  React Build    │    │  (Uvicorn)      │
└─────────────────┘    └────────┬────────┘
                                │ SQLAlchemy 2.0
                                ▼
                       ┌─────────────────┐
                       │  SQLite 数据库   │
                       │  prompts.db     │
                       └─────────────────┘
```

### 3.2 技术栈详情

#### 后端

| 技术 | 版本 | 用途 |
|------|------|------|
| Python | 3.12+ | 编程语言 |
| FastAPI | 0.104+ | Web 框架 |
| SQLAlchemy | 2.0 | ORM（声明式映射，mapped_column 风格） |
| Pydantic | v2 | 数据验证与序列化 |
| python-jose | - | JWT 令牌签发与验证 |
| passlib[bcrypt] | - | 密码哈希与验证 |
| openpyxl | - | Excel 文件读写 |
| uvicorn | - | ASGI 服务器 |

#### 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| TypeScript | - | 编程语言 |
| React | 18 | UI 框架 |
| Vite | 5 | 构建工具 |
| React Router DOM | v7 | 路由管理 |
| Tailwind CSS | 3 + animate | 样式系统 |
| Radix UI | - | 无障碍 UI 原语 |
| shadcn/ui | - | UI 组件封装 |
| Lucide React | - | 图标库 |

#### 部署

| 技术 | 用途 |
|------|------|
| Docker + Docker Compose | 容器化部署 |
| Nginx | 前端静态服务 + 反向代理 |
| GitHub Actions | CI/CD 流水线 |

### 3.3 数据模型

#### 3.3.1 实体关系图

```
┌──────────┐       ┌──────────────┐       ┌──────────┐
│   User   │──1:N──│    Prompt    │──M:N──│    Tag   │
│──────────│       │──────────────│       │──────────│
│ id       │       │ id           │       │ id       │
│ username │       │ title        │       │ name     │
│ email    │       │ scenario     │       └──────────┘
│ password │       │ content      │            ▲
└────┬─────┘       │ variables    │            │
     │             │ is_public    │   prompt_tag_association
     │             │ user_id (FK) │   (prompt_id, tag_id)
     │             │ created_at   │
     │             │ updated_at   │       ┌──────────┐
     │             └──────┬───────┘──M:N──│ Category │
     │                    │               │──────────│
     │                    │               │ id       │
     │              ┌─────┴──────┐        │ name     │
     │              │            │        │ parent_id │──自引用
     │              ▼            ▼        │ user_id  │
     │     ┌────────────┐  ┌─────────┐   │ sort_order│
     │     │PromptVersion│  │Favorite │   └──────────┘
     │     │────────────│  │─────────│        ▲
     │     │ id         │  │ id      │        │
     │     │ prompt_id  │  │ user_id │  prompt_category_
     │     │ content    │  │ prompt_id│  association
     │     │ version_no │  │ created │  (prompt_id, category_id)
     │     │ created_at │  └─────────┘
     │     └────────────┘
     │           ▲
     └───────────┘  (User M:N Prompt via Favorite)
```

#### 3.3.2 核心模型字段

**User（用户）**

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | Integer | PK, 自增 | 用户 ID |
| username | String(50) | 唯一, 非空 | 用户名 |
| email | String(100) | 唯一, 非空 | 邮箱 |
| hashed_password | String(200) | 非空 | bcrypt 哈希密码 |
| created_at | DateTime | 默认 utcnow | 创建时间 |

**Prompt（提示词）**

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | Integer | PK, 自增 | 提示词 ID |
| title | String(200) | 非空 | 名称 |
| scenario | String(500) | 可空 | 适用场景 |
| content | Text | 非空 | 提示词内容 |
| variables | String(500) | 可空 | 变量说明 |
| is_public | Boolean | 默认 False | 是否公开 |
| user_id | Integer | FK → User, SET NULL | 所有者 |
| created_at | DateTime | 默认 utcnow | 创建时间 |
| updated_at | DateTime | 更新时自动刷新 | 更新时间 |

**Tag（标签）**

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | Integer | PK, 自增 | 标签 ID |
| name | String(50) | 唯一, 非空 | 标签名 |

**Category（分类）**

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | Integer | PK, 自增 | 分类 ID |
| name | String(100) | 非空 | 分类名 |
| parent_id | Integer | FK → Category, 可空 | 父分类（树形） |
| user_id | Integer | FK → User, CASCADE, 可空 | 所有者（空=公共分类） |
| sort_order | Integer | 默认 0 | 排序序号 |
| created_at | DateTime | 默认 utcnow | 创建时间 |

**PromptVersion（版本历史）**

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | Integer | PK, 自增 | 版本 ID |
| prompt_id | Integer | FK → Prompt, CASCADE | 所属提示词 |
| content | Text | 非空 | 该版本的提示词内容 |
| version_number | Integer | 非空 | 版本号（自增） |
| created_at | DateTime | 默认 utcnow | 创建时间 |

**Favorite（收藏）**

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | Integer | PK, 自增 | 收藏 ID |
| user_id | Integer | FK → User, CASCADE | 收藏用户 |
| prompt_id | Integer | FK → Prompt, CASCADE | 被收藏提示词 |
| created_at | DateTime | 默认 utcnow | 收藏时间 |

### 3.4 API 规格总览

#### 3.4.1 通用约定

- **基础路径**: `/api`
- **认证方式**: Bearer Token（JWT），`Authorization: Bearer <token>` 请求头
- **分页方式**: 页码分页（`page` + `page_size`）或偏移分页（`skip` + `limit`），二选一
- **分页响应头**: `X-Total-Count` / `X-Page` / `X-Page-Size` / `X-Total-Pages`
- **排序**: `sort_by`（created_at / updated_at / title / id）+ `sort_order`（asc / desc）
- **错误格式**: `{"detail": "错误信息"}`，中文错误消息

#### 3.4.2 端点清单

| 方法 | 路径 | 功能 | 认证 |
|------|------|------|------|
| POST | `/api/auth/register` | 用户注册 | 否 |
| POST | `/api/auth/login` | 用户登录 | 否 |
| GET | `/api/auth/me` | 获取当前用户 | 是 |
| GET | `/api/prompts` | 提示词列表（搜索/筛选/分页/排序） | 是 |
| POST | `/api/prompts` | 创建提示词 | 是 |
| GET | `/api/prompts/{id}` | 提示词详情（含版本历史） | 是 |
| PUT | `/api/prompts/{id}` | 更新提示词（内容变更自动生成版本） | 是 |
| DELETE | `/api/prompts/{id}` | 删除提示词（级联删除版本和收藏） | 是 |
| POST | `/api/prompts/{id}/favorite` | 切换收藏状态（toggle） | 是 |
| GET | `/api/prompts/export` | 导出 Excel | 是 |
| GET | `/api/prompts/import-template` | 下载导入模板 | 是 |
| POST | `/api/prompts/import` | 导入 Excel | 是 |
| GET | `/api/tags` | 标签列表（按名称排序） | 否 |
| GET | `/api/categories` | 分类列表（树形结构） | 是 |
| POST | `/api/categories` | 创建分类 | 是 |
| PUT | `/api/categories/{id}` | 更新分类（含循环引用防护） | 是 |
| DELETE | `/api/categories/{id}` | 删除分类（子分类提升到父级） | 是 |

#### 3.4.3 关键 API 请求/响应格式

**创建提示词**

```json
// POST /api/prompts
{
  "title": "代码审查助手",
  "scenario": "用于审查 Pull Request 中的代码质量",
  "content": "你是一位高级代码审查专家。请审查以下代码：\n{{代码内容}}",
  "variables": "代码内容：需要审查的代码片段",
  "is_public": true,
  "tag_ids": [1, 3],
  "new_tags": ["代码审查", "PR"],
  "category_ids": [2]
}

// 响应 201
{
  "id": 42,
  "title": "代码审查助手",
  "scenario": "用于审查 Pull Request 中的代码质量",
  "content": "你是一位高级代码审查专家...",
  "variables": "代码内容：需要审查的代码片段",
  "is_public": true,
  "owner_username": "zhangming",
  "tags": [{"id": 1, "name": "编程"}, {"id": 3, "name": "质量"}, {"id": 5, "name": "代码审查"}, {"id": 6, "name": "PR"}],
  "categories": [{"id": 2, "name": "开发工具", "children": []}],
  "versions": [{"id": 1, "version_number": 1, "content": "...", "created_at": "2026-05-27T10:00:00"}],
  "favorite_count": 0,
  "is_favorited": false,
  "created_at": "2026-05-27T10:00:00",
  "updated_at": "2026-05-27T10:00:00"
}
```

**提示词列表查询**

```
GET /api/prompts?search=代码&tag_id=1&category_id=2&favorites_only=false&page=1&page_size=20&sort_by=created_at&sort_order=desc

响应头:
X-Total-Count: 15
X-Page: 1
X-Page-Size: 20
X-Total-Pages: 1

响应体: PromptListItem[]（不含 versions 字段，优化性能）
```

**切换收藏**

```json
// POST /api/prompts/42/favorite
// 添加收藏时:
{"id": 10, "user_id": 1, "prompt_id": 42, "created_at": "...", "is_favorited": true, "favorite_count": 5}

// 取消收藏时:
{"id": null, "user_id": 1, "prompt_id": 42, "created_at": null, "is_favorited": false, "favorite_count": 4}
```

### 3.5 认证与安全

#### 3.5.1 JWT 认证流程

```
┌────────┐    POST /api/auth/login     ┌────────┐
│  客户端 │ ──────────────────────────> │  服务端 │
│        │    {email, password}         │        │
│        │ <────────────────────────── │        │
│        │    {access_token, token_type}│        │
│        │                              │        │
│        │    GET /api/prompts          │        │
│        │ ──────────────────────────> │        │
│        │    Authorization: Bearer xxx │        │
│        │ <────────────────────────── │        │
│        │    200 OK + 数据             │        │
└────────┘                              └────────┘
```

- **算法**: HS256
- **密钥**: 环境变量 `SECRET_KEY`（启动时强制要求）
- **有效期**: 60 分钟
- **载荷**: `{"sub": "<user_id>", "exp": <过期时间>}`
- **存储**: 客户端 localStorage（键名 `prompthub_token`）
- **过期处理**: 后端返回 401，前端 AuthContext 自动清除状态并重定向至登录页

#### 3.5.2 权限控制矩阵

| 操作 | 提示词所有者 | 其他用户（公开） | 其他用户（私有） | 未登录用户 |
|------|:----------:|:------------:|:------------:|:--------:|
| 查看列表 | ✅ | ✅ 仅公开 | ❌ | ❌ |
| 查看详情 | ✅ | ✅ 仅公开 | ❌ | ❌ |
| 创建 | ✅ | - | - | ❌ |
| 编辑 | ✅ | ❌ | ❌ | ❌ |
| 删除 | ✅ | ❌ | ❌ | ❌ |
| 收藏 | ✅ | ✅ 仅公开 | ❌ | ❌ |

### 3.6 前端架构

#### 3.6.1 路由结构

| 路径 | 组件 | 守卫 | 说明 |
|------|------|------|------|
| `/login` | LoginPage | AuthRoute | 已登录重定向至首页 |
| `/register` | RegisterPage | AuthRoute | 已登录重定向至首页 |
| `/*` | Layout | ProtectedRoute | 未登录重定向至登录页 |

#### 3.6.2 组件职责

| 组件 | 文件 | 职责 |
|------|------|------|
| Layout | `components/Layout.tsx` | 主布局与核心状态管理枢纽（列表、筛选、CRUD、导入导出、分类管理） |
| Sidebar | `components/Sidebar.tsx` | 侧边栏（分类树、标签列表、快捷筛选） |
| PromptCard | `components/PromptCard.tsx` | 提示词卡片（列表项展示） |
| PromptDetail | `components/PromptDetail.tsx` | 详情面板（内容、版本切换、变量填充、复制） |
| PromptForm | `components/PromptForm.tsx` | 创建/编辑表单（字段输入、分类标签选择） |

#### 3.6.3 状态管理

采用 React Context + 组件内部 state 的轻量级方案：

- **AuthContext**: 全局认证状态（token、user、login、logout）
- **Layout 内部 state**: 15+ 个状态变量管理列表数据、筛选条件、UI 开关
- **useApi Hook**: 封装所有 API 调用，自动处理 401 登出

#### 3.6.4 API 调用层

- `api.ts`: 定义所有类型接口和 API 函数，包含 `fetchApi` 通用请求封装
- `useApi.ts`: 自定义 Hook，将 API 函数与 AuthContext 的 token 和 logout 集成
- 所有认证请求自动携带 `Authorization` 请求头
- 401 响应自动触发登出流程

### 3.7 数据流

#### 3.7.1 提示词列表加载与筛选

```
页面加载
  │
  ├── fetchPrompts() ──> GET /api/prompts (无参数, 加载全部)
  │                         │
  │                         ├── fetchTags() ──> GET /api/tags
  │                         └── fetchCategories() ──> GET /api/categories
  │
  └── 客户端过滤
       │
       ├── searchQuery → 过滤 title/content
       ├── selectedTagId → 过滤 tags
       ├── selectedCategoryId → 过滤 categories（含子分类）
       └── showFavoritesOnly → 过滤 is_favorited
```

> **注意**: 当前版本前端一次性加载全部提示词后在客户端执行过滤，后端支持的搜索/筛选/分页参数虽已定义但前端未使用。

#### 3.7.2 版本自动生成

```
创建提示词 ──> 自动生成 v1 版本
                    │
编辑提示词 ──> 内容变更？── 是 ──> 自动创建新版本 (version_number + 1)
                    │
                    └── 否 ──> 不创建新版本
```

### 3.8 测试覆盖

#### 后端测试（pytest）

| 测试模块 | 用例数 | 覆盖范围 |
|----------|--------|----------|
| test_auth.py | 8 | 注册（成功/重复用户名/重复邮箱/缺字段）、登录（成功/错误密码/不存在邮箱）、获取当前用户（成功/无token/无效token） |
| test_prompts.py | 14 | CRUD 全流程、搜索/分页/排序/可见性、版本生成、权限控制 |
| test_categories.py | 9 | CRUD、树形结构、循环引用防护、子分类级联 |
| test_favorites.py | 5 | toggle 收藏、权限、筛选 |
| **合计** | **36** | - |

#### 前端测试（Vitest + Testing Library）

| 测试模块 | 用例数 | 覆盖范围 |
|----------|--------|----------|
| AuthContext.test.tsx | 5 | 初始状态、localStorage 恢复、login/logout、Provider 外调用 |
| PromptForm.test.tsx | 7 | 创建/编辑模式、必填验证、标签/分类切换 |
| api.test.ts | 14 | fetchApi 请求、401 处理、全部 API 函数 |
| **合计** | **26** | - |

---

## 4. 风险与已知限制

### 4.1 已知技术限制

| 编号 | 限制 | 影响范围 | 严重程度 |
|------|------|----------|----------|
| L-01 | 前端客户端过滤，未使用服务端分页/搜索/筛选 | 数据量增长后性能下降 | 中 |
| L-02 | JWT 无刷新机制，60 分钟后强制重新登录 | 用户体验受损 | 中 |
| L-03 | 版本历史仅可查看，无回滚操作端点 | 版本管理功能不完整 | 中 |
| L-04 | Favorite 表缺少 (user_id, prompt_id) 联合唯一约束 | 并发场景下可能产生重复收藏 | 低 |
| L-05 | JWT 存储在 localStorage，存在 XSS 攻击风险 | 安全性隐患 | 中 |
| L-06 | 导入无幂等性，重复导入会创建重复记录 | 批量操作可靠性 | 低 |
| L-07 | Layout 组件职责过重（500+ 行，15+ 状态） | 可维护性 | 低 |
| L-08 | 侧边栏固定宽度，小屏幕无法折叠 | 移动端体验差 | 低 |
| L-09 | 注册无密码确认字段 | 用户可能输错密码 | 低 |
| L-10 | 分类递归查询性能（get_descendant_ids） | 深层分类树可能慢 | 低 |

### 4.2 安全考量

| 项目 | 当前状态 | 建议 |
|------|----------|------|
| JWT 存储 | localStorage | 迁移至 HttpOnly Cookie |
| CORS | 配置了 expose_headers | 生产环境需限制 origins |
| 密码安全 | bcrypt 哈希 | 符合安全标准 |
| SQL 注入 | SQLAlchemy ORM 参数化查询 | 无风险 |
| XSS | React 默认转义 + Tailwind | 需关注 localStorage 中的用户信息 |

---

## 5. 部署与运维

### 5.1 环境变量

| 变量名 | 必填 | 默认值 | 说明 |
|--------|------|--------|------|
| `SECRET_KEY` | 是 | - | JWT 签名密钥 |
| `DATABASE_URL` | 否 | `sqlite:///./prompts.db` | 数据库连接字符串 |
| `VITE_API_BASE` | 否 | `http://localhost:8000/api` | 前端 API 基础路径 |

### 5.2 部署架构

```
Docker Compose
  ├── backend (Uvicorn)
  │     └── SQLite volume
  ├── frontend (Nginx)
  │     ├── / → React 静态文件
  │     └── /api → proxy_pass backend:8000
  └── (CI/CD: GitHub Actions)
        ├── lint → build → test
        └── Docker push → SSH 部署
```

### 5.3 开发命令

```bash
# 后端
pip install -r requirements.txt
uvicorn backend.main:app --reload
ruff check backend/          # Lint
ruff format backend/         # 格式化
pytest                       # 测试

# 前端
cd frontend
npm install
npm run dev                  # 开发服务器
npm run build                # 构建
npm run lint                 # ESLint
npm run test                 # 测试

# Docker
docker compose up -d         # 启动
docker compose build         # 构建
```
