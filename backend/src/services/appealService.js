const appealDao = require("../dao/appealDao");
const reviewDao = require("../dao/reviewDao");
const { logOperation } = require("../utils/logger");
const { AppError } = require("../utils/response");

async function createAppeal(currentUser, reviewId, reason) {
  const cleanReason = String(reason || "").trim();
  if (!cleanReason) {
    throw new AppError("请填写申诉理由");
  }

  const review = await reviewDao.findReviewById(reviewId);
  if (!review) {
    throw new AppError("评价不存在", 404);
  }

  if (Number(review.reviewee_id) !== Number(currentUser.userId)) {
    throw new AppError("只能申诉自己收到的评价", 403);
  }

  if (review.status === "hidden") {
    throw new AppError("该评价已被管理员隐藏，无需重复申诉");
  }

  const existing = await appealDao.findByReviewAndUser(reviewId, currentUser.userId);
  if (existing) {
    throw new AppError(`你已经对该评价提交过申诉，当前状态：${statusLabel(existing.status)}`);
  }

  const insertId = await appealDao.createAppeal(currentUser.userId, reviewId, cleanReason);
  await logOperation(currentUser.userId, "appeal.create", `reviewId=${reviewId}, appealId=${insertId}`);

  return { id: insertId, status: "pending" };
}

async function listAppeals(filters = {}) {
  return appealDao.listAppeals(filters);
}

async function processAppeal(currentUser, appealId, status, adminReply) {
  if (!["approved", "rejected"].includes(status)) {
    throw new AppError("处理结果只能是 approved 或 rejected");
  }

  const appeal = await appealDao.findById(appealId);
  if (!appeal) {
    throw new AppError("申诉不存在", 404);
  }

  if (appeal.status !== "pending") {
    throw new AppError("该申诉已经处理过");
  }

  await appealDao.updateStatus(appealId, status, adminReply || null);

  // Approved → auto-hide the review
  if (status === "approved") {
    await reviewDao.hideReview(appeal.review_id, `申诉通过自动隐藏。申诉ID: ${appealId}, 理由: ${adminReply || "管理员批准"}`);
    await logOperation(currentUser.userId, "appeal.approve", `appealId=${appealId}, reviewId=${appeal.review_id} auto-hidden`);
  } else {
    await logOperation(currentUser.userId, "appeal.reject", `appealId=${appealId}`);
  }

  return appealDao.findById(appealId);
}

async function getPendingCount() {
  return appealDao.countByStatus("pending");
}

function statusLabel(status) {
  return status === "pending" ? "待处理" : status === "approved" ? "已通过" : "已驳回";
}

module.exports = {
  createAppeal,
  getPendingCount,
  listAppeals,
  processAppeal
};
