import express from 'express';
import {
  createProductionLog,
  getOwnerProductionLogs,
  getProductionLogsByActivityAndFarm,
  getProductionLogsByFarm,
  getProductionLogsByID,
  getRecentActivities,
  getRecentProductionLogs
} from '../controllers/productionLogs.controller';
import { MODULE_KEYS } from '~/constants/moduleKeys';
import { auth, checkRole, requireModuleAccess } from '../middleware/auth.midleware';

const router = express.Router();

// Public routes
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
