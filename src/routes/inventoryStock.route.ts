import express from 'express';
import { getInventoryStocks } from '~/controllers/InventoryStock.controller';
import { auth, checkRoles } from '~/middleware/auth.midleware';

const router = express.Router();

router.get('/stocks', auth, checkRoles(['admin', 'owner', 'sub_account']), getInventoryStocks);

export default router;
