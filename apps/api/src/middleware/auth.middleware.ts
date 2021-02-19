import { NextFunction, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import AuthenticationTokenMissingException from '../exceptions/AuthenticationTokenMissingException';
import WrongAuthenticationTokenException from '../exceptions/WrongAuthenticationTokenException';
import DataStoredInToken from '../interfaces/dataStoredInToken';
import RequestWithUser from '../interfaces/requestWithUser.interface';
import userModel from '../user/user.model';
 
async function authMiddleware(request: RequestWithUser, response: Response, next: NextFunction) {
  if (request.header("Authorization-Token")) {
    try {
        const authToken = request.header("Authorization-Token");
        const secret = process.env.JWT_SECRET;
        const verificationResponse = jwt.verify(authToken, secret) as DataStoredInToken;
        const id = verificationResponse._id;
        const user = await userModel.findById(id);
        // Only get user data if the JWT User ID matches the Request
        // Prevents User A from getting User B data
        if (user && request.params["id"] === id) {
          request.user = user;
          next();
        } else {
          next(new WrongAuthenticationTokenException());
        }
      } catch (error) {
        next(new WrongAuthenticationTokenException());
      }
    } else {
      next(new AuthenticationTokenMissingException());
    }
}
 
export default authMiddleware;