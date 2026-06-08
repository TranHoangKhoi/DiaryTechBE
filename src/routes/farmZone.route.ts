import { Router } from 'express';
import {
  getFarmZonesByFarmId,
  createFarmZone,
  updateFarmZone,
  deleteFarmZone
} from '~/controllers/farmZone.controller';
import { auth } from '~/middleware/auth.midleware';

const router = Router();

router.use(auth); // require login

router.get('/farm/:farm_id', getFarmZonesByFarmId);
router.post('/', createFarmZone);
router.put('/:id', updateFarmZone);
router.delete('/:id', deleteFarmZone);

export default router;
