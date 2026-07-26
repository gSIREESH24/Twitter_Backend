import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

import httpLogger from './common/logger/httpLogger';


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

export default app;