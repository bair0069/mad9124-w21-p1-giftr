import morgan from 'morgan';
import express from 'express';
import sanitizeMongoose from 'express-mongoose-sanitize';
import connect from './startup/connect.js';
import peopleRouter from './routes/people.js';
//import router for gifts
//import router for auth

connect();





