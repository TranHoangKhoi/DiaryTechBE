import express from 'express';
import {
  getFarmer,
  getFarmerById,
  getOwnerStatistics,
  registerOwner,
  softDeleteFarmer,
  hardDeleteFarmer,
  restoreFarmer
} from '../controllers/owner.controller';
import { MODULE_KEY_VALUES } from '~/constants/moduleKeys';
import { auth, checkRole, requireAnyModuleAccess } from '../middleware/auth.midleware';
import { roleUser } from '~/config/constant';

const router = express.Router();

// Public routes
router.get('/farmer', auth, checkRole(roleUser.owner), requireAnyModuleAccess(MODULE_KEY_VALUES), getFarmer);
router.get('/farmer/:id', auth, checkRole(roleUser.owner), requireAnyModuleAccess(MODULE_KEY_VALUES), getFarmerById);
router.patch(
  '/farmer/:id/soft-delete',
  auth,
  checkRole(roleUser.owner),
  requireAnyModuleAccess(MODULE_KEY_VALUES),
  softDeleteFarmer
);
router.delete(
  '/farmer/:id/hard-delete',
  auth,
  checkRole(roleUser.owner),
  requireAnyModuleAccess(MODULE_KEY_VALUES),
  hardDeleteFarmer
);
router.patch(
  '/farmer/:id/restore',
  auth,
  checkRole(roleUser.owner),
  requireAnyModuleAccess(MODULE_KEY_VALUES),
  restoreFarmer
);

// Owner dashboard statistics
router.get(
  '/dashboard/statistics',
  auth,
  checkRole(roleUser.owner),
  requireAnyModuleAccess(MODULE_KEY_VALUES),
  getOwnerStatistics
);

router.post('/register', auth, checkRole('superadmin'), registerOwner);

// Admin-only route (ví dụ)
router.get('/admin-only', auth, checkRole('admin'), (req, res) => {
  res.json({ message: 'Welcome, Admin!' });
});

export default router;
