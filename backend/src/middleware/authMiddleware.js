const { verifyToken } = require("../utils/jwt");
const { AppError } = require("../utils/response");

function authMiddleware(req, res, next) {
  const authorization = req.headers.authorization || "";

  if (!authorization.startsWith("Bearer ")) {
    return next(new AppError("未登录或 token 无效", 401));
  }

  const token = authorization.slice(7).trim();

  try {
    req.user = verifyToken(token);
    return next();
  } catch (error) {
    return next(new AppError("登录状态已失效，请重新登录", 401));
  }
}

module.exports = {
  authMiddleware
};

