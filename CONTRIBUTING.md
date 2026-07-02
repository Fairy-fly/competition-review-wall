# Contributing

感谢关注 `competition-review-wall`。这是一个课程设计和简历展示 Demo，欢迎围绕代码结构、文档、UI 展示和演示数据提出改进。

## 项目边界

- 不把本项目当作正式校园评价系统使用。
- 不提交真实学生数据、真实评价数据或敏感信息。
- 不提交 `.env`、数据库密码、JWT 密钥、构建产物或 `node_modules`。
- 不引入支付、会员、订单或复杂生产级管理功能。

## 本地开发

```bash
npm run install:all
npm run db:init
npm run dev:backend
npm run dev:frontend
```

如果分开执行，也可以进入 `backend/` 和 `frontend/` 目录分别运行。

## 提交建议

建议提交前至少确认：

```bash
npm run build
```

如果改了后端接口，请同步更新：

- `docs/API.md`
- `docs/DATABASE.md`
- `docs/DEMO_GUIDE.md`
- `README.md`

## 推荐改进方向

- 补充截图到 `screenshots/`。
- 完善 API 示例请求和响应。
- 增加后端单元测试或接口测试。
- 增加更完整的错误态和空状态截图。
- 为课程设计答辩补充系统架构图或流程图。
