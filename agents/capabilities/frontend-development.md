# 前端开发能力模块

## 概述

提供前端 React 组件和页面的开发能力，包括组件创建、样式处理、状态管理和 API 集成。

## 能力标识

- **ID**: `capability.frontend-development`
- **版本**: 1.0.0
- **作用域**: frontend
- **触发关键词**: 新增组件, 添加页面, 修改组件, 前端页面, React组件, 添加弹窗

## 能力清单

### CAP-FE-001: 组件创建

创建符合项目规范的 React 组件。

**规范要求**:
- 函数式组件 + Hooks，不使用 class 组件
- 样式使用 Tailwind CSS + `cn()` 工具函数
- 路径别名 `@` 映射到 `src/`
- 图标使用 `lucide-react`

**组件分类**:
| 类型 | 目录 | 说明 |
|------|------|------|
| UI 原子组件 | `components/ui/` | 遵循 shadcn/ui 模式，使用 `forwardRef` |
| 业务组件 | `components/` | 功能性组件，如 PromptCard、PromptForm |
| 页面组件 | `pages/` | 路由级页面，如 LoginPage |

### CAP-FE-002: API 集成

在前端集成后端 API 调用。

**规范要求**:
- TypeScript 接口定义在 `src/api.ts`
- API 调用函数定义在 `src/api.ts`
- 认证 API 通过 `useApi()` hook 调用
- 自动注入 token + 处理 401

**流程**:
1. 在 `api.ts` 中定义接口类型
2. 在 `api.ts` 中实现 API 函数
3. 在组件中通过 `useApi()` 调用
4. 处理加载/错误/成功状态

### CAP-FE-003: 状态管理

管理组件和全局状态。

**规范要求**:
- 全局认证状态: `AuthContext` + `useAuth()`
- Token 持久化: localStorage (`prompthub_token` + `prompthub_user`)
- 弹窗状态: Layout 组件集中管理
- 通知状态: `useToast()` hook
- 优先使用 React Context + useState，不引入额外状态库

### CAP-FE-004: 样式处理

使用 Tailwind CSS 实现响应式设计。

**规范要求**:
- 使用 `cn()` 合并类名（`clsx` + `tailwind-merge`）
- 遵循 shadcn/ui 的 CSS 变量体系
- 响应式断点: sm(640) / md(768) / lg(1024) / xl(1280)
- 动画使用 `tailwindcss-animate`

### CAP-FE-005: 路由集成

添加新的页面路由。

**规范要求**:
- 路由定义在 `App.tsx`
- 认证页面使用 `AuthRoute` 守卫（仅未认证可访问）
- 受保护页面使用 `ProtectedRoute` 守卫（需认证）
- 使用 React Router DOM v7

## 验证清单

- [ ] ESLint 通过: `cd frontend && npm run lint`
- [ ] TypeScript 编译通过: `cd frontend && npx tsc --noEmit`
- [ ] 构建成功: `cd frontend && npm run build`
- [ ] 测试通过: `cd frontend && npm run test`
