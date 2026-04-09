import { Router } from 'express';
import { BagsService } from '../services/bags.service';

const router = Router();
const bagsService = new BagsService();

function sendError(res: any, error: unknown, fallback = 'Unexpected error') {
  const status = typeof error === 'object' && error !== null && 'statusCode' in error
    ? Number((error as any).statusCode)
    : 500;
  const message = error instanceof Error ? error.message : fallback;
  return res.status(status).json({ error: message });
}

// GET /api/tokens/launch-feed - Get token launch feed
router.get('/launch-feed', async (_req, res) => {
  try {
    const feed = await bagsService.getTokenLaunchFeed();
    res.json(feed);
  } catch (error) {
    return sendError(res, error, 'Failed to fetch launch feed');
  }
});

// GET /api/tokens/:tokenMint/details - Get token details
router.get('/:tokenMint/details', async (req, res) => {
  try {
    const { tokenMint } = req.params;
    const details = await bagsService.getTokenDetails(tokenMint);
    res.json(details);
  } catch (error) {
    return sendError(res, error, 'Failed to fetch token details');
  }
});

// POST /api/tokens/launch - Launch new token
router.post('/launch', async (req, res) => {
  try {
    const launchData = req.body;
    const result = await bagsService.launchToken(launchData);
    res.json(result);
  } catch (error) {
    return sendError(res, error, 'Failed to launch token');
  }
});

// GET /api/tokens/:tokenMint/lifetime-fees - Get lifetime fees for token
router.get('/:tokenMint/lifetime-fees', async (req, res) => {
  try {
    const { tokenMint } = req.params;
    const fees = await bagsService.getLifetimeFees(tokenMint);
    res.json(fees);
  } catch (error) {
    return sendError(res, error, 'Failed to fetch lifetime fees');
  }
});

export { router as tokenRoutes };
