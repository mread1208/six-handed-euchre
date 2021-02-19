import {} from "dotenv/config";
import validateEnv from "./utils/validateEnv";
import App from "./app";
import UsersController from "./users/users.controller";

// Validate configs
validateEnv();
const app = new App([new UsersController()]);
app.listen();
