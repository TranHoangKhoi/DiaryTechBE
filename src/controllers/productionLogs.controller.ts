import { Request, Response } from 'express';
import mongoose from 'mongoose';
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
    const { farm_id, activity_id, data, chemical_usages, notes, date, book_id } = req.body;

    const userId = req.user?.id;
    const newProductionLog = new ProductionLogsModel({
      farm_id,
      activity_id,
      data,
      chemical_usages,
      notes,
      date,
      book_id,
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
    const { book_id, page, limit } = req.query;

    if (!farm_id) {
      res.status(400).json({
        success: false,
        message: 'Thiếu farm_id'
      });
      return;
    }

    const filter: any = { farm_id };

    if (book_id) {
      filter.book_id = book_id;
    }

    const baseQuery = ProductionLogsModel.find(filter)
      .populate('farm_id', 'farm_name avatar location')
      .populate('activity_id', 'activity_name image')
      .populate('created_by', 'name avatar')
      .populate('book_id', 'name')
      .sort({ created_at: -1 });

    // =====================================
    // 🔹 Nếu có page + limit → Web dùng
    // =====================================

    if (page && limit) {
      const pageNumber = Math.max(parseInt(page as string), 1);
      const limitNumber = Math.max(parseInt(limit as string), 1);

      const skip = (pageNumber - 1) * limitNumber;

      const [logs, total] = await Promise.all([
        baseQuery.clone().skip(skip).limit(limitNumber),
        ProductionLogsModel.countDocuments(filter)
      ]);

      res.status(200).json({
        success: true,
        data: logs,
        pagination: {
          total,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(total / limitNumber)
        }
      });
      return;
    }

    // =====================================
    // 🔹 Không truyền gì → App cũ dùng
    // =====================================
    const logs = await baseQuery;

    res.status(200).json({
      success: true,
      data: logs
    });
    return;
  } catch (error) {
    console.error('Error fetching production logs:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
    return;
  }
};

export const getProductionLogsByID = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'ID không hợp lệ' });
      return;
    }

    const productionLog = await ProductionLogsModel.findById(id)
      .populate({
        path: 'activity_id',
        populate: {
          path: 'farm_type_id',
          model: 'Farmtype'
        }
      })
      .populate({
        path: 'farm_id',
        model: 'Farm',
        populate: [
          {
            path: 'owner_id',
            model: 'User',
            select: 'name phone avatar role'
          },
          {
            path: 'user_id',
            model: 'User',
            select: 'name phone avatar role'
          }
        ]
      })
      .populate({
        path: 'created_by',
        select: 'name phone avatar'
      })
      .populate({
        path: 'book_id',
        model: 'ProductionBook'
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

    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi server', error });
    return;
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
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Lỗi server',
      error: error
    });
    return;
  }
};

