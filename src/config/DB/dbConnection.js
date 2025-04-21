import { Sequelize } from "sequelize";
import { loadCACert } from "./loadCert.js";
import dotenv from "dotenv";
dotenv.config();

const caCert = loadCACert();
export const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,

    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: process.env.DB_DIALECT,
        dialectOptions: {
            ssl: {
                required: true,
                ca: caCert,
                rejectUnauthorized: false,
            },
        },
        logging: false,
    }
);

export const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log("Database connected successfully.");
    } catch (error) {
        console.error("Unable to connect to the database:", error.message);
        process.exit(1);
    }
};
