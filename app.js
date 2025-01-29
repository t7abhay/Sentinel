import express from "express";
import { connectDB } from "./config/DB/dbConnection.js";
import authRoutes from "./routes/auth/auth.route.js";
import userRoutes from "./routes/user.route.js";
import errorMiddleware from "./middlewares/errorMiddleware";
import { rateLimit } from "express-rate-limit";
const app = express();
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    message: "Rate limited",
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(limiter);
app.use(express.json());

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);

// Error Handling
app.use(errorMiddleware);

// Start the server
(async () => {
    await connectDB();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})();
