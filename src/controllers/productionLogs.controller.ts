import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import ActivitiesModel from '~/models/Activities.model';
import FarmModel from '~/models/Farm.model';
import ProductionBookModel from '~/models/ProductionBook.model';
import { default as ProductionLogs, default as ProductionLogsModel } from '~/models/ProductionLogs.model';
import { assertFarmAccess, getFarmAccessCondition } from '~/services/farmAccess.service';
import {
  normalizeFieldKey,
  normalizeProductionLogDataByActivity,
  syncSharedFieldValuesFromLog
} from '~/services/sharedFieldValue.service';

// Schema cho chemical_usages
const chemicalUsageSchema = z.object({
  chemical_id: z.string().nonempty('Chemical ID lÃ  báº¯t buá»™c'), // Chuá»—i khÃ´ng rá»—ng
  quantity: z.number().positive('Sá»‘ lÆ°á»£ng pháº£i lá»›n hÆ¡n 0'),
  unit: z.string().nonempty('ÄÆ¡n vá»‹ lÃ  báº¯t buá»™c'),
  application_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'NgÃ y á»©ng dá»¥ng pháº£i lÃ  Ä‘á»‹nh dáº¡ng ngÃ y há»£p lá»‡ (ISO)'
  }),
  notes: z.string().optional()
});

// Schema cho ProductionLog
const productionLogSchema = z.object({
  farm_id: z.string().nonempty('Farm ID lÃ  báº¯t buá»™c'),
  activity_id: z.string().nonempty('Activity ID lÃ  báº¯t buá»™c'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'NgÃ y pháº£i lÃ  Ä‘á»‹nh dáº¡ng ngÃ y há»£p lá»‡ (ISO)'
  }),
  data: z.record(z.string(), z.any()).default({}), // Object Ä‘á»™ng, máº·c Ä‘á»‹nh lÃ  {}
  chemical_usages: z.array(chemicalUsageSchema).optional().default([]), // Máº£ng, máº·c Ä‘á»‹nh rá»—ng
  notes: z.string().optional(),
  created_by: z.string().nonempty('Created_by lÃ  báº¯t buá»™c') // Chuá»—i ObjectId
});

// TypeScript type tá»« Zod schema
export type ProductionLogInput = z.infer<typeof productionLogSchema>;

const MAX_MANAGE_LIMIT = 100;

const parsePositiveInt = (value: unknown, fallback: number, max = MAX_MANAGE_LIMIT) => {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (Number.isNaN(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, max);
};

const isValidObjectId = (value: unknown) => typeof value === 'string' && mongoose.Types.ObjectId.isValid(value);

const parseDateValue = (value: unknown) => {
  if (!value) return null;
  const date = new Date(value as string);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getActivityFields = (activity: any) => (Array.isArray(activity?.fields) ? activity.fields : []);

const isEmptyValue = (value: unknown) => {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  return false;
};

const readFieldValue = (rawData: Record<string, unknown>, field: any) => {
  const fieldKey = field?.key ? normalizeFieldKey(field.key) : '';
  if (fieldKey && rawData[fieldKey] !== undefined) return rawData[fieldKey];
  return rawData[field.field_name];
};

const validateLogDataByActivity = (data: unknown, activity: any) => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { ok: false as const, message: 'data must be an object' };
  }

  const rawData = data as Record<string, unknown>;

  for (const field of getActivityFields(activity)) {
    const fieldName = field.field_name;
    const value = readFieldValue(rawData, field);

    if (field.is_required && isEmptyValue(value)) {
      return { ok: false as const, message: `${fieldName} is required` };
    }

    if (isEmptyValue(value)) continue;

    if (field.field_type === 'number' && Number.isNaN(Number(value))) {
      return { ok: false as const, message: `${fieldName} must be a number` };
    }

    if (field.field_type === 'date' && Number.isNaN(Date.parse(String(value)))) {
      return { ok: false as const, message: `${fieldName} must be a valid date` };
    }

    if (field.field_type === 'image') {
      const isValidImageValue = Array.isArray(value) && value.every((item) => typeof item === 'string' && item.trim());
      if (!isValidImageValue) {
        return { ok: false as const, message: `${fieldName} must be an array of image urls` };
      }
    }

    if (field.field_type === 'select' && Array.isArray(field.options) && field.options.length > 0) {
      if (typeof value !== 'string' || !field.options.includes(value)) {
        return { ok: false as const, message: `${fieldName} has invalid option` };
      }
    }
  }

  return { ok: true as const };
};

