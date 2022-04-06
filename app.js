import morgan from "morgan";
import express from "express";
import sanitizeMongo from "express-mongo-sanitize";
import connect from "./startup/connect.js";
import giftsRouter from "./routes/gifts.js";
import peopleRouter from "./routes/people.js";
import authRouter from "./routes/auth/user.js";
import handleError from "./middleware/errorHandler.js";

// connect to mongoDB
connect();
// define app
const app = express();

// app.use(morgan('combined'));
app.use(express.json());
app.use(sanitizeMongo());

// ROUTES

app.use("/api/people", peopleRouter);
app.use("/api/gifts", giftsRouter);
app.use("/auth", authRouter);

//error Handler
app.use(handleError);

export default app;
