import { NextFunction, Request, Response, Router } from "express";
import HttpException from "../exceptions/HttpException";
import validationMiddleware from '../middleware/validation.middleware';
import CreateUserDto from './users.dto';
import User from "./users.interface";
import userModel from "./users.model";

class UsersController {
    public path = "/users";
    public router = Router();
    private user = userModel;

    constructor() {
        this.intializeRoutes();
    }

    public intializeRoutes() {
        this.router.get(this.path, this.getAllUsers);
        this.router.get(`${this.path}/:id`, this.getUserById);
        this.router.patch(`${this.path}/:id`, validationMiddleware(CreateUserDto, true), this.modifyUser);
        this.router.delete(`${this.path}/:id`, this.deleteUser);
        this.router.post(this.path, validationMiddleware(CreateUserDto), this.createUser);
    }

    private getAllUsers = (request: Request, response: Response) => {
        this.user.find().then(users => {
            response.send(users);
        });
    };

    private getUserById = (request: Request, response: Response, next: NextFunction) => {
        const id = request.params.id;
        this.user
            .findById(id)
            .then(user => {
                if (user) {
                    response.send(user);
                } else {
                    next(new HttpException(404, "User not found"));
                }
            })
            .catch(err => {
                next(new HttpException(404, "User not found"));
            });
    };

    private modifyUser = (request: Request, response: Response) => {
        const id = request.params.id;
        const userData: User = request.body;
        this.user.findByIdAndUpdate(id, userData, { new: true }).then(user => {
            response.send(user);
        });
    };

    private createUser = (request: Request, response: Response) => {
        const userData: User = request.body;
        const createdUser = new this.user(userData);
        createdUser.save().then(savedUser => {
            response.send(savedUser);
        });
    };

    private deleteUser = (request: Request, response: Response) => {
        const id = request.params.id;
        this.user.findByIdAndDelete(id).then(successResponse => {
            if (successResponse) {
                response.send(200);
            } else {
                response.send(404);
            }
        });
    };
}

export default UsersController;
