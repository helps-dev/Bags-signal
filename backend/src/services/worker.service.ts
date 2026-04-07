import { BagsService } from './bags.service';
import { RedisCache } from './redis.service';
import { WebSocketManager } from '../websocket/websocket.manager';
import { logger } from '../utils/logger';

export class BackgroundWorker {
  private bagsService: BagsService;
  private cache: RedisCache;
  private wsManager: WebSocketManager;
  private interval: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor(bagsService: BagsService, cache: RedisCache, wsManager: WebSocketManager) {
    this.bagsService = bagsService;
    this.cache = cache;
    this.wsManager = wsManager;
  }

  start(intervalMs: number = 30000): void {
    if (this.isRunning) return;
    this.isRunning = true;

    logger.info('Background worker started', { intervalMs });
    
    this.interval = setInterval(async () => {
      try {
        await this.pollSignals();
      } catch (error) {
        logger.error('Background worker poll error', error as Error);
      }
    }, intervalMs);

    // Run immediately on start
    this.pollSignals().catch(err => logger.error('Initial poll error', err));
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isRunning = false;
    logger.info('Background worker stopped');
  }

  private async pollSignals(): Promise<void> {
    logger.debug('Polling signals...');
    
    try {
      // Fetch fresh feed
      const feed = await this.bagsService.getTokenFeed();
      
      if (!feed || feed.length === 0) return;

      const cacheKey = 'signal:feed';
      const oldFeedStr = await this.cache.get(cacheKey);
      const newFeedStr = JSON.stringify(feed);

      // Only broadcast if data changed
      if (oldFeedStr !== newFeedStr) {
        logger.info('Signals updated, broadcasting to clients', { count: feed.length });
        
        // Update cache
        await this.cache.set(cacheKey, newFeedStr, 60);
        
        // Broadcast to websocket
        this.wsManager.broadcast('signals', feed);
      }
    } catch (error) {
      throw error;
    }
  }
}
