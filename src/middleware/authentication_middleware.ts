import { RequestWithJWTBody, JWTBody } from "../dto/jwt";
import { RequestHandler } from "express";
import jwt from 'jsonwebtoken';

export const authenticationMiddleware: RequestHandler = async (req:RequestWithJWTBody, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    var authorized = false;
    try {
      const jwtBody = jwt.verify(token || '', process.env.ENCRYPTION_KEY!!) as JWTBody;
      req.jwtBody = jwtBody;
      if (jwtBody.userId) {
        authorized = true;
      }
    } catch (error) {
      console.log("token failed validation")        
    } finally {
        if(authorized) {
            next();
        } else {
            res.status(401).json({ message: "Unauthorized"});
            return;
        }
    }
  }