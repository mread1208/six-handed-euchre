const express = require(`express`);
const session = require(`express-session`);
const bodyParser = require(`body-parser`);

const app = express();
const http = require(`http`).createServer(app);
const io = require(`socket.io`)(http);
const port = 4300;

const users = [];

app.use(session({ secret: `ssshhhhh` }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(`/static`, express.static(`${__dirname}/static`));

let sess; // global session, NOT recommended

app.get(`/`, function(req, res) {
    sess = req.session;
    if (!sess.userName) {
        console.log("redirect");
        res.redirect(`/login`);
    }
    res.sendFile(`${__dirname}/index.html`);
});

app.get(`/login`, function(req, res) {
    res.sendFile(`${__dirname}/login.html`);
});
app.post(`/loginUser`, function(req, res) {
    sess = req.session;
    console.log(req.body.username);
    req.session.userName = req.body.username;
    res.redirect(`/`);
});

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

http.listen(port, function() {
    console.log(`listening on *:${port}`);
});
