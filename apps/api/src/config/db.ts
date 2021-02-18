const mongoose = require("mongoose");
const options = {
    autoIndex: false, // Don't build indexes
    poolSize: 10, // Maintain up to 10 socket connections
    // If not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0,
    //geting rid off the depreciation errors
    useNewUrlParser: true,
    useUnifiedTopology: true,
};
const MONGOURI = "mongodb://127.0.0.1:27017/six-handed";

const InitiateMongoServer = async () => {
    try {
        await mongoose.connect(MONGOURI, options);
        console.log("Connected to DB !!");
    } catch (e) {
        console.log(e);
        throw e;
    }
};

module.exports = InitiateMongoServer;
