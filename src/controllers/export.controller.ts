import { Request, Response } from 'express';
import mongoose from 'mongoose';
import ReportTemplate from '../models/ReportTemplate.model';
import * as ExportService from '../services/export.service';
import { ReportAggregatorFactory } from '../services/exportAggregators';

/**
 * Controller xử lý xuất báo cáo Excel
 */
export const exportReportExcel = async (req: Request, res: Response) => {
  try {
    const { farm_id, book_id, template_id, start_date, end_date } = req.query;

    if (!farm_id || !template_id) {
      return res.status(400).json({ message: 'Thiếu các tham số bắt buộc (farm_id, template_id)' });
    }

    if (!mongoose.Types.ObjectId.isValid(template_id as string)) {
      return res.status(400).json({ message: 'ID Template không hợp lệ' });
    }

    const template = await ReportTemplate.findById(template_id);
    if (!template) {
      return res.status(404).json({ message: 'Không tìm thấy Report Template' });
    }

    if (!template.is_active) {
      return res.status(400).json({ message: 'Template này hiện đang bị vô hiệu hóa' });
    }

    const startDate = start_date ? new Date(start_date as string) : new Date('2000-01-01');
    const endDate = end_date ? new Date(end_date as string) : new Date('2100-01-01');
    
    // Đảm bảo lấy hết cuối ngày của endDate
    endDate.setHours(23, 59, 59, 999);

    // 1. Tải buffer từ file server cá nhân
    const templateBuffer = await ExportService.downloadTemplate(template.template_url);

    // 2. Chạy hàm gom dữ liệu (Data Aggregation) thông qua Factory
    const aggregatorFunction = ReportAggregatorFactory[template.aggregator_function];

    if (!aggregatorFunction) {
      return res.status(400).json({ message: `Hàm xử lý ${template.aggregator_function} chưa được cấu hình hoặc không hỗ trợ` });
    }

    const flatData = await aggregatorFunction(
      template,
      farm_id as string,
      book_id as string,
      startDate,
      endDate
    );

    // 3. Render file Excel
    const resultBuffer = await ExportService.renderExcel(templateBuffer, flatData, template.pad_empty_rows);

    // 4. Trả về cho người dùng
    const filename = `${template.report_code}_${farm_id}_${new Date().getTime()}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', resultBuffer.length);

    return res.end(resultBuffer);
  } catch (error: any) {
    console.error('Lỗi khi xuất file excel:', error);
    return res.status(500).json({ message: error.message || 'Lỗi xử lý file Excel' });
  }
};
