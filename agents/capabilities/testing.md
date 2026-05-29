# 测试能力模块

## 概述

提供后端和前端测试编写、执行和调试的能力。

## 能力标识

- **ID**: `capability.testing`
- **版本**: 1.0.0
- **作用域**: fullstack
- **触发关键词**: 写测试, 添加测试, 测试用例, 单元测试, 测试失败, pytest, vitest

## 能力清单

### CAP-TEST-001: 后端测试编写

使用 pytest + FastAPI TestClient 编写后端测试。

**规范要求**:
- 测试文件放在 `tests/` 目录
- 使用 `conftest.py` 中的 fixtures:
  - `db_session`: 独立数据库会话
  - `client`: 未认证的 TestClient
  - `test_user`: 测试用户对象
  - `auth_client`: 已认证的 TestClient
  - `second_user` / `second_auth_client`: 第二个测试用户
- 使用独立 SQLite 数据库（`test_prompts.db`）
- 每个测试自动建表/删表
- `SECRET_KEY` 通过 `os.environ.setdefault` 设置默认值

**测试模板**:
```python
def test_create_prompt(auth_client, db_session):
    response = auth_client.post("/api/prompts", json={
        "title": "测试提示词",
        "content": "这是一个测试内容",
        "is_public": False,
    })
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "测试提示词"
```

### CAP-TEST-002: 前端测试编写

使用 Vitest + Testing Library 编写前端测试。

**规范要求**:
- 测试文件放在 `frontend/src/test/` 目录
- 使用 Vitest + @testing-library/react + jsdom
- 测试配置在 `frontend/vitest.config.ts`
- Setup 文件: `frontend/src/test/setup.ts`

**测试模板**:
```tsx
import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { Component } from "@/components/Component"

describe("Component", () => {
  it("renders correctly", () => {
    render(<Component />)
    expect(screen.getByText("expected text")).toBeInTheDocument()
  })
})
```

### CAP-TEST-003: 测试执行

运行测试并分析结果。

**后端**:
```bash
pytest                          # 运行所有测试
pytest tests/test_auth.py       # 运行指定文件
pytest -v                       # 详细输出
pytest -k "test_name"           # 按名称过滤
```

**前端**:
```bash
cd frontend && npm run test          # 运行所有测试
cd frontend && npm run test:watch    # 监听模式
```

### CAP-TEST-004: 测试调试

分析测试失败原因并提供修复建议。

**调试流程**:
1. 读取失败测试的错误信息
2. 定位失败断言和期望值
3. 分析根因（代码 Bug / 测试数据问题 / 环境问题）
4. 提供修复方案
5. 验证修复后测试通过

### CAP-TEST-005: 测试覆盖分析

评估测试覆盖的完整性。

**覆盖维度**:
- 功能覆盖: 主要功能是否有测试
- 边界条件: 边界值和异常情况
- 权限控制: 认证和授权场景
- 并发场景: 多用户操作场景
- 数据可见性: 公开/私有数据访问

## 验证清单

- [ ] 测试文件位置正确
- [ ] 使用项目标准 fixtures/setup
- [ ] 测试命名清晰（test_功能_场景_期望）
- [ ] 断言具体且完整
- [ ] 无测试间依赖
