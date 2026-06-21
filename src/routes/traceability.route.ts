import express from 'express';
import { getTraceabilityByBookId } from '../controllers/traceability.controller';

const router = express.Router();

// Public route cho trang truy xuất nguồn gốc
router.get('/:bookId', getTraceabilityByBookId);

export default router;
