const favoriteDao = require("../dao/favoriteDao");
const reviewDao = require("../dao/reviewDao");
const userDao = require("../dao/userDao");
const { camelizeUser } = require("../utils/helpers");
const { logOperation } = require("../utils/logger");
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

async function attachTopTags(users, limit = 3) {
  return Promise.all(
    users.map(async (user) => {
      const topTags = await reviewDao.listTopTagsForUser(user.id, limit);
      return {
        ...camelizeUser(user),
        topTags: topTags.map(formatTag)
      };
    })
  );
}

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
  const usersWithTags = await attachTopTags(users, 3);

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

async function lookupUser(studentNo) {
  if (!studentNo) {
    throw new AppError("请输入学号");
  }

  const user = await userDao.findByStudentNo(studentNo);
  if (!user) {
    throw new AppError("未找到该学号对应的用户", 404);
  }

  return camelizeUser(user);
}

async function getFavorites(userId) {
  const favorites = await favoriteDao.listFavoritesByUserId(userId);
  return attachTopTags(favorites, 3);
}

async function addFavorite(userId, targetUserId) {
  const numericTargetId = Number(targetUserId);
  if (!numericTargetId) {
    throw new AppError("请选择要收藏的队友");
  }

  if (numericTargetId === Number(userId)) {
    throw new AppError("不能收藏自己");
  }

  const targetUser = await userDao.findById(numericTargetId);
  if (!targetUser || targetUser.role !== "student") {
    throw new AppError("收藏对象不存在", 404);
  }

  const alreadyFavorite = await favoriteDao.isFavorite(userId, numericTargetId);
  if (!alreadyFavorite) {
    await favoriteDao.createFavorite(userId, numericTargetId);
    await logOperation(userId, "user.favorite.add", `targetUserId=${numericTargetId}`);
  }

  return {
    isFavorite: true,
    targetUser: camelizeUser(targetUser)
  };
}

async function removeFavorite(userId, targetUserId) {
  if (!targetUserId) {
    throw new AppError("请选择要取消收藏的队友");
  }

  await favoriteDao.deleteFavorite(userId, targetUserId);
  await logOperation(userId, "user.favorite.remove", `targetUserId=${targetUserId}`);

  return {
    isFavorite: false,
    targetUserId
  };
}

module.exports = {
  addFavorite,
  getCurrentUser,
  getFavorites,
  getWall,
  lookupUser,
  removeFavorite,
  updateCurrentUser
};
