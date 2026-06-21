import { Request, Response } from 'express';
import mongoose from 'mongoose';
import ProductionBook from '../models/ProductionBook.model';
import ProductionLog from '../models/ProductionLogs.model';
import Farm from '../models/Farm.model';

export const getTraceabilityByBookId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      res.status(400).json({ message: 'ID nhật ký không hợp lệ' });
      return;
    }

    // 1. Fetch Production Book
    const book = await ProductionBook.findById(bookId)
      .populate('farm_type_id')
      .populate('zone_id');

    if (!book) {
      res.status(404).json({ message: 'Không tìm thấy nhật ký sản xuất' });
      return;
    }

    // 2. Fetch Farm Details
    const farm = await Farm.findById(book.farm_id);
    if (!farm) {
      res.status(404).json({ message: 'Không tìm thấy nông trại liên kết' });
      return;
    }

    // 3. Fetch Production Logs
    const logs = await ProductionLog.find({ book_id: bookId })
      .populate('activity_id', 'activity_name icon color fields')
      .sort({ date: 1, created_at: 1 }) // Sort oldest to newest for timeline
      .lean();

    // 4. Return aggregated data
    res.status(200).json({
      book,
      farm: {
        id: farm._id,
        name: farm.farm_name,
        address: farm.location,
        location: farm.location,
        logo: (farm as any).logo || null,
      },
      logs,
    });
  } catch (error) {
    console.error('Error in getTraceabilityByBookId:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu truy xuất', error });
  }
};
