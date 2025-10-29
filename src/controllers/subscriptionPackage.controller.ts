import { Request, Response } from 'express';
import SubscriptionPackageModel from '~/models/SubscriptionPackage.model';
import ServiceModuleModel from '~/models/ServiceModule.model';

export const createSubscriptionPackage = async (req: Request, res: Response) => {
  try {
    const { module_id, name, max_sub_accounts, price_per_month, duration_in_days, description } = req.body;

    // Kiểm tra module có tồn tại không
    const module = await ServiceModuleModel.findById(module_id);
    if (!module) {
      res.status(404).json({
        success: false,
        message: 'Module không tồn tại.'
      });
      return;
    }

    // Tạo gói mới
    const newPackage = await SubscriptionPackageModel.create({
      module_id,
      name,
      max_sub_accounts,
      price_per_month,
      duration_in_days,
      description
    });

    res.status(201).json({
      success: true,
      message: 'Tạo gói thuê thành công.',
      data: newPackage
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo gói thuê.',
      error
    });
  }
};

export const getAllSubscriptionPackage = async (req: Request, res: Response) => {
  try {
    const modules = await SubscriptionPackageModel.find().sort({ createdAt: -1 }); // sắp xếp mới nhất trước

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách gói thành công.',
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
