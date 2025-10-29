import express from 'express';
import { createSubscriptionPackage } from '~/controllers/subscriptionPackage.controller';
import { auth, checkRole } from '../middleware/auth.midleware';

const router = express.Router();
router.post('/create', auth, checkRole('superadmin'), createSubscriptionPackage);

export default router;
