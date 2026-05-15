import express from 'express';
import {
  getAllFarmsMap,
  getFarmDetail,
  getProvinces,
  getWardsByProvince,
  handleConvertAddress,
  searchProvinces
} from '~/controllers/map.controller';
import { MODULE_KEYS } from '~/constants/moduleKeys';
import { auth, requireModuleAccess } from '../middleware/auth.midleware';

const router = express.Router();
router.get('/getFarm', getAllFarmsMap);
router.get('/getFarm/:farmId', getFarmDetail);
router.get('/convertAddress', handleConvertAddress);
router.get('/provinces', getProvinces);
router.get('/wards', getWardsByProvince);
router.get('/search-province', searchProvinces);

export default router;
