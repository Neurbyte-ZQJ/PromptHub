---
name: new-model
description: 添加新的数据库模型或修改现有模型
category: development
parameters:
  - name: name
    description: 模型名称，如 Comment
    required: true
  - name: fields
    description: 字段定义描述
    required: true
  - name: relations
    description: 关联关系描述
    required: false
---

# 添加/修改数据库模型

根据指定参数创建或修改 SQLAlchemy 数据库模型，同步更新 Pydantic Schema。

## 输入参数

- **模型名称**: $ARGUMENTS
- **字段定义**: 从参数中提取
- **关联关系**: 从参数中提取（可选）

## 执行流程

### 1. 定义 SQLAlchemy 模型（`backend/models.py`）

遵循项目规范：
- 使用 SQLAlchemy 2.0 的 `Mapped/mapped_column` 风格
- 继承 `Base`（来自 `backend.database`）
- `__tablename__` 使用复数形式（如 `comments`）
- 字段类型映射：
  - 字符串: `Mapped[str] = mapped_column(String(N), nullable=False)`
  - 可选字符串: `Mapped[Optional[str]] = mapped_column(String(N), nullable=True)`
  - 文本: `Mapped[str] = mapped_column(Text, nullable=False)`
  - 整数: `Mapped[int] = mapped_column(Integer, primary_key=True, index=True)`
  - 布尔: `Mapped[bool] = mapped_column(Boolean, default=False, server_default="0")`
  - 日期: `Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())`
  - 外键: `Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("table.id", ondelete="CASCADE"))`

### 2. 定义关联关系

- 多对多: 使用 `Table()` 定义关联表，外键设置 `ondelete='CASCADE'`
- 一对多: 使用 `relationship()` + `back_populates`
- 自引用: 使用 `parent_id` + `remote_side=[id]`

### 3. 同步 Pydantic Schema（`backend/schemas.py`）

- 创建 `Create` / `Update` / `Response` 三种 Schema
- 响应 Schema 设置 `class Config: from_attributes = True`
- 更新 Schema 的字段使用 `Optional` + `None` 默认值

### 4. 数据库同步

项目无 Alembic 迁移工具，模型变更通过 `Base.metadata.create_all(bind=engine)` 自动反映到数据库。

### 5. 验证

```bash
ruff check backend/
ruff format backend/
pytest
```

## 模板

```python
class {ModelName}(Base):
    __tablename__ = "{table_name}"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    # 字段定义...

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
```