const syncSharedValuesSafely = async ({
  farm,
  activity,
  book,
  log
}: {
  farm: any;
  activity: any;
  book: any;
  log: any;
}) => {
  try {
    await syncSharedFieldValuesFromLog({ farm, activity, book, log });
  } catch (error) {
    console.error('Error syncSharedFieldValuesFromLog:', error);
  }
};

const assertLogRelations = async ({
  farm_id,
  activity_id,
  book_id,
  data
}: {
  farm_id: string;
  activity_id: string;
  book_id: string;
  data: Record<string, unknown>;
}) => {
  if (!isValidObjectId(farm_id)) return { ok: false as const, status: 400, message: 'Invalid farm_id' };
  if (!isValidObjectId(activity_id)) return { ok: false as const, status: 400, message: 'Invalid activity_id' };
  if (!isValidObjectId(book_id)) return { ok: false as const, status: 400, message: 'Invalid book_id' };

  const [farm, activity, book] = await Promise.all([
    FarmModel.findById(farm_id).select('_id farm_type_id'),
    ActivitiesModel.findById(activity_id).select('_id farm_type_id fields'),
    ProductionBookModel.findById(book_id).select('_id farm_id farm_type_id deleted_at')
  ]);

  if (!farm) return { ok: false as const, status: 404, message: 'Farm not found' };
  if (!activity) return { ok: false as const, status: 404, message: 'Activity not found' };
  if (!book || book.deleted_at) return { ok: false as const, status: 404, message: 'Production book not found' };

  if (String(activity.farm_type_id) !== String(farm.farm_type_id)) {
    return { ok: false as const, status: 400, message: 'activity_id does not match farm_type_id' };
  }

  if (String(book.farm_id) !== String(farm._id)) {
    return { ok: false as const, status: 400, message: 'book_id does not belong to farm_id' };
  }

  const dataValidation = validateLogDataByActivity(data, activity);
  if (!dataValidation.ok) {
    return { ok: false as const, status: 400, message: dataValidation.message };
  }

  return { ok: true as const, farm, activity, book };
};

// HÃ m táº¡o má»›i ProductionLog
export const createProductionLog = async (req: Request, res: Response) => {
  try {
    const { farm_id, activity_id, data = {}, chemical_usages, notes, date, book_id, override_timestamps } = req.body;

    const userId = req.user?.id;
    const farmAccess = await assertFarmAccess(req.user, farm_id);
    if (!farmAccess.ok) {
      res.status(farmAccess.status).json({
        success: false,
        message: farmAccess.message
      });
      return;
    }

    const dateValue = parseDateValue(date);
    if (!dateValue) {
      res.status(400).json({
        success: false,
        message: 'Invalid date'
      });
      return;
    }

    const relationValidation = await assertLogRelations({
      farm_id,
      activity_id,
      book_id,
      data
    });
    if (!relationValidation.ok) {
      res.status(relationValidation.status).json({
        success: false,
        message: relationValidation.message
      });
      return;
    }

    const normalizedData = normalizeProductionLogDataByActivity(data, relationValidation.activity);

    const newProductionLog = new ProductionLogsModel({
      farm_id,
      activity_id,
      data: normalizedData,
      chemical_usages,
      notes,
      date: dateValue,
      book_id,
      created_by: userId,
      ...(override_timestamps ? { created_at: dateValue, updated_at: dateValue } : {})
    });

    const savedLog = await newProductionLog.save();
    await syncSharedValuesSafely({
      farm: relationValidation.farm,
      activity: relationValidation.activity,
      book: relationValidation.book,
      log: savedLog
    });

    res.status(201).json({
      success: true,
      message: 'Táº¡o production log thÃ nh cÃ´ng',
      data: savedLog
    });
  } catch (error) {
    console.error('Error creating production log:', error);
    res.status(500).json({
      success: false,
      message: 'Lá»—i server',
      error
    });
  }
};

