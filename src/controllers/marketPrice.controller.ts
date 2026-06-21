import { Request, Response } from 'express';
import { MarketPrice } from '../models/marketPrice.model';

export const getLatestPrices = async (req: Request, res: Response) => {
  try {
    // Get the most recent date available in the DB
    const latestRecord = await MarketPrice.findOne().sort({ date: -1 });
    if (!latestRecord) {
      res.status(200).json({ success: true, data: [], message: 'Chưa có dữ liệu giá cả' });
      return;
    }

    const latestDate = latestRecord.date;
    const prices = await MarketPrice.find({ date: latestDate });

    res.status(200).json({
      success: true,
      data: prices,
      updatedAt: latestDate
    });
  } catch (error) {
    console.error('Error fetching latest prices:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy dữ liệu giá' });
  }
};

export const getPriceHistory = async (req: Request, res: Response) => {
  try {
    const { name } = req.query;
    if (!name) {
      res.status(400).json({ success: false, message: 'Vui lòng cung cấp tên sản phẩm (name)' });
      return;
    }

    // Sort by date ascending for chart
    const history = await MarketPrice.find({ name: String(name) }).sort({ date: 1 });

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error fetching price history:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy lịch sử giá' });
  }
};
