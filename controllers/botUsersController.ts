import { Request, Response } from "express";
import moment from "moment";
import { Repositories } from "../repositories";
import { IBotUser } from "../types/botUser";
import { ResponseStatus } from "../types/response";

class BotUsersController {
  constructor(private repositories: Repositories) {}

  page = async (req: Request, res: Response) => {
    const botUsers = await this.repositories.botUsersRepository.getAll({});

    const correctBotUsers = botUsers.map((botUser) => ({
      ...botUser,
      createdAt: moment(botUser.createdAt).format("YYYY.MM.DD HH:mm"),
    }));

    res.render("botUsers.handlebars", {
      botUsers: correctBotUsers,
    });
  };

  update = async (req: Request, res: Response) => {
    try {
      const users = req.body.users as Omit<IBotUser, "createdAt">[];

      for (let user of users) {
        await this.repositories.botUsersRepository.updateBotUser({
          id: user.id,
          telegramId: user.telegramId,
          comment: user.comment,
        });
      }

      const botUsers = await this.repositories.botUsersRepository.getAll({});

      const correctBotUsers = botUsers.map((botUser) => ({
        ...botUser,
        createdAt: moment(botUser.createdAt).format("YYYY.MM.DD HH:mm"),
      }));

      return res.status(200).json({
        status: ResponseStatus.Success,
        data: correctBotUsers,
      });
    } catch (error) {
      console.log(error);

      return res.status(500).json({
        status: ResponseStatus.Error,
        data: {
          message: "Internal server error",
        },
      });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const body = req.body as Omit<IBotUser, "id" | "createdAt">;

      await this.repositories.botUsersRepository.createBotUser({
        telegramId: Number(body.telegramId),
        comment: body.comment,
      });

      const botUser = await this.repositories.botUsersRepository.getOne({
        telegramId: Number(body.telegramId),
        comment: body.comment,
      });

      return res.status(200).json({
        status: ResponseStatus.Success,
        data: botUser,
      });
    } catch (error) {
      console.log(error);

      return res.status(500).json({
        status: ResponseStatus.Error,
        data: {
          message: "Internal server error",
        },
      });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const botUserId = Number(req.body.botUserId);

      const botUser = await this.repositories.botUsersRepository.getOne({
        id: botUserId,
      });

      if (!botUser) {
        return res.status(404).json({
          status: ResponseStatus.Error,
          data: {
            message: "Bot user is not found",
          },
        });
      }

      await this.repositories.botUsersRepository.deleteBotUser(botUser);

      return res.status(200).json({
        status: ResponseStatus.Success,
        data: {
          message: "User has been successfully deleted",
        },
      });
    } catch (error) {
      console.log(error);

      return res.status(500).json({
        status: ResponseStatus.Error,
        data: {
          message: "Internal server error",
        },
      });
    }
  };
}

export { BotUsersController };
