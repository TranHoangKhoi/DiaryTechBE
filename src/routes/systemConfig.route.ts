import { Router } from 'express';
import { getSystemConfig, updateSystemConfig } from '../controllers/systemConfig.controller';
import { auth, checkRoles } from '~/middleware/auth.midleware';

const router = Router();

// Lấy config (ai đã đăng nhập cũng lấy được để check rule)
router.get('/', auth, getSystemConfig);

// Cập nhật config (chỉ admin mới được quyền đổi)
router.put('/', auth, checkRoles(['admin']), updateSystemConfig);

export default router;
