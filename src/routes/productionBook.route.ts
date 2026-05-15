import express from 'express';
import {
  createProductionBook,
  getProductionBookByFarm,
  getProductionBookById,
  getProductionBookSummaryByFarm,
  getProductionBooksByOwner,
  softDeleteProductionBook,
  updateProductionBook
} from '~/controllers/productionBook.controller';
import { MODULE_KEYS } from '~/constants/moduleKeys';
import { auth, checkRole, requireModuleAccess } from '../middleware/auth.midleware';

const router = express.Router();

router.get('/farm/:farmId/summary', auth, requireModuleAccess(MODULE_KEYS.farmDiary), getProductionBookSummaryByFarm);
router.get('/farm/:farmId', auth, requireModuleAccess(MODULE_KEYS.farmDiary), getProductionBookByFarm);
router.get('/owner', auth, requireModuleAccess(MODULE_KEYS.farmDiary), getProductionBooksByOwner);
router.post('/', auth, requireModuleAccess(MODULE_KEYS.farmDiary), createProductionBook);
router.patch('/:bookId', auth, requireModuleAccess(MODULE_KEYS.farmDiary), updateProductionBook);
router.delete('/:bookId', auth, requireModuleAccess(MODULE_KEYS.farmDiary), softDeleteProductionBook);

// Admin-only route (example)
router.get('/admin-only', auth, checkRole('admin'), (req, res) => {
  res.json({ message: 'Welcome, Admin!' });
});

router.get('/:bookId', auth, requireModuleAccess(MODULE_KEYS.farmDiary), getProductionBookById);

export default router;
