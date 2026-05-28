import express from 'express';
import {
  createInventoryLog,
  createInventoryTemplate,
  deleteInventoryLog,
  deleteInventoryTemplate,
  getInventoryLogById,
  getInventoryLogs,
  getInventoryTemplateById,
  getInventoryTemplates,
  updateInventoryLog,
  updateInventoryTemplate
} from '~/controllers/InventoryLog.controller';
import { auth, checkRoles } from '~/middleware/auth.midleware';

const router = express.Router();

router.get('/templates', auth, checkRoles(['admin', 'owner', 'sub_account']), getInventoryTemplates);
router.post('/templates', auth, checkRoles(['admin']), createInventoryTemplate);
router.get('/templates/:id', auth, checkRoles(['admin', 'owner', 'sub_account']), getInventoryTemplateById);
router.patch('/templates/:id', auth, checkRoles(['admin']), updateInventoryTemplate);
router.delete('/templates/:id', auth, checkRoles(['admin']), deleteInventoryTemplate);

router.get('/logs', auth, checkRoles(['admin', 'owner', 'sub_account']), getInventoryLogs);
router.post('/logs', auth, checkRoles(['admin', 'owner', 'sub_account']), createInventoryLog);
router.get('/logs/:id', auth, checkRoles(['admin', 'owner', 'sub_account']), getInventoryLogById);
router.patch('/logs/:id', auth, checkRoles(['admin', 'owner', 'sub_account']), updateInventoryLog);
router.delete('/logs/:id', auth, checkRoles(['admin', 'owner', 'sub_account']), deleteInventoryLog);

export default router;
