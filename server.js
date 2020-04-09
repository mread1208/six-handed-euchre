const express = require(`express`);
const bodyParser = require(`body-parser`);
const cookieParser = require(`cookie-parser`);
const session = require(`express-session`);
const morgan = require(`morgan`);
const app = express();
const server = require(`http`).Server(app);

const User = require(`./models/user`);
const io = require(`socket.io`)(server);

const port = 4300;

// set our application port
app.set(`port`, port);

// set morgan to log info about our requests for development use.
app.use(morgan(`dev`));

// initialize body-parser to parse incoming parameters requests to req.body
app.use(bodyParser.urlencoded({ extended: true }));

// initialize cookie-parser to allow us access the cookies stored in the browser.
app.use(cookieParser());

// initialize express-session to allow us track the logged-in user across sessions.
app.use(
    session({
        key: `user_sid`,
        secret: `somerandonstuffs`,
        resave: false,
        saveUninitialized: false,
        cookie: {
            expires: 600000,
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

// route for Home-Page
app.get(`/`, sessionChecker, (req, res) => {
    res.redirect(`/login`);
});

// route for user signup
app.route(`/signup`)
    .get(sessionChecker, (req, res) => {
        res.sendFile(`${__dirname}/public/signup.html`);
    })
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

// route for user Login
app.route(`/login`)
    .get(sessionChecker, (req, res) => {
        res.sendFile(`${__dirname}/public/login.html`);
    })
    .post((req, res) => {
        const { username, password } = req.body;
        User.findOne({ where: { username } }).then(function(user) {
            if (!user) {
                res.redirect(`/login`);
            } else if (!user.validPassword(password)) {
                res.redirect(`/login`);
            } else {
                req.session.user = user.dataValues;
                res.redirect(`/game-boards`);
            }
        });
    });

// route for game-boards
app.get(`/game-boards`, (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.sendFile(`${__dirname}/public/game-boards.html`);
    } else {
        res.redirect(`/login`);
    }
});

app.get(`/game/:id`, (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.sendFile(`${__dirname}/public/game.html`);
    } else {
        res.redirect(`/login`);
    }
});

// route for user logout
app.get(`/logout`, (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.clearCookie(`user_sid`);
        res.redirect(`/`);
    } else {
        res.redirect(`/login`);
    }
});

// route for handling 404 requests(unavailable routes)
app.use(function(req, res, next) {
    res.status(404).send(`Sorry can't find that!`);
});

// start the express server
app.listen(app.get(`port`), () => console.log(`App started on port ${app.get(`port`)}`));

// Socket IO stuff
io.on(`connection`, function(socket) {
    io.emit(`chat_message`, `a new user connected!`);
    socket.on(`chat_message`, function(msg) {
        io.emit(`chat_message`, msg);
    });
    socket.on(`join_room`, function(username) {
        io.emit(`chat_message`, `${username} joined`);
    });
});
