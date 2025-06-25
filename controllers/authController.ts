import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { Repositories } from "../repositories";
import { ResponseStatus } from "../types/response";
import { JWT } from "../utils/jwt";

class AuthController {
  constructor(private repositories: Repositories) {}

  loginGet = (req: Request, res: Response) => res.render("login.handlebars");

  loginPost = async (req: Request, res: Response) => {
    try {
      const { login, password } = req.body;

      if (!login || !password) {
        res.status(400).json({
          status: ResponseStatus.Error,
          data: {
            message: "Login and password are required",
          },
        });

        return;
      }

      const user = await this.repositories.usersRepository.getOne({
        login,
      });

      if (!user) {
        res.status(401).json({
          status: ResponseStatus.Error,
          data: {
            message: "Invalid credentials",
          },
        });

        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

      if (!isPasswordValid) {
        res.status(401).json({
          status: ResponseStatus.Error,
          data: {
            message: "Invalid credentials",
          },
        });
        return;
      }

      // Генерируем JWT токен
      const token = JWT.generateToken({
        userId: user.id,
        login: user.login,
      });

      // Устанавливаем токен в HTTP-only куки
      res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // В продакшене только через HTTPS
        maxAge: 3600000 * 24 * 7, // 7 дней
        sameSite: "strict",
      });

      res.status(200).json({
        status: ResponseStatus.Success,
        data: {
          message: "Login successful",
        },
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        status: ResponseStatus.Error,
        data: {
          message: "Internal server error",
        },
      });
    }
  };

  async logout(req: Request, res: Response) {
    try {
      // Очищаем JWT куки
      res.clearCookie("jwt");

      return res.status(200).json({
        status: ResponseStatus.Success,
        data: {
          message: "Logout successful",
        },
      });
    } catch (error) {}
  }
}

export { AuthController };
