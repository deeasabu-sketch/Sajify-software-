const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const { isAuthenticated } = require("../middlewares/authMiddleware");

router.get("/dashboard", isAuthenticated, userController.dashboard);
router.get("/profile", isAuthenticated, userController.profile);

router.get("/orders", isAuthenticated, userController.orders);

router.get("/profile/edit", isAuthenticated, userController.editProfilePage);

router.post("/profile/edit", isAuthenticated, userController.updateProfile);
router.get(
    "/profile/change-password",
    isAuthenticated,
    userController.changePasswordPage
);

router.post(
    "/profile/change-password",
    isAuthenticated,
    userController.changePassword
);

module.exports = router;