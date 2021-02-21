import {} from "dotenv/config";
import { Server } from "http";
import validateEnv from "./utils/validateEnv";
import App from "./app";
import Game from "./game";
import UserController from "./user/user.controller";
import AuthenticationController from "./authentication/authentication.controller";

// Validate configs
validateEnv();

// Start the app
const app = new App([new UserController(), new AuthenticationController()]);
const server: Server = app.listen();

// Startup the Game
const game = new Game(server);
game.init();
