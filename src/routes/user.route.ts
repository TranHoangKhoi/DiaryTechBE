import express from 'express';
import { changePassword, updateUser } from '../controllers/user.controller';
import { getUserProfile } from '../controllers/auth.controller';
import { auth, checkRole } from '../middleware/auth.midleware';

const router = express.Router();

// Protected routes
router.get('/me', auth, getUserProfile);
router.put('/me', auth, updateUser);
router.put('/me/password', auth, changePassword);

// Admin-only route (ví dụ)
router.get('/admin-only', auth, checkRole('admin'), (req, res) => {
  res.json({ message: 'Welcome, Admin!' });
});

export default router;
