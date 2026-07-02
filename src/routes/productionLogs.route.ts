import express from 'express';
import {
  createProductionLog,
  deleteManageProductionLog,
  getManageProductionLogById,
  getManageProductionLogs,
  getProductionLogs,
  getProductionLogsByID,
  updateManageProductionLog,
  deleteProductionLogsByActivity
} from '../controllers/productionLogs.controller';
import { MODULE_KEYS } from '~/constants/moduleKeys';
import { auth, checkRole, requireModuleAccess } from '../middleware/auth.midleware';

const router = express.Router();

// Public routes
router.get('/manage', auth, checkRole('superadmin'), getManageProductionLogs);
router.get('/manage/:id', auth, checkRole('superadmin'), getManageProductionLogById);
router.patch('/manage/:id', auth, checkRole('superadmin'), updateManageProductionLog);
router.delete('/manage/:id', auth, checkRole('superadmin'), deleteManageProductionLog);
router.delete('/manage/bulk/activity', auth, checkRole('superadmin'), deleteProductionLogsByActivity);

router.post('/', auth, requireModuleAccess(MODULE_KEYS.farmDiary), createProductionLog);
router.get('/', auth, requireModuleAccess(MODULE_KEYS.farmDiary), getProductionLogs);
router.get('/:id', auth, requireModuleAccess(MODULE_KEYS.farmDiary), getProductionLogsByID);

//

export default router;
