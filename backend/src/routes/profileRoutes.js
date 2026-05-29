const express = require("express");

const profileController = require("../controllers/profileController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/:userId", authMiddleware, profileController.getProfile);

module.exports = router;

