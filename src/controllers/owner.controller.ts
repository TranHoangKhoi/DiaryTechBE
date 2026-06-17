import { Request, Response } from 'express';
import User, { IUser } from '../models/User.model';
import Farm from '../models/Farm.model';
import { FarmCrop } from '../models/FarmCrop.model';
import { Crop } from '../models/CropCategories';
import ProductionLog from '../models/ProductionLogs.model';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import mongoose, { Types } from 'mongoose';
import { roleUser } from '~/config/constant';
import { syncUserFileServer } from '~/services/userFileServerSync.service';
import { createOwnerSubscription } from '~/services/userSubscription.service';
import UserSubscription from '../models/UserSubscription.model';
import FarmZone from '../models/FarmZone.model';
import InventoryMaterial from '../models/InventoryMaterial.model';
import InventoryStock from '../models/InventoryStock.model';
import InventoryLog from '../models/InventoryLog.model';
import ProductionBook from '../models/ProductionBook.model';

// Schema validation với Zod
const registerSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(10).max(10),
  password: z.string().min(6),
  name: z.string(),
  address: z.string()
});

const provinceSchema = z.object({
  id: z.string().optional(),
  province_code: z.string().min(1),
  name: z.string().min(1),
  short_name: z.string().optional(),
  code: z.string().optional(),
  place_type: z.string().optional(),
  country: z.string().optional().default('VN'),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional()
});

const wardSchema = z.object({
  id: z.string().optional(),
  ward_code: z.string().min(1),
  name: z.string().min(1),
  province_code: z.string().min(1),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional()
});

const optionalDateSchema = z.preprocess((value) => {
  if (value === '' || value === null || typeof value === 'undefined') return null;
  return value;
}, z.coerce.date().nullable().optional());

