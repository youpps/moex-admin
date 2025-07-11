import { Request, Response } from "express";
import moment from "moment";
import { Repositories } from "../repositories";

class DataController {
  constructor(private repositories: Repositories) {}

  page = async (req: Request, res: Response) => {
    const csvFiles = await this.repositories.CSVFilesRepository.getAll();

    const correctCsvFiles = csvFiles.map((csvFile) => ({
      path: csvFile.path,
      createdAt: moment(csvFile.createdAt).format("YYYY.MM.DD HH:mm"),
    }));

    res.render("data.handlebars", {
      csvFiles: correctCsvFiles,
    });
  };
}

export { DataController };
