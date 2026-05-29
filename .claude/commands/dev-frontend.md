---
name: dev-frontend
description: 启动前端开发服务器并验证环境
category: development
---

# 启动前端开发服务器

启动 PromptHub 前端 React + Vite 开发服务器，并验证运行环境是否正常。

## 执行步骤

1. 确认 Node.js 依赖已安装：
   ```bash
   cd frontend && npm install
   ```

2. 启动 Vite 开发服务器：
   ```bash
   cd frontend && npm run dev
   ```

3. 验证服务是否正常运行：
   - 访问 `http://localhost:5173` 确认页面可加载
   - 检查控制台无编译错误

## 环境要求

- Node.js 20.x
- 依赖已通过 `npm install` 安装
- `VITE_API_BASE` 环境变量指向后端 API（默认 `http://localhost:8000/api`）

## 注意事项

- 开发服务器默认监听 `5173` 端口
- 路径别名 `@` 映射到 `src/` 目录
- 热模块替换（HMR）自动生效
- 确保后端服务同时运行以保证 API 调用正常
