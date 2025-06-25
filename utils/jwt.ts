import jwt from "jsonwebtoken";
import { IJwtPayload } from "../types/jwt";

class JWT {
  static generateToken(payload: IJwtPayload): string {
    const secret = process.env.JWT_SECRET || "";
    const expiresIn: any = process.env.JWT_EXPIRES_IN || "7d";

    return jwt.sign(payload, secret, { expiresIn });
  }

  static verifyToken(token: string): IJwtPayload {
    const secret = process.env.JWT_SECRET || "";
    return jwt.verify(token, secret) as IJwtPayload;
  }
}

export { JWT };
