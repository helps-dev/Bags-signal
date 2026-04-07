import { Redis } from '@upstash/redis';
import { config } from '../utils/config';

export class RedisCache {
  private client: Redis;

  constructor() {
    // Check if using Upstash REST API or traditional Redis
    if (config.UPSTASH_REDIS_REST_URL && config.UPSTASH_REDIS_REST_TOKEN) {
      // Upstash REST API (for serverless/free tier)
      this.client = new Redis({
        url: config.UPSTASH_REDIS_REST_URL,
        token: config.UPSTASH_REDIS_REST_TOKEN,
      });
    } else {
      throw new Error('Upstash Redis credentials not found. Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN');
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      const value = await this.client.get(key);
      return value as string | null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    try {
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Redis del error:', error);
    }
  }

  async disconnect(): Promise<void> {
    // Upstash REST API doesn't need explicit disconnect
    return Promise.resolve();
  }
}
