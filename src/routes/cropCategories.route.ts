import express from 'express';
import { createCrop, getCrops } from '~/controllers/crop.controller';
import { auth, checkRole } from '../middleware/auth.midleware';

const router = express.Router();

// Public routes
router.post('/', auth, checkRole('superadmin'), createCrop);
router.get('/', getCrops);

export default router;
