import express from 'express';
import {
  createFarmTypeConfig,
  deleteFarmTypeConfig,
  getAllFarmTypeConfigs,
  getFarmTypeConfigByFarmTypeId,
  getFarmTypeConfigById,
  updateFarmTypeConfig
} from '~/controllers/farmtypeConfig.controller';
import { auth, checkRole } from '../middleware/auth.midleware';

const router = express.Router();

router.get('/', auth, checkRole('superadmin'), getAllFarmTypeConfigs);
router.post('/', auth, checkRole('superadmin'), createFarmTypeConfig);
router.get('/manage/:id', auth, checkRole('superadmin'), getFarmTypeConfigById);
router.patch('/manage/:id', auth, checkRole('superadmin'), updateFarmTypeConfig);
router.delete('/manage/:id', auth, checkRole('superadmin'), deleteFarmTypeConfig);

router.get('/:farm_type_id', auth, getFarmTypeConfigByFarmTypeId);

export default router;
