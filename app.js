import express from "express";
import { connectDB } from "./config/DB/dbConnection.js";
import authRoutes from "./routes/auth/auth.route.js";
import userRoutes from "./routes/user.route.js";
import errorMiddleware from "./middlewares/errorMiddleware";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
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
