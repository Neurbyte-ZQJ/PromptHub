---
name: fix-bug
description: 系统化定位和修复 Bug
category: debugging
parameters:
  - name: description
    description: Bug 现象描述
    required: true
---

# Bug 修复工作流

系统化地定位、分析和修复 Bug，确保修复不引入新问题。

## 输入参数

- **Bug 描述**: $ARGUMENTS

## 执行流程

### 1. 复现问题

- 根据描述确认 Bug 的复现步骤
- 确定影响范围（前端/后端/全栈）
- 记录预期行为 vs 实际行为

### 2. 定位根因

**后端排查路径**：
- 检查 API 路由逻辑（`backend/main.py`）
- 检查数据模型和查询（`backend/models.py`）
- 检查认证逻辑（`backend/auth.py`）
- 检查数据验证（`backend/schemas.py`）

**前端排查路径**：
- 检查组件状态和渲染逻辑
- 检查 API 调用和数据处理（`src/api.ts`）
- 检查认证状态（`src/contexts/AuthContext.tsx`）
- 检查事件处理和交互逻辑

### 3. 实施修复

- 最小化修改范围，仅修复根因
- 保持现有代码风格和规范
- 不引入不必要的重构

### 4. 验证修复

```bash
# 后端验证
ruff check backend/ && ruff format backend/
pytest

# 前端验证
cd frontend && npm run lint && npm run build
cd frontend && npm run test
```

- 确认 Bug 已修复
- 确认无回归问题
- 确认相关测试通过

### 5. 补充测试（如需要）

为修复的 Bug 添加回归测试，防止问题再次出现。

## 输出格式

```
## Bug 修复报告

### 问题描述
[预期行为 vs 实际行为]

### 根因分析
[定位到的根本原因]

### 修复方案
[修改的文件和具体变更]

### 验证结果
[测试结果和验证步骤]
```
