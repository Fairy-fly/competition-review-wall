const { query } = require("../utils/db");

async function findByStudentNo(studentNo) {
  const rows = await query("SELECT * FROM users WHERE student_no = ? LIMIT 1", [studentNo]);
  return rows[0] || null;
}

async function findById(id) {
  const rows = await query("SELECT * FROM users WHERE id = ? LIMIT 1", [id]);
  return rows[0] || null;
}

async function createUser(user) {
  const result = await query(
    `INSERT INTO users (student_no, real_name, password, college, major, grade, skill_direction, role)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [user.studentNo, user.realName, user.password, user.college, user.major, user.grade, user.skillDirection, user.role]
  );

  return result.insertId;
}

async function updateUser(userId, payload) {
  await query(
    `UPDATE users
     SET real_name = ?, college = ?, major = ?, grade = ?, skill_direction = ?, updated_at = NOW()
     WHERE id = ?`,
    [payload.realName, payload.college, payload.major, payload.grade, payload.skillDirection, userId]
  );
}

async function listWallUsers(filters = {}) {
  const conditions = ["u.role = 'student'"];
  const whereValues = [];
  const having = [];
  const havingValues = [];

  if (filters.keyword) {
    conditions.push("(u.real_name LIKE ? OR u.student_no LIKE ? OR u.major LIKE ?)");
    const keyword = `%${filters.keyword}%`;
    whereValues.push(keyword, keyword, keyword);
  }

  if (filters.major) {
    conditions.push("u.major = ?");
    whereValues.push(filters.major);
  }

  if (filters.grade) {
    conditions.push("u.grade = ?");
    whereValues.push(filters.grade);
  }

  if (filters.projectType) {
    conditions.push(
      `EXISTS (
        SELECT 1
        FROM team_members tm
        INNER JOIN competition_projects cp ON cp.id = tm.project_id
        WHERE tm.user_id = u.id AND cp.type = ?
      )`
    );
    whereValues.push(filters.projectType);
  }

  if (filters.tag) {
    conditions.push(
      `EXISTS (
        SELECT 1
        FROM reviews r2
        INNER JOIN review_tags rt2 ON rt2.review_id = r2.id
        INNER JOIN tags t2 ON t2.id = rt2.tag_id
        WHERE r2.reviewee_id = u.id
          AND r2.status = 'normal'
          AND t2.enabled = 1
          AND (t2.name = ? OR t2.display_name = ?)
      )`
    );
    whereValues.push(filters.tag, filters.tag);
  }

  if (filters.minScore) {
    having.push("average_score >= ?");
    havingValues.push(Number(filters.minScore));
  }

  const orderMap = {
    score_desc: "average_score DESC, review_count DESC, u.created_at DESC",
    reviews_desc: "review_count DESC, average_score DESC, u.created_at DESC",
    newest: "u.created_at DESC"
  };

  const sql = `
    SELECT
      u.*,
      COALESCE(ROUND(AVG(CASE WHEN r.status = 'normal' THEN r.overall_score END), 2), 0) AS average_score,
      COUNT(DISTINCT CASE WHEN r.status = 'normal' THEN r.id END) AS review_count,
      COALESCE(ROUND(AVG(CASE WHEN r.status = 'normal' THEN IF(r.willing_again = 1, 100, 0) END), 2), 0) AS willing_again_rate
    FROM users u
    LEFT JOIN reviews r ON r.reviewee_id = u.id
    WHERE ${conditions.join(" AND ")}
    GROUP BY u.id
    ${having.length ? `HAVING ${having.join(" AND ")}` : ""}
    ORDER BY ${orderMap[filters.sortBy] || orderMap.score_desc}
  `;

  return query(sql, [...whereValues, ...havingValues]);
}

async function getWallSummary() {
  const rows = await query(
    `SELECT
       (SELECT COUNT(*) FROM users WHERE role = 'student') AS total_users,
       (SELECT COUNT(*) FROM competition_projects) AS total_projects,
       (SELECT COUNT(*) FROM reviews WHERE status = 'normal') AS total_reviews,
       (SELECT COALESCE(ROUND(AVG(overall_score), 2), 0) FROM reviews WHERE status = 'normal') AS average_score`
  );

  return rows[0] || null;
}

async function listAdminUsers() {
  return query(
    `SELECT
       u.*,
       COUNT(DISTINCT tm.project_id) AS project_count,
       COUNT(DISTINCT r.id) AS review_count
     FROM users u
     LEFT JOIN team_members tm ON tm.user_id = u.id
     LEFT JOIN reviews r ON r.reviewee_id = u.id AND r.status = 'normal'
     GROUP BY u.id
     ORDER BY u.role DESC, u.created_at DESC`
  );
}

module.exports = {
  createUser,
  findById,
  findByStudentNo,
  getWallSummary,
  listAdminUsers,
  listWallUsers,
  updateUser
};

