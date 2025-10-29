import express from 'express';
import { createFarmType, getAllFarmTypes, getFarmType, updateFarmType } from '../controllers/farmtype.controller';
import { auth, checkRole } from '../middleware/auth.midleware';

const router = express.Router();

// Public routes
router.post('/', auth, checkRole('superadmin'), createFarmType);
router.post('/:id', auth, checkRole('superadmin'), updateFarmType);
router.get('/', auth, getAllFarmTypes);
router.get('/:id', auth, getFarmType);

// Admin-only route (ví dụ)
router.get('/admin-only', auth, checkRole('admin'), (req, res) => {
  res.json({ message: 'Welcome, Admin!' });
});

export default router;
