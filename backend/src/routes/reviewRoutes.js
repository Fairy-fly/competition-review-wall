const express = require("express");

const reviewController = require("../controllers/reviewController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.post("/", reviewController.createReview);
router.get("/received/:userId", reviewController.getReceivedReviews);

module.exports = router;

