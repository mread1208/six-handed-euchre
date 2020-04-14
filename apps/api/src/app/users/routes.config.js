const UsersController = require("./controllers/users.controller");
const PermissionMiddleware = require("../common/middlewares/auth.permission.middleware");
const ValidationMiddleware = require("../common/middlewares/auth.validation.middleware");
const config = require("../common/config/env.config");

const ADMIN = config.permissionLevels.ADMIN;
const PAID = config.permissionLevels.PAID_USER;
const FREE = config.permissionLevels.NORMAL_USER;

exports.routesConfig = function(app) {
    app.post("/api/sign-up", [UsersController.insert]);
    app.get("/api/users", [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.minimumPermissionLevelRequired(PAID),
        UsersController.list,
    ]);
    app.get("/api/users/:userId", [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.minimumPermissionLevelRequired(FREE),
        PermissionMiddleware.onlySameUserOrAdminCanDoThisAction,
        UsersController.getById,
    ]);
    app.patch("/api/users/:userId", [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.minimumPermissionLevelRequired(FREE),
        PermissionMiddleware.onlySameUserOrAdminCanDoThisAction,
        UsersController.patchById,
    ]);
    app.delete("/api/users/:userId", [
        ValidationMiddleware.validJWTNeeded,
        PermissionMiddleware.minimumPermissionLevelRequired(ADMIN),
        UsersController.removeById,
    ]);
};
