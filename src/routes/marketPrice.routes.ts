import { Router } from 'express';
import { getLatestPrices, getPriceHistory, createMarketPrice } from '../controllers/marketPrice.controller';
import { auth } from '../middleware/auth.midleware'; 

const router = Router();

// Public route to get prices
router.get('/latest', auth, getLatestPrices);
router.get('/history', auth, getPriceHistory);

// Route for users to submit new price
router.post('/', auth, createMarketPrice);

export default router;
