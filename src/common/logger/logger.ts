import pino from 'pino';
import { env } from '../../config';

const isDevelopment = env.NODE_ENV === 'development';

const logger = pino({
  level: env.LOG_LEVEL,

  transport:
    isDevelopment
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
});

export default logger;