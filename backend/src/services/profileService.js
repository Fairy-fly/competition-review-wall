const favoriteDao = require("../dao/favoriteDao");
const projectDao = require("../dao/projectDao");
const reviewDao = require("../dao/reviewDao");
const userDao = require("../dao/userDao");
const { camelizeProject, camelizeReview, camelizeUser } = require("../utils/helpers");
const { AppError } = require("../utils/response");

function formatTag(tag) {
  return {
    id: tag.id,
    name: tag.name,
    displayName: tag.display_name,
    type: tag.type,
    count: Number(tag.count)
  };
}

async function getProfile(userId, viewerId) {
  const user = await userDao.findById(userId);
  if (!user) {
    throw new AppError("用户不存在", 404);
  }

  const [summary, topTags, recentTags, reviews, projectCount, recentProjects, isFavorite] = await Promise.all([
    reviewDao.getProfileSummary(userId),
    reviewDao.listTopTagsForUser(userId, 5),
    reviewDao.listRecentTagsForUser(userId, 6),
    reviewDao.listReceivedReviews(userId, { includeHidden: false }),
    projectDao.countUserProjects(userId),
    projectDao.listRecentProjectsByUserId(userId, 3),
    viewerId && Number(viewerId) !== Number(userId) ? favoriteDao.isFavorite(viewerId, userId) : false
  ]);

  return {
    user: camelizeUser(user),
    summary: {
      overallScore: Number(summary?.overall_score || 0),
      taskScore: Number(summary?.task_score || 0),
      communicationScore: Number(summary?.communication_score || 0),
      responsibilityScore: Number(summary?.responsibility_score || 0),
      skillScore: Number(summary?.skill_score || 0),
      reviewCount: Number(summary?.review_count || 0),
      projectCount,
      willingAgainRate: Number(summary?.willing_again_rate || 0)
    },
    topTags: topTags.map(formatTag),
    recentTags: recentTags.map((tag) => ({
      ...formatTag(tag),
      latestAt: tag.latest_at
    })),
    recentProjects: recentProjects.map((project) => ({
      ...camelizeProject(project),
      roleInTeam: project.role_in_team
    })),
    recentReviews: reviews.map((row) => camelizeReview(row)),
    viewer: {
      isSelf: Number(viewerId) === Number(userId),
      isFavorite
    }
  };
}

module.exports = {
  getProfile
};
