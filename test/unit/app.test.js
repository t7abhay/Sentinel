import request from "supertest";
import express from "express";
import bodyParser from "body-parser";
import authRoutes from "../src/routes/auth.routes.js";
import db from "../src/db/index.js";

const app = express();
app.use(bodyParser.json());
app.use("/api/v1/auth", authRoutes);

beforeAll(async () => {
    await db.sync({ force: true }); // Resets DB before test run
});

describe("Authentication Routes", () => {
    test("Registers a user", async () => {
        const res = await request(app).post("/api/v1/auth/register").send({
            username: "testuser",
            email: "test@example.com",
            password: "secret",
            roleId: 1,
        });

        expect(res.statusCode).toBe(201);
        expect(res.body.user.username).toBe("testuser");
    });

    test("Rejects invalid login", async () => {
        const res = await request(app).post("/api/v1/auth/login").send({
            email: "test@example.com",
            password: "wrongpass",
        });

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe("Invalid email or password");
    });

    test("Allows correct login", async () => {
        const res = await request(app).post("/api/v1/auth/login").send({
            email: "test@example.com",
            password: "secret",
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.user.email).toBe("test@example.com");
        expect(res.body.token).toBeDefined();
    });
});
