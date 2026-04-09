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

// GET /api/fees/wallet/:walletAddress - Get fee share configuration
router.get('/wallet/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const config = await bagsService.getFeeShareConfig(walletAddress);
    res.json(config);
  } catch (error) {
    return sendError(res, error, 'Failed to fetch fee config');
  }
});

// POST /api/fees/config - Configure fee share
router.post('/config', async (req, res) => {
  try {
    const configData = req.body;
    const result = await bagsService.configureFeeShare(configData);
    res.json(result);
  } catch (error) {
    return sendError(res, error, 'Failed to configure fee share');
  }
});

// GET /api/fees/claim-stats/:tokenMint - Get claim statistics
router.get('/claim-stats/:tokenMint', async (req, res) => {
  try {
    const { tokenMint } = req.params;
    const stats = await bagsService.getClaimStats(tokenMint);
    res.json(stats);
  } catch (error) {
    return sendError(res, error, 'Failed to fetch claim stats');
  }
});

// GET /api/fees/positions - Get claimable positions
router.get('/positions', async (req, res) => {
  try {
    const { walletAddress } = req.query;

    if (!walletAddress) {
      return res.status(400).json({ error: 'walletAddress required' });
    }

    const positions = await bagsService.getClaimablePositions(walletAddress as string);
    res.json(positions);
  } catch (error) {
    return sendError(res, error, 'Failed to fetch positions');
  }
});

// POST /api/fees/claim - Claim fees
router.post('/claim', async (req, res) => {
  try {
    const { tokenMint, walletAddress } = req.body;
    const result = await bagsService.claimFees(tokenMint, walletAddress);
    res.json(result);
  } catch (error) {
    return sendError(res, error, 'Failed to claim fees');
  }
});

export { router as feeRoutes };
