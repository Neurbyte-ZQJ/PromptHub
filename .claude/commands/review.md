---
name: review
description: 执行代码审查，检查代码质量、安全性和最佳实践
category: quality
parameters:
  - name: scope
    description: 审查范围（文件路径或模块名）
    required: false
---

# 代码审查

对指定范围的代码执行全面审查，涵盖代码质量、安全性、性能和最佳实践。

## 输入参数

- **审查范围**: $ARGUMENTS（默认审查当前变更）

## 审查维度

### 1. 代码质量

- [ ] 函数/方法职责单一，命名清晰
- [ ] 无重复代码，逻辑抽象合理
- [ ] 错误处理完善，使用 `HTTPException` + 中文消息
- [ ] 类型注解完整（Python 使用 `Mapped` 风格，TypeScript 接口定义完整）

### 2. 安全性

- [ ] 认证端点正确使用 `Depends(get_current_user)`
- [ ] 数据可见性遵循：用户自己的 + `is_public=True`
- [ ] 修改/删除操作仅所有者可执行
- [ ] 无 SQL 注入风险（使用 ORM 参数化查询）
- [ ] 无敏感信息泄露（密码哈希、JWT 密钥等）

### 3. 后端规范

- [ ] 路由定义在 `backend/main.py` 中
- [ ] Pydantic v2 语法（`model_dump()` / `from_attributes = True`）
- [ ] SQLAlchemy 2.0 风格（`Mapped` / `mapped_column`）
- [ ] 分页响应头正确返回
- [ ] Import 排序符合 isort 规范

### 4. 前端规范

- [ ] 函数式组件 + Hooks
- [ ] Tailwind CSS + `cn()` 工具函数
- [ ] 路径别名 `@` 正确使用
- [ ] API 调用在 `api.ts` 中定义
- [ ] 认证 API 通过 `useApi()` hook 调用
- [ ] 弹窗状态由 Layout 集中管理

### 5. 性能

- [ ] 数据库查询无 N+1 问题
- [ ] 前端组件合理使用 `memo` / `useMemo` / `useCallback`
- [ ] 分页查询使用数据库级别分页（非内存分页）

## 输出格式

```
## 审查结果

### 严重问题 (必须修复)
- [文件:行号] 问题描述

### 建议改进 (推荐修复)
- [文件:行号] 问题描述

### 亮点 (值得保持)
- 良好实践描述
```
