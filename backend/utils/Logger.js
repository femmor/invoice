import morgan from "morgan";
import { createLogger, format, transports } from "winston";
import "winston-daily-rotate-file";

const { combine, timestamp, prettyPrint } = format;

const dailyRotateFileTransport = new transports.DailyRotateFile({
  dirname: "logs",
  filename: "combined-%DATE%.log",
  datePattern: "YYYY-MM-DD-HH",
  maxFiles: "14d",
});

export const systemLogs = createLogger({
  level: "info",
  format: combine(
    timestamp({
      format: "YYYY-MM-DD hh:mm:ss.SSS A",
    }),
    prettyPrint()
  ),
  transports: [
    dailyRotateFileTransport,
    new transports.File({
      level: "error",
      filename: "logs/errors.log",
    }),
  ],
  exceptionHandlers: [
    new transports.File({
      filename: "logs/exceptions.log",
    }),
  ],
  rejectionHandlers: [
    new transports.File({
      filename: "logs/rejections.log",
    }),
  ],
});

export const morganMiddleware = morgan(
  function (tokens, req, res) {
    return JSON.stringify({
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: Number.parseFloat(tokens.status(req, res)),
      content_length: tokens.res(req, res, "content-length"),
      response_time: Number.parseFloat(tokens["response-time"](req, res)),
      userAgent: req.headers["user-agent"],
    });
  },
  {
    stream: {
      write: function (message) {
        const data = JSON.parse(message);
        systemLogs.http(`incoming-request: ${data}`);
      },
    },
  }
);
