const express = require("express");

const dashboardController = require("../controllers/dashboardController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { adminMiddleware } = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/summary", authMiddleware, dashboardController.getSummary);
router.get("/activity", authMiddleware, dashboardController.getRecentActivity);
router.get("/todos", authMiddleware, dashboardController.getUserTodos);
router.get("/admin-stats", authMiddleware, adminMiddleware, dashboardController.getAdminStats);

module.exports = router;
