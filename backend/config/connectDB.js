import chalk from "chalk";
import mongoose from "mongoose";
import { systemLogs } from "../utils/Logger.js";

const connectDB = async () => {
  try {
    const connectionParams = {
      dbName: process.env.DB_NAME,
    };
    await mongoose.connect(process.env.MONGO_URI, connectionParams);
    console.log(`${chalk.green.bold(`Connected to MongoDB successfully!`)}`);
    systemLogs.info(`MongoDB connected successfully!`);
  } catch (error) {
    console.error(`${chalk.red.bold(`Error: ${error.message}`)}`);
    process.exit(1);
  }
};

export default connectDB;
