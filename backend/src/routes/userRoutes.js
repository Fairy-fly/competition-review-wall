const express = require("express");

const userController = require("../controllers/userController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/wall", authMiddleware, userController.getWall);
router.get("/me", authMiddleware, userController.getCurrentUser);
router.put("/me", authMiddleware, userController.updateCurrentUser);

module.exports = router;

