import mysql2 from "mysql2/promise";
import { IUser } from "../types/user";

const toSnakeCase = (string: string) => {
  return string
    .replace(/\W+/g, " ")
    .split(/ |\B(?=[A-Z])/)
    .map((word) => word.toLowerCase())
    .join("_");
};

class UsersRepository {
  constructor(private readonly pool: mysql2.Pool) {}

  async getOne(user: Partial<IUser>): Promise<IUser | null> {
    const users = await this.getAll(user);

    return users[0] ?? null;
  }

  async getAll(user: Partial<IUser>): Promise<IUser[]> {
    const keys = Object.keys(user);
    const where = keys.length ? `WHERE ` + keys.map((key) => `${toSnakeCase(key)} = :${key}`) : "";

    const [data]: any = await this.pool.query(
      `SELECT id, login, password_hash as passwordHash, created_at as createdAt FROM users ${where};`,
      user
    );

    return data;
  }
}

export { UsersRepository };
