import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db/dbConnection.js";

class User extends Model {}

User.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },

        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        role: {
            type: DataTypes.STRING,
            defaultValue: "user",
        },
        isVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },

    {
        sequelize: sequelize,
        modelName: "User",
    }
);

export default User;
