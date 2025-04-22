import { User, Role } from "../models/index.js";

import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const register = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    if ([email, username, password].some((field) => field?.trim() === "")) {
        return res
            .status(400)
            .json(new ApiError(400, "All fields are required"));
    }

    if (password.length < 6) {
        return res
            .status(400)
            .json(new ApiError(400, "Password length must be > 6"));
    }

    const userExists = await User.findOne({ where: { email } });

    if (userExists) {
        return res
            .status(409)
            .json(new ApiError(409, "Email already registered."));
    }

    const defaultRole = await Role.findOne({
        where: { roleName: process.env.DEFAULT_ROLE },
    });

    if (!defaultRole) {
        return res
            .status(500)
            .json(
                new ApiError(
                    500,
                    "Default role not found. Please initialize roles."
                )
            );
    }
    const user = await User.create({
        username,
        email,
        password,
        roleId: defaultRole.id,
    });

    return res
        .status(201)
        .json(new ApiResponse(200, user, "User registered successfully  "));
});

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res
            .status(400)
            .json(new ApiError(400, "Email and password are required."));
    }

    const user = await User.findOne({ where: { email }, include: "role" });
    if (!user) {
        return res.status(404).json(new ApiError(404, "Account not found"));
    }

    const isMatch = await user.isPasswordCorrect(password);

    if (!isMatch) {
        return res.status(401).json(new ApiError(401, "Invalid credentials"));
    }

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
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
});

export const logout = asyncHandler(async (req, res) => {
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
            .json(new ApiResponse(200, {}, "User already logged out "));
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
});

export const getMyProfile = asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ["password"] },
        include: "role",
    });

    if (!user) {
        return res.status(400).json(new ApiError(400, "Unauthorized"));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User fetched successfully"));
});

export const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(req.user.id);
    const isMatch = await user.isPasswordCorrect(currentPassword);

    if (!isMatch) {
        return res
            .status(401)
            .json(new ApiError(401, "Incorrect current password"));
    }

    if (newPassword === currentPassword) {
        return res
            .status(409)
            .json(
                new ApiError(
                    409,
                    "Current password and new password are same, Use different password"
                )
            );
    }

    user.password = newPassword;
    await user.save();

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password updated successfully"));
});

export const updateUserRole = asyncHandler(async (req, res) => {
    const { roleId } = req.body;
    const { id } = req.params;

    const role = await Role.findByPk(roleId);
    if (!role) {
        return res.status(404).json(new ApiError(404, "Role not found"));
    }

    const user = await User.findByPk(id);
    if (!user) {
        return res.status(404).json(new ApiError(404, "User not found"));
    }

    user.roleId = role.id;
    await user.save();

    return res.status(200).json(new ApiResponse(201, {}, "User  role updated"));
});

export const createAdmin = async (req, res, next) => {
    const { username, email, password, adminKey } = req.body;

    if (adminKey !== process.env.ADMIN_CREATION_KEY) {
        return res.status(403).json(new ApiError(403, "Invalid admin key"));
    }

    const role = await Role.findOne({
        where: { roleName: process.env.ADMIN_ROLE },
    });

    if (!role) {
        return res.status(500).json(new ApiError(500, "Admin role not found"));
    }

    const existing = await User.findOne({ where: { email } });

    if (existing) {
        return res.status(409).json(new ApiError(400, "User already exists"));
    }

    const newUser = await User.create({
        username,
        email,
        password,
        roleId: role.id,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, newUser, "Admin user created successfully"));
};

export const refreshToken = asyncHandler(async (req, res) => {
    const clientRefreshToken = req.cookies?.refreshToken;

    console.log(`\n\n\n\n${clientRefreshToken}🍎🍎🍎🍎🍎🍎🍎🍎🍎🍎🍎\n\n\n`);

    if (!clientRefreshToken) {
        return res
            .status(401)
            .json(new ApiError(401, "Refresh token not provided"));
    }

    const user = await User.findOne({
        where: { refreshToken: clientRefreshToken },
    });

    if (!user) {
        return res.status(401).json(new ApiError(401, "Invalid refresh token"));
    }

    const accessToken = await user.generateAccessToken();

    return res.status(200).json({
        accessToken,
    });
});
