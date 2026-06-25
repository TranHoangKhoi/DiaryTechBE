import { Request, Response } from 'express';
import { z } from 'zod';
import ReportTemplate from '../models/ReportTemplate.model';
import mongoose from 'mongoose';

// --- Validations ---
const createTemplateSchema = z.object({
  name: z.string().min(1, 'Tên template không được bỏ trống'),
  farm_type_id: z.string().min(1, 'Vui lòng chọn loại Farm'),
  report_code: z.string().min(1, 'Mã báo cáo không được bỏ trống'),
  template_url: z.string().url('URL không hợp lệ'),
  data_sources: z.object({
    activity_ids: z.array(z.string()).default([]),
    inventory_categories: z.array(z.string()).default([])
  }),
  aggregator_function: z.string().min(1, 'Tên hàm xử lý dữ liệu không được bỏ trống'),
  pad_empty_rows: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true)
});

const updateTemplateSchema = createTemplateSchema.partial();

// --- Controllers ---

/**
 * Tạo mới ReportTemplate
 */
export const createReportTemplate = async (req: Request, res: Response) => {
  try {
    const validatedData = createTemplateSchema.parse(req.body);
    const userId = req.user?.id; // Lấy từ auth middleware

    const existingCode = await ReportTemplate.findOne({
      farm_type_id: validatedData.farm_type_id,
      report_code: validatedData.report_code
    });

    if (existingCode) {
      return res.status(400).json({ message: 'Mã báo cáo này đã tồn tại cho loại Farm được chọn' });
    }

    const newTemplate = new ReportTemplate({
      ...validatedData,
      created_by: userId
    });

    await newTemplate.save();
    return res.status(201).json(newTemplate);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error('Error creating report template:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi hệ thống' });
  }
};

/**
 * Lấy danh sách ReportTemplate
 */
export const getReportTemplates = async (req: Request, res: Response) => {
  try {
    const { farm_type_id, is_active } = req.query;
    
    const filter: any = {};
    if (farm_type_id) {
      if (!mongoose.Types.ObjectId.isValid(farm_type_id as string)) {
        return res.status(400).json({ message: 'farm_type_id không hợp lệ' });
      }
      filter.farm_type_id = farm_type_id;
    }
    if (is_active !== undefined) {
      filter.is_active = is_active === 'true';
    }

    const templates = await ReportTemplate.find(filter)
      .populate('farm_type_id', 'type_name code')
      .populate('data_sources.activity_ids', 'activity_name activity_code')
      .sort({ createdAt: -1 });

    return res.status(200).json(templates);
  } catch (error: any) {
    console.error('Error fetching report templates:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi hệ thống' });
  }
};

/**
 * Lấy thông tin 1 ReportTemplate
 */
export const getReportTemplateById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }

    const template = await ReportTemplate.findById(id)
      .populate('farm_type_id', 'type_name code')
      .populate('data_sources.activity_ids', 'activity_name activity_code fields');

    if (!template) {
      return res.status(404).json({ message: 'Không tìm thấy Report Template' });
    }

    return res.status(200).json(template);
  } catch (error: any) {
    console.error('Error fetching report template details:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi hệ thống' });
  }
};

/**
 * Cập nhật ReportTemplate
 */
export const updateReportTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }

    const validatedData = updateTemplateSchema.parse(req.body);

    // Nếu đổi report_code hoặc farm_type_id, kiểm tra trùng lặp
    if (validatedData.report_code || validatedData.farm_type_id) {
      const template = await ReportTemplate.findById(id);
      if (!template) return res.status(404).json({ message: 'Không tìm thấy Report Template' });

      const checkFarmType = validatedData.farm_type_id || template.farm_type_id;
      const checkCode = validatedData.report_code || template.report_code;

      const existingCode = await ReportTemplate.findOne({
        _id: { $ne: id },
        farm_type_id: checkFarmType,
        report_code: checkCode
      });

      if (existingCode) {
        return res.status(400).json({ message: 'Mã báo cáo này đã tồn tại cho loại Farm được chọn' });
      }
    }

    const updatedTemplate = await ReportTemplate.findByIdAndUpdate(
      id,
      { $set: validatedData },
      { new: true, runValidators: true }
    );

    if (!updatedTemplate) {
      return res.status(404).json({ message: 'Không tìm thấy Report Template' });
    }

    return res.status(200).json(updatedTemplate);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error('Error updating report template:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi hệ thống' });
  }
};

/**
 * Xóa ReportTemplate
 */
export const deleteReportTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }

    const deleted = await ReportTemplate.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Không tìm thấy Report Template' });
    }

    return res.status(200).json({ message: 'Xóa thành công' });
  } catch (error: any) {
    console.error('Error deleting report template:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi hệ thống' });
  }
};
