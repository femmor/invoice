import chalk from "chalk";
import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import connectDB from "./config/connectDB.js";

import { morganMiddleware, systemLogs } from "./utils/Logger.js";

dotenv.config();
const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(morganMiddleware);

app.get("/", (req, res) => {
  res.json({
    Hi: "Welcome to the Invoice app",
  });
});

const PORT = process.env.PORT || 5005;

const startApp = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      systemLogs.info(
        `Server: Running in ${process.env.NODE_ENV} mode on port ${PORT}`
      );
    });
  } catch (error) {
    systemLogs.error(`Something went wrong when starting the server: ${error}`);
  }
};

startApp();
