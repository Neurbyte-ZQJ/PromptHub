---
name: lint
description: 运行后端和前端代码检查与格式化
category: quality
---

# 代码检查与格式化

运行后端 Ruff 和前端 ESLint 进行代码质量检查和自动格式化。

## 执行步骤

### 1. 后端 Ruff 检查

```bash
ruff check backend/
```

检查规则：E, F, I, W（忽略 E501 行长度限制）

### 2. 后端 Ruff 格式化

```bash
ruff format backend/
```

格式化配置：target-version = py312, line-length = 120

### 3. 前端 ESLint 检查

```bash
cd frontend && npm run lint
```

ESLint 配置：@typescript-eslint/recommended + react-hooks/recommended

### 4. 前端 TypeScript 类型检查

```bash
cd frontend && npx tsc --noEmit
```

### 5. 汇总结果

- 列出所有检查中发现的问题
- 区分自动修复和需手动修复的问题
- 如有错误，提供修复建议

## 配置参考

- 后端 Ruff: `pyproject.toml` → `[tool.ruff]`
- 前端 ESLint: `frontend/.eslintrc.cjs`
- 前端 TypeScript: `frontend/tsconfig.json`
