// import { config } from "../common/config/env.config";
// const GamesController = require("./controllers/games.controller");
// const PermissionMiddleware = require("../common/middlewares/auth.permission.middleware");
// const ValidationMiddleware = require("../common/middlewares/auth.validation.middleware");

// const FREE = config.permissionLevels.NORMAL_USER;

// exports.routesConfig = function(app) {
//     app.get("/api/games", [
//         ValidationMiddleware.validJWTNeeded,
//         PermissionMiddleware.minimumPermissionLevelRequired(FREE),
//         GamesController.list,
//     ]);
//     app.post("/api/games/create", [
//         ValidationMiddleware.validJWTNeeded,
//         PermissionMiddleware.minimumPermissionLevelRequired(FREE),
//         GamesController.insert,
//     ]);
//     app.get("/api/games/:gameId", [
//         ValidationMiddleware.validJWTNeeded,
//         PermissionMiddleware.minimumPermissionLevelRequired(FREE),
//         GamesController.getById,
//     ]);
// };
