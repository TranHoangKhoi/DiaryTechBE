import { Request, Response } from 'express';
import { MarketPrice } from '../models/marketPrice.model';
import mongoose from 'mongoose';

export const createMarketPrice = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { name, price, unit, province, imageUrl, type } = req.body;

    if (!name || !price) {
      res.status(400).json({ success: false, message: 'Vui lòng cung cấp tên sản phẩm và giá' });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Chống spam: Giới hạn 3 lần / ngày / người
    const count = await MarketPrice.countDocuments({
      userId: userId,
      date: today
    });

    if (count >= 3) {
      res.status(429).json({ success: false, message: 'Bạn đã đạt giới hạn báo giá trong hôm nay (tối đa 3 lần/ngày)' });
      return;
    }

    const newPrice = new MarketPrice({
      name,
      price: Number(price),
      unit: unit || 'kg',
      userId,
      province,
      date: today,
      imageUrl,
      type: type || 'Shrimp'
    });

    await newPrice.save();

    res.status(201).json({ success: true, message: 'Đóng góp báo giá thành công', data: newPrice });
  } catch (error) {
    console.error('Error creating market price:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi tạo báo giá' });
  }
};

export const getLatestPrices = async (req: Request, res: Response) => {
  try {
    const { province_code } = req.query;
    
    // Get the most recent date available in the DB
    const latestRecord = await MarketPrice.findOne().sort({ date: -1 });
    if (!latestRecord) {
      res.status(200).json({ success: true, data: [], message: 'Chưa có dữ liệu giá cả' });
      return;
    }

    const latestDate = latestRecord.date;

    const matchStage: any = { date: latestDate };
    if (province_code) {
      matchStage['province.province_code'] = String(province_code);
    }

    const prices = await MarketPrice.aggregate([
      { $match: matchStage },
      { $group: {
          _id: "$name",
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
          unit: { $first: "$unit" },
          imageUrl: { $first: "$imageUrl" },
          province: { $first: "$province" },
          type: { $first: "$type" }
      }}
    ]);

    const formattedData = prices.map(p => ({
      _id: p._id, // use name as ID for uniqueness in list
      name: p._id,
      price: p.minPrice === p.maxPrice ? p.minPrice.toLocaleString('vi-VN') : `${p.minPrice.toLocaleString('vi-VN')} - ${p.maxPrice.toLocaleString('vi-VN')}`,
      unit: p.unit,
      region: p.province?.name || 'Chưa xác định',
      imageUrl: p.imageUrl
    }));

    res.status(200).json({
      success: true,
      data: formattedData,
      updatedAt: latestDate
    });
  } catch (error) {
    console.error('Error fetching latest prices:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy dữ liệu giá' });
  }
};

export const getPriceHistory = async (req: Request, res: Response) => {
  try {
    const { name, province_code } = req.query;
    if (!name) {
      res.status(400).json({ success: false, message: 'Vui lòng cung cấp tên sản phẩm (name)' });
      return;
    }

    const matchStage: any = { name: String(name) };
    if (province_code) {
      matchStage['province.province_code'] = String(province_code);
    }

    const history = await MarketPrice.aggregate([
      { $match: matchStage },
      { $group: {
          _id: { date: "$date" },
          avgPrice: { $avg: "$price" },
      }},
      { $sort: { "_id.date": 1 } }
    ]);

    const formattedHistory = history.map(h => ({
      date: h._id.date,
      price: Math.round(h.avgPrice).toLocaleString('vi-VN')
    }));

    res.status(200).json({
      success: true,
      data: formattedHistory
    });
  } catch (error) {
    console.error('Error fetching price history:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy lịch sử giá' });
  }
};
