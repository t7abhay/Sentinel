import bcrypt from "bcrypt";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User, Role } from "../models/index.js";
import generateToken from "../utils/generateToken.js";
import { ApiError } from "../utils/apiError.js";

export const register = asyncHandler(async (req, res) => {
    /* 
    
    Some  input sanitization is needed
    */

    const { username, email, password, roleName } = req.body;

    if (
        [username, email, password, roleName].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All specified fields are required");
    }

    const role = await Role.findOne({ where: { name: roleName } });
    if (!role) {
        return res.status(400).json({ message: "Invalid role" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
        username,
        email,
        password: hashedPassword,
        roleId: role.id,
    });

    res.status(201).json({ message: "User registered", user });

    res.status(500).json({ message: error.message });
});

export const login = asyncHandler(async (req, res) => {
    /* 
    Input sanitization  is required 
    
    
    */
    const { email, password } = req.body;

    if ([email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(401, "Invalid Credentials");
    }

    const user = await User.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new ApiError(401, "Invalid credentials");
    }

    const token = generateToken(user.id);
    res.status(200).json({ message: "Login successful", token });
});
