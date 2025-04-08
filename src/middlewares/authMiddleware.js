import jwt from "jsonwebtoken";
import { User, Role } from "../models/index.js";

export const authenticate = async (req, res, next) => {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
    }

    if (!token && req.cookies?.accessToken) {
        token = req.cookies.accessToken;
    }

    if (!token) {
        return res.status(401).json({ error: "Authentication token missing" });
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findByPk(decoded.id, {
            include: {
                model: Role,
                as: "role",
                attributes: ["roleName"],
            },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error("JWT Error:", err.message);
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};
