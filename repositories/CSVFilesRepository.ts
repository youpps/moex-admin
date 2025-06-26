import mysql2, { PoolConnection } from "mysql2/promise";
import { ICSVFile } from "../types/csvFile";
import fs from "fs";
import { pipeline } from "stream/promises";
import { Transform } from "stream";
import { parse } from "csv-parse";
import moment from "moment";

// Constants
const VALID_TAGS = [
  "MOEX (AUTO)",
  "Новость",
  "Торги",
  "Политика",
  "Пульс",
  "Фьючерсы",
  "Персона",
  "Народные облигации",
  "Общее мнение",
  "РЕКЛАМА",
  "Дивиденды",
  "Мероприятие",
  "Котировки",
  "Мошенники",
  "Выходные",
  "Ивестиции",
  "Авторские фонды",
  "Юмор",
  "Обучение",
  "ПИФы",
  "Comp",
  "Алготрейдинг",
  "R&A",
  "Приостановка торгов",
  "Набсовет",
  "Вакансия",
  "Moex Camp",
  "Сбой",
  "Суд",
];

const CSV_PARSER_OPTIONS = {
  delimiter: ";",
  quote: '"',
  relaxColumnCount: true,
  skipEmptyLines: true,
  skipRecordsWithError: true,
};

interface CSVRow {
  [key: string]: string;
}

class CSVProcessor {
  private csvFileId: number | null = null;

  constructor(
    private readonly filePath: string,
    private readonly fileName: string,
    private readonly pool: mysql2.Pool
  ) {}

