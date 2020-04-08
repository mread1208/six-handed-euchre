const app = require(`express`)();
const http = require(`http`).createServer(app);
const io = require(`socket.io`)(http);

app.get(`/`, function(req, res) {
    res.sendFile(`${__dirname}/index.html`);
});

io.on(`connection`, function(socket) {
    socket.on(`chat message`, function(msg) {
        socket.broadcast.emit(`chat message`, msg);
    });
    io.emit(`connected message`, `a new user connected!`);

    // socket.on(`set nickname`, function(msg) {
    //     io.emit(`connected message`, `Nickname set: ${msg}`);
    // });
});

http.listen(4300, function() {
    console.log(`listening on *:4300`);
});
