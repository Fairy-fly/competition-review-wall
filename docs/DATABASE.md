# 数据库设计说明

数据库名称：

```text
competition_review_wall
```

SQL 文件：

- `backend/sql/schema.sql`：建库建表。
- `backend/sql/seed.sql`：写入课程设计演示数据。

初始化方式：

```bash
cd backend
npm run db:init
```

也可以在 MySQL 命令行中执行：

```sql
SOURCE backend/sql/schema.sql;
SOURCE backend/sql/seed.sql;
```

## 设计目标

本项目围绕“竞赛项目中的队友匿名评价”建模，核心目标是：

- 记录用户、项目、项目成员关系。
- 在项目成员之间建立匿名评价数据。
- 用评分和标签聚合协作画像。
- 支持管理员审核、隐藏评价和申诉处理。

## 核心表

### users

用户表，包含学生和管理员。

| 字段 | 说明 |
| --- | --- |
| `id` | 用户主键 |
| `student_no` | 学号 / 登录账号，唯一 |
| `real_name` | 真实姓名 |
| `password` | bcrypt 加密后的密码 |
| `college` | 学院 |
| `major` | 专业 |
| `grade` | 年级 |
| `skill_direction` | 技能方向 |
| `role` | `student` 或 `admin` |
| `created_at` / `updated_at` | 创建和更新时间 |

### competition_projects

竞赛项目表。

| 字段 | 说明 |
| --- | --- |
| `id` | 项目主键 |
| `name` | 项目名称 |
| `type` | 竞赛类型 |
| `team_name` | 队伍名称 |
| `start_date` / `end_date` | 项目时间 |
| `creator_id` | 创建者用户 ID |
| `status` | `ongoing` / `reviewable` / `archived` |
| `description` | 项目说明 |

### team_members

项目成员表，用于表示用户加入了哪个项目。

| 字段 | 说明 |
| --- | --- |
| `id` | 主键 |
| `project_id` | 项目 ID |
| `user_id` | 用户 ID |
| `role_in_team` | 队内角色 |

约束：

- `UNIQUE KEY uk_project_user (project_id, user_id)`：同一用户不能重复加入同一项目。

### reviews

匿名评价核心表。

| 字段 | 说明 |
| --- | --- |
| `id` | 评价主键 |
| `project_id` | 所属项目 |
| `reviewer_id` | 评价人 |
| `reviewee_id` | 被评价人 |
| `overall_score` | 综合评分 |
| `task_score` | 任务完成评分 |
| `communication_score` | 沟通评分 |
| `responsibility_score` | 责任心评分 |
| `skill_score` | 技能评分 |
| `willing_again` | 是否愿意再次组队 |
| `comment` | 文字评价 |
| `status` | `normal` / `hidden` |
| `hidden_reason` | 隐藏原因 |

约束：

- `UNIQUE KEY uk_review_once (project_id, reviewer_id, reviewee_id)`：同一项目中，一个评价人对同一被评价人只能评价一次。

匿名设计：

- 前台隐藏 `reviewer_id`，只显示“匿名队友”。
- 后台保留真实关联，管理员可追溯。

### tags

评价标签字典表。

| 字段 | 说明 |
| --- | --- |
| `id` | 标签主键 |
| `name` | 标签内部名 |
| `type` | `positive` / `neutral` / `risk` |
| `display_name` | 前台展示名 |
| `enabled` | 是否启用 |

### review_tags

评价与标签的多对多关系表。

| 字段 | 说明 |
| --- | --- |
| `review_id` | 评价 ID |
| `tag_id` | 标签 ID |

### appeals

评价申诉表。

| 字段 | 说明 |
| --- | --- |
| `id` | 申诉主键 |
| `review_id` | 被申诉评价 |
| `appellant_user_id` | 申诉人 |
| `reason` | 申诉原因 |
| `status` | `pending` / `resolved` / `rejected` |
| `admin_reply` | 管理员回复 |

### user_favorites

用户收藏队友表。

| 字段 | 说明 |
| --- | --- |
| `user_id` | 收藏人 |
| `target_user_id` | 被收藏队友 |

### operation_logs

操作日志表，用于记录演示数据和部分后台操作。

| 字段 | 说明 |
| --- | --- |
| `user_id` | 操作用户 |
| `action` | 操作类型 |
| `detail` | 操作详情 |

## 表关系概览

```text
users 1 ── N competition_projects     创建项目
users N ── N competition_projects     通过 team_members 加入项目
competition_projects 1 ── N reviews   项目内互评
users 1 ── N reviews                  reviewer_id / reviewee_id
reviews N ── N tags                   通过 review_tags 关联
reviews 1 ── N appeals                针对评价发起申诉
users N ── N users                    通过 user_favorites 收藏队友
```

## 画像聚合逻辑

协作画像不是单独存储在一张表里，而是基于 `reviews`、`review_tags`、`tags`、`team_members` 和 `competition_projects` 动态聚合：

- 综合评分：正常状态评价的平均分。
- 分项评分：任务、沟通、责任、技能维度平均分。
- 再次组队率：`willing_again = 1` 的比例。
- 高频标签：评价标签出现次数。
- 参与项目：用户所在项目记录。
- 匿名评价列表：只展示状态为 `normal` 的评价。

## 演示数据说明

`seed.sql` 包含：

- 1 个管理员账号。
- 5 个学生账号。
- 3 个竞赛项目。
- 项目成员关系。
- 多条匿名评价和评价标签。
- 1 条申诉记录。
- 若干收藏和操作日志。

注意：`seed.sql` 会执行 `TRUNCATE TABLE`，会清空相关表后重新写入演示数据。
