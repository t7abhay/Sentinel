import express from "express";
import { signup, login } from "../controllers/auth.controller.js";

export const router = express.Router();
router.post("/register", register);
router.post("/login", login);
