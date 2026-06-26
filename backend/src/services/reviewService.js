const { getConnection } = require("../utils/db");
const projectDao = require("../dao/projectDao");
const reviewDao = require("../dao/reviewDao");
const tagDao = require("../dao/tagDao");
const userDao = require("../dao/userDao");
const { camelizeReview } = require("../utils/helpers");
const { logOperation } = require("../utils/logger");
const { AppError } = require("../utils/response");

function validateScore(value, label) {
  const numeric = Number(value);
  if (!Number.isInteger(numeric) || numeric < 1 || numeric > 5) {
    throw new AppError(`${label}必须是 1 到 5 分`);
  }
  return numeric;
}

async function createReview(currentUser, payload) {
  const projectId = Number(payload.projectId);
  const revieweeId = Number(payload.revieweeId);

  if (!projectId || !revieweeId) {
    throw new AppError("项目和被评价人不能为空");
  }

  if (currentUser.userId === revieweeId) {
    throw new AppError("不能评价自己");
  }

  const project = await projectDao.getProjectById(projectId);
  if (!project) {
    throw new AppError("项目不存在", 404);
  }

  if (!["reviewable", "archived"].includes(project.status)) {
    throw new AppError("只有可评价或已归档项目才能提交评价");
  }

  const [reviewerMember, revieweeMember] = await Promise.all([
    projectDao.isUserMember(projectId, currentUser.userId),
    projectDao.isUserMember(projectId, revieweeId)
  ]);

  if (!reviewerMember || !revieweeMember) {
    throw new AppError("只能评价同一项目中的队友");
  }

  const existed = await reviewDao.findReviewByUniqueKey(projectId, currentUser.userId, revieweeId);
  if (existed) {
    throw new AppError("同一项目中不能重复评价同一队友");
  }

  const reviewee = await userDao.findById(revieweeId);
  if (!reviewee) {
    throw new AppError("被评价人不存在", 404);
  }

  const overallScore = validateScore(payload.overallScore, "综合评分");
  const taskScore = validateScore(payload.taskScore ?? overallScore, "任务完成");
  const communicationScore = validateScore(payload.communicationScore ?? overallScore, "沟通协作");
  const responsibilityScore = validateScore(payload.responsibilityScore ?? overallScore, "责任心");
  const skillScore = validateScore(payload.skillScore ?? overallScore, "技术能力");
  const tagIds = Array.isArray(payload.tagIds) ? payload.tagIds.map(Number).filter(Boolean) : [];

  const validTags = await tagDao.listEnabledTagsByIds(tagIds);
  if (tagIds.length !== validTags.length) {
    throw new AppError("存在无效标签");
  }

  const connection = await getConnection();
  let reviewId;

  try {
    await connection.beginTransaction();

    const [result] = await connection.execute(
      `INSERT INTO reviews
        (project_id, reviewer_id, reviewee_id, overall_score, task_score, communication_score, responsibility_score, skill_score, willing_again, comment, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'normal')`,
      [
        projectId,
        currentUser.userId,
        revieweeId,
        overallScore,
        taskScore,
        communicationScore,
        responsibilityScore,
        skillScore,
        payload.willingAgain ? 1 : 0,
        payload.comment || ""
      ]
    );

    reviewId = result.insertId;

    for (const tagId of tagIds) {
      await connection.execute("INSERT INTO review_tags (review_id, tag_id) VALUES (?, ?)", [reviewId, tagId]);
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  await logOperation(
    currentUser.userId,
    "review.create",
    `projectId=${projectId}, reviewId=${reviewId}, revieweeId=${revieweeId}`
  );

  const reviews = await reviewDao.listReceivedReviews(revieweeId, { includeHidden: false });
  const createdReview = reviews.find((item) => item.id === reviewId);
  return camelizeReview(createdReview);
}

async function getReceivedReviews(userId) {
  const targetUser = await userDao.findById(userId);
  if (!targetUser) {
    throw new AppError("用户不存在", 404);
  }

  const reviews = await reviewDao.listReceivedReviews(userId, { includeHidden: false });
  return reviews.map((row) => camelizeReview(row));
}

module.exports = {
  createReview,
  getReceivedReviews
};
