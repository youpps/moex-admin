import { Repositories } from "../repositories";
import { AdminController } from "./adminController";
import { AuthController } from "./authController";

class Controllers {
  public adminController: AdminController;
  public authController: AuthController;
  
  constructor(repositories: Repositories) {
    this.adminController = new AdminController(repositories);
    this.authController = new AuthController(repositories);
  }
}

export { Controllers };
