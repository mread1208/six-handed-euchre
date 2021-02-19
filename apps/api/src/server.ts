import {} from "dotenv/config";
import validateEnv from "./utils/validateEnv";
import App from "./app";
import UserController from "./user/user.controller";
import AuthenticationController from "./authentication/authentication.controller";

// Validate configs
validateEnv();
const app = new App([new UserController(), new AuthenticationController()]);
const server = app.listen();
