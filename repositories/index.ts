import mysql2 from "mysql2/promise";
import { CSVFilesRepository } from "./CSVFilesRepository";
import { UsersRepository } from "./usersRepository";
import { BotUsersRepository } from "./botUsersRepository";
import { ProfessionalSourcesRepository } from "./professionalSourcesRepository";

class Repositories {
  public CSVFilesRepository: CSVFilesRepository;
  public usersRepository: UsersRepository;
  public botUsersRepository: BotUsersRepository;
  public professionalSourcesRepository: ProfessionalSourcesRepository;

  constructor(pool: mysql2.Pool) {
    this.CSVFilesRepository = new CSVFilesRepository(pool);
    this.usersRepository = new UsersRepository(pool);
    this.botUsersRepository = new BotUsersRepository(pool);
    this.professionalSourcesRepository = new ProfessionalSourcesRepository(pool);
  }
}

export { Repositories };
