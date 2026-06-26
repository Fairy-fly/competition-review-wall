const projectService = require("./projectService");
const reviewDao = require("../dao/reviewDao");
const userDao = require("../dao/userDao");
const { camelizeProject, camelizeReview, camelizeUser } = require("../utils/helpers");
const { logOperation } = require("../utils/logger");
const { AppError } = require("../utils/response");

async function getUsers() {
  const rows = await userDao.listAdminUsers();
  return rows.map((row) => ({
    ...camelizeUser(row),
    projectCount: Number(row.project_count || 0),
    reviewCount: Number(row.review_count || 0)
  }));
}

async function getProjects() {
  const projects = await projectService.getAdminProjects();
  return projects.map((project) => camelizeProject(project));
}

async function getReviews(filters = {}) {
  const reviews = await reviewDao.listAllReviews(filters);
  return reviews.map((row) => camelizeReview(row, { includeReviewerName: true, includeReviewerId: true }));
}

async function hideReview(currentUser, reviewId, reason) {
  const cleanReason = String(reason || "").trim();
  if (!cleanReason) {
    throw new AppError("请填写隐藏原因");
  }

  const review = await reviewDao.findReviewById(reviewId);
  if (!review) {
    throw new AppError("评价不存在", 404);
  }

  if (review.status === "hidden") {
    throw new AppError("该评价已经被隐藏");
  }

  await reviewDao.hideReview(reviewId, cleanReason);
  await logOperation(currentUser.userId, "admin.hideReview", `reviewId=${reviewId}, reason=${cleanReason}`);

  const updated = await reviewDao.findReviewById(reviewId);
  return camelizeReview(updated, { includeReviewerName: true, includeReviewerId: true });
}

module.exports = {
  getProjects,
  getReviews,
  getUsers,
  hideReview
};
