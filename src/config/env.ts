import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  PORT: z.coerce.number().default(3000),
  LOG_LEVEL: z.string().default('info'),
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.string(),
  DATABASE_URL: z.string(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables');
  console.error(parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;