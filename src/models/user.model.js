import { DataTypes } from "sequelize";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const UserModel = (sequelize) => {
    const User = sequelize.define(
        "User",
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
                validate: {
                    isEmail: true,
                },
            },
            password: {
                type: DataTypes.TEXT,
                allowNull: false,
                validate: {
                    len: [6, 100],
                },
            },
            refreshToken: {
                type: DataTypes.STRING,
                allowNull: true,
            },
        },
        {
            tableName: "users",
            timestamps: true,
        }
    );

    User.beforeCreate(async (user) => {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
    });

    User.beforeUpdate(async (user) => {
        if (user.changed("password")) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
        }
    });

    User.prototype.generateAccessToken = function () {
        return jwt.sign(
            { id: this.id, role: this.roleId },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
        );
    };

    User.prototype.generateRefreshToken = function () {
        return jwt.sign({ id: this.id }, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        });
    };

    User.prototype.isPasswordCorrect = async function (password) {
        return await bcrypt.compare(password, this.password);
    };

    return User;
};

export default UserModel;
