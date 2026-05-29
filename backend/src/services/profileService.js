const projectDao = require("../dao/projectDao");
const reviewDao = require("../dao/reviewDao");
const userDao = require("../dao/userDao");
const { camelizeReview, camelizeUser } = require("../utils/helpers");
const { AppError } = require("../utils/response");

async function getProfile(userId) {
  const user = await userDao.findById(userId);
  if (!user) {
    throw new AppError("用户不存在", 404);
  }

  const [summary, topTags, reviews, projectCount] = await Promise.all([
    reviewDao.getProfileSummary(userId),
    reviewDao.listTopTagsForUser(userId, 5),
    reviewDao.listReceivedReviews(userId, { includeHidden: false }),
    projectDao.countUserProjects(userId)
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
    topTags: topTags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      displayName: tag.display_name,
      type: tag.type,
      count: Number(tag.count)
    })),
    recentReviews: reviews.map((row) => camelizeReview(row))
  };
}

module.exports = {
  getProfile
};

