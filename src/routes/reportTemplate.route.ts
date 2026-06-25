import { Router } from 'express';
import * as ReportTemplateController from '../controllers/reportTemplate.controller';
import { auth, checkRole } from '../middleware/auth.midleware';

const router = Router();

// Các route quản lý cấu hình mẫu báo cáo (chỉ Admin/Superadmin mới được quyền tạo/sửa/xóa)
router.post('/', auth, checkRole('superadmin'), (req, res, next) => {
  ReportTemplateController.createReportTemplate(req, res).catch(next);
});

router.get('/', auth, (req, res, next) => {
  ReportTemplateController.getReportTemplates(req, res).catch(next);
});

router.get('/:id', auth, (req, res, next) => {
  ReportTemplateController.getReportTemplateById(req, res).catch(next);
});

router.put('/:id', auth, checkRole('superadmin'), (req, res, next) => {
  ReportTemplateController.updateReportTemplate(req, res).catch(next);
});

router.delete('/:id', auth, checkRole('superadmin'), (req, res, next) => {
  ReportTemplateController.deleteReportTemplate(req, res).catch(next);
});

export default router;
