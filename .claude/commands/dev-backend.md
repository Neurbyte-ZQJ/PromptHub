---
name: dev-backend
description: 启动后端开发服务器并验证环境
category: development
---

# 启动后端开发服务器

启动 PromptHub 后端 FastAPI 开发服务器，并验证运行环境是否正常。

## 执行步骤

1. 确认 Python 环境和依赖已安装：
   ```bash
   pip install -r requirements.txt
   ```

2. 启动 Uvicorn 开发服务器（支持热重载）：
   ```bash
   uvicorn backend.main:app --reload
   ```

3. 验证服务是否正常运行：
   - 访问 `http://localhost:8000/docs` 确认 Swagger UI 可用
   - 检查控制台无报错信息

## 环境要求

- Python 3.12+
- 依赖已通过 `requirements.txt` 安装
- `SECRET_KEY` 环境变量已设置（或使用默认值）
- SQLite 数据库文件 `prompts.db` 将自动创建

## 注意事项

- 开发服务器默认监听 `8000` 端口
- CORS 配置允许所有来源（仅开发环境）
- 数据库变更通过 `Base.metadata.create_all()` 自动同步
