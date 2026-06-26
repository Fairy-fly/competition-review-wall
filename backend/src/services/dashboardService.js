const dashboardDao = require("../dao/dashboardDao");
const { camelizeUser } = require("../utils/helpers");

function formatTag(tag) {
  return {
    id: tag.id,
    name: tag.name,
    displayName: tag.display_name,
    type: tag.type,
    count: Number(tag.count)
  };
}

async function getSummary() {
  const [overview, topUsers, hotTags] = await Promise.all([
    dashboardDao.getOverviewStats(),
    dashboardDao.getTopUsers(5),
    dashboardDao.getHotTags(8)
  ]);

  return {
    overview: {
      totalUsers: Number(overview?.total_users || 0),
      totalProjects: Number(overview?.total_projects || 0),
      totalReviews: Number(overview?.total_reviews || 0),
      hiddenReviews: Number(overview?.hidden_reviews || 0),
      averageScore: Number(overview?.average_score || 0),
      usersWithoutReviews: Number(overview?.users_without_reviews || 0)
    },
    topUsers: topUsers.map(camelizeUser),
    hotTags: hotTags.map(formatTag)
  };
}

async function getRecentActivity() {
  const activity = await dashboardDao.getRecentActivity(5);

  return {
    recentReviews: (activity.recentReviews || []).map((r) => ({
      id: r.id,
      overallScore: r.overall_score,
      createdAt: r.created_at,
      projectName: r.project_name,
      revieweeName: r.reviewee_name,
      revieweeId: r.reviewee_id
    })),
    recentProjects: (activity.recentProjects || []).map((p) => ({
      id: p.id,
      name: p.name,
      type: p.type,
      updatedAt: p.updated_at,
      creatorName: p.creator_name
    })),
    recentProfiles: (activity.recentProfiles || []).map((u) => ({
      id: u.id,
      realName: u.real_name,
      major: u.major,
      skillDirection: u.skill_direction,
      latestReviewAt: u.latest_review_at,
      recentReviewCount: Number(u.recent_review_count)
    }))
  };
}

async function getUserTodos(userId) {
  const rows = await dashboardDao.getUserTodos(userId);

  // Group by project
  const projectMap = new Map();
  for (const row of rows) {
    const pid = row.project_id;
    if (!projectMap.has(pid)) {
      projectMap.set(pid, {
        projectId: pid,
        projectName: row.project_name,
        status: row.status,
        teammates: []
      });
    }
    projectMap.get(pid).teammates.push({
      teammateId: row.teammate_id,
      teammateName: row.teammate_name,
      teammateMajor: row.teammate_major,
      roleInTeam: row.role_in_team,
      reviewed: row.reviewed === 1
    });
  }

  const todos = [];
  for (const [, project] of projectMap) {
    const unreviewed = project.teammates.filter((t) => !t.reviewed);
    if (unreviewed.length > 0) {
      todos.push({
        ...project,
        unreviewedCount: unreviewed.length,
        totalCount: project.teammates.length,
        unreviewed
      });
    }
  }

  return todos;
}

async function getAdminStats() {
  const stats = await dashboardDao.getAdminStats();
  return stats;
}

module.exports = {
  getAdminStats,
  getRecentActivity,
  getSummary,
  getUserTodos
};
