import "express";
import { PoolConnection } from "mysql2/promise";

declare module "express" {
  export interface Request {
    connection: PoolConnection;
  }
}
