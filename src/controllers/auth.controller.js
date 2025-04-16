import { User, Role } from "../models/index.js";

import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const homeLander = asyncHandler(async (req, res) => {
    return res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Sentinel - Authentication Microservice</title>
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@3.3.2/dist/tailwind.min.css" rel="stylesheet">
      <link href="https://fonts.googleapis.com/css2?family=Montserrat&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Montserrat', sans-serif;
        }
        .text-primary-600 { color: #178a3e; }
        .text-primary-700 { color: #116c33; }
        .hover\\:text-primary-600:hover { color: #178a3e; }
        .hover\\:bg-primary-50:hover { background-color: #ecfdf5; }
        .bg-primary-600 { background-color: #178a3e; }
        .bg-primary-700 { background-color: #116c33; }
      </style>
    </head>
    <body class="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 font-sans text-gray-800">
      <header class="bg-white shadow-md">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div class="flex items-center space-x-2">
            <svg class="w-8 h-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
            </svg>
            <span class="text-2xl font-bold text-primary-700">Sentinel</span>
          </div>
          <nav class="hidden md:flex space-x-8">
            <a href="#features" class="hover:text-primary-600 transition-colors font-medium">Features</a>
            <a href="#technologies" class="hover:text-primary-600 transition-colors font-medium">Technologies</a>
            <a href="#docs" class="hover:text-primary-600 transition-colors font-medium">Documentation</a>
            <a href="#contact" class="hover:text-primary-600 transition-colors font-medium">Contact</a>
          </nav>
          <div class="md:hidden">
            <details class="relative">
              <summary class="cursor-pointer p-2">
                <svg class="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </summary>
              <div class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-2">
                <a href="#features" class="block px-4 py-2 hover:bg-primary-50">Features</a>
                <a href="#technologies" class="block px-4 py-2 hover:bg-primary-50">Technologies</a>
                <a href="#docs" class="block px-4 py-2 hover:bg-primary-50">Documentation</a>
                <a href="#contact" class="block px-4 py-2 hover:bg-primary-50">Contact</a>
              </div>
            </details>
          </div>
        </div>
      </header>

      <main class="max-w-5xl mx-auto px-4 py-20 text-center">
        <h1 class="text-4xl md:text-5xl font-bold text-primary-700 mb-6">Secure, Scalable Authentication</h1>
        <p class="text-lg md:text-xl text-gray-600 mb-8">Sentinel is your plug-and-play auth microservice designed for modern applications.</p>
        <a href="#docs" class="inline-block bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition">Read the Docs</a>
      </main>

      <footer class="text-center py-6 text-sm text-gray-500">
        &copy; ${new Date().getFullYear()} Sentinel. All rights reserved.
      </footer>
    </body>
    </html>
  `);
});

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
        return res.status(400).json(new ApiError(401, "Invalid credentials"));
    }

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const options = {
        httpOnly: true,
        // secure: true,
        // sameSite: "None",  // temp  coded   for local testing
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
            .status(400)
            .json(new ApiError(400, "Incorrect current password"));
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
