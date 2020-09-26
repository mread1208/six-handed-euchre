const validationJwt = require("jsonwebtoken"),
    validationSecret = require("../config/env.config").jwt_secret,
    validationCrypto = require("crypto");

exports.verifyRefreshBodyField = (req, res, next) => {
    if (req.body && req.body.refresh_token) {
        return next();
    } else {
        return res.status(400).send({ error: "need to pass refresh_token field" });
    }
};

exports.validRefreshNeeded = (req, res, next) => {
    const b = new Buffer(req.body.refresh_token, "base64");
    const refresh_token = b.toString();
    const hash = validationCrypto
        .createHmac("sha512", req.jwt.refreshKey)
        .update(req.jwt.userId + validationSecret)
        .digest("base64");
    if (hash === refresh_token) {
        req.body = req.jwt;
        return next();
    } else {
        return res.status(400).send({ error: "Invalid refresh token" });
    }
};

exports.validJWTNeeded = (req, res, next) => {
    if (req.headers["authorization"]) {
        try {
            const authorization = req.headers["authorization"].split(" ");
            if (authorization[0] !== "Bearer") {
                return res.status(401).send();
            } else {
                req.jwt = validationJwt.verify(authorization[1], validationSecret);
                return next();
            }
        } catch (err) {
            return res.status(403).send();
        }
    } else {
        return res.status(401).send();
    }
};
