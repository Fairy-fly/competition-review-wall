const { query } = require("../utils/db");

async function findReviewByUniqueKey(projectId, reviewerId, revieweeId) {
  const rows = await query(
    `SELECT * FROM reviews
     WHERE project_id = ? AND reviewer_id = ? AND reviewee_id = ?
     LIMIT 1`,
    [projectId, reviewerId, revieweeId]
  );
  return rows[0] || null;
}

async function listReceivedReviews(userId, options = {}) {
  const where = ["r.reviewee_id = ?"];
  const values = [userId];

  if (!options.includeHidden) {
    where.push("r.status = 'normal'");
  }

  return query(
    `SELECT
       r.*,
       cp.name AS project_name,
       reviewer.real_name AS reviewer_name,
       reviewee.real_name AS reviewee_name,
       GROUP_CONCAT(
         DISTINCT CONCAT(t.id, '::', COALESCE(t.display_name, t.name), '::', t.type, '::', t.name)
         ORDER BY t.id SEPARATOR '||'
       ) AS tags
     FROM reviews r
     INNER JOIN competition_projects cp ON cp.id = r.project_id
     INNER JOIN users reviewer ON reviewer.id = r.reviewer_id
     INNER JOIN users reviewee ON reviewee.id = r.reviewee_id
     LEFT JOIN review_tags rt ON rt.review_id = r.id
     LEFT JOIN tags t ON t.id = rt.tag_id
     WHERE ${where.join(" AND ")}
     GROUP BY r.id
     ORDER BY r.created_at DESC`,
    values
  );
}

async function listAllReviews(filters = {}) {
  const where = [];
  const values = [];

  if (filters.projectId) {
    where.push("r.project_id = ?");
    values.push(Number(filters.projectId));
  }

  if (filters.id) {
    where.push("r.id = ?");
    values.push(Number(filters.id));
  }

  if (filters.status) {
    where.push("r.status = ?");
    values.push(filters.status);
  }

  if (filters.minScore) {
    where.push("r.overall_score >= ?");
    values.push(Number(filters.minScore));
  }

  if (filters.maxScore) {
    where.push("r.overall_score <= ?");
    values.push(Number(filters.maxScore));
  }

  if (filters.keyword) {
    where.push("(cp.name LIKE ? OR reviewer.real_name LIKE ? OR reviewee.real_name LIKE ? OR r.comment LIKE ?)");
    const keyword = `%${filters.keyword}%`;
    values.push(keyword, keyword, keyword, keyword);
  }

  return query(
    `SELECT
       r.*,
       cp.name AS project_name,
       reviewer.real_name AS reviewer_name,
       reviewee.real_name AS reviewee_name,
       GROUP_CONCAT(
         DISTINCT CONCAT(t.id, '::', COALESCE(t.display_name, t.name), '::', t.type, '::', t.name)
         ORDER BY t.id SEPARATOR '||'
       ) AS tags
     FROM reviews r
     INNER JOIN competition_projects cp ON cp.id = r.project_id
     INNER JOIN users reviewer ON reviewer.id = r.reviewer_id
     INNER JOIN users reviewee ON reviewee.id = r.reviewee_id
     LEFT JOIN review_tags rt ON rt.review_id = r.id
     LEFT JOIN tags t ON t.id = rt.tag_id
     ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
     GROUP BY r.id
     ORDER BY r.created_at DESC`,
    values
  );
}

async function findReviewById(reviewId) {
  const rows = await listAllReviews({ id: reviewId });
  return rows.find((item) => item.id === Number(reviewId)) || null;
}

