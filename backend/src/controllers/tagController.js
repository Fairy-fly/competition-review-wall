const tagService = require("../services/tagService");
const { sendSuccess } = require("../utils/response");

async function getTags(req, res, next) {
  try {
    const data = await tagService.getTags();
    sendSuccess(res, data, "获取标签成功");
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTags
};

