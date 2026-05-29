# 竞赛队友测评墙 Demo

一个用于课程设计演示的前后端分离 Web Demo，围绕高校竞赛组队后的匿名评价、协作画像和管理员审核闭环来实现。

## 技术栈

- 前端：Vue 3 + Vite + Element Plus + Pinia + Vue Router + Axios + ECharts
- 后端：Node.js + Express + MySQL + mysql2 + bcryptjs + jsonwebtoken + cors

## 目录结构

```text
frontend/   Vue 3 前端
backend/    Express 后端
README.md   运行说明
```

## 本地运行

### 1. 初始化数据库

先确认你本机的 MySQL 可用。你可以二选一：

方式 A：直接在项目里执行脚本

```powershell
cd D:\竞赛队友测评墙\backend
npm.cmd run db:init
```

方式 B：在 MySQL 终端里手动执行 SQL

```sql
SOURCE D:/竞赛队友测评墙/backend/sql/schema.sql;
SOURCE D:/竞赛队友测评墙/backend/sql/seed.sql;
```
脚本方式会读取 `backend/.env` 里的数据库连接配置。

### 2. 配置后端环境变量

项目里已经预放了一个 [backend/.env](/D:/竞赛队友测评墙/backend/.env) 模板。
如果你本机 MySQL 不是 `root` 或者设置了密码，请把里面的 `DB_USER`、`DB_PASSWORD` 改成你自己的实际值。

示例：

```env
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=你的MySQL密码
DB_NAME=competition_review_wall
JWT_SECRET=competition-review-wall-demo-secret
JWT_EXPIRES_IN=7d
```

### 3. 启动后端

```powershell
cd D:\竞赛队友测评墙\backend
npm.cmd install
npm.cmd run dev
```

### 4. 启动前端

```powershell
cd D:\竞赛队友测评墙\frontend
npm.cmd install
npm.cmd run dev
```

默认访问地址：

- 前端：[http://localhost:5173](http://localhost:5173)
- 后端健康检查：[http://localhost:3000/api/health](http://localhost:3000/api/health)

## 默认演示账号

- 管理员
  - 学号：`admin001`
  - 密码：`Admin@123456`
- 学生账号
  - 学号：`2023001`
  - 学号：`2023002`
  - 学号：`2022001`
  - 学号：`2021008`
  - 学号：`2024003`
  - 统一密码：`Stu@123456`

## 演示顺序建议

1. 学生登录后进入测评墙首页，查看公开画像和热门标签。
2. 进入“竞赛项目”，查看已有项目，或新建项目。
3. 在项目详情中添加队友，并把状态切到 `reviewable`。
4. 进入“提交评价”，对同项目队友完成匿名评价。
5. 打开用户画像详情页，查看综合分、雷达图和历史评价。
6. 管理员登录后台，查看评价列表并隐藏一条不适合展示的评价。

## 已实现接口

- 认证：`POST /api/auth/register`、`POST /api/auth/login`
- 用户：`GET /api/users/me`、`PUT /api/users/me`、`GET /api/users/wall`
- 项目：`POST /api/projects`、`GET /api/projects/my`、`GET /api/projects/:id`、`POST /api/projects/:id/members`、`PUT /api/projects/:id/status`
- 评价：`POST /api/reviews`、`GET /api/reviews/received/:userId`
- 标签：`GET /api/tags`
- 画像：`GET /api/profile/:userId`
- 后台：`GET /api/admin/users`、`GET /api/admin/projects`、`GET /api/admin/reviews`、`PUT /api/admin/reviews/:id/hide`

## 说明

- 当前版本不包含真实学校认证、文件上传、申诉流程、推荐算法和自动风控。
- 评价前台匿名展示，但后台保留评价人与被评价人的真实关联，便于管理员追溯。
- 如果后续你要继续开发，我建议先从“申诉模块”和“测评墙筛选条件扩展”往下接，会比较顺手。
