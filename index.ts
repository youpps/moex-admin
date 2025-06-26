import { config } from "dotenv";
import express, { Request, Response } from "express";
import fileUpload from "express-fileupload";
import * as handlebars from "express-handlebars";
import path from "path";
import { Controllers } from "./controllers";
import { createDatabase } from "./database";
import { Repositories } from "./repositories";
import { AuthMiddleware } from "./middleware/authMiddleware";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";

config();

const DB_HOST = process.env.DB_HOST || "";
const DB_PORT = process.env.DB_PORT || "";
const DB_PASSWORD = process.env.DB_PASSWORD || "";
const DB_DATABASE = process.env.DB_DATABASE || "";
const DB_USER = process.env.DB_USER || "";

const database = createDatabase({
  host: DB_HOST,
  port: DB_PORT,
  password: DB_PASSWORD,
  user: DB_USER,
  database: DB_DATABASE,
});

const repositories = new Repositories(database);
const controllers = new Controllers(repositories);

const app = express();

app.use(
  fileUpload({
    limits: { fileSize: 500 * 1024 * 1024 },
  })
);

app.use("/public", express.static("public"));
app.use(cookieParser());
app.use(express.json());

app.engine("handlebars", handlebars.engine({ defaultLayout: "main" }));
app.set("views", path.resolve(__dirname, "./views"));
app.set("view engine", "handlebars");

app.get("/", controllers.authController.loginGet as any);
app.get("/login", controllers.authController.loginGet as any);
app.post("/logout", controllers.authController.logoutPost as any);

app.post("/login", controllers.authController.loginPost as any);
app.get("/upload", AuthMiddleware.middleware as any, controllers.adminController.uploadGet as any);
app.post("/upload", AuthMiddleware.middleware as any, controllers.adminController.uploadPost as any);
app.get("/data", AuthMiddleware.middleware as any, controllers.adminController.dataGet as any);

console.log("moex_admin", "2)on(N91G8]TyXL3US£v");

app.listen(7020, () => {
  console.log("Server running on port 7020");
});
