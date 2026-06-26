const { query } = require("../utils/db");

async function createProject(project) {
  const result = await query(
    `INSERT INTO competition_projects
      (name, type, team_name, start_date, end_date, creator_id, status, description)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      project.name,
      project.type,
      project.teamName,
      project.startDate,
      project.endDate,
      project.creatorId,
      project.status,
      project.description
    ]
  );

  return result.insertId;
}

async function addMember(projectId, userId, roleInTeam) {
  const result = await query(
    "INSERT INTO team_members (project_id, user_id, role_in_team) VALUES (?, ?, ?)",
    [projectId, userId, roleInTeam]
  );
  return result.insertId;
}

async function getProjectById(projectId) {
  const rows = await query(
    `SELECT cp.*, u.real_name AS creator_name
     FROM competition_projects cp
     INNER JOIN users u ON u.id = cp.creator_id
     WHERE cp.id = ?
     LIMIT 1`,
    [projectId]
  );
  return rows[0] || null;
}

async function listProjectsByUserId(userId) {
  return query(
    `SELECT
       cp.*,
       u.real_name AS creator_name,
       COUNT(DISTINCT tm2.id) AS member_count
     FROM team_members tm
     INNER JOIN competition_projects cp ON cp.id = tm.project_id
     INNER JOIN users u ON u.id = cp.creator_id
     LEFT JOIN team_members tm2 ON tm2.project_id = cp.id
     WHERE tm.user_id = ?
     GROUP BY cp.id
     ORDER BY cp.created_at DESC`,
    [userId]
  );
}

async function listRecentProjectsByUserId(userId, limit = 3) {
  const safeLimit = Math.max(1, Math.min(10, Number(limit) || 3));
  return query(
    `SELECT
       cp.*,
       u.real_name AS creator_name,
       tm.role_in_team,
       COUNT(DISTINCT tm2.id) AS member_count
     FROM team_members tm
     INNER JOIN competition_projects cp ON cp.id = tm.project_id
     INNER JOIN users u ON u.id = cp.creator_id
     LEFT JOIN team_members tm2 ON tm2.project_id = cp.id
     WHERE tm.user_id = ?
     GROUP BY cp.id, tm.role_in_team
     ORDER BY cp.created_at DESC
     LIMIT ${safeLimit}`,
    [userId]
  );
}

async function listAllProjects() {
  return query(
    `SELECT
       cp.*,
       u.real_name AS creator_name,
       COUNT(DISTINCT tm.id) AS member_count
     FROM competition_projects cp
     INNER JOIN users u ON u.id = cp.creator_id
     LEFT JOIN team_members tm ON tm.project_id = cp.id
     GROUP BY cp.id
     ORDER BY cp.created_at DESC`
  );
}

async function listProjectMembers(projectId) {
  return query(
    `SELECT
       tm.*,
       u.student_no,
       u.real_name,
       u.college,
       u.major,
       u.grade,
       u.skill_direction,
       u.role
     FROM team_members tm
     INNER JOIN users u ON u.id = tm.user_id
     WHERE tm.project_id = ?
     ORDER BY tm.id ASC`,
    [projectId]
  );
}

async function updateProjectStatus(projectId, status) {
  await query("UPDATE competition_projects SET status = ?, updated_at = NOW() WHERE id = ?", [status, projectId]);
}

async function isUserMember(projectId, userId) {
  const rows = await query("SELECT id FROM team_members WHERE project_id = ? AND user_id = ? LIMIT 1", [projectId, userId]);
  return Boolean(rows[0]);
}

async function countUserProjects(userId) {
  const rows = await query("SELECT COUNT(*) AS total FROM team_members WHERE user_id = ?", [userId]);
  return Number(rows[0]?.total || 0);
}

module.exports = {
  addMember,
  countUserProjects,
  createProject,
  getProjectById,
  isUserMember,
  listAllProjects,
  listProjectMembers,
  listProjectsByUserId,
  listRecentProjectsByUserId,
  updateProjectStatus
};
