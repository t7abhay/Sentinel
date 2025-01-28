import { DataTypes } from "sequelize";
import { sequelize } from "../config/DB/dbConnection.js";

const Role = sequelize.define("Role", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

export default Role;
