import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

let transporter;

if (process.env.NODE_ENV === "development") {
  transporter = nodemailer.createTransport({
    host: "mailhog",
    port: 1025,
  });
} else if (process.env.NODE_ENV === "production") {
  // TODO: Create production transporter - configure mailgun
}

export default transporter;
