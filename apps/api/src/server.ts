import {} from "dotenv/config";
import validateEnv from "./utils/validateEnv";
import App from "./app";
import UsersController from "./users/users.controller";

// Validate configs
validateEnv();

console.log(`MONGO_USER: ${process.env.MONGO_USER}`);
const app = new App([new UsersController()]);
app.listen();
