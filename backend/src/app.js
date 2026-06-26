const cors = require("cors");
const express = require("express");
const path = require("path");

const adminRoutes = require("./routes/adminRoutes");
const appealRoutes = require("./routes/appealRoutes");
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const profileRoutes = require("./routes/profileRoutes");
const projectRoutes = require("./routes/projectRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const tagRoutes = require("./routes/tagRoutes");
const userRoutes = require("./routes/userRoutes");
const { errorHandler, notFoundHandler } = require("./middleware/errorMiddleware");
const { requestLogger } = require("./utils/logger");
const { sendSuccess } = require("./utils/response");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3009",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.get("/api/health", (req, res) => {
  sendSuccess(res, { status: "ok", time: new Date().toISOString() }, "服务正常");
});

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/appeals", appealRoutes);

if (process.env.NODE_ENV === "production") {
  const frontendDist = path.join(__dirname, "../../frontend/dist");
  app.use(express.static(frontendDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) return next();
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
