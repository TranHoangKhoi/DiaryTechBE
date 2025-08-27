import { Request, Response } from 'express';
import fs from 'fs';
import mongoose from 'mongoose';
import path from 'path';
import { z } from 'zod';
import ProductionLogs from '~/models/ProductionLogs.model';

// Schema cho chemical_usages
const chemicalUsageSchema = z.object({
  chemical_id: z.string().nonempty('Chemical ID là bắt buộc'), // Chuỗi không rỗng
  quantity: z.number().positive('Số lượng phải lớn hơn 0'),
  unit: z.string().nonempty('Đơn vị là bắt buộc'),
  application_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Ngày ứng dụng phải là định dạng ngày hợp lệ (ISO)'
  }),
  notes: z.string().optional()
});

// Schema cho ProductionLog
const productionLogSchema = z.object({
  farm_id: z.string().nonempty('Farm ID là bắt buộc'),
  activity_id: z.string().nonempty('Activity ID là bắt buộc'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Ngày phải là định dạng ngày hợp lệ (ISO)'
  }),
  data: z.record(z.string(), z.any()).default({}), // Object động, mặc định là {}
  chemical_usages: z.array(chemicalUsageSchema).optional().default([]), // Mảng, mặc định rỗng
  notes: z.string().optional(),
  created_by: z.string().nonempty('Created_by là bắt buộc') // Chuỗi ObjectId
});

// TypeScript type từ Zod schema
export type ProductionLogInput = z.infer<typeof productionLogSchema>;

// Hàm tạo mới ProductionLog
export const createProductionLog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { activity_id, created_by, chemical_usages, date, farm_id, notes, data } = req.body;
    console.log('Received Body:', req.body);

    const parsedData = JSON.parse(req.body.data);

    // Gộp file fieldname vào parsedData
    if (Array.isArray(req.files)) {
      req.files.forEach((file) => {
        if (file.fieldname.includes('[')) {
          const fieldName = decodeURIComponent(file.fieldname.split('[')[1].split(']')[0]);
          parsedData[fieldName] = file.filename;
        }
      });
    }

    // Gán lại vào req.body.data
    req.body.data = JSON.stringify(parsedData);

    // In log kiểm tra
    console.log('Final req.body.data:', req.body);

    console.log('Merged Data:', parsedData);

    if (typeof req.body.data === 'string') {
      req.body.data = JSON.parse(req.body.data);
    }

    if (typeof req.body.chemical_usages === 'string') {
      req.body.chemical_usages = JSON.parse(req.body.chemical_usages);
    }

    // Parse và validate dữ liệu từ FE với Zod
    const parsedDataFull = productionLogSchema.parse(req.body);

    // // Chuyển đổi các chuỗi thành ObjectId (nếu cần)
    const productionLogData = {
      farm_id: new mongoose.Types.ObjectId(parsedDataFull.farm_id),
      activity_id: new mongoose.Types.ObjectId(parsedDataFull.activity_id),
      date: new Date(parsedDataFull.date),
      data: parsedDataFull.data,
      chemical_usages: [],
      notes: parsedDataFull.notes,
      created_by: new mongoose.Types.ObjectId(parsedDataFull.created_by)
    };

    // // Tạo mới ProductionLog
    const newLog = new ProductionLogs(productionLogData);
    const savedLog = await newLog.save();

    res.status(201).json({
      message: 'Nhật ký sản xuất đã được tạo thành công',
      data: savedLog
    });
    return;
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      // Trả về lỗi validate từ Zod
      res.status(400).json({
        message: 'Dữ liệu không hợp lệ',
        errors: error.errors
      });
      return;
    }

    res.status(500).json({
      message: 'Lỗi server',
      error: error
    });
    return;
  }
};

// export const getProductionLogsByActivityAndFarm = async (req: Request, res: Response): Promise<void> => {
//   try {
//     // Lấy activity_id và farm_id từ query params hoặc body
//     const { activity_id, farm_id } = req.query;

//     console.log(activity_id, farm_id);

//     // Kiểm tra xem các tham số có được cung cấp không
//     if (!activity_id || !farm_id) {
//       res.status(400).json({
//         message: 'Vui lòng cung cấp cả activity_id và farm_id'
//       });
//       return;
//     }

