import chalk from "chalk";
import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";

dotenv.config();
const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const PORT = process.env.PORT || 5005;

app.listen(PORT, () => {
  console.log(
    [`Server: `] +
      chalk.green.bold(
        `Running in ${chalk.yellow(
          process.env.NODE_ENV
        )} on port ${chalk.yellow.bold(PORT)}`
      )
  );
});
