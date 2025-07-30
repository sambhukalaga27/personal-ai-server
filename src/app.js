import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middlewares/error.middlewares.js';
import healthcheckRouter from './routes/healthcheck.routes.js';
import userRouter from './routes/user.routes.js';
import llmRouter from './routes/llm.routes.js';
import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Defining express app object
const app = express();

// Setting Middlewares
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json({limit: '16kb'}));
app.use(express.urlencoded({extended: true, limit: '16kb'}));
app.use(express.static('public')); // for serving static files in the directory public
app.use(cookieParser());

// Routes
app.use('/api/v1/healthcheck', healthcheckRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/llm', llmRouter);

// Root Path GET
app.get('/', ( req, res ) => {
  return res.status(200).json({
    service: 'Custom AI Backend',
    author: 'Nikhil Gajam',
    message: 'This is a secure API for interacting with a custom AI model.',
    github: 'https://github.com/nikhilgajam',
    youtube: 'https://youtube.com/nikhiltech'
  });
});


// Error Handling
app.use(errorHandler);

export { app };
