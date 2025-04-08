import { sequelize } from "../config/DB/dbConnection.js";
import UserFactory from "./user.model.js";
import RoleFactory from "./role.model.js";

const User = UserFactory(sequelize);
const Role = RoleFactory(sequelize);

Role.hasMany(User, { foreignKey: "roleId", as: "users" });
User.belongsTo(Role, { foreignKey: "roleId", as: "role" });

export { sequelize, User, Role };