const registerOwnerSchema = z.object({
  phone: z.string().min(10).max(10),
  password: z.string().min(6),
  name: z.string().min(1),
  cccd: z.string().optional().default(''),
  date_of_birth: optionalDateSchema,
  cccd_issue_place: z.string().optional().default(''),
  cccd_issue_date: optionalDateSchema,
  address: z.string().min(1),
  province: provinceSchema,
  ward: wardSchema,
  gender: z.number().min(1).default(1),
  des: z.string().optional(),
  module_id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  package_id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  custom_limits: z
    .object({
      max_sub_accounts: z.number().int().min(0).optional()
    })
    .optional()
});
export const getFarmer = async (req: Request, res: Response) => {
  try {
    const ownerId = req?.user?.id;
    const { status } = req.query;
    console.log('ownerId: ', ownerId);

    if (!ownerId || !Types.ObjectId.isValid(ownerId)) {
      res.status(400).json({ message: 'Invalid owner ID' });
      return;
    }

    const query: any = { owner_id: ownerId };
    if (status === 'active') {
      query.status = { $ne: 'deleted' };
    } else if (status === 'deleted') {
      query.status = 'deleted';
    }

    const listFarmer = await User.find(query).setOptions({ includeDeleted: true }).exec();

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

    const farmerInfo = await User.findById(idFarmer).setOptions({ includeDeleted: true }).exec();
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
  const session = await mongoose.startSession();

  try {
    if (req.user?.role !== 'superadmin') {
      res.status(403).json({ success: false, message: 'Only superadmin can create owner accounts' });
      return;
    }

    if (!req.user?.id) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const {
      phone,
      password,
      name,
      cccd,
      date_of_birth,
      cccd_issue_place,
      cccd_issue_date,
      address,
      province,
      ward,
      gender,
      des,
      module_id,
      package_id,
      custom_limits
    } = registerOwnerSchema.parse(req.body);

    const avatar =
      gender === 1
        ? 'https://res.cloudinary.com/delix6nht/image/upload/v1755744492/1_wlrjjb.png'
        : 'https://res.cloudinary.com/delix6nht/image/upload/v1755744493/2_giyotm.png';

    const assignedBy = req.user.id;
    let createdOwner: IUser | null = null;
    let createdSubscription: Awaited<ReturnType<typeof createOwnerSubscription>> | null = null;

    await session.withTransaction(async () => {
      const existedUser = await User.findOne({ phone }).select('_id').session(session);
      if (existedUser) {
        throw Object.assign(new Error('User already exists'), { statusCode: 400 });
      }

      const [user] = await User.create(
        [
          {
            password,
            name,
            role: 'owner',
            address,
            province,
            ward,
            phone,
            cccd,
            date_of_birth,
            cccd_issue_place,
            cccd_issue_date,
            gender,
            avatar,
            des
          }
        ],
        { session }
      );

      createdOwner = user;
      createdSubscription = await createOwnerSubscription({
        user_id: String(user._id),
        module_id,
        package_id,
        custom_limits,
        assigned_by: assignedBy,
        session
      });
    });

    const owner = createdOwner as IUser | null;
    if (!owner) {
      res.status(500).json({ success: false, message: 'Failed to create owner account' });
      return;
    }

    await syncUserFileServer(String(owner._id));

    res.status(201).json({
      success: true,
      message: 'Owner account and subscription created successfully',
      data: {
        owner: {
          id: owner._id,
          phone: owner.phone,
          role: owner.role,
          status: owner.status
        },
        subscription: createdSubscription
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
      return;
    }

    const statusCode =
      error instanceof Error && 'statusCode' in error ? Number((error as { statusCode: number }).statusCode) : 500;
    if (statusCode !== 500) {
      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create owner account'
      });
      return;
    }

    console.error('Error creating owner account:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  } finally {
    session.endSession();
  }
};

export const softDeleteFarmer = async (req: Request, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  try {
    const ownerId = req.user?.id;
    const farmerId = req.params.id;

    if (!ownerId || !Types.ObjectId.isValid(ownerId)) {
      res.status(400).json({ success: false, message: 'Invalid owner ID' });
      return;
    }
    if (!farmerId || !Types.ObjectId.isValid(farmerId)) {
      res.status(400).json({ success: false, message: 'Invalid farmer ID' });
      return;
    }

    await session.withTransaction(async () => {
      const user = await User.findOneAndUpdate(
        { _id: farmerId, owner_id: ownerId, status: { $ne: 'deleted' } },
        { status: 'deleted' },
        { session, new: true }
      );

      if (!user) {
        throw Object.assign(new Error('Farmer not found or already deleted'), { statusCode: 404 });
      }

      await Farm.updateMany({ user_id: farmerId }, { farm_status: 'deleted' }, { session });
    });

    res.status(200).json({ success: true, message: 'Farmer and associated farms have been soft deleted' });
  } catch (error) {
    const statusCode = error instanceof Error && 'statusCode' in error ? Number((error as any).statusCode) : 500;
    res
      .status(statusCode)
      .json({ success: false, message: error instanceof Error ? error.message : 'Internal server error' });
  } finally {
    session.endSession();
  }
};

export const hardDeleteFarmer = async (req: Request, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  try {
    const ownerId = req.user?.id;
    const farmerId = req.params.id;

    if (!ownerId || !Types.ObjectId.isValid(ownerId)) {
      res.status(400).json({ success: false, message: 'Invalid owner ID' });
      return;
    }
    if (!farmerId || !Types.ObjectId.isValid(farmerId)) {
      res.status(400).json({ success: false, message: 'Invalid farmer ID' });
      return;
    }

    await session.withTransaction(async () => {
      // 1. Ensure user is soft deleted and belongs to owner
      const user = await User.findOne({ _id: farmerId, owner_id: ownerId, status: 'deleted' })
        .setOptions({ includeDeleted: true })
        .session(session);
      if (!user) {
        throw Object.assign(new Error('Farmer must be soft deleted first before hard delete'), { statusCode: 400 });
      }

      // 2. Find farms
      const farms = await Farm.find({ user_id: farmerId }).setOptions({ includeDeleted: true }).session(session);
      const farmIds = farms.map((f) => f._id);

      if (farmIds.length > 0) {
        // 3. Cascading Delete
        await ProductionLog.deleteMany({ farm_id: { $in: farmIds } }).session(session);
        await ProductionBook.deleteMany({ farm_id: { $in: farmIds } }).session(session);
        await InventoryLog.deleteMany({ farm_id: { $in: farmIds } }).session(session);
        await InventoryStock.deleteMany({ farm_id: { $in: farmIds } }).session(session);
        await InventoryMaterial.deleteMany({ farm_id: { $in: farmIds } }).session(session);
        await FarmZone.deleteMany({ farm_id: { $in: farmIds } }).session(session);
        await Farm.deleteMany({ user_id: farmerId }).session(session);
      }

      // 4. Delete user
      await User.deleteOne({ _id: farmerId }).session(session);

      // 5. Restore remaining_sub_accounts
      await UserSubscription.findOneAndUpdate(
        { user_id: ownerId },
        { $inc: { remaining_sub_accounts: 1 } },
        { session }
      );
    });

    res.status(200).json({ success: true, message: 'Farmer permanently deleted' });
  } catch (error) {
    const statusCode = error instanceof Error && 'statusCode' in error ? Number((error as any).statusCode) : 500;
    res
      .status(statusCode)
      .json({ success: false, message: error instanceof Error ? error.message : 'Internal server error' });
  } finally {
    session.endSession();
  }
};

export const restoreFarmer = async (req: Request, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  try {
    const ownerId = req.user?.id;
    const farmerId = req.params.id;

    if (!ownerId || !Types.ObjectId.isValid(ownerId)) {
      res.status(400).json({ success: false, message: 'Invalid owner ID' });
      return;
    }
    if (!farmerId || !Types.ObjectId.isValid(farmerId)) {
      res.status(400).json({ success: false, message: 'Invalid farmer ID' });
      return;
    }

    await session.withTransaction(async () => {
      const user = await User.findOneAndUpdate(
        { _id: farmerId, owner_id: ownerId, status: 'deleted' },
        { status: 'active' },
        { session, new: true }
      ).setOptions({ includeDeleted: true });

      if (!user) {
        throw Object.assign(new Error('Farmer not found or is not deleted'), { statusCode: 404 });
      }

      await Farm.updateMany({ user_id: farmerId, farm_status: 'deleted' }, { farm_status: 'active' }, { session });
    });

    res.status(200).json({ success: true, message: 'Farmer and associated farms have been restored' });
  } catch (error) {
    console.error('restoreFarmer Error:', error);
    const statusCode = error instanceof Error && 'statusCode' in error ? Number((error as any).statusCode) : 500;
    res.status(statusCode).json({ success: false, message: error instanceof Error ? error.message : String(error) });
  } finally {
    session.endSession();
  }
};
