import { Router } from 'express';
import { issueAndLog, receiveAndLog } from '../controllers/workflow.controller';
import { auth } from '../middleware/auth.midleware';

const router = Router();

// Endpoint gộp xuất kho và ghi nhật ký
router.post('/issue-and-log', auth, issueAndLog);

// Endpoint gộp nhập kho và ghi nhật ký
router.post('/receive-and-log', auth, receiveAndLog);

export default router;
