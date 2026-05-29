---
name: new-component
description: 创建新的前端 React 组件
category: development
parameters:
  - name: name
    description: 组件名称（PascalCase），如 PromptShareDialog
    required: true
  - name: type
    description: 组件类型（ui/business/page）
    required: true
  - name: description
    description: 组件功能描述
    required: true
---

# 创建新 React 组件

根据指定参数创建符合项目规范的前端 React 组件。

## 输入参数

- **组件名称**: $ARGUMENTS
- **组件类型**: 从参数中提取（ui / business / page）
- **功能描述**: 从参数中提取

## 执行流程

### 1. 确定组件位置

根据组件类型选择目录：
- **ui 组件**: `frontend/src/components/ui/` — 基础 UI 原子组件（遵循 shadcn/ui 模式）
- **business 组件**: `frontend/src/components/` — 业务功能组件
- **page 组件**: `frontend/src/pages/` — 页面级组件

### 2. 创建组件文件

遵循项目规范：
- 使用函数式组件 + Hooks，不使用 class 组件
- 样式使用 Tailwind CSS + `cn()` 工具函数（`clsx` + `tailwind-merge`）
- 路径别名 `@` 映射到 `src/`
- 图标使用 `lucide-react`
- 通知使用 `useToast()` hook

### 3. 注册 API 调用（如需要）

在 `frontend/src/api.ts` 中：
- 定义 TypeScript 接口
- 实现 API 调用函数

### 4. 集成到布局（如需要）

在 `frontend/src/components/Layout.tsx` 中：
- 添加对话框状态管理
- 集成到主布局

### 5. 验证

```bash
cd frontend && npm run lint
cd frontend && npm run build
```

## 模板

### 业务组件模板

```tsx
import { cn } from "@/lib/utils"

interface {ComponentName}Props {
  className?: string
  // 其他 props
}

export function {ComponentName}({ className, ...props }: {ComponentName}Props) {
  return (
    <div className={cn("", className)}>
      {/* 组件内容 */}
    </div>
  )
}
```

### UI 组件模板（shadcn/ui 风格）

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

export interface {ComponentName}Props
  extends React.HTMLAttributes<HTMLDivElement> {}

const {ComponentName} = React.forwardRef<HTMLDivElement, {ComponentName}Props>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("", className)}
      {...props}
    />
  )
)
{ComponentName}.displayName = "{ComponentName}"

export { {ComponentName} }
```
