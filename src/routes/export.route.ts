import { Router } from 'express';
import * as ExportController from '../controllers/export.controller';
import { auth, requireModuleAccess } from '../middleware/auth.midleware';

const router = Router();

router.get(
  '/excel',
  auth,
  (req, res, next) => { ExportController.exportReportExcel(req, res).catch(next); }
);

export default router;
