class AppError extends Error {
  constructor(message, status = 400, code = status) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function sendSuccess(res, data = null, message = "成功", status = 200) {
  return res.status(status).json({
    code: 0,
    message,
    data
  });
}

module.exports = {
  AppError,
  sendSuccess
};