// Láº¥y danh sÃ¡ch hoáº¡t Ä‘á»™ng theo farmId
export const getProductionLogsByFarm = async (req: Request, res: Response) => {
  try {
    const { farm_id } = req.params;
    const { book_id, activity_id, start_date, end_date, page, limit } = req.query;

    if (!farm_id) {
      res.status(400).json({
        success: false,
        message: 'Thiáº¿u farm_id'
      });
      return;
    }

    const farmAccess = await assertFarmAccess(req.user, farm_id);
    if (!farmAccess.ok) {
      res.status(farmAccess.status).json({
        success: false,
        message: farmAccess.message
      });
      return;
    }

    const filter: any = { farm_id };

    if (book_id) {
      if (!mongoose.Types.ObjectId.isValid(book_id as string)) {
        res.status(400).json({
          success: false,
          message: 'MÃ£ cuá»‘n nhÃ¢t kÃ½ khÃ´ng há»£p lá»‡'
        });
        return;
      }

      filter.book_id = book_id;
    }

    if (activity_id) {
      if (!mongoose.Types.ObjectId.isValid(activity_id as string)) {
        res.status(400).json({
          success: false,
          message: 'MÃ£ hoáº¡t Ä‘á»™ng khÃ´ng há»£p lá»‡'
        });
        return;
      }

      filter.activity_id = activity_id;
    }

    if (start_date || end_date) {
      const dateFilter: Record<string, Date> = {};

      if (start_date) {
        const startDate = new Date(start_date as string);

        if (isNaN(startDate.getTime())) {
          res.status(400).json({
            success: false,
            message: 'NgÃ y báº¯t Ä‘áº§u khÃ´ng há»£p lá»‡'
          });
          return;
        }

        startDate.setHours(0, 0, 0, 0);
        dateFilter.$gte = startDate;
      }

      if (end_date) {
        const endDate = new Date(end_date as string);

        if (isNaN(endDate.getTime())) {
          res.status(400).json({
            success: false,
            message: 'NgÃ y káº¿t thÃºc khÃ´ng há»£p lá»‡'
          });
          return;
        }

        endDate.setHours(23, 59, 59, 999);
        dateFilter.$lte = endDate;
      }

      filter.date = dateFilter;
    }

    const baseQuery = ProductionLogsModel.find(filter)
      .populate('farm_id', 'farm_name avatar location')
      .populate('activity_id', 'activity_name image fields')
      .populate('created_by', 'name avatar')
      .populate('book_id', 'name')
      .sort({ created_at: -1 });

    // =====================================
    // ðŸ”¹ Náº¿u cÃ³ page + limit â†’ Web dÃ¹ng
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
    // ðŸ”¹ KhÃ´ng truyá»n gÃ¬ â†’ App cÅ© dÃ¹ng
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
      message: 'Lá»—i server'
    });
    return;
  }
};

export const getProductionLogsByID = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'ID khÃ´ng há»£p lá»‡' });
      return;
    }

    const baseLog = await ProductionLogsModel.findById(id).select('farm_id');
    if (!baseLog) {
      res.status(404).json({ success: false, message: 'KhÃƒÂ´ng tÃƒÂ¬m thÃ¡ÂºÂ¥y nhÃ¡ÂºÂ­t kÃƒÂ½ sÃ¡ÂºÂ£n xuÃ¡ÂºÂ¥t' });
      return;
    }

    const farmAccess = await assertFarmAccess(req.user, String(baseLog.farm_id));
    if (!farmAccess.ok) {
      res.status(farmAccess.status).json({ success: false, message: farmAccess.message });
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
      res.status(404).json({ success: false, message: 'KhÃ´ng tÃ¬m tháº¥y nháº­t kÃ½ sáº£n xuáº¥t' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Láº¥y chi tiáº¿t nháº­t kÃ½ sáº£n xuáº¥t thÃ nh cÃ´ng',
      data: productionLog
    });

    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lá»—i server', error });
    return;
  }
};

