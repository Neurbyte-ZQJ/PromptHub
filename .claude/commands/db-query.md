---
name: db-query
description: 执行数据库查询和数据分析
category: database
parameters:
  - name: query
    description: 查询描述或 SQL 语句
    required: true
---

# 数据库查询

对 PromptHub SQLite 数据库执行查询操作，用于数据分析和问题排查。

## 输入参数

- **查询描述**: $ARGUMENTS

## 执行方式

### 方式一：通过 SQLAlchemy ORM 查询

在 Python 交互环境中使用项目模型进行查询：

```python
from backend.database import SessionLocal
from backend.models import Prompt, User, Tag, Category, Favorite

db = SessionLocal()
# 执行查询...
db.close()
```

### 方式二：直接 SQLite 查询

```bash
sqlite3 prompts.db "SQL语句"
```

## 常用查询示例

### 统计概览

```sql
SELECT '用户数' AS metric, COUNT(*) AS count FROM users
UNION ALL
SELECT '提示词数', COUNT(*) FROM prompts
UNION ALL
SELECT '标签数', COUNT(*) FROM tags
UNION ALL
SELECT '分类数', COUNT(*) FROM categories;
```

### 用户提示词统计

```sql
SELECT u.username, COUNT(p.id) AS prompt_count
FROM users u
LEFT JOIN prompts p ON p.user_id = u.id
GROUP BY u.id
ORDER BY prompt_count DESC;
```

### 热门标签

```sql
SELECT t.name, COUNT(pta.prompt_id) AS usage_count
FROM tags t
JOIN prompt_tag_association pta ON pta.tag_id = t.id
GROUP BY t.id
ORDER BY usage_count DESC
LIMIT 20;
```

## 注意事项

- 数据库文件：`prompts.db`（项目根目录）
- 查询操作仅限 SELECT，禁止执行写操作
- 生产环境操作前务必备份数据库
- 查询结果可能包含敏感信息，注意数据安全
