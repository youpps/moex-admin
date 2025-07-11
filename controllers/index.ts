import { Repositories } from "../repositories";
import { AuthController } from "./authController";
import { BotUsersController } from "./botUsersController";
import { DataController } from "./dataController";
import { ProfessionalSourcesController } from "./professionalSourcesController";
import { UploadController } from "./uploadController";

class Controllers {
  public dataController: DataController;
  public authController: AuthController;
  public botUsersController: BotUsersController;
  public uploadController: UploadController;
  public professionalSourcesController: ProfessionalSourcesController;

  constructor(repositories: Repositories) {
    this.dataController = new DataController(repositories);
    this.authController = new AuthController(repositories);
    this.botUsersController = new BotUsersController(repositories);
    this.uploadController = new UploadController(repositories);
    this.professionalSourcesController = new ProfessionalSourcesController(repositories)
  }
}

export { Controllers };
