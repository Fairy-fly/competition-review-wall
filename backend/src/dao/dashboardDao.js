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

module.exports = {
  getHotTags,
  getOverviewStats,
  getTopUsers
};
