const profileService = require("../services/profileService");
const { sendSuccess } = require("../utils/response");

async function getProfile(req, res, next) {
  try {
    const data = await profileService.getProfile(Number(req.params.userId), req.user.userId);
    sendSuccess(res, data, "获取用户画像成功");
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProfile
};