export const getProductionLogsByActivityAndFarm = async (req: Request, res: Response): Promise<void> => {
  try {
    // Láº¥y activity_id vÃ  farm_id tá»« query params hoáº·c body
    const { activity_id, farm_id } = req.query;

    console.log('activity_id: ', activity_id);
    console.log('farm_id: ', farm_id);

    // Kiá»ƒm tra xem cÃ¡c tham sá»‘ cÃ³ Ä‘Æ°á»£c cung cáº¥p khÃ´ng
    if (!activity_id || !farm_id) {
      res.status(400).json({
        message: 'Vui lÃ²ng cung cáº¥p cáº£ activity_id vÃ  farm_id'
      });
      return;
    }

    // Chuyá»ƒn Ä‘á»•i thÃ nh ObjectId (náº¿u cáº§n)
    const farmAccess = await assertFarmAccess(req.user, farm_id as string);
    if (!farmAccess.ok) {
      res.status(farmAccess.status).json({
        message: farmAccess.message
      });
      return;
    }

    const activityId = new mongoose.Types.ObjectId(activity_id as string);
    const farmId = new mongoose.Types.ObjectId(farm_id as string);

    // Truy váº¥n ProductionLogs
    const productionLogs = await ProductionLogs.find({
      activity_id: activityId,
      farm_id: farmId
    });

    //   .populate('activity_id', 'activity_name description') // Populate thÃ´ng tin Activity
    //   .populate('farm_id', 'farm_name location') // Populate thÃ´ng tin Farm tá»« User.farms
    //   .populate('chemical_usages.chemical_id', 'chemical_name') // Populate thÃ´ng tin Chemical
    //   .populate('created_by', 'username email') // Populate thÃ´ng tin User
    //   .sort({ date: -1 }); // Sáº¯p xáº¿p theo ngÃ y giáº£m dáº§n (má»›i nháº¥t trÆ°á»›c)

    // Kiá»ƒm tra káº¿t quáº£
    if (!productionLogs || productionLogs.length === 0) {
      res.status(404).json({
        message: 'KhÃ´ng tÃ¬m tháº¥y ProductionLogs nÃ o vá»›i activity_id vÃ  farm_id nÃ y'
      });
      return;
    }

    // Tráº£ vá» danh sÃ¡ch ProductionLogs
    res.status(200).json(productionLogs);
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Lá»—i server',
      error: error
    });
    return;
  }
};

