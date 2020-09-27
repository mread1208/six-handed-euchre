const usersUserModel = require("../models/users.model");
const usersCrypto = require("crypto");

exports.insert = (req, res) => {
    const salt = usersCrypto.randomBytes(16).toString("base64");
    const hash = usersCrypto
        .createHmac("sha512", salt)
        .update(req.body.password)
        .digest("base64");
    req.body.password = salt + "$" + hash;
    req.body.permissionLevel = 1;
    usersUserModel
        .createUser(req.body)
        .then(result => {
            res.status(201).send({ id: result._id });
        })
        .catch(err => res.status(403).send(err));
};

exports.list = (req, res) => {
    let limit = req.query.limit && req.query.limit <= 100 ? parseInt(req.query.limit) : 10;
    let page = 0;
    if (req.query) {
        if (req.query.page) {
            req.query.page = parseInt(req.query.page);
            page = Number.isInteger(req.query.page) ? req.query.page : 0;
        }
    }
    usersUserModel.list(limit, page).then(result => {
        res.status(200).send(result);
    });
};

exports.getById = (req, res) => {
    usersUserModel.findById(req.params.userId).then(result => {
        res.status(200).send(result);
    });
};
exports.patchById = (req, res) => {
    if (req.body.password) {
        const salt = usersCrypto.randomBytes(16).toString("base64");
        const hash = usersCrypto
            .createHmac("sha512", salt)
            .update(req.body.password)
            .digest("base64");
        req.body.password = salt + "$" + hash;
    }

    usersUserModel.patchUser(req.params.userId, req.body).then(result => {
        res.status(204).send({});
    });
};

exports.removeById = (req, res) => {
    usersUserModel.removeById(req.params.userId).then(result => {
        res.status(204).send({});
    });
};
