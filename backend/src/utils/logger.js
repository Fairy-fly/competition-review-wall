const fs = require("fs");
const path = require("path");

const { query } = require("./db");

const logsDir = path.join(__dirname, "../../logs");
const accessLogPath = path.join(logsDir, "access.log");
const errorLogPath = path.join(logsDir, "error.log");

function ensureLogsDir() {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
}

function writeLine(filePath, line) {
  ensureLogsDir();
  fs.appendFileSync(filePath, `${line}\n`, "utf8");
}

function requestLogger(req, res, next) {
  const startedAt = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startedAt;
    writeLine(
      accessLogPath,
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`
    );
  });

  next();
}

function logError(error, req) {
  writeLine(
    errorLogPath,
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${error.message}\n${error.stack || ""}`
  );
}

async function logOperation(userId, action, detail) {
  writeLine(accessLogPath, `[${new Date().toISOString()}] operation user=${userId || "system"} ${action} ${detail}`);

  try {
    await query("INSERT INTO operation_logs (user_id, action, detail) VALUES (?, ?, ?)", [userId || null, action, detail]);
  } catch (error) {
    writeLine(errorLogPath, `[${new Date().toISOString()}] operation-log-failed ${error.message}`);
  }
}

module.exports = {
  logError,
  logOperation,
  requestLogger
};

