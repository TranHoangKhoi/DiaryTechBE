import express from 'express';
import {
  getAllFarmsMap,
  getFarmDetail,
  getProvinces,
  getWardsByProvince,
  handleConvertAddress,
  searchProvinces
} from '~/controllers/map.controller';
import { auth, optionalAuth } from '../middleware/auth.midleware';

const router = express.Router();
router.get('/getFarm', optionalAuth, getAllFarmsMap);
router.get('/getFarm/:farmId', optionalAuth, getFarmDetail);
router.get('/convertAddress', handleConvertAddress);
router.get('/provinces', getProvinces);
router.get('/wards', getWardsByProvince);
router.get('/search-province', searchProvinces);

export default router;
