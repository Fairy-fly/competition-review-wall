const reviewDao = require("../dao/reviewDao");
const userDao = require("../dao/userDao");
const { camelizeUser } = require("../utils/helpers");
const { logOperation } = require("../utils/logger");
const { AppError } = require("../utils/response");

async function getCurrentUser(userId) {
  const user = await userDao.findById(userId);
  if (!user) {
    throw new AppError("用户不存在", 404);
  }

  return camelizeUser(user);
}

async function updateCurrentUser(userId, payload) {
  const user = await userDao.findById(userId);
  if (!user) {
    throw new AppError("用户不存在", 404);
  }

  await userDao.updateUser(userId, {
    realName: payload.realName || user.real_name,
    college: payload.college || "",
    major: payload.major || "",
    grade: payload.grade || "",
    skillDirection: payload.skillDirection || ""
  });

  await logOperation(userId, "user.updateProfile", "updated own profile");
  const updatedUser = await userDao.findById(userId);
  return camelizeUser(updatedUser);
}

async function getWall(filters) {
  const users = await userDao.listWallUsers(filters);
  const summary = await userDao.getWallSummary();

  const usersWithTags = await Promise.all(
    users.map(async (user) => {
      const topTags = await reviewDao.listTopTagsForUser(user.id, 3);
      return {
        ...camelizeUser(user),
        topTags: topTags.map((tag) => ({
          id: tag.id,
          name: tag.name,
          displayName: tag.display_name,
          type: tag.type,
          count: Number(tag.count)
        }))
      };
    })
  );

  return {
    summary: {
      totalUsers: Number(summary?.total_users || 0),
      totalProjects: Number(summary?.total_projects || 0),
      totalReviews: Number(summary?.total_reviews || 0),
      averageScore: Number(summary?.average_score || 0)
    },
    users: usersWithTags
  };
}

module.exports = {
  getCurrentUser,
  getWall,
  updateCurrentUser
};

