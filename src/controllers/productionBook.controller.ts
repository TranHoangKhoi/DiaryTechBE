import { Request, Response } from 'express';
import ProductionBookModel from '~/models/ProductionBook.model';

// Hàm tạo mới ProductionLog
export const createProductionBook = async (req: Request, res: Response) => {
  try {
    const { name, description, production, image, start_date, end_date, general_info, farm_id, farm_type_id } =
      req.body;

    // Bạn lấy từ context hoặc token
    const userId = req.user?.id;

    const newBook = await ProductionBookModel.create({
      name,
      description,
      production,
      image,
      start_date,
      end_date,
      general_info,
      farm_id,
      farm_type_id,
      created_by: userId,
      status: 'ongoing'
    });

    res.json({ success: true, data: newBook });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: 'Lỗi tạo nhật ký' });
  }
};

export const getProductionBookByFarm = async (req: Request, res: Response) => {
  try {
    const { farm_id } = req.params; // hoặc req.query.farm_id nếu bạn muốn dùng query

    if (!farm_id) {
      res.status(400).json({ message: 'Thiếu thông tin hộ' });
      return;
    }

    const books = await ProductionBookModel.find({ farm_id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: books.length,
      data: books
    });
  } catch (error) {
    console.error('Error fetching production books:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
