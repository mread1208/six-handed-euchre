import * as express from "express";

const app = express();

app.get("/api", (req, res) => {
    res.send({ message: "Welcome to api!" });
});

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
