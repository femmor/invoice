import chalk from "chalk";
import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import connectDB from "./config/connectDB.js";
import mongoSanitize from "express-mongo-sanitize";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import { morganMiddleware, systemLogs } from "./utils/Logger.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(morganMiddleware);

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to our API!",
  });
});

// Auth routes
app.use("/api/v1/auth", authRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5005;

const startApp = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      systemLogs.info(
        chalk.green.bold(
          `Server: Running in ${process.env.NODE_ENV} mode on port ${PORT}`
        )
      );
    });
  } catch (error) {
    systemLogs.error(
      chalk.red(`Something went wrong when starting the server: ${error}`)
    );
  }
};

startApp();
