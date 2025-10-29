import { Request, Response } from 'express';
import ServiceModuleModel from '~/models/ServiceModule.model';

export const createServiceModule = async (req: Request, res: Response) => {
  try {
    const { key, name, description } = req.body;

    // Kiểm tra thiếu dữ liệu
    if (!key || !name || !description) {
      res.status(400).json({
        success: false,
        message: 'Thiếu dữ liệu: key, name hoặc description.'
      });
      return;
    }

    // Kiểm tra trùng key
    const existing = await ServiceModuleModel.findOne({ key });
    if (existing) {
      res.status(400).json({
        success: false,
        message: `Module với key '${key}' đã tồn tại.`
      });
      return;
    }

    // Tạo mới module
    const newModule = await ServiceModuleModel.create({ key, name, description });

    res.status(201).json({
      success: true,
      message: 'Tạo ServiceModule thành công.',
      data: newModule
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo ServiceModule.',
      error
    });
  }
};

export const getAllServiceModules = async (req: Request, res: Response) => {
  try {
    const modules = await ServiceModuleModel.find().sort({ createdAt: -1 }); // sắp xếp mới nhất trước

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách ServiceModule thành công.',
      data: modules
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách ServiceModule.',
      error
    });
  }
};
