export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (
            !req.user ||
            !req.user.role ||
            !allowedRoles.includes(req.user.role.roleName)
        ) {
            return res
                .status(403)
                .json({ error: "You do not have permission" });
        }
        next();
    };
};
