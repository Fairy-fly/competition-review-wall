const userService = require("../services/userService");
const { sendSuccess } = require("../utils/response");

async function getCurrentUser(req, res, next) {
  try {
    const data = await userService.getCurrentUser(req.user.userId);
    sendSuccess(res, data, "获取当前用户成功");
  } catch (error) {
    next(error);
  }
}

async function updateCurrentUser(req, res, next) {
  try {
    const data = await userService.updateCurrentUser(req.user.userId, req.body);
    sendSuccess(res, data, "更新个人资料成功");
  } catch (error) {
    next(error);
  }
}

async function getWall(req, res, next) {
  try {
    const data = await userService.getWall(req.query);
    sendSuccess(res, data, "获取测评墙成功");
  } catch (error) {
    next(error);
  }
}

async function lookupUser(req, res, next) {
  try {
    const data = await userService.lookupUser(req.query.studentNo);
    sendSuccess(res, data, "查询用户成功");
  } catch (error) {
    next(error);
  }
}

async function getFavorites(req, res, next) {
  try {
    const data = await userService.getFavorites(req.user.userId);
    sendSuccess(res, data, "获取收藏队友成功");
  } catch (error) {
    next(error);
  }
}

async function addFavorite(req, res, next) {
  try {
    const data = await userService.addFavorite(req.user.userId, req.body.targetUserId);
    sendSuccess(res, data, "收藏队友成功", 201);
  } catch (error) {
    next(error);
  }
}

async function removeFavorite(req, res, next) {
  try {
    const data = await userService.removeFavorite(req.user.userId, Number(req.params.targetUserId));
    sendSuccess(res, data, "取消收藏成功");
  } catch (error) {
    next(error);
  }
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
