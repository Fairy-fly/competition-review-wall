const adminService = require("../services/adminService");
const { sendSuccess } = require("../utils/response");

async function getUsers(req, res, next) {
  try {
    const data = await adminService.getUsers();
    sendSuccess(res, data, "获取用户列表成功");
  } catch (error) {
    next(error);
  }
}

async function getProjects(req, res, next) {
  try {
    const data = await adminService.getProjects();
    sendSuccess(res, data, "获取项目列表成功");
  } catch (error) {
    next(error);
  }
}

async function getReviews(req, res, next) {
  try {
    const data = await adminService.getReviews(req.query);
    sendSuccess(res, data, "获取评价列表成功");
  } catch (error) {
    next(error);
  }
}

async function hideReview(req, res, next) {
  try {
    const data = await adminService.hideReview(req.user, Number(req.params.id), req.body.reason);
    sendSuccess(res, data, "隐藏评价成功");
  } catch (error) {
    next(error);
  }
}

async function resetPassword(req, res, next) {
  try {
    const data = await adminService.resetPassword(req.user, Number(req.params.id), req.body.password);
    sendSuccess(res, data, "密码重置成功");
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProjects,
  getReviews,
  getUsers,
  hideReview,
  resetPassword
};
