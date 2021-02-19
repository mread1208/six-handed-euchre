import * as express from "express";
import * as mongoose from "mongoose";
import * as bodyParser from "body-parser";

const mongooseOptions = {
    autoIndex: false, // Don't build indexes
    poolSize: 10, // Maintain up to 10 socket connections
    // If not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0,
    //geting rid off the depreciation errors
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

class App {
    public app: express.Application;

    constructor(controllers) {
        this.app = express();

        this.connectToTheDatabase();
        this.initializeMiddlewares();
        this.initializeControllers(controllers);
    }

    public listen() {
        this.app.listen(process.env.PORT, () => {
            console.log(`App listening on the port ${process.env.PORT}`);
        });
    }

    private initializeMiddlewares() {
        this.app.use(bodyParser.json());
    }

    private initializeControllers(controllers) {
        controllers.forEach(controller => {
            this.app.use("/api", controller.router);
        });
    }

    private connectToTheDatabase() {
        const { MONGO_USER, MONGO_PASSWORD, MONGO_PATH } = process.env;
        mongoose.connect(`mongodb://${MONGO_PATH}`, mongooseOptions);
    }
}

export default App;
