import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as mongoose from 'mongoose';
import Controller from './interfaces/controller.interface';
import errorMiddleware from './middleware/error.middleware';
import { Server } from "http";

const mongooseOptions = {
  maxPoolSize: 50, 
  wtimeoutMS: 2500,
  useNewUrlParser: true
};
class App {
  public app: express.Application;

  constructor(controllers: Controller[]) {
    this.app = express();

    this.connectToTheDatabase();
    this.initializeMiddlewares();
    this.initializeCorsHeaders();
    this.initializeControllers(controllers);
    this.initializeErrorHandling();
  }

  public listen(): Server {
    const server = this.app.listen(process.env.PORT, () => {
      console.log(`App listening on the port ${process.env.PORT}`);
    });

    return server;
  }

  public getServer() {
    return this.app;
  }

  private initializeMiddlewares() {
    // TODO: Maybe don't need this?
    // this.app.use(bodyParser.json());
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }
  private initializeCorsHeaders() {
    // Headers
    this.app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "http://localhost:4200");
        res.header("Access-Control-Allow-Credentials", "true");
        res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
        res.header("Access-Control-Expose-Headers", "Content-Length, Authorization-Token");
        res.header("Access-Control-Allow-Headers", "Accept, Authorization, Content-Type, X-Requested-With, Range");
        if (req.method === "OPTIONS") {
            return res.send(200);
        } else {
            return next();
        }
    });
  }

  private initializeControllers(controllers: Controller[]) {
    controllers.forEach((controller) => {
      this.app.use('/api', controller.router);
    });
  }

  private connectToTheDatabase() {
    const {
      MONGO_USER,
      MONGO_PASSWORD,
      MONGO_PATH,
    } = process.env;
    // mongoose.connect(`mongodb://${MONGO_USER}:${MONGO_PASSWORD}${MONGO_PATH}`);
    mongoose.connect(`mongodb://${MONGO_PATH}`, mongooseOptions);

  }
}

export default App;
