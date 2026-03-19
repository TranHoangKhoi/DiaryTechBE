import express from 'express';
import {
  createFarm,
  getFarmsByOwner,
  getFarmsByUserId,
  getFarmsByUserIdFormAdmin
} from '~/controllers/farm.controller';
import { addCropToFarm } from '~/controllers/farmCrop.controller';
import { addFarmMedia } from '~/controllers/farmMedia.controller';
import { upload } from '~/middleware/upload.midleware';
import { auth, checkRole } from '../middleware/auth.midleware';
import { addReport } from '~/controllers/productionReport.controller';

const router = express.Router();

// Public routes
// POST
router.post('/', auth, checkRole('owner'), upload.fields([{ name: 'image', maxCount: 1 }]), createFarm);
router.post('/:farmId/crops', auth, checkRole('owner'), addCropToFarm);
router.post('/:farmId/media', auth, checkRole('owner'), addFarmMedia);
router.post('/:farmId/reports', auth, checkRole('owner'), addReport);

// GET
router.get('/byOwner', auth, getFarmsByOwner);
router.get('/byUser', auth, getFarmsByUserId);
router.get('/get-farm/:userId', auth, checkRole('superadmin'), getFarmsByUserIdFormAdmin);

export default router;
