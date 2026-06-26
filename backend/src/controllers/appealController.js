const appealService = require("../services/appealService");
const { sendSuccess } = require("../utils/response");

async function createAppeal(req, res, next) {
  try {
    const data = await appealService.createAppeal(
      req.user,
      req.body.reviewId,
      req.body.reason
    );
    sendSuccess(res, data, "申诉提交成功，管理员会尽快处理", 201);
  } catch (error) {
    next(error);
  }
}

async function listAppeals(req, res, next) {
  try {
    const data = await appealService.listAppeals(req.query);
    sendSuccess(res, data, "获取申诉列表成功");
  } catch (error) {
    next(error);
  }
}

async function processAppeal(req, res, next) {
  try {
    const data = await appealService.processAppeal(
      req.user,
      req.params.id,
      req.body.status,
      req.body.adminReply
    );
    sendSuccess(res, data, "申诉处理完成");
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createAppeal,
  listAppeals,
  processAppeal
};
