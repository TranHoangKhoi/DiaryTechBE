import express from 'express';
import {
  createManageProductionReport,
  deleteManageProductionReport,
  getManageProductionReportById,
  getManageProductionReports,
  regenerateProductionReportLogSummary,
  updateManageProductionReport
} from '~/controllers/productionReport.controller';
import { auth, checkRole } from '../middleware/auth.midleware';

const router = express.Router();

router.get('/manage', auth, checkRole('superadmin'), getManageProductionReports);
router.post('/manage', auth, checkRole('superadmin'), createManageProductionReport);
router.get('/manage/:id', auth, checkRole('superadmin'), getManageProductionReportById);
router.patch('/manage/:id', auth, checkRole('superadmin'), updateManageProductionReport);
router.delete('/manage/:id', auth, checkRole('superadmin'), deleteManageProductionReport);
router.post('/manage/:id/regenerate-log-summary', auth, checkRole('superadmin'), regenerateProductionReportLogSummary);

export default router;
