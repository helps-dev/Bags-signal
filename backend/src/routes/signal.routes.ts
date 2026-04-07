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
  const message = error instanceof Error ? error.message : fallback;
  return res.status(status).json({ error: message });
}

// GET /api/signals/feed - Get real-time token feed with scores
router.get('/feed', async (_req, res) => {
  try {
    const cacheKey = 'signal:feed';
    const cached = await cache.get(cacheKey);

    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) {
        lastFeedSnapshot = parsed;
      }
      return res.json(parsed);
    }

    const feed = await bagsService.getTokenFeed();
    lastFeedSnapshot = feed;

    await cache.set(cacheKey, JSON.stringify(feed), 60);

    res.json(feed);
  } catch (error) {
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
