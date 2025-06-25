import { NextFunction, Request, Response } from "express";
import { ResponseStatus } from "../types/response";
import { JWT } from "../utils/jwt";

class AuthMiddleware {
  static middleware(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.jwt;

      if (!token) {
        return res.redirect("/login");
      }

      JWT.verifyToken(token);

      next();
    } catch (error) {
      console.log(error);

      return res.redirect("/login");
    }
  }
}

export { AuthMiddleware };
