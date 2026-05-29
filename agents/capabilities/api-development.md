# API 开发能力模块

## 概述

提供后端 FastAPI 接口的开发能力，包括路由定义、Schema 设计、认证集成和数据可见性控制。

## 能力标识

- **ID**: `capability.api-development`
- **版本**: 1.0.0
- **作用域**: backend
- **触发关键词**: 新增接口, 新增API, 添加路由, 修改接口, 创建端点, 后端接口

## 能力清单

### CAP-API-001: 路由定义

在 `backend/main.py` 中定义新的 API 路由。

**规范要求**:
- HTTP 方法与 RESTful 语义一致
- 路径参数使用 `{param}` 格式
- 需认证端点使用 `Depends(get_current_user)`
- 响应模型通过 `response_model` 参数指定

**示例**:
```python
@app.post("/api/prompts", response_model=PromptListItem)
def create_prompt(
    prompt: PromptCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ...
```

### CAP-API-002: Schema 设计

在 `backend/schemas.py` 中定义 Pydantic 请求/响应模型。

**规范要求**:
- 使用 Pydantic v2 语法
- Create Schema: 必填字段无默认值
- Update Schema: 所有字段 `Optional` + `None` 默认值
- Response Schema: 设置 `class Config: from_attributes = True`
- 使用 `model_dump()` 替代 `.dict()`
- 使用 `model_dump(exclude_unset=True)` 处理部分更新

### CAP-API-003: 认证集成

为端点添加认证和权限控制。

**规范要求**:
- JWT 认证: `Depends(get_current_user)`
- 数据可见性: 用户自己的 + `is_public=True`
- 修改/删除: 仅所有者可操作
- 错误响应: 401/403 + 中文消息

### CAP-API-004: 分页实现

为列表端点实现标准分页。

**规范要求**:
- 支持 `page` + `page_size` 和 `skip` + `limit` 两种方式
- 分页元信息通过响应头返回: `X-Total-Count/X-Page/X-Page-Size/X-Total-Pages`
- `page` 从 1 开始，`page_size` 默认 20，最大 100
- `limit` 最大 100

### CAP-API-005: 错误处理

统一错误处理规范。

**规范要求**:
- 使用 `HTTPException`
- `detail` 使用中文
- 状态码: 200/201/400/401/403/404
- 错误格式: `{"detail": "错误信息"}`

## 验证清单

- [ ] Ruff 检查通过: `ruff check backend/`
- [ ] Ruff 格式化: `ruff format backend/`
- [ ] 测试通过: `pytest`
- [ ] Swagger UI 可访问: `http://localhost:8000/docs`
