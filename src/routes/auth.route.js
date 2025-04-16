import express from "express";
import {
    register,
    login,
    getMyProfile,
    changePassword,
    logout,
    updateUserRole,
    createAdmin,
    homeLander,
} from "../controllers/auth.controller.js";

import { authenticate } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.get("/profile", authenticate, getMyProfile);
router.get("/", homeLander);

router.post("/register", register);
router.post("/login", login);

router.post("/logout", logout);
router.post("/change-password", authenticate, changePassword);

router.patch(
    "/users/:id/update-role",
    authenticate,
    authorizeRoles(process.env.ADMIN_ROLE),
    updateUserRole
);

router.post("/create-admin", authenticate, createAdmin);

export default router;
