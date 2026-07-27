import app from './app';
import logger from './common/logger/logger';
import { env } from './config';

app.listen(env.PORT, () => {
  logger.info(`🚀 Server started on port ${env.PORT}`);
});