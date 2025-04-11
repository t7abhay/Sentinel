import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import morgan from "morgan";
import { seedDefaultRoles } from "./seeders/seedRoles.js";
import lusca from "lusca";
import { sequelize } from "./config/DB/dbConnection.js";
import session from "express-session";
import authRoutes from "./routes/auth.route.js";
import healthCheck from "./routes/healthcheck.route.js";
import { notFound, errorHandler } from "./middlewares/errorMiddleware.js";
import cookieParser from "cookie-parser";
dotenv.config();

const app = express();
app.set("trust proxy", 1);
const corsConfig = {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
};
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per window
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: "Rate limited",
});

app.use(
    session({
        secret: process.env.SESSION_SECRET || "your-secret-key",
        resave: false,
        saveUninitialized: true,
        cookie: {
            secure: process.env.NODE_ENV === "development",
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24, // 1 day
        },
    })
);
app.use(limiter);
app.use(helmet());
app.use(cors(corsConfig));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cookieParser());

app.use(lusca.csrf());
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/auth", healthCheck);

sequelize
    .authenticate()
    .then(() => {
        console.log("Database connected successfully");
        return sequelize.sync({ alter: true });
    })
    .then(() => {
        console.log("Models synced");
        return seedDefaultRoles();
    });

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
    console.log(`Server is listening on: ${process.env.PORT}`)
);
