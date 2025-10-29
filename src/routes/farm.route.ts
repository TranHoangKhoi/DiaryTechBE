import express from 'express';
import { createFarm, getFarmsByOwner, getFarmsByUserId } from '~/controllers/farm.controller';
import { upload } from '~/middleware/upload.midleware';
import { auth, checkRole } from '../middleware/auth.midleware';

const router = express.Router();

// Public routes
router.post('/', auth, checkRole('owner'), upload.fields([{ name: 'image', maxCount: 1 }]), createFarm);
router.get('/byOwner', auth, getFarmsByOwner);
router.get('/byUser', auth, getFarmsByUserId);

export default router;
