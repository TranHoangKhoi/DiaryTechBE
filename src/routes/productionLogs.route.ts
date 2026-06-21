import express from 'express';
import {
  createProductionLog,
  deleteManageProductionLog,
  getManageProductionLogById,
  getManageProductionLogs,
  getOwnerProductionLogs,
  getProductionLogsByActivityAndFarm,
  getProductionLogsByFarm,
  getProductionLogsByID,
  getRecentActivities,
  getRecentProductionLogs,
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
router.get('/', auth, requireModuleAccess(MODULE_KEYS.farmDiary), getProductionLogsByActivityAndFarm);
router.get('/farm/:farm_id', auth, requireModuleAccess(MODULE_KEYS.farmDiary), getProductionLogsByFarm);
router.get('/recent', auth, requireModuleAccess(MODULE_KEYS.farmDiary), getRecentProductionLogs);
router.get('/owner', auth, checkRole('owner'), requireModuleAccess(MODULE_KEYS.farmDiary), getOwnerProductionLogs);
router.get(
  '/owner/logs/recent',
  auth,
  checkRole('owner'),
  requireModuleAccess(MODULE_KEYS.farmDiary),
  getRecentActivities
);
router.get('/:id', auth, requireModuleAccess(MODULE_KEYS.farmDiary), getProductionLogsByID);

//

export default router;
