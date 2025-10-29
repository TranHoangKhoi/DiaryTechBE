import { Request, Response } from 'express';
import UserSubscriptionModel from '~/models/UserSubscription.model';
import UserModel from '~/models/User.model';
import SubscriptionPackageModel from '~/models/SubscriptionPackage.model';
import ServiceModuleModel from '~/models/ServiceModule.model';

export const createUserSubscription = async (req: Request, res: Response) => {
  try {
    const { user_id, module_id, package_id } = req.body;

    // 1️⃣ Kiểm tra user
    const user = await UserModel.findById(user_id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User không tồn tại.' });
      return;
    }

    // 2️⃣ Kiểm tra module
    const module = await ServiceModuleModel.findById(module_id);
    if (!module) {
      res.status(404).json({ success: false, message: 'Module không tồn tại.' });
      return;
    }

    // 3️⃣ Kiểm tra gói thuê
    const pkg = await SubscriptionPackageModel.findById(package_id);
    if (!pkg) {
      res.status(404).json({ success: false, message: 'Gói thuê không tồn tại.' });
      return;
    }

    // 4️⃣ Tính thời gian hết hạn
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + pkg.duration_in_days);

    // 5️⃣ Tạo mới UserSubscription
    const newSub = await UserSubscriptionModel.create({
      user_id,
      module_id,
      package_id,
      start_date: startDate,
      end_date: endDate,
      status: 'active',
      remaining_sub_accounts: pkg.max_sub_accounts
    });

    res.status(201).json({
      success: true,
      message: 'Tạo thuê bao người dùng thành công.',
      data: newSub
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo thuê bao người dùng.',
      error
    });
  }
};
