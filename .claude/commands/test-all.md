---
name: test-all
description: 运行所有后端和前端测试
category: testing
---

# 运行全部测试

依次运行后端 pytest 测试和前端 Vitest 测试，汇总测试结果。

## 执行步骤

### 1. 运行后端测试

```bash
pytest -v
```

测试覆盖：
- `tests/test_auth.py` — 认证相关测试
- `tests/test_prompts.py` — 提示词 CRUD 测试
- `tests/test_categories.py` — 分类管理测试
- `tests/test_favorites.py` — 收藏功能测试
- `tests/test_password_reset.py` — 密码重置测试

后端测试使用独立 SQLite 数据库（`test_prompts.db`），每个测试自动建表/删表。

### 2. 运行前端测试

```bash
cd frontend && npm run test
```

测试覆盖：
- `frontend/src/test/AuthContext.test.tsx` — 认证上下文测试
- `frontend/src/test/PromptForm.test.tsx` — 表单组件测试
- `frontend/src/test/api.test.ts` — API 调用测试

### 3. 汇总结果

- 统计通过/失败/跳过的测试数量
- 列出所有失败的测试及错误信息
- 如有失败，提供修复建议

## 注意事项

- 后端测试需要 `SECRET_KEY` 环境变量（`conftest.py` 中有默认值）
- 前端测试使用 jsdom 环境，不依赖真实浏览器
- 测试数据库与开发数据库隔离
