import { Request, Response } from "express";
import moment from "moment";
import { Repositories } from "../repositories";
import { IProfessionalSource } from "../types/professionalSource";
import { ResponseStatus } from "../types/response";

class ProfessionalSourcesController {
  constructor(private repositories: Repositories) {}

  page = async (req: Request, res: Response) => {
    const professionalSources = await this.repositories.professionalSourcesRepository.getAll({});

    const correctProfessionalSources = professionalSources.map((professionalSource) => ({
      ...professionalSource,
      createdAt: moment(professionalSource.createdAt).format("YYYY.MM.DD HH:mm"),
    }));

    res.render("professionalSources.handlebars", {
      professionalSources: correctProfessionalSources,
    });
  };

  create = async (req: Request, res: Response) => {
    try {
      const body = req.body as Omit<IProfessionalSource, "createdAt">;

      await this.repositories.professionalSourcesRepository.createProfessionalSource({
        link: body.link,
      });

      const professionalSource = await this.repositories.professionalSourcesRepository.getOne({
        link: body.link,
      });

      return res.status(200).json({
        status: ResponseStatus.Success,
        data: professionalSource,
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
      const link = req.body.link as string;

      await this.repositories.professionalSourcesRepository.deleteProfessionalSource(link);

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

export { ProfessionalSourcesController };
