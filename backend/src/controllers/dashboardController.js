const dashboardService = require("../services/dashboardService");
const { sendSuccess } = require("../utils/response");

async function getSummary(req, res, next) {
  try {
    const data = await dashboardService.getSummary();
    sendSuccess(res, data, "获取概览统计成功");
  } catch (error) {
    next(error);
  }
}

async function getRecentActivity(req, res, next) {
  try {
    const data = await dashboardService.getRecentActivity();
    sendSuccess(res, data, "获取近期动态成功");
  } catch (error) {
    next(error);
  }
}

async function getUserTodos(req, res, next) {
  try {
    const data = await dashboardService.getUserTodos(req.user.userId);
    sendSuccess(res, data, "获取待办事项成功");
  } catch (error) {
    next(error);
  }
}

async function getAdminStats(req, res, next) {
  try {
    const data = await dashboardService.getAdminStats();
    sendSuccess(res, data, "获取管理统计成功");
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAdminStats,
  getRecentActivity,
  getSummary,
  getUserTodos
};
