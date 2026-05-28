import { Request, Response } from 'express';
import { Types } from 'mongoose';
import FarmModel from '~/models/Farm.model';
import InventoryStockModel from '~/models/InventoryStock.model';
import { assertFarmAccess, getFarmAccessCondition } from '~/services/farmAccess.service';

const parsePositiveInt = (value: unknown, fallback: number, max = 100) => {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (Number.isNaN(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, max);
};

const isValidObjectId = (value: string) => Types.ObjectId.isValid(value);
const normalizeSlug = (value: string) => value.trim().toLowerCase().replace(/\s+/g, '_');
const isAdminUser = (user?: Express.Request['user']) => user?.role === 'superadmin' || user?.role === 'admin';

const getAccessibleFarmIds = async (user?: Express.Request['user']) => {
  const accessCondition = getFarmAccessCondition(user as NonNullable<Express.Request['user']> | undefined);
  if (!accessCondition) return null;

  const farms = await FarmModel.find(accessCondition).select('_id').lean();
  return farms.map((farm) => farm._id);
};

export const getInventoryStocks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { farm_id, material_id, category, status, search, page = 1, limit = 100 } = req.query;
    const pageNumber = parsePositiveInt(page, 1);
    const limitNumber = parsePositiveInt(limit, 100);
    const skip = (pageNumber - 1) * limitNumber;
    const filter: Record<string, any> = {};

    if (farm_id) {
      if (!isValidObjectId(String(farm_id))) {
        res.status(400).json({ message: 'Invalid farm_id' });
        return;
      }

      const farmAccess = await assertFarmAccess(req.user, String(farm_id));
      if (!farmAccess.ok) {
        res.status(farmAccess.status).json({ message: farmAccess.message });
        return;
      }

      filter.farm_id = farm_id;
    } else if (!isAdminUser(req.user)) {
      const farmIds = await getAccessibleFarmIds(req.user);
      if (!farmIds) {
        res.status(403).json({ message: 'Forbidden' });
        return;
      }

      filter.farm_id = { $in: farmIds };
    }

    if (material_id) {
      if (!isValidObjectId(String(material_id))) {
        res.status(400).json({ message: 'Invalid material_id' });
        return;
      }
      filter.material_id = material_id;
    }

    if (category) filter.category = normalizeSlug(String(category));
    if (status) filter.status = status;

    if (search && String(search).trim()) {
      const escapedSearch = String(search)
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { material_name: { $regex: escapedSearch, $options: 'i' } },
        { supplier_name: { $regex: escapedSearch, $options: 'i' } }
      ];
    }

    const [stocks, total] = await Promise.all([
      InventoryStockModel.find(filter)
        .populate('farm_id', 'farm_name avatar')
        .populate('material_id', 'name code supplier_name manufacturer unit category status')
        .populate('last_log_id', 'log_date transaction_type quantity')
        .sort({ last_transaction_at: -1, updatedAt: -1 })
        .skip(skip)
        .limit(limitNumber),
      InventoryStockModel.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: stocks,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber)
      }
    });
  } catch (error) {
    console.error('Error getInventoryStocks:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