//     // Chuyển đổi thành ObjectId (nếu cần)
//     const activityId = new mongoose.Types.ObjectId(activity_id as string);
//     const farmId = new mongoose.Types.ObjectId(farm_id as string);

//     // Truy vấn ProductionLogs
//     const productionLogs = await ProductionLogs.find({
//       activity_id: activityId,
//       farm_id: farmId
//     })
//       .populate('activity_id', 'activity_name description') // Populate thông tin Activity
//       .populate('farm_id', 'farm_name location') // Populate thông tin Farm từ User.farms
//       .populate('chemical_usages.chemical_id', 'chemical_name') // Populate thông tin Chemical
//       .populate('created_by', 'username email') // Populate thông tin User
//       .sort({ date: -1 }); // Sắp xếp theo ngày giảm dần (mới nhất trước)

//     // Kiểm tra kết quả
//     if (!productionLogs || productionLogs.length === 0) {
//       res.status(404).json({
//         message: 'Không tìm thấy ProductionLogs nào với activity_id và farm_id này'
//       });
//       return;
//     }

//     // Trả về danh sách ProductionLogs
//     res.status(200).json({
//       message: 'Lấy danh sách ProductionLogs thành công',
//       data: productionLogs
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message: 'Lỗi server',
//       error: error
//     });
//   }
// };

export const getProductionLogsByID = async (req: Request, res: Response): Promise<void> => {
  try {
    // Lấy activity_id và farm_id từ query params hoặc body
    const { id } = req.params;
    console.log('Id Productions log: ', id);

    // Chuyển đổi thành ObjectId (nếu cần)
    const productionLogId = new mongoose.Types.ObjectId(id as string);

    // Truy vấn ProductionLogs
    const productionLog = await ProductionLogs.findById(productionLogId);
    console.log('productionLog: ', productionLog);

    // Trả về danh sách ProductionLogs
    res.status(200).json(productionLog);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Lỗi server',
      error: error
    });
  }
};

export const getProductionLogsByActivityAndFarm = async (req: Request, res: Response): Promise<void> => {
  try {
    // Lấy activity_id và farm_id từ query params hoặc body
    const { activity_id, farm_id } = req.query;

    console.log('activity_id: ', activity_id);
    console.log('farm_id: ', farm_id);

    // Kiểm tra xem các tham số có được cung cấp không
    if (!activity_id || !farm_id) {
      res.status(400).json({
        message: 'Vui lòng cung cấp cả activity_id và farm_id'
      });
      return;
    }

    // Chuyển đổi thành ObjectId (nếu cần)
    const activityId = new mongoose.Types.ObjectId(activity_id as string);
    const farmId = new mongoose.Types.ObjectId(farm_id as string);

    // Truy vấn ProductionLogs
    const productionLogs = await ProductionLogs.find({
      activity_id: activityId,
      farm_id: farmId
    });

    console.log('productionLogs: ', productionLogs);

    //   .populate('activity_id', 'activity_name description') // Populate thông tin Activity
    //   .populate('farm_id', 'farm_name location') // Populate thông tin Farm từ User.farms
    //   .populate('chemical_usages.chemical_id', 'chemical_name') // Populate thông tin Chemical
    //   .populate('created_by', 'username email') // Populate thông tin User
    //   .sort({ date: -1 }); // Sắp xếp theo ngày giảm dần (mới nhất trước)

    // Kiểm tra kết quả
    if (!productionLogs || productionLogs.length === 0) {
      res.status(404).json({
        message: 'Không tìm thấy ProductionLogs nào với activity_id và farm_id này'
      });
      return;
    }

    // Trả về danh sách ProductionLogs
    res.status(200).json(productionLogs);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Lỗi server',
      error: error
    });
  }
};

export const handleGetImageProductionLog = async (req: Request, res: Response): Promise<void> => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../../uploads', filename);
  console.log('filename: ', filename);

  if (!fs.existsSync(filePath)) {
    res.status(404).json({ message: 'File not found' });
    return;
  }

  res.sendFile(filePath);
};
