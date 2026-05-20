import express from 'express';
import {
  createOperationalLog,
  createOperationalLogTemplate,
  deleteOperationalLog,
  deleteOperationalLogTemplate,
  getOperationalLogById,
  getOperationalLogs,
  getOperationalLogTemplateById,
  getOperationalLogTemplates,
  updateOperationalLog,
  updateOperationalLogTemplate
} from '~/controllers/operationalLog.controller';
import { auth, checkRole } from '~/middleware/auth.midleware';

const router = express.Router();

router.get('/templates', auth, checkRole('superadmin'), getOperationalLogTemplates);
router.post('/templates', auth, checkRole('superadmin'), createOperationalLogTemplate);
router.get('/templates/:id', auth, checkRole('superadmin'), getOperationalLogTemplateById);
router.patch('/templates/:id', auth, checkRole('superadmin'), updateOperationalLogTemplate);
router.delete('/templates/:id', auth, checkRole('superadmin'), deleteOperationalLogTemplate);

router.get('/logs', auth, checkRole('superadmin'), getOperationalLogs);
router.post('/logs', auth, checkRole('superadmin'), createOperationalLog);
router.get('/logs/:id', auth, checkRole('superadmin'), getOperationalLogById);
router.patch('/logs/:id', auth, checkRole('superadmin'), updateOperationalLog);
router.delete('/logs/:id', auth, checkRole('superadmin'), deleteOperationalLog);

export default router;
