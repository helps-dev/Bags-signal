import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(val => parseInt(val, 10)).default(3001),
  BAGS_API_KEY: z.string().min(1, 'BAGS_API_KEY is required'),
  BAGS_API_BASE_URL: z.string().url().default('https://public-api-v2.bags.fm/api/v1'),
  REDIS_URL: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  AI_SERVICE_URL: z.string().url().default('http://localhost:8000'),
  ALLOWED_ORIGINS: z.string().optional(),
  SOLANA_RPC_URL: z.string().url().optional(),
  HELIUS_RPC_URL: z.string().url().default('https://mainnet.helius-rpc.com'),
  HELIUS_API_KEY: z.string().optional(),
  BIRDEYE_API_KEY: z.string().optional(),
});

export type Config = z.infer<typeof configSchema>;

function validateConfig(): Config {
  try {
    return configSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingKeys = error.issues.map((err) => err.path.join('.')).join(', ');
      console.error(`❌ Invalid environment variables: ${missingKeys}`);
      process.exit(1);
    }
    throw error;
  }
}

export const config = validateConfig();
