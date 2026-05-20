import express from 'express';
import {
  createActivity,
  deleteActivity,
  getActivityById,
  getAllActivityByIdType,
  getManageActivities,
  updateActivities
} from '../controllers/activity.controller';
import { auth, checkRole } from '../middleware/auth.midleware';

const router = express.Router();

router.get('/manage', auth, checkRole('superadmin'), getManageActivities);
router.post('/', auth, checkRole('superadmin'), createActivity);
router.patch('/manage/:id', auth, checkRole('superadmin'), updateActivities);
router.put('/:id', auth, checkRole('superadmin'), updateActivities);
router.delete('/manage/:id', auth, checkRole('superadmin'), deleteActivity);

router.get('/farmtype/:id', auth, getAllActivityByIdType);
router.get('/:id', auth, getActivityById);

export default router;
