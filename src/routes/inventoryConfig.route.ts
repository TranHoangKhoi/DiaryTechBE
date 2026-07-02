import { Router } from 'express';
import { getInventoryConfigs } from '../controllers/inventoryConfig.controller';
import { auth } from '~/middleware/auth.midleware';

const router = Router();

// Everyone can view configs
router.get('/configs', auth, getInventoryConfigs);

export default router;
