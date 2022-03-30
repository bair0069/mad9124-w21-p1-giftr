import mongoose from "mongoose";
import log from './logger.js';

export default function () {
  mongoose
    .connect("mongodb://localhost:27017/giftr", { useNewUrlParser: true })
    .then(() => {
      log.info("Connected to MongoDB");
    })
    .catch((err) => {
      log.error("Error connecting to MongoDB", err);
      process.exit(1);
    });
}