// Lấy ra hoạt động gần nhất
export const getRecentProductionLogs = async (req: Request, res: Response) => {
  try {
    const { farm_id, limit, exclude_log_id } = req.query;
    const limitNumber = Math.max(parseInt(limit as string) || 5, 1);
    const query: any = {};

    if (farm_id) {
      if (!mongoose.Types.ObjectId.isValid(farm_id as string)) {
        res.status(400).json({
          success: false,
          message: 'farm_id không hợp lệ'
        });
        return;
      }
      query.farm_id = new mongoose.Types.ObjectId(farm_id as string);
    } else if (req.user?.role === 'owner') {
      // Nếu là owner và không truyền farm_id, lấy log của tất cả farm thuộc owner này
      const farms = await mongoose.model('Farm').find({ owner_id: req.user.id }).select('_id');
      const farmIds = farms.map((f) => f._id);
      if (farmIds.length === 0) {
        res.status(200).json({ success: true, data: [] });
        return;
      }
      query.farm_id = { $in: farmIds };
    } else {
      res.status(400).json({
        success: false,
        message: 'Thiếu farm_id hoặc bạn không phải là owner'
      });
      return;
    }

    // nếu có log cần loại trừ
    if (exclude_log_id && mongoose.Types.ObjectId.isValid(exclude_log_id as string)) {
      query._id = {
        $ne: new mongoose.Types.ObjectId(exclude_log_id as string)
      };
    }

    const logs = await ProductionLogsModel.find(query)
      .populate('farm_id', 'farm_name avatar province ward location')
      .populate('activity_id', 'activity_name image')
      .populate('created_by', 'name avatar')
      .populate('book_id', 'name')
      .sort({ created_at: -1 })
      .limit(limitNumber);

    res.status(200).json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error('Error fetching recent logs:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

// Lấy nhật ký bằng tài khoản owner
export const getOwnerProductionLogs = async (req: Request, res: Response) => {
  try {
    const ownerId = req.user?.id;
    console.log('ownerId: ', req.user?.id);

    const { farmer_id, farm_id, page = 1, limit = 10 } = req.query;

    const pageNumber = Math.max(parseInt(page as string), 1);
    const limitNumber = Math.max(parseInt(limit as string), 1);
    const skip = (pageNumber - 1) * limitNumber;

    // ==============================
    // Tìm farm thuộc tenant
    // ==============================

    const farmFilter: any = {
      owner_id: ownerId
    };

    if (farmer_id) {
      farmFilter.user_id = farmer_id;
    }

    if (farm_id) {
      farmFilter._id = farm_id;
    }

    const farms = await mongoose.model('Farm').find(farmFilter).select('_id');

    const farmIds = farms.map((f: any) => f._id);

    // ==============================
    // Query production logs
    // ==============================

    const [logs, total] = await Promise.all([
      ProductionLogsModel.find({
        farm_id: { $in: farmIds }
      })
        .populate('farm_id', 'farm_name avatar province ward location')
        .populate('activity_id', 'activity_name image description')
        .populate('created_by', 'name avatar')
        .populate('book_id', 'name')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limitNumber),

      ProductionLogsModel.countDocuments({
        farm_id: { $in: farmIds }
      })
    ]);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber)
      }
    });
  } catch (error) {
    console.error('Error fetching tenant logs:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

// Lấy hoạt động gần nhất của owner
export const getRecentActivities = async (req: Request, res: Response) => {
  try {
    const ownerId = req.user?.id;

    const { limit = 4, farm_id } = req.query;

    const limitNumber = Math.max(parseInt(limit as string) || 5, 1);

    // ==============================
    // Lấy danh sách farm thuộc owner
    // ==============================

    const farmFilter: any = {
      owner_id: ownerId
    };

    if (farm_id) {
      farmFilter._id = farm_id;
    }

    const farms = await mongoose.model('Farm').find(farmFilter).select('_id farm_name avatar');

    const farmIds = farms.map((f: any) => f._id);

    if (!farmIds.length) {
      res.status(200).json({
        success: true,
        data: []
      });
      return;
    }

    // ==============================
    // Lấy production logs mới nhất
    // ==============================

    const logs = await ProductionLogsModel.find({
      farm_id: { $in: farmIds }
    })
      .populate('farm_id', 'farm_name avatar province ward')
      .populate('activity_id', 'activity_name image')
      .populate('created_by', 'name avatar')
      .sort({ created_at: -1 })
      .limit(limitNumber);

    // ==============================
    // Transform thành activity
    // ==============================

    const activities = logs.map((log: any) => ({
      id: log._id,
      type: 'create_log',

      message: `${log.farm_id?.farm_name} đã thêm nhật ký "${log.activity_id?.activity_name}"`,

      user: {
        id: log.created_by?._id,
        name: log.created_by?.name,
        avatar: log.created_by?.avatar
      },

      farm: {
        id: log.farm_id?._id,
        name: log.farm_id?.farm_name,
        avatar: log.farm_id?.avatar
      },

      created_at: log.created_at
    }));

    res.status(200).json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Error fetching recent activities:', error);

    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};
