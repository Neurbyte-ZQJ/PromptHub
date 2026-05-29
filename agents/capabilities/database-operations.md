# 数据库操作能力模块

## 概述

提供数据库模型设计、查询优化和数据迁移的能力。

## 能力标识

- **ID**: `capability.database-operations`
- **版本**: 1.0.0
- **作用域**: backend
- **触发关键词**: 新增表, 修改模型, 添加字段, 数据库迁移, 新增关联, 添加索引

## 能力清单

### CAP-DB-001: 模型定义

定义 SQLAlchemy 2.0 数据模型。

**规范要求**:
- 使用 `Mapped` / `mapped_column` 风格
- 继承 `Base`（来自 `backend.database`）
- `__tablename__` 使用复数形式
- 主键: `id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)`
- 时间戳: `created_at` + `updated_at`（使用 `server_default=func.now()`）

**字段类型映射**:
| Python 类型 | SQLAlchemy 类型 | 数据库类型 |
|-------------|-----------------|-----------|
| `Mapped[str]` | `String(N)` | VARCHAR(N) |
| `Mapped[Optional[str]]` | `String(N), nullable=True` | VARCHAR(N) NULL |
| `Mapped[str]` | `Text` | TEXT |
| `Mapped[int]` | `Integer` | INTEGER |
| `Mapped[bool]` | `Boolean` | BOOLEAN |
| `Mapped[datetime]` | `DateTime(timezone=True)` | DATETIME |

### CAP-DB-002: 关联关系

定义模型间的关联关系。

**多对多**:
```python
association_table = Table(
    "association_name",
    Base.metadata,
    Column("left_id", Integer, ForeignKey("left_table.id", ondelete="CASCADE"), primary_key=True),
    Column("right_id", Integer, ForeignKey("right_table.id", ondelete="CASCADE"), primary_key=True),
)
```

**一对多**:
```python
items: Mapped[List["Item"]] = relationship(back_populates="parent", cascade="all, delete-orphan")
parent: Mapped["Parent"] = relationship(back_populates="items")
```

**自引用（树形）**:
```python
parent_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("table.id", ondelete="CASCADE"))
children: Mapped[List["Category"]] = relationship(back_populates="parent", remote_side=[id])
```

### CAP-DB-003: 动态计算字段

通过函数附加非持久化的计算字段。

**规范要求**:
- `favorite_count` / `is_favorited` 通过 `attach_favorite_info()` 附加
- `owner_username` 通过 `hybrid_property` 从关联 User 获取
- 不在数据库中存储计算字段

### CAP-DB-004: Schema 同步

模型变更时同步更新 Pydantic Schema。

**规范要求**:
- 在 `backend/schemas.py` 中添加对应的 Create/Update/Response Schema
- Response Schema 设置 `from_attributes = True`
- Update Schema 所有字段 Optional + None 默认值

### CAP-DB-005: 数据库同步

项目无 Alembic，模型变更自动反映到数据库。

**注意事项**:
- `Base.metadata.create_all(bind=engine)` 在 `main.py` 启动时执行
- 仅创建不存在的表，不修改已有表结构
- 如需修改已有表结构，需手动操作或重建数据库
- 生产环境变更前务必备份

## 验证清单

- [ ] 模型定义符合 SQLAlchemy 2.0 风格
- [ ] 关联表外键设置 `ondelete='CASCADE'`
- [ ] Pydantic Schema 同步更新
- [ ] Ruff 检查通过
- [ ] 测试通过
