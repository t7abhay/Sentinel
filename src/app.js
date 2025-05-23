import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import morgan from "morgan";
import { seedDefaultRoles } from "./seeders/seedRoles.js";
import { sequelize } from "./config/DB/dbConnection.js";
import session from "express-session";
import authRouter from "./routes/auth.route.js";
import healthRouter from "./routes/healthcheck.route.js";

import cookieParser from "cookie-parser";
dotenv.config();

const app = express();
app.set("trust proxy", 1);
const corsConfig = {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    secure: true,
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
            secure: process.env.NODE_ENV === "production",
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
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/auth", healthRouter);

sequelize
    .authenticate()
    .then(() => {
        console.log("Database connected successfully");
        return sequelize.sync();
    })
    .then(() => {
        console.log("Models synced");
        return seedDefaultRoles();
    });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
    console.log(`Server is listening on: ${process.env.PORT}`)
);
