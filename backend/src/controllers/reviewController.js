const reviewService = require("../services/reviewService");
const { sendSuccess } = require("../utils/response");

async function createReview(req, res, next) {
  try {
    const data = await reviewService.createReview(req.user, req.body);
    sendSuccess(res, data, "提交评价成功", 201);
  } catch (error) {
    next(error);
  }
}

async function getReceivedReviews(req, res, next) {
  try {
    const data = await reviewService.getReceivedReviews(Number(req.params.userId));
    sendSuccess(res, data, "获取收到的评价成功");
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createReview,
  getReceivedReviews
};
