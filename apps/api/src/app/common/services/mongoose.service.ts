const mongoose = require("mongoose");
let count = 0;

const options = {
    autoIndex: false, // Don't build indexes
    poolSize: 10, // Maintain up to 10 socket connections
    // If not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0,
    //geting rid off the depreciation errors
    useNewUrlParser: true,
    useUnifiedTopology: true,
};
const connectWithRetry = () => {
    console.log("MongoDB connection with retry");
    mongoose
        .connect("mongodb://127.0.0.1:27017/six-handed", options)
        .then(() => {
            console.log("MongoDB is connected");
        })
        .catch(err => {
            console.log("MongoDB connection unsuccessful, retry after 5 seconds. ", ++count);
            setTimeout(connectWithRetry, 5000);
        });
};

connectWithRetry();

exports.mongoose = mongoose;