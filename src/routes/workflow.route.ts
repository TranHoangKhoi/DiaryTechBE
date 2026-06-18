import { Router } from 'express';
import { issueAndLog } from '../controllers/workflow.controller';
import { auth } from '../middleware/auth.midleware';

const router = Router();

// Endpoint gộp xuất kho và ghi nhật ký
router.post('/issue-and-log', auth, issueAndLog);

export default router;
