import { DataTypes } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const RoleModel = (sequelize) => {
    const Role = sequelize.define(
        "Role",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            roleName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            tableName: "roles",
            timestamps: false,
        }
    );

    return Role;
};

const roleEnvVars = [
    process.env.ADMIN_ROLE,
    process.env.MODERATOR_ROLE,
    process.env.MEMBER_ROLE,
];

export const initializeRoles = async () => {
    for (const roleName of roleEnvVars) {
        if (!roleName) continue;

        const [role, created] = await Role.findOrCreate({
            where: { roleName },
            defaults: { roleName },
        });

        if (created) {
            console.log(` Role '${roleName}' created`);
        } else {
            console.log(` Role '${roleName}' already exists`);
        }
    }
};

export default RoleModel;
