import express from 'express';
import {
  createFarm,
  getFarmsByOwner,
  getFarmsByUserId,
  getFarmsByUserIdFormAdmin,
  updateFarmSubAccount
} from '~/controllers/farm.controller';
import { addCropToFarm } from '~/controllers/farmCrop.controller';
import { addFarmMedia } from '~/controllers/farmMedia.controller';
import { MODULE_KEY_VALUES } from '~/constants/moduleKeys';
import { upload } from '~/middleware/upload.midleware';
import { auth, checkRole, requireAnyModuleAccess } from '../middleware/auth.midleware';
import { addReport } from '~/controllers/productionReport.controller';

const router = express.Router();

// Public routes
// POST
router.post(
  '/',
  auth,
  checkRole('owner'),
  requireAnyModuleAccess(MODULE_KEY_VALUES),
  upload.fields([{ name: 'image', maxCount: 1 }]),
  createFarm
);
router.post('/:farmId/crops', auth, checkRole('owner'), requireAnyModuleAccess(MODULE_KEY_VALUES), addCropToFarm);
router.post('/:farmId/media', auth, checkRole('owner'), requireAnyModuleAccess(MODULE_KEY_VALUES), addFarmMedia);
router.post('/:farmId/reports', auth, checkRole('owner'), requireAnyModuleAccess(MODULE_KEY_VALUES), addReport);

router.put(
  '/:farmId',
  auth,
  checkRole('owner'),
  requireAnyModuleAccess(MODULE_KEY_VALUES),
  upload.fields([{ name: 'image', maxCount: 1 }]),
  updateFarmSubAccount
);

// GET
router.get('/byOwner', auth, requireAnyModuleAccess(MODULE_KEY_VALUES), getFarmsByOwner);
router.get('/byUser', auth, requireAnyModuleAccess(MODULE_KEY_VALUES), getFarmsByUserId);
router.get('/get-farm/:userId', auth, checkRole('superadmin'), getFarmsByUserIdFormAdmin);

export default router;
