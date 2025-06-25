import mysql2 from "mysql2/promise";
import { CSVFilesRepository } from "./CSVFilesRepository";
import { UsersRepository } from "./usersRepository";

class Repositories {
  public CSVFilesRepository: CSVFilesRepository;
  public usersRepository: UsersRepository;

  constructor(pool: mysql2.Pool) {
    this.CSVFilesRepository = new CSVFilesRepository(pool);
    this.usersRepository = new UsersRepository(pool);
  }
}

export { Repositories };
