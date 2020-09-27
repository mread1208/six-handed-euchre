import { config } from "../common/config/env.config";
const UsersController = require("./controllers/users.controller");
const UsersPermissionMiddleware = require("../common/middlewares/auth.permission.middleware");
const UsersValidationMiddleware = require("../common/middlewares/auth.validation.middleware");

const ADMIN = config.permissionLevels.ADMIN;
const PAID = config.permissionLevels.PAID_USER;
const FREEUSER = config.permissionLevels.NORMAL_USER;

exports.routesConfig = function(app) {
    app.post("/api/sign-up", [UsersController.insert]);
    app.get("/api/users", [
        UsersValidationMiddleware.validJWTNeeded,
        UsersPermissionMiddleware.minimumPermissionLevelRequired(PAID),
        UsersController.list,
    ]);
    app.get("/api/users/:userId", [
        UsersValidationMiddleware.validJWTNeeded,
        UsersPermissionMiddleware.minimumPermissionLevelRequired(FREEUSER),
        UsersPermissionMiddleware.onlySameUserOrAdminCanDoThisAction,
        UsersController.getById,
    ]);
    app.patch("/api/users/:userId", [
        UsersValidationMiddleware.validJWTNeeded,
        UsersPermissionMiddleware.minimumPermissionLevelRequired(FREEUSER),
        UsersPermissionMiddleware.onlySameUserOrAdminCanDoThisAction,
        UsersController.patchById,
    ]);
    app.delete("/api/users/:userId", [
        UsersValidationMiddleware.validJWTNeeded,
        UsersPermissionMiddleware.minimumPermissionLevelRequired(ADMIN),
        UsersController.removeById,
    ]);
};
