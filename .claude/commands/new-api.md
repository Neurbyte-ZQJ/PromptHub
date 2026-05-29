---
name: new-api
description: 创建新的后端 API 端点（含路由、Schema、模型）
category: development
parameters:
  - name: endpoint
    description: API 端点路径，如 /api/prompts/{id}/share
    required: true
  - name: method
    description: HTTP 方法（GET/POST/PUT/DELETE）
    required: true
  - name: description
    description: 端点功能描述
    required: true
---

# 创建新 API 端点

根据指定参数创建完整的后端 API 端点，包括路由定义、Pydantic Schema 和必要的模型变更。

## 输入参数

- **端点路径**: $ARGUMENTS
- **HTTP 方法**: 从参数中提取
- **功能描述**: 从参数中提取

## 执行流程

### 1. 分析需求

- 确定端点是否需要认证（是否使用 `Depends(get_current_user)`）
- 确定请求/响应数据结构
- 确定是否需要新增数据库模型或修改现有模型

### 2. 定义 Pydantic Schema（`backend/schemas.py`）

遵循项目规范：
- 使用 Pydantic v2 语法
- 请求模型继承 `BaseModel`
- 响应模型设置 `class Config: from_attributes = True`
- 使用 `model_dump()` 替代 `.dict()`
- 使用 `model_dump(exclude_unset=True)` 处理部分更新

### 3. 实现路由逻辑（`backend/main.py`）

遵循项目规范：
- 路由定义在 `backend/main.py` 中（不使用 `routers/` 目录）
- 需要认证的端点使用 `Depends(get_current_user)`
- 错误处理使用 `HTTPException`，`detail` 使用中文
- 分页端点通过响应头返回 `X-Total-Count/X-Page/X-Page-Size/X-Total-Pages`
- 数据可见性遵循：用户自己的 + `is_public=True` 的数据

### 4. 数据模型变更（如需要，`backend/models.py`）

遵循项目规范：
- 使用 SQLAlchemy 2.0 的 `Mapped/mapped_column` 风格
- 多对多关系使用 `Table()` 定义关联表，外键设置 `ondelete='CASCADE'`
- 动态计算字段通过函数附加，不持久化

### 5. 验证

```bash
ruff check backend/
ruff format backend/
pytest
```

## 模板

### 路由模板

```python
@router.{method}("{endpoint}")
def {function_name}(
    {parameters},
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),  # 如需认证
):
    # 业务逻辑
    return result
```

### Schema 模板

```python
class {Name}Create(BaseModel):
    field: type

class {Name}Response(BaseModel):
    id: int
    field: type

    class Config:
        from_attributes = True
```
