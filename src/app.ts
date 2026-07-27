import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

import httpLogger from './common/logger/httpLogger';
import userRoutes from "./modules/user/user.routes";
import { errorHandler } from './common/middleware/error.middleware';
import authRoutes from './modules/auth/auth.routes';



const app = express();

//Logger
app.use(httpLogger);

// Security
app.use(helmet());

// Enable CORS
app.use(cors());

// Compress responses
app.use(compression());

// Parse JSON
app.use(express.json());

// Parse form data
app.use(express.urlencoded({ extended: true }));

// Health Check

app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
  });
});

app.use("/api/v1/users", userRoutes);

app.use(errorHandler);

app.use("/api/v1/auth", authRoutes);

app.use(errorHandler);

export default app;