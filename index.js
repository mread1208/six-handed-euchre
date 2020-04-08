const express = require(`express`);
const app = express();
const http = require(`http`).createServer(app);
const io = require(`socket.io`)(http);

let users = [];

app.get(`/`, function(req, res) {
    res.sendFile(`${__dirname}/index.html`);
});

app.use(`/static`, express.static(`${__dirname}/static`));

io.on(`connection`, function(socket) {
    console.log(`a new user connected!`);
    io.emit(`chat_message`, `a new user connected!`);
    socket.on(`chat_message`, function(msg) {
        io.emit(`chat_message`, msg);
    });
    socket.on(`join_room`, function(username) {
        users.push({ username });
        console.log(users);
        io.emit(`chat_message`, `${username} joined`);
    });
});

http.listen(4300, function() {
    console.log(`listening on *:4300`);
});
