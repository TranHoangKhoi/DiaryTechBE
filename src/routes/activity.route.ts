import express from 'express';
import {
  createActivity,
  getAllActivityByIdType,
  getActivityById,
  updateActivities
} from '../controllers/activity.controller';
import { auth, checkRole } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/', auth, createActivity);
router.get('/farmtype/:id', auth, getAllActivityByIdType);
router.get('/:id', auth, getActivityById);
router.put('/:id', auth, updateActivities);

// Admin-only route (ví dụ)
router.get('/admin-only', auth, checkRole('admin'), (req, res) => {
  res.json({ message: 'Welcome, Admin!' });
});

export default router;
