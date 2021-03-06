
import * as bcrypt from 'bcrypt';
import { Request, Response, NextFunction, Router } from 'express';
import * as jwt from 'jsonwebtoken';
import WrongCredentialsException from '../exceptions/WrongCredentialsException';
import Controller from '../interfaces/controller.interface';
import DataStoredInToken from '../interfaces/dataStoredInToken';
import TokenData from '../interfaces/tokenData.interface';
import validationMiddleware from '../middleware/validation.middleware';
import CreateUserDto from '../user/user.dto';
import User from '../user/user.interface';
import userModel from '../user/user.model';
import AuthenticationService from './authentication.service';
import LogInDto from './logIn.dto';

class AuthenticationController implements Controller {
  public path = '/auth';
  public router = Router();
  public authenticationService = new AuthenticationService();
  private user = userModel;
  private authorizationTokenHeader = "Authorization-Token";

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/register`, validationMiddleware(CreateUserDto), this.registration);
    this.router.get(`${this.path}/login`, this.loggingIn);
  }

  private registration = async (request: Request, response: Response, next: NextFunction) => {
    const userData: CreateUserDto = request.body;
    try {
      const {
        tokenData,
        user,
      } = await this.authenticationService.register(userData);
      response.setHeader(this.authorizationTokenHeader, tokenData.token);
      // Don't send the password back with the response!
      user.password = undefined;
      response.send(user);
    } catch (error) {
      next(error);
    }
  }

  private loggingIn = async (request: Request, response: Response, next: NextFunction) => {
    // Get the Auth Header (Base64 encoded)
    const b64auth = (request.headers.authorization || '').split(' ')[1] || '';
    // Parse into variables
    const [email, password] = Buffer.from(b64auth, 'base64').toString().split(':')
    const logInData: LogInDto = {email, password}
    const user = await this.user.findOne({ email: logInData.email });
    if (user) {
      const isPasswordMatching = await bcrypt.compare(
        logInData.password,
        user.get('password', null, { getters: false }),
      );
      if (isPasswordMatching) {
        const tokenData = this.authenticationService.createToken(user);
        response.setHeader(this.authorizationTokenHeader, tokenData.token);
        // Don't send the password back with the response!
        user.password = undefined;
        response.status(201).send(user);
      } else {
        next(new WrongCredentialsException());
      }
    } else {
      next(new WrongCredentialsException());
    }
  }
}

export default AuthenticationController;