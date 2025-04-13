import { User, Role } from "../models/index.js";

import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const register = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    if ([email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const userExists = await User.findOne({ where: { email } });

    if (userExists) {
        return res
            .status(404)
            .json(new ApiError(404, "Email already registered."));
    }

    const defaultRole = await Role.findOne({
        where: { roleName: process.env.DEFAULT_ROLE },
    });

    if (!defaultRole) {
        return res.status(500).json({
            message: "Default role not found. Please initialize roles.",
        });
    }
    const user = await User.create({
        username,
        email,
        password,
        roleId: defaultRole.id,
    });

    res.status(201).json(
        new ApiResponse(200, user, "User registered successfully  ")
    );
});

export const login = async (req, res, next) => {
    try {
        const { email, password } = matchedData(req);

        const user = await User.findOne({ where: { email }, include: "role" });

        if (!user) {
            throw new ApiError(400, "Invalid credentials");
        }

        const isMatch = await user.isPasswordCorrect(password);

        if (!isMatch) {
            throw new ApiError(401, "Invalid user credentials");
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        const options = {
            httpOnly: true,
            // secure: true,
            // sameSite: "None",
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        user,
                        accessToken,
                        refreshToken,
                    },
                    "User logged in successfully!"
                )
            );
    } catch (error) {
        next(error);
    }
};

export const getMyProfile = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ["password"] },
            include: "role",
        });
        console.log(user);
        res.json(user);
    } catch (err) {
        next(err);
    }
};

export const changePassword = async (req, res, next) => {
    try {
        const { oldPassword, newPassword } = matchedData(req);

        const user = await User.findByPk(req.user.id);
        const isMatch = await user.isPasswordCorrect(oldPassword);

        if (!isMatch) {
            return res.status(400).json({ message: "Old password incorrect" });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: "Password updated successfully" });
    } catch (err) {
        next(err);
    }
};

export const logout = async (req, res, next) => {
    try {
        const refreshToken = req.cookies?.refreshToken;
        const options = {
            httpOnly: true,
            secure: true,
            sameSite: "None",
        };

        if (!refreshToken) {
            return res
                .status(200)
                .clearCookie("accessToken", options)
                .clearCookie("refreshToken", options)
                .json(
                    new ApiResponse(
                        200,
                        {},
                        "User already logged out or not logged in."
                    )
                );
        }

        const user = await User.findOne({ where: { refreshToken } });

        if (user) {
            user.refreshToken = null;
            await user.save();
        }

        return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(new ApiResponse(200, {}, "User logged out successfully"));
    } catch (err) {
        next(err);
    }
};
export const updateUserRole = async (req, res, next) => {
    try {
        const { roleId } = req.body;
        const { id } = req.params;

        const role = await Role.findByPk(roleId);
        if (!role) return res.status(404).json({ message: "Role not found" });

        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.roleId = role.id;
        await user.save();

        return res.status(200).json({ message: "User role updated" });
    } catch (err) {
        next(err);
    }
};

export const createAdmin = async (req, res, next) => {
    const { username, email, password, adminKey } = req.body;

    if (adminKey !== process.env.ADMIN_CREATION_KEY) {
        return res.status(403).json({ message: "Invalid admin key" });
    }

    const role = await Role.findOne({
        where: { roleName: process.env.ADMIN_ROLE },
    });
    if (!role) return res.status(500).json({ message: "Admin role not found" });

    const existing = await User.findOne({ where: { email } });
    if (existing)
        return res.status(400).json({ message: "User already exists" });

    const newUser = await User.create({
        username,
        email,
        password,
        roleId: role.id,
    });
    res.status(201).json({ message: "Admin user created successfully" });
};
