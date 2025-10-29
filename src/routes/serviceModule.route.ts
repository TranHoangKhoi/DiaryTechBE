import express from 'express';
import { createServiceModule, getAllServiceModules } from '~/controllers/serviceModule.controller';
import { auth, checkRole } from '../middleware/auth.midleware';

const router = express.Router();
router.post('/create', auth, checkRole('superadmin'), createServiceModule);
router.get('/', auth, checkRole('superadmin'), getAllServiceModules);

export default router;
