import { Redis } from '@upstash/redis';
import { config } from '../utils/config';

export class RedisCache {
  private client: Redis | any = null;
  private isUpstash: boolean = false;

  constructor() {
    // Check if using Upstash REST API (production) or traditional Redis (local)
    if (config.UPSTASH_REDIS_REST_URL && config.UPSTASH_REDIS_REST_TOKEN) {
      // Upstash REST API (for serverless/production)
      this.client = new Redis({
        url: config.UPSTASH_REDIS_REST_URL,
        token: config.UPSTASH_REDIS_REST_TOKEN,
      });
      this.isUpstash = true;
      console.log('✅ Redis: Using Upstash REST API');
    } else if (config.REDIS_URL) {
      // Traditional Redis (for local development)
      const IORedis = require('ioredis');
      this.client = new IORedis(config.REDIS_URL);
      this.client.on('error', (err: Error) => {
        console.error('Redis error:', err);
      });
      console.log('✅ Redis: Using traditional Redis');
    } else {
      console.warn('⚠️ Redis: No Redis configuration found, caching disabled');
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.client) return null;
    
    try {
      const value = await this.client.get(key);
      return value as string | null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!this.client) return;
    
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
    if (!this.client) return;
    
    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Redis del error:', error);
    }
  }

  async disconnect(): Promise<void> {
    if (!this.client) return;
    
    // Upstash REST API doesn't need explicit disconnect
    if (!this.isUpstash && this.client && typeof this.client.quit === 'function') {
      await this.client.quit();
    }
  }
}
