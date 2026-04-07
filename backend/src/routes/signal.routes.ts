import { Router } from 'express';
import { BagsService } from '../services/bags.service';
import { RedisCache } from '../services/redis.service';

const router = Router();
const bagsService = new BagsService();
const cache = new RedisCache();
let lastFeedSnapshot: unknown[] = [];

function sendError(res: any, error: unknown, fallback = 'Unexpected error') {
  const status = typeof error === 'object' && error !== null && 'statusCode' in error
    ? Number((error as any).statusCode)
    : 500;
  
  let message = fallback;
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  } else if (typeof error === 'object' && error !== null && 'message' in error) {
    message = String((error as any).message);
  }
  
  return res.status(status).json({ error: message });
}

// GET /api/signals/feed - Get real-time token feed with scores
router.get('/feed', async (_req, res) => {
  try {
    const cacheKey = 'signal:feed';
    
    // Try to get from cache
    try {
      const cached = await cache.get(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          lastFeedSnapshot = parsed;
          return res.json(parsed);
        }
      }
    } catch (cacheError) {
      // Cache error, continue to fetch fresh data
      console.error('[Signal Feed] Cache parse error:', cacheError);
    }

    // Fetch fresh data from Bags API
    const feed = await bagsService.getTokenFeed();
    
    if (!Array.isArray(feed)) {
      throw new Error('Invalid feed data: not an array');
    }
    
    lastFeedSnapshot = feed;

    // Try to cache the result
    try {
      await cache.set(cacheKey, JSON.stringify(feed), 60);
    } catch (cacheError) {
      console.error('[Signal Feed] Cache write error:', cacheError);
    }

    res.json(feed);
  } catch (error) {
    console.error('[Signal Feed] Error:', error);
    
    // Return stale data if available
    if (lastFeedSnapshot.length > 0) {
      return res.set('X-Bags-Stale-Feed', '1').json(lastFeedSnapshot);
    }
    
    return sendError(res, error, 'Failed to fetch signal feed');
  }
});

// GET /api/signals/score/:tokenMint - Get AI score for specific token
router.get('/score/:tokenMint', async (req, res) => {
  try {
    const { tokenMint } = req.params;
    const score = await bagsService.getTokenScore(tokenMint);
    res.json(score);
  } catch (error) {
    return sendError(res, error, 'Failed to fetch token score');
  }
});

// GET /api/signals/alerts - Get user alert configuration
router.get('/alerts', async (req, res) => {
  try {
    const { walletAddress, threshold = 80 } = req.query;

    if (!walletAddress) {
      return res.status(400).json({ error: 'walletAddress required' });
    }

    const alerts = await bagsService.getUserAlerts(
      walletAddress as string,
      Number(threshold)
    );

    res.json(alerts);
  } catch (error) {
    return sendError(res, error, 'Failed to fetch alerts');
  }
});

export { router as signalRoutes };
