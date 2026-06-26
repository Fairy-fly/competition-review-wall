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

module.exports = {
  getSummary
};
