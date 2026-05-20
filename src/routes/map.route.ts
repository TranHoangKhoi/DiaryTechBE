import express from 'express';
import {
  getGlobalMapContract,
  getGlobalMapProfile,
  getGlobalMapBoundary,
  getGlobalMapFeatures,
  getGlobalMapStats,
  getAllFarmsMap,
  getFarmDetail,
  getMapTenants,
  getTenantMapContract,
  getTenantMapProfile,
  getTenantMapBoundary,
  getTenantMapFeatures,
  getTenantMapStats,
  getTenantMapAssistantContents,
  getMapAssistantContentById,
  createTenantMapAssistantContent,
  updateMapAssistantContent,
  deleteMapAssistantContent,
  getProvinces,
  getWardsByProvince,
  handleConvertAddress,
  searchProvinces
} from '~/controllers/map.controller';
import { MODULE_KEYS } from '~/constants/moduleKeys';
import { auth, checkRole, requireModuleAccess } from '../middleware/auth.midleware';

const router = express.Router();

router.get('/global', getGlobalMapContract);
router.get('/global/profile', getGlobalMapProfile);
router.get('/global/boundary', getGlobalMapBoundary);
router.get('/global/features', getGlobalMapFeatures);
router.get('/global/stats', getGlobalMapStats);
router.get('/tenant/:tenantSlug', getTenantMapContract);
router.get('/tenant/:tenantSlug/profile', getTenantMapProfile);
router.get('/tenant/:tenantSlug/boundary', getTenantMapBoundary);
router.get('/tenant/:tenantSlug/features', getTenantMapFeatures);
router.get('/tenant/:tenantSlug/stats', getTenantMapStats);
router.get('/tenant/:tenantSlug/assistant', getTenantMapAssistantContents);
router.post('/tenant/:tenantSlug/assistant', auth, checkRole('admin'), createTenantMapAssistantContent);
router.get('/assistant/:assistantId', getMapAssistantContentById);
router.put('/assistant/:assistantId', auth, checkRole('admin'), updateMapAssistantContent);
router.delete('/assistant/:assistantId', auth, checkRole('admin'), deleteMapAssistantContent);
router.get('/tenants', getMapTenants);

router.get('/getFarm', getAllFarmsMap);
router.get('/getFarm/:farmId', getFarmDetail);
router.get('/convertAddress', handleConvertAddress);
router.get('/provinces', getProvinces);
router.get('/wards', getWardsByProvince);
router.get('/search-province', searchProvinces);

export default router;
