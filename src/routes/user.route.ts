import express from 'express';
import { updateUser } from '../controllers/user.controller';
import { auth, checkRole } from '../middleware/auth';

const router = express.Router();

// Public routes
// router.post('/register', register);
// router.post('/login', login);

// Protected routes
// router.get('/profile', auth, getUserProfile);
router.put('/profile', auth, updateUser);
// router.post('/farmer/addFarm/:idUser', auth, addFarmToUser);

// Admin-only route (ví dụ)
router.get('/admin-only', auth, checkRole('admin'), (req, res) => {
  res.json({ message: 'Welcome, Admin!' });
});

export default router;
