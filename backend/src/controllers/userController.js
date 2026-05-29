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

module.exports = {
  getCurrentUser,
  getWall,
  updateCurrentUser
};

