const mongoose = require("../../common/services/mongoose.service").mongoose;
const Schema = mongoose.Schema;

const gameSchema = new Schema({
    gameName: String,
});

gameSchema.virtual("id").get(function() {
    return this._id.toHexString();
});

// Ensure virtual fields are serialised.
gameSchema.set("toJSON", {
    virtuals: true,
});

gameSchema.findById = function(cb) {
    return this.model("Game").find({ id: this.id }, cb);
};

const Game = mongoose.model("Game", gameSchema);

exports.findById = id => {
    return Game.findById(id).then(result => {
        result = result.toJSON();
        delete result._id;
        delete result.__v;
        return result;
    });
};

exports.createGame = gameData => {
    const game = new Game(gameData);
    return game.save();
};

exports.list = (perPage, page) => {
    return new Promise((resolve, reject) => {
        Game.find()
            .limit(perPage)
            .skip(perPage * page)
            .exec(function(err, game) {
                if (err) {
                    reject(err);
                } else {
                    resolve(game);
                }
            });
    });
};
