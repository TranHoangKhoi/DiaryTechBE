import { Request, Response } from 'express';
import fs from 'fs';
import mongoose from 'mongoose';
import path from 'path';
import { z } from 'zod';
import { default as ProductionLogs, default as ProductionLogsModel } from '~/models/ProductionLogs.model';

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
export const createProductionLog = async (req: Request, res: Response) => {
  try {
    const { farm_id, activity_id, data, chemical_usages, notes, date } = req.body;

    const userId = req.user?.id;
    const newProductionLog = new ProductionLogsModel({
      farm_id,
      activity_id,
      data,
      chemical_usages,
      notes,
      date,
      created_by: userId
    });

    const savedLog = await newProductionLog.save();

    res.status(201).json({
      success: true,
      message: 'Tạo production log thành công',
      data: savedLog
    });
  } catch (error) {
    console.error('Error creating production log:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error
    });
  }
};

// Lấy danh sách hoạt động theo farmId
export const getProductionLogsByFarm = async (req: Request, res: Response) => {
  try {
    const { farm_id } = req.params;

    if (!farm_id) {
      res.status(400).json({
        success: false,
        message: 'Thiếu farm_id'
      });
    }

    const logs = await ProductionLogsModel.find({ farm_id })
      .populate('farm_id', 'farm_name avatar location') // lấy thông tin farm cơ bản
      .populate('activity_id', 'activity_name') // lấy tên activity
      .populate('created_by', 'name avatar') // lấy thông tin user tạo log
      // .populate('chemical_usages.chemical_id', 'name unit') // lấy tên + đơn vị hóa chất
      .sort({ created_at: -1 }); // sắp xếp mới nhất trước

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách production logs thành công',
      data: logs
    });
  } catch (error) {
    console.error('Error fetching production logs:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error
    });
  }
};

// Lấy chi tiết nhật ký bằng id nhật ký
// export const getProductionLogsByID = async (req: Request, res: Response): Promise<void> => {
//   try {
//     // Lấy activity_id và farm_id từ query params hoặc body
//     const { id } = req.params;
//     console.log('Id Productions log: ', id);

//     // Chuyển đổi thành ObjectId (nếu cần)
//     const productionLogId = new mongoose.Types.ObjectId(id as string);

//     // Truy vấn ProductionLogs
//     const productionLog = await ProductionLogs.findById(productionLogId);
//     console.log('productionLog: ', productionLog);

//     // Trả về danh sách ProductionLogs
//     res.status(200).json(productionLog);
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
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'ID không hợp lệ' });
      return;
    }

    // Truy vấn và populate cả activity và farm type
    const productionLog = await ProductionLogsModel.findById(id)
      .populate({
        path: 'activity_id',
        populate: {
          path: 'farm_type_id', // populate tiếp farm_type_id trong activity
          model: 'Farmtype'
        }
      })
      .populate({
        path: 'farm_id', // populate thêm farm nếu cần
        model: 'Farm'
      })
      .populate({
        path: 'created_by', // populate thêm user nếu muốn
        select: 'name phone avatar'
      });

    if (!productionLog) {
      res.status(404).json({ success: false, message: 'Không tìm thấy nhật ký sản xuất' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Lấy chi tiết nhật ký sản xuất thành công',
      data: productionLog
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi server', error });
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
