import { Request, Response } from 'express';
import SystemConfigModel from '../models/SystemConfig.model';

export const getSystemConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    let config = await SystemConfigModel.findOne();
    if (!config) {
      config = await SystemConfigModel.create({ allow_negative_stock: false });
    }
    res.status(200).json({ success: true, data: config });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Lỗi lấy cấu hình hệ thống' });
  }
};

export const updateSystemConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const { allow_negative_stock } = req.body;
    let config = await SystemConfigModel.findOne();
    if (!config) {
      config = await SystemConfigModel.create({ allow_negative_stock: Boolean(allow_negative_stock) });
    } else {
      if (allow_negative_stock !== undefined) {
        config.allow_negative_stock = Boolean(allow_negative_stock);
      }
      config.updated_at = new Date();
      await config.save();
    }
    res.status(200).json({ success: true, data: config });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Lỗi cập nhật cấu hình hệ thống' });
  }
};
