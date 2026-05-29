const { logError } = require("../utils/logger");

function notFoundHandler(req, res) {
  res.status(404).json({
    code: 404,
    message: "接口不存在",
    data: null
  });
}

function errorHandler(error, req, res, next) {
  const status = error.status || 500;
  const code = error.code || status;
  const message = error.message || "服务器内部错误";

  logError(error, req);

  res.status(status).json({
    code,
    message,
    data: null
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};

