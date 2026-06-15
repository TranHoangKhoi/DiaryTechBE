import { Router } from 'express';
import { getFarmDiagram, syncFarmDiagram } from '~/controllers/farmDiagram.controller';
import { auth } from '~/middleware/auth.midleware';

const router = Router();

router.use(auth);

router.get('/:farm_id', getFarmDiagram);
router.put('/sync/:farm_id', syncFarmDiagram);

export default router;
