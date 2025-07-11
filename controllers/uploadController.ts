import { Request, Response } from "express";
import moment from "moment";
import { Repositories } from "../repositories";
import { IBotUser } from "../types/botUser";
import { ResponseStatus } from "../types/response";
import fs from "fs";
import path from "path";

class UploadController {
  constructor(private repositories: Repositories) {}

  upload = async (req: Request, res: Response) => {
    // Получаем файл (уверены, что он один)
    const file = req.files?.file;

    if (!file || Array.isArray(file)) {
      return res.status(400).json({
        status: ResponseStatus.Error,
        data: {
          message: "Please upload a single file",
        },
      });
    }

    // Создаем папку storage, если ее нет
    const storagePath = path.join(__dirname, "../storage");
    if (!fs.existsSync(storagePath)) {
      fs.mkdirSync(storagePath);
    }

    const filename = `${Date.now()}_${file.name}`;

    // Формируем путь для сохранения файла
    const filePath = path.join(storagePath, filename);

    // Перемещаем файл
    file.mv(filePath, (error: any) => {
      if (error) {
        console.log(error);

        return res.status(500).json({
          status: ResponseStatus.Error,
          data: {
            message: "Error uploading file",
          },
        });
      }

      this.repositories.CSVFilesRepository.uploadFile(path.resolve(__dirname, "../storage", filename), filename);

      return res.status(200).json({
        status: ResponseStatus.Success,
        data: {
          message: "File has been uploaded successfully",
        },
      });
    });
  };

  page = async (req: Request, res: Response) => {
    res.render("upload.handlebars");
  };
}

export { UploadController };
