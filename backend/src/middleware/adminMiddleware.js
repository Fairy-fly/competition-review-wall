const { AppError } = require("../utils/response");

function adminMiddleware(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return next(new AppError("需要管理员权限", 403));
  }

  return next();
}

module.exports = {
  adminMiddleware
};

