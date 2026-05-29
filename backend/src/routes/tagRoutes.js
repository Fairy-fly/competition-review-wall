const express = require("express");

const tagController = require("../controllers/tagController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, tagController.getTags);

module.exports = router;

