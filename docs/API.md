# API 接口说明

本文档说明 `competition-review-wall` Demo 的主要 REST API。默认后端地址为：

```text
http://localhost:3000/api
```

前端开发环境通过 Vite 将 `/api` 代理到后端。

## 通用约定

成功响应：

```json
{
  "code": 0,
  "message": "成功",
  "data": {}
}
```

需要登录的接口使用 JWT：

```http
Authorization: Bearer <token>
```

管理员接口需要登录用户的 `role` 为 `admin`。

## 认证 Auth

| 方法 | 路径 | 权限 | 说明 |
| --- | --- | --- | --- |
| POST | `/auth/register` | 公开 | 注册学生账号 |
| POST | `/auth/login` | 公开 | 登录并返回 token 和用户信息 |

登录请求示例：

```json
{
  "studentNo": "2023001",
  "password": "Stu@123456"
}
```

## 用户 Users

| 方法 | 路径 | 权限 | 说明 |
| --- | --- | --- | --- |
| GET | `/users/me` | 登录 | 获取当前用户 |
| PUT | `/users/me` | 登录 | 更新当前用户资料 |
| GET | `/users/wall` | 登录 | 获取公开画像墙用户列表 |
| GET | `/users/lookup` | 登录 | 按学号查找队友，用于添加项目成员 |
| GET | `/users/favorites` | 登录 | 获取收藏的队友 |
| POST | `/users/favorites` | 登录 | 收藏队友 |
| DELETE | `/users/favorites/:targetUserId` | 登录 | 取消收藏队友 |

画像墙常用查询参数：

| 参数 | 说明 |
| --- | --- |
| `keyword` | 姓名 / 学号 / 专业关键词 |
| `major` | 专业 |
| `grade` | 年级 |
| `tag` | 标签 |
| `projectType` | 竞赛类型 |
| `minScore` | 最低综合评分 |
| `minWillingAgainRate` | 最低再次组队率 |
| `onlyReviewed` | 是否只看已有评价的用户 |
| `sortBy` | 排序方式，如 `score_desc` |

## 项目 Projects

| 方法 | 路径 | 权限 | 说明 |
| --- | --- | --- | --- |
| POST | `/projects` | 登录 | 创建竞赛项目 |
| GET | `/projects/my` | 登录 | 获取我参与的项目 |
| GET | `/projects/:id` | 登录 | 获取项目详情 |
| GET | `/projects/:id/review-progress` | 登录 | 获取项目评价进度 |
| POST | `/projects/:id/members` | 登录 | 添加项目成员 |
| PUT | `/projects/:id/status` | 登录 | 修改项目状态 |

项目状态：

| 状态 | 含义 |
| --- | --- |
| `ongoing` | 进行中，尚未开放评价 |
| `reviewable` | 可评价，成员可以互评 |
| `archived` | 已归档，保留历史评价与画像 |

创建项目请求示例：

```json
{
  "name": "互联网+ 校赛项目",
  "type": "创新创业",
  "teamName": "火力全开队",
  "startDate": "2026-03-01",
  "endDate": "2026-04-18",
  "description": "课程设计演示项目"
}
```

## 评价 Reviews

| 方法 | 路径 | 权限 | 说明 |
| --- | --- | --- | --- |
| POST | `/reviews` | 登录 | 提交队友评价 |
| GET | `/reviews/received/:userId` | 登录 | 获取某用户收到的评价 |

提交评价请求示例：

```json
{
  "projectId": 1,
  "revieweeId": 3,
  "overallScore": 4,
  "taskScore": 4,
  "communicationScore": 5,
  "responsibilityScore": 4,
  "skillScore": 4,
  "willingAgain": true,
  "comment": "建模和分析都很稳，协作推进比较顺。",
  "tagIds": [1, 2]
}
```

匿名机制说明：

- 前台评价列表不公开 `reviewer_id`，统一展示为“匿名队友”。
- 后台数据库仍保存 `reviewer_id` 与 `reviewee_id`，用于管理员审核和申诉追溯。
- 同一项目中，同一评价人对同一被评价人只能提交一次评价。

## 标签 Tags

| 方法 | 路径 | 权限 | 说明 |
| --- | --- | --- | --- |
| GET | `/tags` | 登录 | 获取可用评价标签 |

标签类型：

| 类型 | 含义 |
| --- | --- |
| `positive` | 正向标签 |
| `neutral` | 中性标签 |
| `risk` | 风险标签 |

## 画像 Profile

| 方法 | 路径 | 权限 | 说明 |
| --- | --- | --- | --- |
| GET | `/profile/:userId` | 登录 | 获取用户协作画像 |

画像聚合内容包括：

- 用户基础信息
- 综合评分和分项评分
- 评价次数、项目次数、再次组队率
- 高频标签和近期标签
- 最近项目
- 匿名评价列表

## 首页 Dashboard

| 方法 | 路径 | 权限 | 说明 |
| --- | --- | --- | --- |
| GET | `/dashboard/summary` | 登录 | 首页概览、热门标签、高分队友 |
| GET | `/dashboard/activity` | 登录 | 最近评价、项目和活跃画像 |
| GET | `/dashboard/todos` | 登录 | 当前用户待评价队友 |
| GET | `/dashboard/admin-stats` | 管理员 | 管理后台统计 |

## 申诉 Appeals

| 方法 | 路径 | 权限 | 说明 |
| --- | --- | --- | --- |
| POST | `/appeals` | 登录 | 提交评价申诉 |
| GET | `/appeals` | 管理员 | 获取申诉列表 |
| PUT | `/appeals/:id/process` | 管理员 | 处理申诉 |

申诉状态：

| 状态 | 含义 |
| --- | --- |
| `pending` | 待处理 |
| `resolved` | 已处理 |
| `rejected` | 已驳回 |

## 管理员 Admin

| 方法 | 路径 | 权限 | 说明 |
| --- | --- | --- | --- |
| GET | `/admin/users` | 管理员 | 用户列表 |
| GET | `/admin/projects` | 管理员 | 项目列表 |
| GET | `/admin/reviews` | 管理员 | 评价列表 |
| PUT | `/admin/reviews/:id/hide` | 管理员 | 隐藏评价或更新隐藏原因 |
| PUT | `/admin/users/:id/reset-password` | 管理员 | 重置用户密码 |

隐藏评价请求示例：

```json
{
  "hiddenReason": "该评价表述偏主观，暂不在前台公开"
}
```

## 健康检查

| 方法 | 路径 | 权限 | 说明 |
| --- | --- | --- | --- |
| GET | `/health` | 公开 | 后端服务健康检查 |
