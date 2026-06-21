import { Request, Response } from 'express';
import mongoose, { Types } from 'mongoose';
import { z } from 'zod';
import { INVENTORY_MATERIAL_STATUSES } from '~/constants/inventoryContract';
import FarmModel from '~/models/Farm.model';
import Farmtype from '~/models/Farmtype.model';
import InventoryLogModel from '~/models/InventoryLog.model';
import InventoryMaterialModel from '~/models/InventoryMaterial.model';
import InventoryStockModel from '~/models/InventoryStock.model';
import { assertFarmAccess, getFarmAccessCondition } from '~/services/farmAccess.service';

const parsePositiveInt = (value: unknown, fallback: number, max = 100) => {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (Number.isNaN(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, max);
};

const isValidObjectId = (value: string) => Types.ObjectId.isValid(value);
const normalizeSlug = (value: string) => value.trim().toLowerCase().replace(/\s+/g, '_');
const MATERIAL_CODE_PAD_LENGTH = 3;
const MATERIAL_CODE_RETRY_LIMIT = 3;

const isAdminUser = (user?: Express.Request['user']) => user?.role === 'superadmin' || user?.role === 'admin';
const isFarmUser = (user?: Express.Request['user']) => user?.role === 'owner' || user?.role === 'sub_account';

const getAccessibleFarmIds = async (user?: Express.Request['user']) => {
  const accessCondition = getFarmAccessCondition(user as NonNullable<Express.Request['user']> | undefined);
  if (!accessCondition) return null;

  const farms = await FarmModel.find(accessCondition).select('_id').lean();
  return farms.map((farm) => farm._id);
};

const materialSchema = z.object({
  farm_id: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine((value) => !value || isValidObjectId(value), 'Invalid farm_id'),
  farm_type_id: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine((value) => !value || isValidObjectId(value), 'Invalid farm_type_id'),
  domain: z.string().trim().optional().default('inventory'),
  category: z.string().trim().min(1, 'Category is required'),
  key: z.string().trim().min(1, 'Material key is required'),
  code: z.string().trim().optional(),
  name: z.string().trim().min(1, 'Material name is required'),
  images: z.array(z.string().trim()).optional().default([]),
  supplier_name: z.string().trim().optional().default(''),
  manufacturer: z.string().trim().optional().default(''),
  unit: z.string().trim().min(1, 'Unit is required'),
  description: z.string().trim().optional().default(''),
  aliases: z.array(z.string().trim().min(1)).optional().default([]),
  substance_type: z.enum(['main', 'supplementary']).optional().default('main'),
  status: z.enum(INVENTORY_MATERIAL_STATUSES).optional().default('active'),
  source_template_id: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine((value) => !value || isValidObjectId(value), 'Invalid source_template_id')
});

const updateMaterialSchema = materialSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: 'At least one field is required'
});

const hasOwn = (payload: Record<string, unknown>, key: string) => Object.prototype.hasOwnProperty.call(payload, key);

