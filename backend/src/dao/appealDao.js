const { query } = require("../utils/db");

async function createAppeal(appellantUserId, reviewId, reason) {
  const result = await query(
    `INSERT INTO appeals (review_id, appellant_user_id, reason)
     VALUES (?, ?, ?)`,
    [reviewId, appellantUserId, reason]
  );
  return result.insertId;
}

async function findByReviewAndUser(reviewId, appellantUserId) {
  const rows = await query(
    "SELECT * FROM appeals WHERE review_id = ? AND appellant_user_id = ? LIMIT 1",
    [reviewId, appellantUserId]
  );
  return rows[0] || null;
}

async function listAppeals(filters = {}) {
  const where = [];
  const values = [];

  if (filters.status) {
    where.push("a.status = ?");
    values.push(filters.status);
  }

  if (filters.reviewId) {
    where.push("a.review_id = ?");
    values.push(Number(filters.reviewId));
  }

  return query(
    `SELECT
       a.*,
       r.overall_score, r.comment AS review_comment, r.status AS review_status,
       cp.name AS project_name,
       appellant.real_name AS appellant_name, appellant.student_no AS appellant_student_no,
       reviewer.real_name AS reviewer_name,
       reviewee.real_name AS reviewee_name
     FROM appeals a
     INNER JOIN reviews r ON r.id = a.review_id
     INNER JOIN competition_projects cp ON cp.id = r.project_id
     INNER JOIN users appellant ON appellant.id = a.appellant_user_id
     INNER JOIN users reviewer ON reviewer.id = r.reviewer_id
     INNER JOIN users reviewee ON reviewee.id = r.reviewee_id
     ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
     ORDER BY a.created_at DESC`,
    values
  );
}

async function findById(appealId) {
  const rows = await listAppeals({});
  return rows.find((item) => item.id === Number(appealId)) || null;
}

async function updateStatus(appealId, status, adminReply) {
  await query(
    `UPDATE appeals
     SET status = ?, admin_reply = ?, updated_at = NOW()
     WHERE id = ?`,
    [status, adminReply || null, appealId]
  );
}

async function countByStatus(status) {
  const rows = await query(
    "SELECT COUNT(*) AS total FROM appeals WHERE status = ?",
    [status]
  );
  return Number(rows[0]?.total || 0);
}

module.exports = {
  countByStatus,
  createAppeal,
  findById,
  findByReviewAndUser,
  listAppeals,
  updateStatus
};
