const GameModel = require("../models/game.model");

exports.list = (req, res) => {
    let limit = req.query.limit && req.query.limit <= 100 ? parseInt(req.query.limit) : 10;
    let page = 0;
    if (req.query) {
        if (req.query.page) {
            req.query.page = parseInt(req.query.page);
            page = Number.isInteger(req.query.page) ? req.query.page : 0;
        }
    }
    GameModel.list(limit, page).then(result => {
        res.status(200).send(result);
    });
};

exports.insert = (req, res) => {
    GameModel.createGame(req.body)
        .then(result => {
            res.status(201).send({ id: result._id });
        })
        .catch(err => res.status(403).send(err));
};

exports.getById = (req, res) => {
    GameModel.findById(req.params.gameId).then(result => {
        res.status(200).send(result);
    });
};
