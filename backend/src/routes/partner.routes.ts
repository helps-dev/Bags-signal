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

// GET /api/partners/stats - Get partner statistics
router.get('/stats', async (req, res) => {
  try {
    const { partnerWallet } = req.query;

    if (!partnerWallet) {
      return res.status(400).json({ error: 'partnerWallet required' });
    }

    const stats = await bagsService.getPartnerStats(partnerWallet as string);
    res.json(stats);
  } catch (error) {
    return sendError(res, error, 'Failed to fetch partner stats');
  }
});

// POST /api/partners/config - Register new partner
router.post('/config', async (req, res) => {
  try {
    const partnerData = req.body;
    const result = await bagsService.registerPartner(partnerData);
    res.json(result);
  } catch (error) {
    return sendError(res, error, 'Failed to register partner');
  }
});

export { router as partnerRoutes };
