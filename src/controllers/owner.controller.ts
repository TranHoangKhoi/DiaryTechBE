import { Request, Response } from 'express';
import User from '../models/User.model';
import Farm from '../models/Farm.model';
import { FarmCrop } from '../models/FarmCrop.model';
import { Crop } from '../models/CropCategories';
import ProductionLog from '../models/ProductionLogs.model';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { Types } from 'mongoose';
import { roleUser } from '~/config/constant';

// Schema validation với Zod
const registerSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(10).max(10),
  password: z.string().min(6),
  name: z.string(),
  address: z.string()
});

const registerOwnerSchema = z.object({
  phone: z.string().min(10).max(10),
  password: z.string().min(6),
  name: z.string().min(1),
  address: z.string().min(1),
  gender: z.number().min(1).default(1),
  des: z.string().optional()
});

export const getFarmer = async (req: Request, res: Response) => {
  try {
    const ownerId = req?.user?.id;
    console.log('ownerId: ', ownerId);

    // Kiểm tra ownerId có hợp lệ không
    if (!ownerId || !Types.ObjectId.isValid(ownerId)) {
      res.status(400).json({ message: 'Invalid owner ID' });
      return;
    }

    // Truy vấn danh sách user với owner_id
    const listFarmer = await User.find({ owner_id: ownerId }).exec();

    // Kiểm tra xem có dữ liệu hay không
    if (!listFarmer || listFarmer.length === 0) {
      res.status(404).json({ message: 'No users found for this owner' });
      return;
    }

    res.status(200).json(listFarmer);
  } catch (error) {
    console.error('Error fetching farmers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getFarmerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const idFarmer = req.params.id;
    const ownerAccount = req?.user;

    if (ownerAccount?.role !== roleUser.owner) {
      res.status(400).json({ message: 'Invalid permission !' });
    }

    if (!idFarmer || !Types.ObjectId.isValid(idFarmer)) {
      res.status(400).json({ message: 'Invalid farmer ID' });
      return;
    }

    const farmerInfo = await User.findById(idFarmer).exec();
    if (!farmerInfo) {
      res.status(404).json({ message: 'No users found for this owner' });
      return;
    }

    res.status(200).json(farmerInfo);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getOwnerStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.id;

    if (!ownerId || !Types.ObjectId.isValid(ownerId)) {
      res.status(400).json({ success: false, message: 'Invalid owner ID' });
      return;
    }

    const ownerObjectId = new Types.ObjectId(ownerId);

    console.log('ownerObjectId: ', req.user);

    // 1. Tổng số hộ dân (Sub-accounts)
    // 2. Tổng số nông trại (Farms)
    // 3. Tổng diện tích canh tác
    const [totalSubAccounts, totalFarms, areaStats] = await Promise.all([
      User.countDocuments({ owner_id: ownerObjectId, role: roleUser.supAccount }),
      Farm.countDocuments({ owner_id: ownerObjectId }),
      Farm.aggregate([{ $match: { owner_id: ownerObjectId } }, { $group: { _id: null, totalArea: { $sum: '$area' } } }])
    ]);

    const totalAreaValue = areaStats[0]?.totalArea || 0;

    // Lấy danh sách farm_id thuộc owner để dùng cho các query sau
    const farms = await Farm.find({ owner_id: ownerObjectId }).select('_id farm_type_id');
    const farmIds = farms.map((f) => f._id);
    const totalFarmTypes = new Set(farms.map((f) => String(f.farm_type_id))).size;

    const totalProductionLogs = await ProductionLog.countDocuments({
      farm_id: { $in: farmIds }
    });

    // 4. Cơ cấu cây trồng chính
    const cropStructure = await FarmCrop.aggregate([
      {
        $match: {
          farm_id: { $in: farmIds },
          is_primary: true
        }
      },
      {
        $group: {
          _id: '$crop_id',
          totalArea: { $sum: '$area' },
          totalFarmsCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'crops',
          localField: '_id',
          foreignField: '_id',
          as: 'cropInfo'
        }
      },
      { $unwind: '$cropInfo' },
      {
        $project: {
          cropId: '$_id',
          cropName: '$cropInfo.name',
          color: '$cropInfo.color',
          totalFarmsCount: 1,
          totalArea: 1,
          percentage: {
            $cond: [{ $eq: [totalAreaValue, 0] }, 0, { $multiply: [{ $divide: ['$totalArea', totalAreaValue] }, 100] }]
          }
        }
      },
      { $sort: { percentage: -1 } }
    ]);

    // 5. Tỷ lệ hoạt động (Active Rate) trong 30 ngày qua
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const MIN_LOGS = 1;

    const activeFarmsAgg = await ProductionLog.aggregate([
      {
        $match: {
          farm_id: { $in: farmIds },
          created_at: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: '$farm_id',
          totalLogs: { $sum: 1 }
        }
      },
      {
        $match: {
          totalLogs: { $gte: MIN_LOGS }
        }
      }
    ]);

    const activeRate = totalFarms > 0 ? (activeFarmsAgg.length / totalFarms) * 100 : 0;

    // 6. Thống kê trong ngày (Today Insights)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const logsCreatedToday = await ProductionLog.countDocuments({
      farm_id: { $in: farmIds },
      created_at: { $gte: startOfToday }
    });

    const activeFarms = activeFarmsAgg.length;
    const inactiveFarms = totalFarms - activeFarms;

    res.status(200).json({
      success: true,
      data: {
        totalSubAccounts,
        totalFarms,
        totalProductionLogs,
        totalFarmTypes,
        totalArea: { value: totalAreaValue, unit: 'ha' },
        cropStructure,
        activeRate: parseFloat(activeRate.toFixed(2)),
        todayInsights: {
          logsCreatedToday,
          inactiveFarmsCount: inactiveFarms,
          activeFarmsCount: activeFarms
        }
      }
    });
  } catch (error) {
    console.error('Error fetching owner statistics:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error });
  }
};

export const registerOwner = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'superadmin') {
      res.status(403).json({ success: false, message: 'Only superadmin can create owner accounts' });
      return;
    }

    const { phone, password, name, address, gender, des } = registerOwnerSchema.parse(req.body);

    const existedUser = await User.findOne({ phone });
    if (existedUser) {
      res.status(400).json({ success: false, message: 'User already exists' });
      return;
    }

    const avatar =
      gender === 1
        ? 'https://res.cloudinary.com/delix6nht/image/upload/v1755744492/1_wlrjjb.png'
        : 'https://res.cloudinary.com/delix6nht/image/upload/v1755744493/2_giyotm.png';

    const user = new User({
      password,
      name,
      role: 'owner',
      address,
      phone,
      gender,
      avatar,
      des
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Owner account created successfully',
      data: {
        id: user._id,
        phone: user.phone,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
      return;
    }

    console.error('Error creating owner account:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
