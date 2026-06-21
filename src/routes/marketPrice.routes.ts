import { Router } from 'express';
import { getLatestPrices, getPriceHistory } from '../controllers/marketPrice.controller';
import { auth } from '../middleware/auth.midleware'; // Ensure this exists, or use directly without auth if public
import { scrapeTepbacPrices } from '../services/crawler.service';

const router = Router();

// Public route to get prices, no auth needed if it's just market data
router.get('/latest', auth, getLatestPrices);
router.get('/history', auth, getPriceHistory);

// Route ẩn để bạn gọi thủ công khi muốn cào dữ liệu ngay lập tức
router.get('/force-sync', async (req, res) => {
  try {
    await scrapeTepbacPrices();
    res.json({ success: true, message: 'Đã cào dữ liệu xong!' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
