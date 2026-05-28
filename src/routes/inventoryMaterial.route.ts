import express from 'express';
import {
  createInventoryMaterial,
  deleteInventoryMaterial,
  getInventoryMaterialById,
  getInventoryMaterials,
  updateInventoryMaterial
} from '~/controllers/InventoryMaterial.controller';
import { auth, checkRoles } from '~/middleware/auth.midleware';

const router = express.Router();

router.get('/materials', auth, checkRoles(['admin', 'owner', 'sub_account']), getInventoryMaterials);
router.post('/materials', auth, checkRoles(['admin', 'owner', 'sub_account']), createInventoryMaterial);
router.get('/materials/:id', auth, checkRoles(['admin', 'owner', 'sub_account']), getInventoryMaterialById);
router.patch('/materials/:id', auth, checkRoles(['admin', 'owner', 'sub_account']), updateInventoryMaterial);
router.delete('/materials/:id', auth, checkRoles(['admin', 'owner', 'sub_account']), deleteInventoryMaterial);

export default router;