  public async process(): Promise<void> {
    const connection = await this.pool.getConnection();

    try {
      await connection.beginTransaction();
      console.log("START OF UPLOADING");

      await this.insertCsvFileRecord(connection);
      await this.processCsvFile(connection);
      await connection.commit();
      console.log("END OF UPLOADING");
    } catch (error) {
      console.error("Error during CSV import:", error);
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  private async insertCsvFileRecord(connection: PoolConnection): Promise<void> {
    await connection.query("SET autocommit = 1");
    const [result] = await connection.execute("INSERT INTO csv_files (path) VALUES (?)", [this.fileName]);
    await connection.query("SET autocommit = 1");
    this.csvFileId = (result as any).insertId;
  }

  private async processCsvFile(connection: PoolConnection): Promise<void> {
    const readStream = fs.createReadStream(this.filePath);
    const csvParser = parse(CSV_PARSER_OPTIONS);
    const rowProcessor = this.createRowProcessor(connection);
    console.log("START PROCESSING");

    await pipeline(readStream, csvParser, rowProcessor);
  }

  private createRowProcessor(connection: PoolConnection): Transform {
    return new Transform({
      objectMode: true,
      transform: async (row: CSVRow, _, callback) => {
        try {
          if (this.shouldSkipRow(row)) {
            return callback();
          }

          await this.processRow(row, connection);
          callback();
        } catch (error) {
          callback(error as Error);
        }
      },
    });
  }

  private shouldSkipRow(row: CSVRow): boolean {
    return Object.keys(row).length < 20 || row[0] === "Дата";
  }

  private async processRow(row: CSVRow, connection: PoolConnection): Promise<void> {
    const lineData = this.prepareLineData(row);
    const tags = this.extractValidTags(row);

    const [result] = await connection.query(this.getInsertQuery(), lineData);

    await this.insertTags(connection, tags, (result as any).insertId);
  }

  private prepareLineData(row: CSVRow): Record<string, any> {
    const sourceTypes = [
      "Соцсети",
      "Мессенджеры каналы",
      "Мессенджеры чаты",
      "Форумы",
      "Блоги",
      "Онлайн-СМИ",
      "Микроблоги",
      "Видео",
      "Отзывы",
    ];
    const messageTypes = ["Пост", "Репост", "Комментарий", "Сообщество", "Репост с дополнением", "Stories"];
    const sexs = ["женский", "мужской"];
    const tonalities = ["нейтрально", "негатив", "позитив"];
    const objectRoles = ["Второстепенная", "Главная", "Не определена", "Эпизодическая"];
    const authorTypes = ["Сообщество", "Аккаунт СМИ", "Личный профиль"];

    return {
      date: moment(row[0], "DD.MM.YYYY HH:mm").toDate(),
      message_id: parseInt(row[1]),
      hash: row[2] || null,
      title: row[3] || null,
      text: row[4] || null,
      source: row[5] || null,
      url: row[6] || null,
      source_type: sourceTypes.includes(row[7]) ? row[7] : null,
      message_type: messageTypes.includes(row[8]) ? row[8] : null,
      plot: row[9] || null,
      author: row[10] || null,
      author_url: row[11] || null,
      author_type: authorTypes.includes(row[12]) ? row[12] : null,
      publication_place: row[13] || null,
      publication_place_url: row[14] || null,
      sex: sexs.includes(row[15]) ? row[15] : null,
      age: row[16] ? parseInt(row[16]) : null,
      auditorium: row[17] ? parseInt(row[17]) : null,
      comments: row[18] ? parseInt(row[18]) : null,
      media_citation: row[19] ? parseInt(row[19]) : null,
      reposts: row[20] ? parseInt(row[20]) : null,
      likes: row[21] ? parseInt(row[21]) : null,
      engagement: row[22] ? parseInt(row[22]) : null,
      views: row[23] ? parseInt(row[23]) : null,
      rate: row[24] ? parseInt(row[24]) : null,
      duplicates: row[25] ? parseInt(row[25]) : null,
      media_auditorium: row[26] ? parseInt(row[26]) : null,
      tonality: tonalities.includes(row[27]) ? row[27] : null,
      object_role: objectRoles.includes(row[28]) ? row[28] : null,
      country: row[30] || null,
      region: row[31] || null,
      city: row[32] || null,
      language: row[33] || null,
      is_processed: row[35] === "Да",
      csv_file_id: this.csvFileId,
    };
  }

  private extractValidTags(row: any): string[] {
    return VALID_TAGS.filter((tag) =>
      row.map((value: any) => value?.toString()?.toLowerCase()).includes(tag.toLowerCase())
    );
  }

  private getInsertQuery(): string {
    return `
      INSERT INTO csv_file_lines (
        message_id, date, hash, title, text, source, url, source_type, message_type,
        plot, author, author_url, author_type, publication_place, publication_place_url,
        sex, age, auditorium, comments, media_citation, reposts, likes, engagement,
        views, rate, duplicates, media_auditorium, tonality, object_role, country,
        region, city, language, is_processed, csv_file_id
      ) VALUES (
        :message_id, :date, :hash, :title, :text, :source, :url, :source_type, :message_type,
        :plot, :author, :author_url, :author_type, :publication_place, :publication_place_url,
        :sex, :age, :auditorium, :comments, :media_citation, :reposts, :likes, :engagement,
        :views, :rate, :duplicates, :media_auditorium, :tonality, :object_role, :country,
        :region, :city, :language, :is_processed, :csv_file_id
      )
    `;
  }

  private async insertTags(connection: PoolConnection, tags: string[], csvFileLineId: number): Promise<void> {
    await Promise.all(
      tags.map((tag) =>
        connection.query("INSERT INTO csv_file_line_tags(name, csv_file_line_id) VALUES (:name, :csv_file_line_id)", {
          name: tag,
          csv_file_line_id: csvFileLineId,
        })
      )
    );
  }
}

class CSVFilesRepository {
  constructor(private readonly pool: mysql2.Pool) {}

  public async getAll(): Promise<ICSVFile[]> {
    const [data] = await this.pool.query(
      "SELECT id, path, created_at as createdAt FROM csv_files ORDER BY created_at DESC;"
    );
    return data as ICSVFile[];
  }

  public async uploadFile(filePath: string, fileName: string): Promise<void> {
    const processor = new CSVProcessor(filePath, fileName, this.pool);
    await processor.process().catch(console.error);
  }
}

export { CSVFilesRepository };
