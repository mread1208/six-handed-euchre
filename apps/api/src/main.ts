/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import * as express from "express";
import * as session from "express-session";
import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as morgan from "morgan";
import User from "./app/models/user";

const app = express();
const server = require(`http`).Server(app);
const io = require(`socket.io`)(server);

// set morgan to log info about our requests for development use.
app.use(morgan(`dev`));

// initialize body-parser to parse incoming parameters requests to req.body
app.use(bodyParser.urlencoded({ extended: true }));

// initialize cookie-parser to allow us access the cookies stored in the browser.
app.use(cookieParser());

// initialize express-session to allow us track the logged-in user across sessions.
app.use(
    session({
        // key: `user_sid`,
        secret: `somerandonstuffs`,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 600000,
        },
    })
);

// This middleware will check if user's cookie is still saved in browser and user is not set, then automatically log the user out.
// This usually happens when you stop your express server after login, your cookie still remains saved in the browser.
app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie(`user_sid`);
    }
    next();
});

// middleware function to check for logged-in users
const sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        res.redirect(`/game-boards`);
    } else {
        next();
    }
};

// route for handling 404 requests(unavailable routes)
app.use(function(req, res, next) {
    res.status(404).send(`Sorry can't find that!`);
});

app.get("/api", (req, res) => {
    res.send({ message: "Welcome to api!" });
});

app.route(`/signup`)
    // .get(sessionChecker, (req, res) => {
    //     res.sendFile(`${__dirname}/public/signup.html`);
    // })
    .post((req, res) => {
        User.create({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
        })
            .then(user => {
                req.session.user = user.dataValues;
                res.redirect(`/game-boards`);
            })
            .catch(error => {
                res.redirect(`/signup`);
            });
    });

const port = process.env.port || 3333;
server.listen(port, () => {
    console.log(`Listening at http://localhost:${port}/api`);
});
server.on("error", console.error);

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
