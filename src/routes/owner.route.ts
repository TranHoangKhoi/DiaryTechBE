import express from 'express';
import { getFarmer, getFarmerById } from '../controllers/owner.controller';
import { auth, checkRole } from '../middleware/auth.midleware';

const router = express.Router();

// Public routes
router.get('/farmer', auth, getFarmer);
router.get('/farmer/:id', auth, getFarmerById);

// Admin-only route (ví dụ)
router.get('/admin-only', auth, checkRole('admin'), (req, res) => {
  res.json({ message: 'Welcome, Admin!' });
});

export default router;