const normalizeMaterialPayload = (
  payload: z.infer<typeof materialSchema> | z.infer<typeof updateMaterialSchema>
) => {
  const nextPayload: Record<string, unknown> = { ...payload };

  if (hasOwn(payload, 'farm_id')) nextPayload.farm_id = payload.farm_id || null;
  if (hasOwn(payload, 'farm_type_id')) nextPayload.farm_type_id = payload.farm_type_id || null;
  if (hasOwn(payload, 'domain')) nextPayload.domain = payload.domain ? normalizeSlug(payload.domain) : 'inventory';
  if (hasOwn(payload, 'category')) nextPayload.category = payload.category ? normalizeSlug(payload.category) : undefined;
  if (hasOwn(payload, 'key')) nextPayload.key = payload.key ? normalizeSlug(payload.key) : undefined;
  if (hasOwn(payload, 'code')) nextPayload.code = payload.code ? normalizeSlug(payload.code) : undefined;
  if (hasOwn(payload, 'aliases')) {
    nextPayload.aliases = Array.isArray(payload.aliases)
      ? payload.aliases.map((item) => normalizeSlug(item)).filter(Boolean)
      : [];
  }

  return nextPayload as z.infer<typeof materialSchema> | z.infer<typeof updateMaterialSchema>;
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getNextMaterialCode = async ({
  scope_type,
  scope_id,
  key
}: {
  scope_type: 'farm' | 'farm_type';
  scope_id: mongoose.Types.ObjectId;
  key: string;
}) => {
  const materials = await InventoryMaterialModel.find({
    scope_type,
    scope_id,
    key,
    code: { $regex: `^${escapeRegExp(key)}-\\d+$` }
  })
    .select('code')
    .lean();

  const maxNumber = materials.reduce((max, item) => {
    const match = String(item.code || '').match(/-(\d+)$/);
    if (!match) return max;
    const value = Number.parseInt(match[1], 10);
    return Number.isFinite(value) ? Math.max(max, value) : max;
  }, 0);

  return `${key}-${String(maxNumber + 1).padStart(MATERIAL_CODE_PAD_LENGTH, '0')}`;
};

const isDuplicateCodeError = (error: unknown) =>
  error instanceof mongoose.mongo.MongoServerError &&
  error.code === 11000 &&
  Boolean((error as any).keyPattern?.code);

const handleControllerError = (res: Response, error: unknown, logLabel: string) => {
  if (error instanceof z.ZodError) {
    res.status(400).json({ message: 'Validation error', errors: error.errors });
    return;
  }

  if (error instanceof mongoose.Error.ValidationError) {
    res.status(400).json({ message: 'Validation error', error: error.message });
    return;
  }

  if (error instanceof mongoose.mongo.MongoServerError && error.code === 11000) {
    res.status(409).json({ message: 'Inventory material already exists', keyValue: error.keyValue });
    return;
  }

  console.error(logLabel, error);
  res.status(500).json({ message: 'Server error' });
};

const resolveMaterialScope = async (
  payload: ReturnType<typeof normalizeMaterialPayload>,
  current?: { farm_id?: unknown; farm_type_id?: unknown }
) => {
  const farmIdTouched = hasOwn(payload as Record<string, unknown>, 'farm_id');
  const farmTypeIdTouched = hasOwn(payload as Record<string, unknown>, 'farm_type_id');

  let farmId = farmIdTouched ? payload.farm_id : current?.farm_id ? String(current.farm_id) : null;
  let farmTypeId = farmTypeIdTouched ? payload.farm_type_id : current?.farm_type_id ? String(current.farm_type_id) : null;

  if (farmIdTouched && payload.farm_id) farmTypeId = null;
  if (farmTypeIdTouched && payload.farm_type_id) farmId = null;

  if (!farmId && !farmTypeId) {
    return { ok: false as const, status: 400, message: 'farm_id or farm_type_id is required' };
  }

  if (farmId && farmTypeId) {
    return { ok: false as const, status: 400, message: 'Only one of farm_id or farm_type_id is allowed' };
  }

  if (farmId) {
    const farm = await FarmModel.exists({ _id: farmId });
    if (!farm) return { ok: false as const, status: 404, message: 'Farm not found' };
    const scopeId = new mongoose.Types.ObjectId(String(farmId));
    return {
      ok: true as const,
      scope_type: 'farm' as const,
      scope_id: scopeId,
      farm_id: scopeId,
      farm_type_id: null
    };
  }

  if (farmTypeId) {
    const farmType = await Farmtype.exists({ _id: farmTypeId });
    if (!farmType) return { ok: false as const, status: 404, message: 'Farm type not found' };
    const scopeId = new mongoose.Types.ObjectId(String(farmTypeId));
    return {
      ok: true as const,
      scope_type: 'farm_type' as const,
      scope_id: scopeId,
      farm_id: null,
      farm_type_id: scopeId
    };
  }

  return { ok: false as const, status: 400, message: 'Invalid material scope' };
};

const assertFarmMaterialWriteAccess = async (
  user: Express.Request['user'] | undefined,
  farmId?: unknown,
  message = 'You do not have access to this material farm'
) => {
  if (isAdminUser(user)) return { ok: true as const };

  if (!isFarmUser(user)) {
    return { ok: false as const, status: 403, message: 'Forbidden' };
  }

  if (!farmId) {
    return {
      ok: false as const,
      status: 400,
      message: 'owner/sub_account can only manage farm-scoped inventory materials'
    };
  }

  const farmAccess = await assertFarmAccess(user, String(farmId));
  if (!farmAccess.ok) return farmAccess;

  return { ok: true as const, farm: farmAccess.farm };
};

export const createInventoryMaterial = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsedPayload = materialSchema.parse(req.body);
    const payload = normalizeMaterialPayload(parsedPayload);
    const scope = await resolveMaterialScope(payload);
    if (!scope.ok) {
      res.status(scope.status).json({ message: scope.message });
      return;
    }

    const writeAccess = await assertFarmMaterialWriteAccess(req.user, scope.farm_id);
    if (!writeAccess.ok) {
      res.status(writeAccess.status).json({ message: writeAccess.message });
      return;
    }

    let material = null;
    for (let attempt = 0; attempt < MATERIAL_CODE_RETRY_LIMIT; attempt += 1) {
      const code = await getNextMaterialCode({
        scope_type: scope.scope_type,
        scope_id: scope.scope_id,
        key: String(payload.key)
      });

      try {
        material = await InventoryMaterialModel.create({
          ...payload,
          scope_type: scope.scope_type,
          scope_id: scope.scope_id,
          farm_id: scope.farm_id,
          farm_type_id: scope.farm_type_id,
          code,
          created_by: req.user?.id
        });
        break;
      } catch (error) {
        if (attempt < MATERIAL_CODE_RETRY_LIMIT - 1 && isDuplicateCodeError(error)) continue;
        throw error;
      }
    }

    res.status(201).json({ message: 'Create inventory material successfully', data: material });
  } catch (error) {
    handleControllerError(res, error, 'Error createInventoryMaterial:');
  }
};

