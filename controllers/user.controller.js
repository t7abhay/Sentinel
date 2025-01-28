import { User } from "../models/index.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import bcrypt from "bcrypt";

// Get user by ID
export const getUserById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const user = await User.findByPk(id, {
        attributes: ["id", "username", "email", "roleId"],
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    res.status(200).json(new ApiResponse(200, user));
});

// Update user details
export const updateUser = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { username, email, password } = req.body;

    const user = await User.findByPk(id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const updatedData = {};

    if (username) updatedData.username = username;
    if (email) updatedData.email = email;
    if (password) {
        updatedData.password = await bcrypt.hash(password, 10);
    }

    await user.update(updatedData);

    res.status(200).json(
        new ApiResponse(200, user, "User updated successfully")
    );
});

// Delete user
export const deleteUser = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    await user.destroy();

    res.status(200).json(
        new ApiResponse(200, null, "User deleted successfully")
    );
});
