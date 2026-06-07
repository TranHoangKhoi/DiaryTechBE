import express from 'express';
import { createSubscriptionPackage, getAllSubscriptionPackage } from '~/controllers/subscriptionPackage.controller';
import { auth, checkRole } from '../middleware/auth.midleware';

const router = express.Router();
router.post('/create', auth, checkRole('superadmin'), createSubscriptionPackage);
router.get('/', auth, checkRole('superadmin'), getAllSubscriptionPackage);

export default router;
