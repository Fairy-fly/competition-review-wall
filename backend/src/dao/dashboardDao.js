const { query } = require("../utils/db");

async function getOverviewStats() {
  const rows = await query(
    `SELECT
       (SELECT COUNT(*) FROM users WHERE role = 'student') AS total_users,
       (SELECT COUNT(*) FROM competition_projects) AS total_projects,
       (SELECT COUNT(*) FROM reviews WHERE status = 'normal') AS total_reviews,
       (SELECT COUNT(*) FROM reviews WHERE status = 'hidden') AS hidden_reviews,
       (SELECT COALESCE(ROUND(AVG(overall_score), 2), 0) FROM reviews WHERE status = 'normal') AS average_score,
       (SELECT COUNT(*) FROM users u WHERE u.role = 'student' AND NOT EXISTS (
          SELECT 1 FROM reviews r WHERE r.reviewee_id = u.id AND r.status = 'normal'
        )) AS users_without_reviews`
  );

  return rows[0] || null;
}

async function getHotTags(limit = 5) {
  const safeLimit = Math.max(1, Math.min(10, Number(limit) || 5));
  return query(
    `SELECT
       t.id,
       t.name,
       COALESCE(t.display_name, t.name) AS display_name,
       t.type,
       COUNT(*) AS count
     FROM review_tags rt
     INNER JOIN reviews r ON r.id = rt.review_id
     INNER JOIN tags t ON t.id = rt.tag_id
     WHERE r.status = 'normal' AND t.enabled = 1
     GROUP BY t.id
     ORDER BY count DESC, t.id ASC
     LIMIT ${safeLimit}`
  );
}

async function getTopUsers(limit = 5) {
  const safeLimit = Math.max(1, Math.min(10, Number(limit) || 5));
  return query(
    `SELECT
       u.*,
       COALESCE(ROUND(AVG(CASE WHEN r.status = 'normal' THEN r.overall_score END), 2), 0) AS average_score,
       COUNT(DISTINCT CASE WHEN r.status = 'normal' THEN r.id END) AS review_count,
       COALESCE(ROUND(AVG(CASE WHEN r.status = 'normal' THEN IF(r.willing_again = 1, 100, 0) END), 2), 0) AS willing_again_rate
     FROM users u
     LEFT JOIN reviews r ON r.reviewee_id = u.id
     WHERE u.role = 'student'
     GROUP BY u.id
     HAVING review_count > 0
     ORDER BY average_score DESC, review_count DESC, u.id ASC
     LIMIT ${safeLimit}`
  );
}

async function getRecentActivity(limit = 5) {
  const safeLimit = Math.max(1, Math.min(10, Number(limit) || 5));

  const [recentReviews, recentProjects, recentProfiles] = await Promise.all([
    query(
      `SELECT r.id, r.overall_score, r.created_at, cp.name AS project_name,
              reviewee.real_name AS reviewee_name, reviewee.id AS reviewee_id
       FROM reviews r
       INNER JOIN competition_projects cp ON cp.id = r.project_id
       INNER JOIN users reviewee ON reviewee.id = r.reviewee_id
       WHERE r.status = 'normal'
       ORDER BY r.created_at DESC
       LIMIT ${safeLimit}`
    ),
    query(
      `SELECT cp.id, cp.name, cp.type, cp.updated_at, u.real_name AS creator_name
       FROM competition_projects cp
       INNER JOIN users u ON u.id = cp.creator_id
       WHERE cp.status = 'reviewable'
       ORDER BY cp.updated_at DESC
       LIMIT ${safeLimit}`
    ),
    query(
      `SELECT u.id, u.real_name, u.major, u.skill_direction,
              MAX(r.created_at) AS latest_review_at,
              COUNT(DISTINCT r.id) AS recent_review_count
       FROM users u
       INNER JOIN reviews r ON r.reviewee_id = u.id AND r.status = 'normal'
       WHERE u.role = 'student'
       GROUP BY u.id
       ORDER BY latest_review_at DESC
       LIMIT ${safeLimit}`
    )
  ]);

  return { recentReviews, recentProjects, recentProfiles };
}

async function getUserTodos(userId) {
  return query(
    `SELECT
       cp.id AS project_id,
       cp.name AS project_name,
       cp.status,
       tm2.user_id AS teammate_id,
       u.real_name AS teammate_name,
       u.major AS teammate_major,
       tm2.role_in_team,
       CASE WHEN r.id IS NULL THEN 0 ELSE 1 END AS reviewed
     FROM team_members tm
     INNER JOIN competition_projects cp ON cp.id = tm.project_id
     INNER JOIN team_members tm2 ON tm2.project_id = cp.id AND tm2.user_id != ?
     INNER JOIN users u ON u.id = tm2.user_id
     LEFT JOIN reviews r ON r.project_id = cp.id
       AND r.reviewer_id = ?
       AND r.reviewee_id = tm2.user_id
     WHERE tm.user_id = ?
       AND cp.status IN ('reviewable', 'archived')
     ORDER BY cp.updated_at DESC, tm2.id ASC`,
    [userId, userId, userId]
  );
}

async function getAdminStats() {
  const [byMajor, reviewTrend, pendingAppeals] = await Promise.all([
    query(
      `SELECT
         COALESCE(NULLIF(u.major, ''), '未填写') AS major,
         COUNT(DISTINCT u.id) AS user_count,
         COALESCE(ROUND(AVG(CASE WHEN r.status = 'normal' THEN r.overall_score END), 2), 0) AS avg_score
       FROM users u
       LEFT JOIN reviews r ON r.reviewee_id = u.id AND r.status = 'normal'
       WHERE u.role = 'student'
       GROUP BY u.major
       ORDER BY avg_score DESC, user_count DESC`
    ),
    query(
      `SELECT
         DATE(r.created_at) AS review_date,
         COUNT(*) AS review_count
       FROM reviews r
       WHERE r.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       GROUP BY DATE(r.created_at)
       ORDER BY review_date ASC`
    ),
    query("SELECT COUNT(*) AS total FROM appeals WHERE status = 'pending'")
  ]);

  return {
    byMajor: byMajor.map((row) => ({
      major: row.major,
      userCount: Number(row.user_count),
      avgScore: Number(row.avg_score)
    })),
    reviewTrend: reviewTrend.map((row) => ({
      date: row.review_date,
      count: Number(row.review_count)
    })),
    pendingAppeals: Number(pendingAppeals[0]?.total || 0)
  };
}

module.exports = {
  getAdminStats,
  getHotTags,
  getOverviewStats,
  getRecentActivity,
  getTopUsers,
  getUserTodos
};
