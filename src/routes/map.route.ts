import express from 'express';
import { getAllFarmsMap } from '~/controllers/map.controller';
import { auth } from '../middleware/auth.midleware';

const router = express.Router();
router.get('/getFarm', auth, getAllFarmsMap);

export default router;
