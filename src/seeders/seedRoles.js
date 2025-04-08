import { Role } from "../models/index.js";

export const seedDefaultRoles = async () => {
    const rolesFromEnv = process.env.ROLES?.split(",").map((role) =>
        role.trim()
    );

    const defaultRoles = rolesFromEnv?.length
        ? rolesFromEnv
        : ["admin", "moderator", "member"];

    for (const roleName of defaultRoles) {
        const [role, created] = await Role.findOrCreate({
            where: { roleName },
            defaults: { roleName },
        });

        if (created) {
            console.log(`✅ Role '${roleName}' created`);
        } else {
            console.log(`ℹ️ Role '${roleName}' already exists`);
        }
    }
};
