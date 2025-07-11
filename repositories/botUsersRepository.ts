import mysql2 from "mysql2/promise";
import { IBotUser } from "../types/botUser";

const toSnakeCase = (string: string) => {
  return string
    .replace(/\W+/g, " ")
    .split(/ |\B(?=[A-Z])/)
    .map((word) => word.toLowerCase())
    .join("_");
};

class BotUsersRepository {
  constructor(private readonly pool: mysql2.Pool) {}

  async getOne(botUser: Partial<IBotUser>): Promise<IBotUser | null> {
    const users = await this.getAll(botUser);

    return users[0] ?? null;
  }

  async getAll(botUser: Partial<IBotUser>): Promise<IBotUser[]> {
    const keys = Object.keys(botUser);
    const where = keys.length ? `WHERE ` + keys.map((key) => `${toSnakeCase(key)} = :${key}`).join(" AND ") : "";

    const [data]: any = await this.pool.query(
      `SELECT id, telegram_id as telegramId, comment, created_at as createdAt FROM bot_users ${where};`,
      botUser
    );

    return data;
  }

  async createBotUser(botUser: Pick<IBotUser, "telegramId" | "comment">) {
    const connection = await this.pool.getConnection();

    try {
      await connection.query(`INSERT INTO bot_users(telegram_id, comment) VALUES(:telegramId, :comment);`, botUser);
      await connection.query(
        `INSERT INTO moex_bot.users (id, role_id, active_menu_id, keyboard_menu)
VALUES (?, 2, 1, 'root')
ON DUPLICATE KEY UPDATE
    role_id = VALUES(role_id),
    active_menu_id = VALUES(active_menu_id)
    keyboard_menu = VALUES(keyboard_menu);`,
        [botUser.telegramId]
      );

      await connection.commit();
    } catch (e) {
      console.log(e);
      await connection.rollback();
    } finally {
      connection.release();
    }
  }

  async updateBotUser(botUser: Pick<IBotUser, "id" | "telegramId" | "comment">) {
    const [data]: any = await this.pool.query(
      `UPDATE bot_users SET telegram_id = :telegramId, comment = :comment WHERE id = :id;`,
      botUser
    );

    return data;
  }

  async deleteBotUser(botUser: IBotUser) {
    const connection = await this.pool.getConnection();

    try {
      await connection.query(`DELETE FROM bot_users WHERE id = ? LIMIT 1;`, [botUser.id]);
      await connection.query(
        `UPDATE moex_bot.users
SET role_id = 1, active_menu_id = 1, keyboard_menu = 'root'
WHERE id = ?;`,
        [botUser.telegramId]
      );

      await connection.commit();
    } catch (e) {
      console.log(e);
      await connection.rollback();
    } finally {
      connection.release();
    }
  }
}

export { BotUsersRepository };
