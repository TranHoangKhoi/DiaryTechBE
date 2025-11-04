import express from 'express';
import { getAllFarmsMap, handleConvertAddress } from '~/controllers/map.controller';
import { auth } from '../middleware/auth.midleware';

const router = express.Router();
router.get('/getFarm', auth, getAllFarmsMap);
router.get('/convertAddress', auth, handleConvertAddress);

export default router;
