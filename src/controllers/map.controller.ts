import { Request, Response } from 'express';
import FarmModel from '~/models/Farm.model';

export const getAllFarmsMap = async (req: Request, res: Response) => {
  try {
    const farms = await FarmModel.find()
      .populate('farm_type_id', 'type_name image description') // chọn trường cần thiết
      .populate('owner_id', 'name phone avatar role') // chỉ lấy thông tin cơ bản
      .populate('user_id', 'name phone avatar role')
      .sort({ created_at: -1 }); // sắp xếp farm mới nhất lên đầu

    res.status(200).json({
      success: true,
      total: farms.length,
      data: farms
    });
  } catch (error: any) {
    console.error('Error getAllFarms:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách nông trại',
      error: error.message
    });
  }
};
