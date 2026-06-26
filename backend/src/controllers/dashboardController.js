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

module.exports = {
  getSummary
};
