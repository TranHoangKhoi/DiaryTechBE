import express from 'express';
import { getFarmer, getFarmerById, getOwnerStatistics } from '../controllers/owner.controller';
import { auth, checkRole } from '../middleware/auth.midleware';
import { roleUser } from '~/config/constant';

const router = express.Router();

// Public routes
router.get('/farmer', auth, getFarmer);
router.get('/farmer/:id', auth, getFarmerById);

// Owner dashboard statistics
router.get('/dashboard/statistics', auth, checkRole(roleUser.owner), getOwnerStatistics);

// Admin-only route (ví dụ)
router.get('/admin-only', auth, checkRole('admin'), (req, res) => {
  res.json({ message: 'Welcome, Admin!' });
});

export default router;
