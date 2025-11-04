import { Request, Response } from 'express';
import FarmModel from '~/models/Farm.model';
import { VietnamAddressConverter } from '../addressConvert/VietnamAddressConverter';

import path from 'path';

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

// Khởi tạo 1 instance toàn cục
const converter = new VietnamAddressConverter();

// ✅ Khởi tạo khi server khởi động
(async () => {
  try {
    const dataPath = path.join(__dirname, '../addressConvert/geojson/vietnameConver.json');
    await converter.initialize(dataPath);
    console.log('✅ VietnamAddressConverter initialized!');
  } catch (error) {
    console.error('❌ Lỗi khởi tạo converter:', error);
  }
})();

// 📍 API chính
export const handleConvertAddress = async (req: Request, res: Response) => {
  try {
    const { address } = req.query; // GET nên lấy từ query

    if (!address || typeof address !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Thiếu tham số ?address=...'
      });
      return;
    }

    const result = converter.convertAddress(address);
    res.json(result);
  } catch (err: any) {
    console.error('❌ Lỗi convert address:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
