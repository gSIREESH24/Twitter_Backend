import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

import httpLogger from './common/logger/httpLogger';
import userRoutes from "./modules/user/user.routes";
import { errorHandler } from './common/middleware/error.middleware';
import authRoutes from './modules/auth/auth.routes';
import tweetRoutes from './modules/tweet/tweet.routes';
import followRoutes from './modules/follow/follow.routes';
import likeRoutes from './modules/like/like.routes';
import feedRoutes from './modules/feed/feed.routes';
import commentRoutes from './modules/comment/comment.routes';
import searchRoutes from './modules/search/search.routes';
import notificationRoutes from './modules/notification/notification.routes';
import mediaRoutes from './modules/media/media.routes';
import retweetRoutes from './modules/retweet/retweet.routes';
import hashtagRoutes from './modules/hashtag/hashtag.routes';



import promBundle from 'express-prom-bundle';

const app = express();

// Prometheus Metrics Middleware
const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  includeStatusCode: true,
  includeUp: true,
  promClient: {
    collectDefaultMetrics: {}
  }
});
app.use(metricsMiddleware);

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

app.use("/api/v1/auth", authRoutes);

app.use("/api/v1/tweets", tweetRoutes);


app.use("/api/v1/users", followRoutes);

app.use("/api/v1/tweets", likeRoutes);
app.use("/api/v1/tweets", retweetRoutes);

app.use("/api/v1/feed", feedRoutes);

app.use("/api/v1", commentRoutes);

app.use("/api/v1/search", searchRoutes);

app.use("/api/v1/notifications", notificationRoutes);

app.use("/api/v1/media", mediaRoutes);
app.use("/api/v1/hashtags", hashtagRoutes);

app.use(errorHandler);

export default app;