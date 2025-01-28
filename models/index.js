import { sequelize } from "../config/DB/dbConnection.js";
import User from "./user.model.js";
import Role from "./role.model.js";

User.init(sequelize);

if (Role) {
    Role.init(sequelize);
}

if (Role) {
    User.belongsTo(Role, { foreignKey: "roleId" });
    Role.hasMany(User, { foreignKey: "roleId" });
}

export { sequelize, User, Role };
