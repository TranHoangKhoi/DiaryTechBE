import express from 'express';
import { createProductionBook, getProductionBookByFarm } from '~/controllers/productionBook.controller';
import { auth, checkRole } from '../middleware/auth.midleware';

const router = express.Router();

router.get('/farm/:farm_id', auth, getProductionBookByFarm);
router.post('/', auth, createProductionBook);

// Admin-only route (ví dụ)
router.get('/admin-only', auth, checkRole('admin'), (req, res) => {
  res.json({ message: 'Welcome, Admin!' });
});

export default router;