// Láº¥y ra hoáº¡t Ä‘á»™ng gáº§n nháº¥t
export const getManageProductionLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      farm_id,
      farm_type_id,
      owner_id,
      farmer_id,
      book_id,
      activity_id,
      start_date,
      end_date,
      search,
      page = 1,
      limit = 20
    } = req.query;

    const pageNumber = parsePositiveInt(page, 1);
    const limitNumber = parsePositiveInt(limit, 20);
    const skip = (pageNumber - 1) * limitNumber;
    const filter: Record<string, any> = {};

    if (book_id) {
      if (!isValidObjectId(book_id)) {
        res.status(400).json({ success: false, message: 'Invalid book_id' });
        return;
      }
      filter.book_id = book_id;
    }

    if (activity_id) {
      if (!isValidObjectId(activity_id)) {
        res.status(400).json({ success: false, message: 'Invalid activity_id' });
        return;
      }
      filter.activity_id = activity_id;
    }

    if (farm_id) {
      if (!isValidObjectId(farm_id)) {
        res.status(400).json({ success: false, message: 'Invalid farm_id' });
        return;
      }
      filter.farm_id = farm_id;
    } else if (farm_type_id || owner_id || farmer_id) {
      const farmFilter: Record<string, any> = {};

      if (farm_type_id) {
        if (!isValidObjectId(farm_type_id)) {
          res.status(400).json({ success: false, message: 'Invalid farm_type_id' });
          return;
        }
        farmFilter.farm_type_id = farm_type_id;
      }

      if (owner_id) {
        if (!isValidObjectId(owner_id)) {
          res.status(400).json({ success: false, message: 'Invalid owner_id' });
          return;
        }
        farmFilter.owner_id = owner_id;
      }

      if (farmer_id) {
        if (!isValidObjectId(farmer_id)) {
          res.status(400).json({ success: false, message: 'Invalid farmer_id' });
          return;
        }
        farmFilter.user_id = farmer_id;
      }

      const farms = await FarmModel.find(farmFilter).select('_id').lean();
      filter.farm_id = { $in: farms.map((farm) => farm._id) };
    }

    if (start_date || end_date) {
      const dateFilter: Record<string, Date> = {};

      if (start_date) {
        const startDate = parseDateValue(start_date);
        if (!startDate) {
          res.status(400).json({ success: false, message: 'Invalid start_date' });
          return;
        }
        startDate.setHours(0, 0, 0, 0);
        dateFilter.$gte = startDate;
      }

      if (end_date) {
        const endDate = parseDateValue(end_date);
        if (!endDate) {
          res.status(400).json({ success: false, message: 'Invalid end_date' });
          return;
        }
        endDate.setHours(23, 59, 59, 999);
        dateFilter.$lte = endDate;
      }

      filter.date = dateFilter;
    }

    if (search && String(search).trim()) {
      const escapedSearch = String(search).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [{ notes: { $regex: escapedSearch, $options: 'i' } }];
    }

    const [logs, total] = await Promise.all([
      ProductionLogsModel.find(filter)
        .populate('farm_id', 'farm_name avatar province ward location farm_type_id owner_id user_id')
        .populate('activity_id', 'activity_name image description fields farm_type_id')
        .populate('created_by', 'name avatar role')
        .populate('book_id', 'name production status start_date end_date')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limitNumber),
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
  } catch (error) {
    console.error('Error getManageProductionLogs:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getManageProductionLogById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid production log id' });
      return;
    }

    const log = await ProductionLogsModel.findById(id)
      .populate('farm_id', 'farm_name avatar province ward location farm_type_id owner_id user_id')
      .populate('activity_id', 'activity_name image description fields farm_type_id')
      .populate('created_by', 'name avatar role')
      .populate('book_id', 'name production status start_date end_date farm_id farm_type_id');

    if (!log) {
      res.status(404).json({ success: false, message: 'Production log not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: log
    });
  } catch (error) {
    console.error('Error getManageProductionLogById:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateManageProductionLog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid production log id' });
      return;
    }

    const currentLog = await ProductionLogsModel.findById(id);
    if (!currentLog) {
      res.status(404).json({ success: false, message: 'Production log not found' });
      return;
    }

    const nextFarmId = String(req.body.farm_id ?? currentLog.farm_id);
    const nextActivityId = String(req.body.activity_id ?? currentLog.activity_id);
    const nextBookId = String(req.body.book_id ?? currentLog.book_id);
    const nextData = req.body.data ?? currentLog.data ?? {};
    const relationValidation = await assertLogRelations({
      farm_id: nextFarmId,
      activity_id: nextActivityId,
      book_id: nextBookId,
      data: nextData
    });

    if (!relationValidation.ok) {
      res.status(relationValidation.status).json({
        success: false,
        message: relationValidation.message
      });
      return;
    }

    if (req.body.date !== undefined) {
      const nextDate = parseDateValue(req.body.date);
      if (!nextDate) {
        res.status(400).json({ success: false, message: 'Invalid date' });
        return;
      }
      currentLog.date = nextDate;
    }

    currentLog.farm_id = new mongoose.Types.ObjectId(nextFarmId) as any;
    currentLog.activity_id = new mongoose.Types.ObjectId(nextActivityId) as any;
    currentLog.book_id = new mongoose.Types.ObjectId(nextBookId) as any;
    currentLog.data = normalizeProductionLogDataByActivity(nextData, relationValidation.activity) as any;

    if (req.body.notes !== undefined) currentLog.notes = req.body.notes;
    currentLog.updated_at = new Date();

    const savedLog = await currentLog.save();
    await syncSharedValuesSafely({
      farm: relationValidation.farm,
      activity: relationValidation.activity,
      book: relationValidation.book,
      log: savedLog
    });

    res.status(200).json({
      success: true,
      message: 'Update production log successfully',
      data: savedLog
    });
  } catch (error) {
    console.error('Error updateManageProductionLog:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteManageProductionLog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid production log id' });
      return;
    }

    const deletedLog = await ProductionLogsModel.findByIdAndDelete(id);
    if (!deletedLog) {
      res.status(404).json({ success: false, message: 'Production log not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Delete production log successfully',
      data: deletedLog
    });
  } catch (error) {
    console.error('Error deleteManageProductionLog:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getRecentProductionLogs = async (req: Request, res: Response) => {
  try {
    const { farm_id, limit, exclude_log_id } = req.query;
    const limitNumber = Math.max(parseInt(limit as string) || 5, 1);
    const query: any = {};

    if (farm_id) {
      if (!mongoose.Types.ObjectId.isValid(farm_id as string)) {
        res.status(400).json({
          success: false,
          message: 'farm_id khÃ´ng há»£p lá»‡'
        });
        return;
      }
      const farmAccess = await assertFarmAccess(req.user, farm_id as string);
      if (!farmAccess.ok) {
        res.status(farmAccess.status).json({
          success: false,
          message: farmAccess.message
        });
        return;
      }

      query.farm_id = new mongoose.Types.ObjectId(farm_id as string);
    } else if (req.user?.role === 'owner' || req.user?.role === 'sub_account') {
      // Náº¿u lÃ  owner vÃ  khÃ´ng truyá»n farm_id, láº¥y log cá»§a táº¥t cáº£ farm thuá»™c owner nÃ y
      const farms = await mongoose.model('Farm').find(getFarmAccessCondition(req.user) ?? {}).select('_id');
      const farmIds = farms.map((f) => f._id);
      if (farmIds.length === 0) {
        res.status(200).json({ success: true, data: [] });
        return;
      }
      query.farm_id = { $in: farmIds };
    } else {
      res.status(400).json({
        success: false,
        message: 'Thiáº¿u farm_id hoáº·c báº¡n khÃ´ng cÃ³ quyá»n truy cáº­p'
      });
      return;
    }

    // náº¿u cÃ³ log cáº§n loáº¡i trá»«
    if (exclude_log_id && mongoose.Types.ObjectId.isValid(exclude_log_id as string)) {
      query._id = {
        $ne: new mongoose.Types.ObjectId(exclude_log_id as string)
      };
    }

    const logs = await ProductionLogsModel.find(query)
      .populate('farm_id', 'farm_name avatar province ward location')
      .populate('activity_id', 'activity_name image fields')
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
      message: 'Lá»—i server'
    });
  }
};

