import mysql2 from "mysql2/promise";
import { IProfessionalSource } from "../types/professionalSource";

const toSnakeCase = (string: string) => {
  return string
    .replace(/\W+/g, " ")
    .split(/ |\B(?=[A-Z])/)
    .map((word) => word.toLowerCase())
    .join("_");
};

class ProfessionalSourcesRepository {
  constructor(private readonly pool: mysql2.Pool) {}

  async getOne(professionalSource: Partial<IProfessionalSource>): Promise<IProfessionalSource | null> {
    const users = await this.getAll(professionalSource);

    return users[0] ?? null;
  }

  async getAll(professionalSource: Partial<IProfessionalSource>): Promise<IProfessionalSource[]> {
    const keys = Object.keys(professionalSource);
    const where = keys.length ? `WHERE ` + keys.map((key) => `${toSnakeCase(key)} = :${key}`).join(" AND ") : "";

    const [data]: any = await this.pool.query(
      `SELECT link, created_at as createdAt FROM professional_sources ${where};`,
      professionalSource
    );

    return data;
  }

  async createProfessionalSource(professionalSource: Pick<IProfessionalSource, "link">) {
    const [data]: any = await this.pool.query(
      `INSERT INTO professional_sources(link) VALUES(:link);`,
      professionalSource
    );

    return data;
  }

  async deleteProfessionalSource(link: string) {
    const [data]: any = await this.pool.query(`DELETE FROM professional_sources WHERE link = ? LIMIT 1;`, [link]);

    return data;
  }
}

export { ProfessionalSourcesRepository };
