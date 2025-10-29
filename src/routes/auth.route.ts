import express from 'express';
import { auth, checkRole } from '../middleware/auth.midleware';
import { getUserProfile, login, register } from '~/controllers/auth.controller';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', auth, getUserProfile);

// Admin-only route (ví dụ)
router.get('/admin-only', auth, checkRole('admin'), (req, res) => {
  res.json({ message: 'Welcome, Admin!' });
});

export default router;
