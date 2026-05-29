# 交互协议

## 概述

定义智能体之间、智能体与用户之间的标准交互协议，确保通信的一致性和可追溯性。

## 协议类型

### 1. 用户 → 智能体

用户通过自然语言或命令触发智能体：

```
用户输入 → 意图识别 → 智能体匹配 → 任务分发
```

意图识别规则：
- 关键词匹配：根据智能体的 `triggers` 字段
- 上下文推断：根据当前工作上下文（如正在编辑的文件类型）
- 显式调用：通过命令直接指定智能体

### 2. 智能体 → 智能体

智能体之间的协作通过任务委派实现：

```
智能体A → 委派任务 → 智能体B → 返回结果 → 智能体A
```

委派规则：
- 委派必须附带完整上下文
- 接收方必须确认或拒绝
- 结果必须包含执行状态和元信息

### 3. 智能体 → 工具

智能体调用外部工具的标准流程：

```
构建参数 → 调用工具 → 解析输出 → 错误处理 → 返回结果
```

## 消息格式

### 请求消息

```json
{
  "type": "request",
  "from": "agent-id | user",
  "to": "agent-id | tool-name",
  "action": "action-name",
  "payload": {},
  "context": {
    "working_directory": "string",
    "active_files": ["string"],
    "project_phase": "string"
  },
  "metadata": {
    "timestamp": "ISO8601",
    "request_id": "uuid"
  }
}
```

### 响应消息

```json
{
  "type": "response",
  "from": "agent-id | tool-name",
  "to": "agent-id | user",
  "status": "success | error | partial",
  "payload": {},
  "validation": {
    "lint_passed": "boolean",
    "tests_passed": "boolean",
    "build_passed": "boolean"
  },
  "metadata": {
    "timestamp": "ISO8601",
    "request_id": "uuid",
    "duration_ms": "number"
  }
}
```

## 错误处理协议

### 错误分级

| 级别 | 说明 | 处理策略 |
|------|------|----------|
| CRITICAL | 系统级错误，无法继续 | 终止当前任务，通知用户 |
| ERROR | 任务执行失败 | 回滚变更，提供修复建议 |
| WARNING | 非预期但可恢复 | 记录日志，继续执行 |
| INFO | 信息性提示 | 记录日志 |

### 错误响应格式

```json
{
  "type": "error",
  "level": "CRITICAL | ERROR | WARNING",
  "code": "string - 错误代码",
  "message": "string - 人类可读的错误描述（中文）",
  "suggestion": "string - 修复建议",
  "context": {
    "file": "string - 相关文件路径",
    "line": "number - 相关行号",
    "original_error": "string - 原始错误信息"
  }
}
```

## 工作流编排

### 串行工作流

```
Step1 → Step2 → Step3 → Result
```

每个步骤的输出作为下一步骤的输入。

### 并行工作流

```
    ┌→ StepA ─┐
Step1├→ StepB ─┼→ Merge → Result
    └→ StepC ─┘
```

多个步骤并行执行，结果合并后输出。

### 条件工作流

```
Step1 → Condition?
           ├→ Yes → Step2A → Result
           └→ No  → Step2B → Result
```

根据条件选择不同的执行路径。

### PromptHub 典型工作流

**新增功能开发**：
```
需求分析 → 数据模型设计 → API 开发 → 前端组件开发 → 集成测试 → 代码审查
```

**Bug 修复**：
```
问题复现 → 根因定位 → 实施修复 → 回归测试 → 代码审查
```

**部署发布**：
```
代码检查 → 测试执行 → 镜像构建 → 服务部署 → 健康检查
```
