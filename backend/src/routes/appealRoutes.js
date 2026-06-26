const express = require("express");

const appealController = require("../controllers/appealController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { adminMiddleware } = require("../middleware/adminMiddleware");

const router = express.Router();

router.post("/", authMiddleware, appealController.createAppeal);
router.get("/", authMiddleware, adminMiddleware, appealController.listAppeals);
router.put("/:id/process", authMiddleware, adminMiddleware, appealController.processAppeal);

module.exports = router;