export const getInventoryMaterials = async (req: Request, res: Response): Promise<void> => {
  try {
    const { farm_id, farm_type_id, category, status, search, page = 1, limit = 20 } = req.query;
    const pageNumber = parsePositiveInt(page, 1);
    const limitNumber = parsePositiveInt(limit, 20);
    const skip = (pageNumber - 1) * limitNumber;
    const filter: Record<string, any> = {};
    let scopedFarmId = '';
    let scopedFarmTypeId = '';

    if (farm_id) {
      if (!isValidObjectId(String(farm_id))) {
        res.status(400).json({ message: 'Invalid farm_id' });
        return;
      }

      const farm = await FarmModel.findById(String(farm_id)).select('_id farm_type_id').lean();
      if (!farm) {
        res.status(404).json({ message: 'Farm not found' });
        return;
      }

      filter.$and = [
        {
          $or: [
            { farm_id: farm._id },
            { farm_id: null, farm_type_id: farm.farm_type_id }
          ]
        }
      ];
    }

    if (farm_type_id) {
      if (!isValidObjectId(String(farm_type_id))) {
        res.status(400).json({ message: 'Invalid farm_type_id' });
        return;
      }
      delete filter.$or;
      delete filter.$and;
      filter.farm_type_id = farm_type_id;
    }

    if (category) filter.category = normalizeSlug(String(category));
    if (status) filter.status = status;

    if (!isAdminUser(req.user)) {
      filter.status = 'active';

      if (farm_id) {
        const farmAccess = await assertFarmAccess(req.user, String(farm_id));
        if (!farmAccess.ok) {
          res.status(farmAccess.status).json({ message: farmAccess.message });
          return;
        }

        scopedFarmId = String(farmAccess.farm._id);
        scopedFarmTypeId = String(farmAccess.farm.farm_type_id);
        delete filter.farm_id;
        delete filter.farm_type_id;
        delete filter.$or;
        delete filter.$and;
      } else {
        const farmIds = await getAccessibleFarmIds(req.user);
        if (!farmIds) {
          res.status(403).json({ message: 'Forbidden' });
          return;
        }
        filter.farm_id = { $in: farmIds };
      }
    }

    if (search && String(search).trim()) {
      const escapedSearch = String(search)
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$and = [
        ...(Array.isArray(filter.$and) ? filter.$and : []),
        {
          $or: [
            { name: { $regex: escapedSearch, $options: 'i' } },
            { key: { $regex: escapedSearch, $options: 'i' } },
            { supplier_name: { $regex: escapedSearch, $options: 'i' } }
          ]
        }
      ];
    }

    if (scopedFarmId) {
      const andFilters = Array.isArray(filter.$and) ? filter.$and : [];
      filter.$and = [
        {
          $or: [
            { farm_id: scopedFarmId },
            { farm_id: null, farm_type_id: scopedFarmTypeId }
          ]
        },
        ...andFilters
      ];
    }

    const [materials, total] = await Promise.all([
      InventoryMaterialModel.find(filter)
        .populate('farm_type_id', 'type_name image description')
        .populate('farm_id', 'farm_name avatar')
        .populate('created_by', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),
      InventoryMaterialModel.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: materials,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber)
      }
    });
  } catch (error) {
    handleControllerError(res, error, 'Error getInventoryMaterials:');
  }
};

