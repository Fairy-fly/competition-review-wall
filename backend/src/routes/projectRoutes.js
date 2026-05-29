const express = require("express");

const projectController = require("../controllers/projectController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.post("/", projectController.createProject);
router.get("/my", projectController.getMyProjects);
router.get("/:id", projectController.getProjectDetail);
router.post("/:id/members", projectController.addMember);
router.put("/:id/status", projectController.updateStatus);

module.exports = router;

