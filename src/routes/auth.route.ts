import express from 'express';
import { auth, checkRole } from '../middleware/auth.midleware';
import { getUserProfile, getUserProfileByAdmin, login, register } from '~/controllers/auth.controller';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', auth, getUserProfile);
router.get('/profile-by-admin/:userId', auth, checkRole('owner'), getUserProfileByAdmin);

// Admin-only route (ví dụ)
router.get('/admin-only', auth, checkRole('admin'), (req, res) => {
  res.json({ message: 'Welcome, Admin!' });
});

export default router;
