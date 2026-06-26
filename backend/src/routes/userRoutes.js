const express = require("express");

const userController = require("../controllers/userController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/wall", authMiddleware, userController.getWall);
router.get("/lookup", authMiddleware, userController.lookupUser);
router.get("/favorites", authMiddleware, userController.getFavorites);
router.post("/favorites", authMiddleware, userController.addFavorite);
router.delete("/favorites/:targetUserId", authMiddleware, userController.removeFavorite);
router.get("/me", authMiddleware, userController.getCurrentUser);
router.put("/me", authMiddleware, userController.updateCurrentUser);

module.exports = router;