async function getProfileSummary(userId) {
  const rows = await query(
    `SELECT
       COALESCE(ROUND(AVG(overall_score), 2), 0) AS overall_score,
       COALESCE(ROUND(AVG(task_score), 2), 0) AS task_score,
       COALESCE(ROUND(AVG(communication_score), 2), 0) AS communication_score,
       COALESCE(ROUND(AVG(responsibility_score), 2), 0) AS responsibility_score,
       COALESCE(ROUND(AVG(skill_score), 2), 0) AS skill_score,
       COUNT(*) AS review_count,
       COALESCE(ROUND(AVG(IF(willing_again = 1, 100, 0)), 2), 0) AS willing_again_rate
     FROM reviews
     WHERE reviewee_id = ? AND status = 'normal'`,
    [userId]
  );

  return rows[0] || null;
}

async function listTopTagsForUser(userId, limit = 5) {
  const safeLimit = Math.max(1, Math.min(20, Number(limit) || 5));
  return query(
    `SELECT
       t.id,
       t.name,
       COALESCE(t.display_name, t.name) AS display_name,
       t.type,
       COUNT(*) AS count
     FROM reviews r
     INNER JOIN review_tags rt ON rt.review_id = r.id
     INNER JOIN tags t ON t.id = rt.tag_id
     WHERE r.reviewee_id = ? AND r.status = 'normal' AND t.enabled = 1
     GROUP BY t.id
     ORDER BY count DESC, t.id ASC
     LIMIT ${safeLimit}`,
    [userId]
  );
}

async function listRecentTagsForUser(userId, limit = 6) {
  const safeLimit = Math.max(1, Math.min(12, Number(limit) || 6));
  return query(
    `SELECT
       t.id,
       t.name,
       COALESCE(t.display_name, t.name) AS display_name,
       t.type,
       COUNT(*) AS count,
       MAX(r.created_at) AS latest_at
     FROM reviews r
     INNER JOIN review_tags rt ON rt.review_id = r.id
     INNER JOIN tags t ON t.id = rt.tag_id
     WHERE r.reviewee_id = ? AND r.status = 'normal' AND t.enabled = 1
     GROUP BY t.id
     ORDER BY latest_at DESC, count DESC
     LIMIT ${safeLimit}`,
    [userId]
  );
}

async function listReviewedUserIds(projectId, reviewerId) {
  const rows = await query("SELECT reviewee_id FROM reviews WHERE project_id = ? AND reviewer_id = ?", [projectId, reviewerId]);
  return rows.map((item) => item.reviewee_id);
}

async function listProjectReviewProgress(projectId, reviewerId) {
  return query(
    `SELECT
       tm.user_id,
       tm.role_in_team,
       u.student_no,
       u.real_name,
       u.college,
       u.major,
       u.grade,
       u.skill_direction,
       u.role,
       CASE WHEN mine.id IS NULL THEN 0 ELSE 1 END AS reviewed_by_me,
       COUNT(DISTINCT received.id) AS received_review_count
     FROM team_members tm
     INNER JOIN users u ON u.id = tm.user_id
     LEFT JOIN reviews mine
       ON mine.project_id = tm.project_id
      AND mine.reviewer_id = ?
      AND mine.reviewee_id = tm.user_id
     LEFT JOIN reviews received
       ON received.project_id = tm.project_id
      AND received.reviewee_id = tm.user_id
      AND received.status = 'normal'
     WHERE tm.project_id = ?
     GROUP BY
       tm.id,
       tm.user_id,
       tm.role_in_team,
       u.id,
       u.student_no,
       u.real_name,
       u.college,
       u.major,
       u.grade,
       u.skill_direction,
       u.role,
       mine.id
     ORDER BY tm.id ASC`,
    [reviewerId, projectId]
  );
}

async function hideReview(reviewId, reason) {
  await query("UPDATE reviews SET status = 'hidden', hidden_reason = ?, updated_at = NOW() WHERE id = ?", [reason, reviewId]);
}

module.exports = {
  findReviewById,
  findReviewByUniqueKey,
  getProfileSummary,
  hideReview,
  listAllReviews,
  listProjectReviewProgress,
  listRecentTagsForUser,
  listReceivedReviews,
  listReviewedUserIds,
  listTopTagsForUser
};
