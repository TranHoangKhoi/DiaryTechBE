import express from 'express';
import { createUserSubscription } from '~/controllers/userSubscription.controller';
import { auth, checkRole } from '../middleware/auth.midleware';

const router = express.Router();
router.post('/create', auth, checkRole('superadmin'), createUserSubscription);

export default router;
