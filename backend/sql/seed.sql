USE competition_review_wall;

INSERT INTO users (id, student_no, real_name, password, college, major, grade, skill_direction, role)
VALUES
  (1, 'admin001', '系统管理员', '$2a$10$w5dCNKRheSI4bfhvn0r8.O6MLxq3cTPZp6sz91YbmW9lT/1FIkgH6', '信息中心', '平台管理', '教师', '平台运营', 'admin'),
  (2, '2023001', '张三', '$2a$10$34pwp.uBO8aX3rFlMjPv7uSC6KYzXf/07VxCXdghdES8sDOf1tOze', '计算机学院', '软件工程', '2023级', '前端开发', 'student'),
  (3, '2023002', '李四', '$2a$10$34pwp.uBO8aX3rFlMjPv7uSC6KYzXf/07VxCXdghdES8sDOf1tOze', '计算机学院', '人工智能', '2023级', '算法建模', 'student'),
  (4, '2022001', '王五', '$2a$10$34pwp.uBO8aX3rFlMjPv7uSC6KYzXf/07VxCXdghdES8sDOf1tOze', '管理学院', '电子商务', '2022级', '文档答辩', 'student'),
  (5, '2021008', '赵六', '$2a$10$34pwp.uBO8aX3rFlMjPv7uSC6KYzXf/07VxCXdghdES8sDOf1tOze', '信息学院', '数据科学', '2021级', '全栈协作', 'student'),
  (6, '2024003', '陈七', '$2a$10$34pwp.uBO8aX3rFlMjPv7uSC6KYzXf/07VxCXdghdES8sDOf1tOze', '创新创业学院', '数字媒体', '2024级', '产品策划', 'student')
ON DUPLICATE KEY UPDATE
  real_name = VALUES(real_name),
  password = VALUES(password),
  college = VALUES(college),
  major = VALUES(major),
  grade = VALUES(grade),
  skill_direction = VALUES(skill_direction),
  role = VALUES(role);

INSERT INTO tags (id, name, type, display_name, enabled)
VALUES
  (1, 'reliable', 'positive', '靠谱', 1),
  (2, 'smooth_communication', 'positive', '沟通顺畅', 1),
  (3, 'strong_execution', 'positive', '执行力强', 1),
  (4, 'strong_documentation', 'positive', '文档能力强', 1),
  (5, 'needs_clear_assignment', 'neutral', '需要明确分工', 1),
  (6, 'steady_support', 'neutral', '适合辅助型角色', 1),
  (7, 'late_communication', 'risk', '沟通不及时', 1),
  (8, 'low_participation', 'risk', '参与度较低', 1)
ON DUPLICATE KEY UPDATE
  type = VALUES(type),
  display_name = VALUES(display_name),
  enabled = VALUES(enabled);

INSERT INTO competition_projects (id, name, type, team_name, start_date, end_date, creator_id, status, description)
VALUES
  (1, '互联网+ 校赛项目', '创新创业', '火力全开队', '2026-03-01', '2026-04-18', 2, 'reviewable', '围绕校园服务场景做一套可演示产品。'),
  (2, '数学建模校赛', '数学建模', '模型推进队', '2026-01-08', '2026-02-20', 3, 'archived', '完成建模报告、代码和答辩材料。'),
  (3, '挑战杯创新项目', '科创竞赛', '逐光小组', '2026-04-05', '2026-06-20', 5, 'ongoing', '正在推进调研与原型阶段。')
ON DUPLICATE KEY UPDATE
  type = VALUES(type),
  team_name = VALUES(team_name),
  start_date = VALUES(start_date),
  end_date = VALUES(end_date),
  creator_id = VALUES(creator_id),
  status = VALUES(status),
  description = VALUES(description);

INSERT INTO team_members (id, project_id, user_id, role_in_team)
VALUES
  (1, 1, 2, '队长 / 前端'),
  (2, 1, 3, '算法'),
  (3, 1, 4, '文档答辩'),
  (4, 2, 3, '队长 / 建模'),
  (5, 2, 4, '答辩'),
  (6, 2, 5, '数据处理'),
  (7, 3, 5, '队长 / 全栈'),
  (8, 3, 2, '前端'),
  (9, 3, 6, '产品策划')
ON DUPLICATE KEY UPDATE
  role_in_team = VALUES(role_in_team);

INSERT INTO reviews (
  id, project_id, reviewer_id, reviewee_id, overall_score, task_score, communication_score,
  responsibility_score, skill_score, willing_again, comment, status
)
VALUES
  (1, 1, 2, 3, 4, 4, 5, 4, 4, 1, '建模和分析都很稳，协作推进比较顺。', 'normal'),
  (2, 1, 3, 2, 5, 5, 4, 5, 5, 1, '前端推进很快，临近答辩时扛住了交付压力。', 'normal'),
  (3, 1, 4, 2, 3, 3, 2, 3, 4, 0, '个人能力不错，但有时同步不够及时。', 'hidden'),
  (4, 2, 3, 4, 5, 5, 5, 5, 4, 1, '文档组织非常清楚，答辩表达也很稳。', 'normal'),
  (5, 2, 4, 5, 3, 3, 3, 3, 3, 1, '完成分内任务没问题，但更适合明确分工的节奏。', 'normal'),
  (6, 2, 5, 3, 4, 4, 4, 4, 4, 1, '整体配合稳定，项目推进过程里比较靠谱。', 'normal')
ON DUPLICATE KEY UPDATE
  overall_score = VALUES(overall_score),
  task_score = VALUES(task_score),
  communication_score = VALUES(communication_score),
  responsibility_score = VALUES(responsibility_score),
  skill_score = VALUES(skill_score),
  willing_again = VALUES(willing_again),
  comment = VALUES(comment),
  status = VALUES(status);

INSERT INTO review_tags (id, review_id, tag_id)
VALUES
  (1, 1, 1),
  (2, 1, 2),
  (3, 2, 1),
  (4, 2, 3),
  (5, 3, 7),
  (6, 3, 5),
  (7, 4, 4),
  (8, 4, 2),
  (9, 5, 5),
  (10, 5, 6),
  (11, 6, 1),
  (12, 6, 2)
ON DUPLICATE KEY UPDATE
  tag_id = VALUES(tag_id);

INSERT INTO operation_logs (id, user_id, action, detail)
VALUES
  (1, 1, 'seed.init', '初始化课程设计 Demo 数据'),
  (2, 2, 'project.create', '创建了互联网+ 校赛项目'),
  (3, 3, 'project.create', '创建了数学建模校赛'),
  (4, 5, 'project.create', '创建了挑战杯创新项目')
ON DUPLICATE KEY UPDATE
  action = VALUES(action),
  detail = VALUES(detail);

