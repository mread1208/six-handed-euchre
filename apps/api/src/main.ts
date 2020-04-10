import * as express from "express";

const config = require("./app/common/config/env.config.js");
const app = express();
const bodyParser = require("body-parser");

const AuthorizationRouter = require("./app/authorization/routes.config");
const UsersRouter = require("./app/users/routes.config");

app.get("/api", (req, res) => {
    res.send({ message: "Welcome to api!" });
});

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
    res.header("Access-Control-Expose-Headers", "Content-Length");
    res.header("Access-Control-Allow-Headers", "Accept, Authorization, Content-Type, X-Requested-With, Range");
    if (req.method === "OPTIONS") {
        return res.send(200);
    } else {
        return next();
    }
});

app.use(bodyParser.json());
AuthorizationRouter.routesConfig(app);
UsersRouter.routesConfig(app);

// route for handling 404 requests(unavailable routes)
app.use(function(req, res, next) {
    res.status(404).send(`Sorry can't find that!`);
});

const port = process.env.port || 3333;
const server = app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}/api`);
});
server.on("error", console.error);

const io = require(`socket.io`)(server);
// Socket IO stuff
io.on(`connection`, function(socket) {
    // io.emit(`chat_message`, `a new user connected!`);
    socket.on(`chat_message`, function(msg) {
        io.emit(`chat_message`, msg);
    });
    socket.on(`join_room`, function(username) {
        io.emit(`chat_message`, `${username} joined`);
    });
});
