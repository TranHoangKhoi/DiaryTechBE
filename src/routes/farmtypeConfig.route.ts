import express from 'express';
import { createFarmTypeConfig, getFarmTypeConfigByFarmTypeId } from '~/controllers/farmtypeConfig.controller';
import { auth, checkRole } from '../middleware/auth.midleware';

const router = express.Router();

// Public routes
router.post('/', auth, checkRole('superadmin'), createFarmTypeConfig);
router.get('/:farm_type_id', auth, getFarmTypeConfigByFarmTypeId);

// Admin-only route (ví dụ)
router.get('/admin-only', auth, checkRole('admin'), (req, res) => {
  res.json({ message: 'Welcome, Admin!' });
});

export default router;