// Láº¥y nháº­t kÃ½ báº±ng tÃ i khoáº£n owner
export const getOwnerProductionLogs = async (req: Request, res: Response) => {
  try {
    const ownerId = req.user?.id;
    console.log('ownerId: ', req.user?.id);

    const { farmer_id, farm_id, book_id, activity_id, start_date, end_date, search, page = 1, limit = 10 } = req.query;

    const pageNumber = Math.max(parseInt(page as string), 1);
    const limitNumber = Math.max(parseInt(limit as string), 1);
    const skip = (pageNumber - 1) * limitNumber;

    // ==============================
    // TÃ¬m farm thuá»™c tenant
    // ==============================

    const farmFilter: any = {
      owner_id: ownerId
    };

    if (farmer_id) {
      if (!mongoose.Types.ObjectId.isValid(farmer_id as string)) {
        res.status(400).json({
          success: false,
          message: 'Há»™ nÃ´ng dÃ¢n khÃ´ng há»£p lá»‡'
        });
        return;
      }

      farmFilter.user_id = farmer_id;
    }

    if (farm_id) {
      if (!mongoose.Types.ObjectId.isValid(farm_id as string)) {
        res.status(400).json({
          success: false,
          message: 'MÃ£ trang tráº¡i khÃ´ng há»£p lá»‡'
        });
        return;
      }

      farmFilter._id = farm_id;
    }

    const farms = await mongoose.model('Farm').find(farmFilter).select('_id');

    const farmIds = farms.map((f: any) => f._id);

    const logFilter: any = {
      farm_id: { $in: farmIds }
    };

    if (book_id) {
      if (!mongoose.Types.ObjectId.isValid(book_id as string)) {
        res.status(400).json({
          success: false,
          message: 'MÃ£ cuá»‘n nháº­t kÃ½ khÃ´ng há»£p lá»‡'
        });
        return;
      }

      logFilter.book_id = book_id;
    }

    if (activity_id) {
      if (!mongoose.Types.ObjectId.isValid(activity_id as string)) {
        res.status(400).json({
          success: false,
          message: 'MÃ£ hoáº¡t Ä‘á»™ng khÃ´ng há»£p lá»‡'
        });
        return;
      }

      logFilter.activity_id = activity_id;
    }

    if (start_date || end_date) {
      const dateFilter: Record<string, Date> = {};

      if (start_date) {
        const startDate = new Date(start_date as string);

        if (isNaN(startDate.getTime())) {
          res.status(400).json({
            success: false,
            message: 'NgÃ y báº¯t Ä‘áº§u khÃ´ng há»£p lá»‡'
          });
          return;
        }

        startDate.setHours(0, 0, 0, 0);
        dateFilter.$gte = startDate;
      }

      if (end_date) {
        const endDate = new Date(end_date as string);

        if (isNaN(endDate.getTime())) {
          res.status(400).json({
            success: false,
            message: 'NgÃ y káº¿t thÃºc khÃ´ng há»£p lá»‡'
          });
          return;
        }

        endDate.setHours(23, 59, 59, 999);
        dateFilter.$lte = endDate;
      }

      logFilter.date = dateFilter;
    }

    if (search && (search as string).trim()) {
      const escapedSearch = (search as string).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      logFilter.$or = [{ notes: { $regex: escapedSearch, $options: 'i' } }];
    }

    // ==============================
    // Query production logs
    // ==============================

    const [logs, total] = await Promise.all([
      ProductionLogsModel.find(logFilter)
        .populate('farm_id', 'farm_name avatar province ward location')
        .populate('activity_id', 'activity_name image description fields')
        .populate('created_by', 'name avatar')
        .populate('book_id', 'name')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limitNumber),

      ProductionLogsModel.countDocuments(logFilter)
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
      message: 'Lá»—i server'
    });
  }
};

