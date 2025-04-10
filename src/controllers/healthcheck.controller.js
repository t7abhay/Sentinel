import { ApiResponse } from "../utils/ApiResponse.js";
export const healthCheck = async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { message: "Service is up and running 🍎" },
                "Healthy"
            )
        );
};
