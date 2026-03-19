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
import { auth } from '../middleware/auth.midleware';

const router = express.Router();

// Public routes
router.post('/', auth, createProductionLog);
router.get('/', getProductionLogsByActivityAndFarm);
router.get('/farm/:farm_id', auth, getProductionLogsByFarm);
router.get('/recent', getRecentProductionLogs);
router.get('/owner', auth, getOwnerProductionLogs);
router.get('/owner/logs/recent', auth, getRecentActivities);
router.get('/:id', getProductionLogsByID);

//

export default router;
