const { query } = require("../utils/db");

async function createFavorite(userId, targetUserId) {
  await query("INSERT INTO user_favorites (user_id, target_user_id) VALUES (?, ?)", [userId, targetUserId]);
}

async function deleteFavorite(userId, targetUserId) {
  await query("DELETE FROM user_favorites WHERE user_id = ? AND target_user_id = ?", [userId, targetUserId]);
}

async function listFavoritesByUserId(userId) {
  return query(
    `SELECT
       uf.created_at AS favorited_at,
       u.*,
       COALESCE(ROUND(AVG(CASE WHEN r.status = 'normal' THEN r.overall_score END), 2), 0) AS average_score,
       COUNT(DISTINCT CASE WHEN r.status = 'normal' THEN r.id END) AS review_count,
       COALESCE(ROUND(AVG(CASE WHEN r.status = 'normal' THEN IF(r.willing_again = 1, 100, 0) END), 2), 0) AS willing_again_rate
     FROM user_favorites uf
     INNER JOIN users u ON u.id = uf.target_user_id
     LEFT JOIN reviews r ON r.reviewee_id = u.id
     WHERE uf.user_id = ?
     GROUP BY uf.id, u.id
     ORDER BY uf.created_at DESC`,
    [userId]
  );
}

async function isFavorite(userId, targetUserId) {
  const rows = await query(
    "SELECT id FROM user_favorites WHERE user_id = ? AND target_user_id = ? LIMIT 1",
    [userId, targetUserId]
  );
  return Boolean(rows[0]);
}

module.exports = {
  createFavorite,
  deleteFavorite,
  isFavorite,
  listFavoritesByUserId
};

