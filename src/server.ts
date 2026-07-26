import app from './app';
import logger from './common/logger/logger';

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
});