export const getInventoryMaterialById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400).json({ message: 'Invalid material id' });
      return;
    }

    const material = await InventoryMaterialModel.findById(req.params.id)
      .populate('farm_type_id', 'type_name image description')
      .populate('farm_id', 'farm_name avatar')
      .populate('created_by', 'name email role');

    if (!material) {
      res.status(404).json({ message: 'Inventory material not found' });
      return;
    }

    if (!isAdminUser(req.user)) {
      if (material.farm_id) {
        const farmAccess = await assertFarmAccess(req.user, String(material.farm_id));
        if (!farmAccess.ok) {
          res.status(farmAccess.status).json({ message: farmAccess.message });
          return;
        }
      } else if (req.query.farm_id) {
        const farmAccess = await assertFarmAccess(req.user, String(req.query.farm_id));
        if (!farmAccess.ok) {
          res.status(farmAccess.status).json({ message: farmAccess.message });
          return;
        }

        if (material.farm_type_id && String(material.farm_type_id) !== String(farmAccess.farm.farm_type_id)) {
          res.status(403).json({ message: 'Material does not match farm type' });
          return;
        }
      } else if (!req.query.farm_id) {
        res.status(403).json({ message: 'farm_id query is required for shared material access' });
        return;
      }
    }

    res.status(200).json({ success: true, data: material });
  } catch (error) {
    handleControllerError(res, error, 'Error getInventoryMaterialById:');
  }
};

export const updateInventoryMaterial = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400).json({ message: 'Invalid material id' });
      return;
    }

    const parsedPayload = updateMaterialSchema.parse(req.body);
    const payload = normalizeMaterialPayload(parsedPayload);
    delete (payload as Partial<typeof payload>).code;

    const currentMaterial = await InventoryMaterialModel.findById(req.params.id);
    if (!currentMaterial) {
      res.status(404).json({ message: 'Inventory material not found' });
      return;
    }

    const currentAccess = await assertFarmMaterialWriteAccess(req.user, currentMaterial.farm_id);
    if (!currentAccess.ok) {
      res.status(currentAccess.status).json({ message: currentAccess.message });
      return;
    }

    const scope = await resolveMaterialScope(payload, currentMaterial);
    if (!scope.ok) {
      res.status(scope.status).json({ message: scope.message });
      return;
    }

    const nextAccess = await assertFarmMaterialWriteAccess(req.user, scope.farm_id);
    if (!nextAccess.ok) {
      res.status(nextAccess.status).json({ message: nextAccess.message });
      return;
    }

    const nextKey = String(payload.key || currentMaterial.key);
    const scopeChanged =
      currentMaterial.scope_type !== scope.scope_type || String(currentMaterial.scope_id || '') !== String(scope.scope_id);
    const keyChanged = Boolean(payload.key && payload.key !== currentMaterial.key);
    const updatePayload: Record<string, unknown> = {
      ...payload,
      scope_type: scope.scope_type,
      scope_id: scope.scope_id,
      farm_id: scope.farm_id,
      farm_type_id: scope.farm_type_id
    };

    if (scopeChanged || keyChanged || !currentMaterial.scope_type || !currentMaterial.scope_id) {
      updatePayload.code = await getNextMaterialCode({
        scope_type: scope.scope_type,
        scope_id: scope.scope_id,
        key: nextKey
      });
    }

    const material = await InventoryMaterialModel.findByIdAndUpdate(req.params.id, updatePayload, {
      new: true,
      runValidators: true
    });

    if (!material) {
      res.status(404).json({ message: 'Inventory material not found' });
      return;
    }

    res.status(200).json({ message: 'Update inventory material successfully', data: material });
  } catch (error) {
    handleControllerError(res, error, 'Error updateInventoryMaterial:');
  }
};

export const deleteInventoryMaterial = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400).json({ message: 'Invalid material id' });
      return;
    }

    const material = await InventoryMaterialModel.findById(req.params.id);
    if (!material) {
      res.status(404).json({ message: 'Inventory material not found' });
      return;
    }

    const writeAccess = await assertFarmMaterialWriteAccess(req.user, material.farm_id);
    if (!writeAccess.ok) {
      res.status(writeAccess.status).json({ message: writeAccess.message });
      return;
    }

    const [logCount, stockCount] = await Promise.all([
      InventoryLogModel.countDocuments({ material_id: material._id }),
      InventoryStockModel.countDocuments({ material_id: material._id })
    ]);

    if (logCount > 0 || stockCount > 0) {
      material.status = 'archived';
      await material.save();
      res.status(200).json({
        message: 'Archive inventory material successfully',
        data: material,
        meta: { logCount, stockCount }
      });
      return;
    }

    await InventoryMaterialModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Delete inventory material successfully', data: material });
  } catch (error) {
    handleControllerError(res, error, 'Error deleteInventoryMaterial:');
  }
};
