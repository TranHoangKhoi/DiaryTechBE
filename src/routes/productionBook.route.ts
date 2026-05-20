import express from 'express';
import {
  createManageProductionBook,
  createProductionBook,
  deleteManageProductionBook,
  getManageProductionBookById,
  getManageProductionBooks,
  getProductionBookByFarm,
  getProductionBookById,
  getProductionBookSummaryByFarm,
  getProductionBooksByOwner,
  softDeleteProductionBook,
  updateManageProductionBook,
  updateProductionBook
} from '~/controllers/productionBook.controller';
import { MODULE_KEYS } from '~/constants/moduleKeys';
import { auth, checkRole, requireModuleAccess } from '../middleware/auth.midleware';

const router = express.Router();

router.get('/manage', auth, checkRole('superadmin'), getManageProductionBooks);
router.post('/manage', auth, checkRole('superadmin'), createManageProductionBook);
router.get('/manage/:bookId', auth, checkRole('superadmin'), getManageProductionBookById);
router.patch('/manage/:bookId', auth, checkRole('superadmin'), updateManageProductionBook);
router.delete('/manage/:bookId', auth, checkRole('superadmin'), deleteManageProductionBook);

router.get('/farm/:farmId/summary', auth, requireModuleAccess(MODULE_KEYS.farmDiary), getProductionBookSummaryByFarm);
router.get('/farm/:farmId', auth, requireModuleAccess(MODULE_KEYS.farmDiary), getProductionBookByFarm);
router.get('/owner', auth, requireModuleAccess(MODULE_KEYS.farmDiary), getProductionBooksByOwner);
router.post('/', auth, requireModuleAccess(MODULE_KEYS.farmDiary), createProductionBook);
router.patch('/:bookId', auth, requireModuleAccess(MODULE_KEYS.farmDiary), updateProductionBook);
router.delete('/:bookId', auth, requireModuleAccess(MODULE_KEYS.farmDiary), softDeleteProductionBook);

router.get('/:bookId', auth, requireModuleAccess(MODULE_KEYS.farmDiary), getProductionBookById);

export default router;