// Láº¥y hoáº¡t Ä‘á»™ng gáº§n nháº¥t cá»§a owner
export const getRecentActivities = async (req: Request, res: Response) => {
  try {
    const ownerId = req.user?.id;

    const { limit = 4, farm_id } = req.query;

    const limitNumber = Math.max(parseInt(limit as string) || 5, 1);

    // ==============================
    // Láº¥y danh sÃ¡ch farm thuá»™c owner
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
    // Láº¥y production logs má»›i nháº¥t
    // ==============================

    const logs = await ProductionLogsModel.find({
      farm_id: { $in: farmIds }
    })
      .populate('farm_id', 'farm_name avatar province ward')
      .populate('activity_id', 'activity_name image fields')
      .populate('created_by', 'name avatar')
      .sort({ created_at: -1 })
      .limit(limitNumber);

    // ==============================
    // Transform thÃ nh activity
    // ==============================

    const activities = logs.map((log: any) => ({
      id: log._id,
      type: 'create_log',

      message: `${log.farm_id?.farm_name} Ä‘Ã£ thÃªm nháº­t kÃ½ "${log.activity_id?.activity_name}"`,

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
      message: 'Lá»—i server'
    });
  }
};

export const deleteProductionLogsByActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { farm_id, activity_id } = req.query;

    if (!farm_id || !activity_id) {
      res.status(400).json({ message: 'farm_id vÃ  activity_id lÃ  báº¯t buá»™c' });
      return;
    }

    if (!isValidObjectId(farm_id) || !isValidObjectId(activity_id)) {
      res.status(400).json({ message: 'farm_id hoáº·c activity_id khÃ´ng há»£p lá»‡' });
      return;
    }

    const result = await ProductionLogsModel.deleteMany({ farm_id, activity_id });

    res.status(200).json({
      success: true,
      message: 'XÃ³a nháº­t kÃ½ thÃ nh cÃ´ng',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error deleting logs:', error);
    res.status(500).json({ success: false, message: 'Lá»—i server' });
  }
};
