import App from "./app";
import UsersController from "./users/users.controller";

const port = process.env.port || 3333;
const app = new App([new UsersController()]);

app.listen();
