import config from "config";
import mongoose from "mongoose";
import log from "./logger.js";
const dbConfig = config.get("db");
export default function () {
  mongoose
    .connect(`mongodb://${dbConfig.host}:${dbConfig.port}/${dbConfig.dbName}`, {
      useNewUrlParser: true,
    })
    .then(() => {
      log.info("Connected to MongoDB...");
    })
    .catch((err) => {
      log.error("Error connecting to MongoDB...", err);
      process.exit(1);
    });
}
