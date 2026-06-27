const express = require("express");

const adminController = require("../controllers/adminController");
const { adminMiddleware } = require("../middleware/adminMiddleware");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware, adminMiddleware);
router.get("/users", adminController.getUsers);
router.get("/projects", adminController.getProjects);
router.get("/reviews", adminController.getReviews);
router.put("/reviews/:id/hide", adminController.hideReview);
router.put("/users/:id/reset-password", adminController.resetPassword);

module.exports = router;
