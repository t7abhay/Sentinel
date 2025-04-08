import express from "express";
import {
    register,
    login,
    getMyProfile,
    changePassword,
    logout,
    updateUserRole,
    createAdmin,
} from "../controllers/auth.controller.js";
import { body } from "express-validator";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

const registerValidation = [
    body("username").trim().notEmpty(),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
];

const loginValidation = [
    body("email").isEmail().normalizeEmail(),
    body("password").exists(),
];

const passwordValidation = [
    body("oldPassword").exists(),
    body("newPassword").isLength({ min: 6 }),
];

router.get("/get-profile", authenticate, getMyProfile);

router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);

router.post(
    "/change-password",
    authenticate,
    passwordValidation,
    changePassword
);
router.post("/logout", logout);

router.patch(
    "/users/:id/update-role",
    authenticate,
    authorizeRoles(process.env.ADMIN_ROLE),
    updateUserRole
);

router.post("/create-admin", authenticate, createAdmin);

export default router;
