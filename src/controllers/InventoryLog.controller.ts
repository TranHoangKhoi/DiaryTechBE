import { Request, Response } from 'express';
import mongoose, { Types } from 'mongoose';
import { z } from 'zod';
import {
  INVENTORY_FIELD_TYPES,
  INVENTORY_LOG_STATUSES,
  INVENTORY_MATERIAL_AUTO_FILL_RULES,
  INVENTORY_MATERIAL_LOOKUP_MODEL,
  INVENTORY_MATERIAL_SNAPSHOT_FIELDS,
  INVENTORY_SCHEMA_ITEM_TYPES,
  INVENTORY_TEMPLATE_STATUSES,
  INVENTORY_TRANSACTION_TYPES
} from '~/constants/inventoryContract';
import FarmModel from '~/models/Farm.model';
import Farmtype from '~/models/Farmtype.model';
import InventoryMaterialModel from '~/models/InventoryMaterial.model';
import InventoryLogModel from '~/models/InventoryLog.model';
import InventoryTemplateModel, {
  IInventoryTemplate,
  IInventoryTemplateField,
  IInventoryTemplateSchemaItem
} from '~/models/InventoryTemplate.model';
import ProductionBookModel from '~/models/ProductionBook.model';
import { assertFarmAccess, getFarmAccessCondition } from '~/services/farmAccess.service';
import {
  reverseInventoryStockFromLog,
  resolveInventoryLogQuantity,
  getInventoryLogTransactionFactor,
  syncInventoryStockFromLog
} from '~/services/inventoryStock.service';
import { syncSharedFieldValuesFromInventoryLog } from '~/services/sharedFieldValue.service';

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

const applyInventoryLogAccessFilter = async (
  user: Express.Request['user'] | undefined,
  filter: Record<string, any>,
  farmId?: string
) => {
  if (!user) return { ok: false as const, status: 401, message: 'Unauthorized' };
  if (isAdminUser(user)) return { ok: true as const };

  if (farmId) {
    const farmAccess = await assertFarmAccess(user, farmId);
    if (!farmAccess.ok) return farmAccess;
    filter.farm_id = farmId;
    return { ok: true as const };
  }

  const farmIds = await getAccessibleFarmIds(user);
  if (!farmIds) return { ok: false as const, status: 403, message: 'Forbidden' };

  filter.farm_id = { $in: farmIds };
  return { ok: true as const };
};

const optionSchema = z.object({
  label: z.string().trim().min(1, 'Option label is required'),
  value: z.string().trim().min(1, 'Option value is required')
});

const fieldSchema = z
  .object({
    key: z.string().trim().min(1, 'Field key is required'),
    label: z.string().trim().min(1, 'Field label is required'),
    type: z.enum(INVENTORY_FIELD_TYPES),
    required: z.boolean().optional().default(false),
    options: z.array(optionSchema).optional().default([]),
    unit: z.string().trim().optional(),
    placeholder: z.string().trim().optional(),
    lookup: z
      .object({
        model: z.literal(INVENTORY_MATERIAL_LOOKUP_MODEL),
        scope: z.enum(['farm', 'farm_type']).optional(),
        category: z.string().trim().optional(),
        auto_fill: z.record(z.string()).optional()
      })
      .optional()
  })
  .superRefine((field, ctx) => {
    if (
      field.type === 'select' &&
      field.options.length === 0 &&
      field.lookup?.model !== INVENTORY_MATERIAL_LOOKUP_MODEL
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['options'],
        message: 'Select field must have at least one option'
      });
    }
  });

const schemaItemSchema = z
  .object({
    key: z.string().trim().min(1, 'Schema key is required'),
    name: z.string().trim().min(1, 'Schema name is required'),
    type: z.enum(INVENTORY_SCHEMA_ITEM_TYPES),
    fields: z.array(fieldSchema).optional().default([]),
    columns: z.array(fieldSchema).optional().default([])
  })
  .superRefine((item, ctx) => {
    const targetFields = item.type === 'table' ? item.columns : item.fields;
    if (targetFields.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [item.type === 'table' ? 'columns' : 'fields'],
        message: `${item.type} must have at least one field`
      });
      return;
    }

    const keys = new Set<string>();
    targetFields.forEach((field, index) => {
      const normalizedKey = normalizeSlug(field.key);
      if (keys.has(normalizedKey)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [item.type === 'table' ? 'columns' : 'fields', index, 'key'],
          message: `Duplicate field key: ${field.key}`
        });
      }
      keys.add(normalizedKey);
    });
  });

const baseTemplateSchema = z.object({
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
  key: z.string().trim().min(1, 'Template key is required'),
  name: z.string().trim().min(1, 'Template name is required'),
  description: z.string().trim().optional().default(''),
  schema: z.array(schemaItemSchema).min(1, 'Schema is required'),
  version: z.number().int().positive().optional().default(1),
  status: z.enum(INVENTORY_TEMPLATE_STATUSES).optional().default('active')
});

const createTemplateSchema = baseTemplateSchema;
const updateTemplateSchema = baseTemplateSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: 'At least one field is required'
});

const createLogSchema = z.object({
  farm_id: z.string().trim().refine(isValidObjectId, 'Invalid farm_id'),
  book_id: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine((value) => !value || isValidObjectId(value), 'Invalid book_id'),
  template_id: z.string().trim().refine(isValidObjectId, 'Invalid template_id'),
  material_id: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine((value) => !value || isValidObjectId(value), 'Invalid material_id'),
  transaction_type: z.enum(INVENTORY_TRANSACTION_TYPES).optional().default('in'),
  log_date: z.coerce.date().optional(),
  date: z.coerce.date().optional(),
  quantity: z.coerce.number().optional(),
  unit: z.string().trim().optional(),
  material_snapshot: z
    .object({
      material_name: z.string().trim().optional().default(''),
      supplier_name: z.string().trim().optional().default(''),
      manufacturer: z.string().trim().optional().default(''),
      unit: z.string().trim().optional().default('')
    })
    .optional(),
  data: z.record(z.any()).optional().default({}),
  notes: z.string().trim().optional().default(''),
  status: z.enum(INVENTORY_LOG_STATUSES).optional().default('submitted'),
  source_reference: z
    .object({
      model: z.enum(['ProductionLog', 'InventoryLog', 'manual']),
      id: z
        .string()
        .trim()
        .optional()
        .refine((value) => !value || isValidObjectId(value), 'Invalid source_reference.id')
    })
    .optional(),
  legacy_source: z
    .object({
      model: z.enum(['ProductionLog', 'InventoryLog', 'manual']),
      id: z
        .string()
        .trim()
        .optional()
        .refine((value) => !value || isValidObjectId(value), 'Invalid legacy_source.id')
    })
    .optional(),
  created_by: z.string().trim().optional()
});

const updateLogSchema = createLogSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: 'At least one field is required'
});

const normalizeTemplatePayload = (
  payload: z.infer<typeof createTemplateSchema> | z.infer<typeof updateTemplateSchema>
) => ({
  ...payload,
  farm_id: payload.farm_id || null,
  farm_type_id: payload.farm_type_id || null,
  domain: payload.domain ? normalizeSlug(payload.domain) : 'inventory',
  category: payload.category ? normalizeSlug(payload.category) : undefined,
  key: payload.key ? normalizeSlug(payload.key) : undefined,
  schema: payload.schema?.map((item) => ({
    ...item,
    key: normalizeSlug(item.key),
    fields: item.type === 'section' ? item.fields.map((field) => ({ ...field, key: normalizeSlug(field.key) })) : [],
    columns: item.type === 'table' ? item.columns.map((field) => ({ ...field, key: normalizeSlug(field.key) })) : []
  }))
});

const normalizeMaterialSnapshot = (material?: any) =>
  INVENTORY_MATERIAL_SNAPSHOT_FIELDS.reduce(
    (snapshot, field) => ({
      ...snapshot,
      [field]: material?.[field === 'material_name' ? 'name' : field] || ''
    }),
    {} as Record<(typeof INVENTORY_MATERIAL_SNAPSHOT_FIELDS)[number], string>
  );

const resolveMaterialLookupField = (template: IInventoryTemplate) => {
  for (const schemaItem of template.schema || []) {
    const fields = schemaItem.type === 'table' ? schemaItem.columns || [] : schemaItem.fields || [];
    const lookupField = fields.find((field) => field.lookup?.model === INVENTORY_MATERIAL_LOOKUP_MODEL);
    if (lookupField) return lookupField;
  }
  return null;
};

const resolveMaterialFieldValue = (template: IInventoryTemplate, data: Record<string, any>) => {
  const lookupField = resolveMaterialLookupField(template);
  if (!lookupField) return null;

  for (const schemaItem of template.schema || []) {
    const fields = schemaItem.type === 'table' ? schemaItem.columns || [] : schemaItem.fields || [];
    if (!fields.some((field) => field.key === lookupField.key)) continue;

    if (schemaItem.type === 'table') {
      const rows = Array.isArray(data[schemaItem.key]) ? data[schemaItem.key] : [];
      const firstRow = rows[0];
      const value = firstRow?.[lookupField.key];
      if (typeof value === 'string' && value.trim()) return value.trim();
      continue;
    }

    const value = data[schemaItem.key]?.[lookupField.key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }

  return null;
};

const applyMaterialSnapshotToLogData = (template: IInventoryTemplate, data: Record<string, any>, material?: any) => {
  if (!material) return data;

  const nextData = { ...data };
  const materialSnapshot = normalizeMaterialSnapshot(material);

  template.schema.forEach((schemaItem) => {
    const fields = schemaItem.type === 'table' ? schemaItem.columns || [] : schemaItem.fields || [];
    const getAutoFillValue = (fieldKey: string) => {
      for (const field of fields) {
        const autoFill = field.lookup?.model === INVENTORY_MATERIAL_LOOKUP_MODEL ? field.lookup.auto_fill || {} : {};
        for (const [materialField, targetField] of Object.entries(autoFill)) {
          if (targetField === fieldKey) {
            return materialSnapshot[materialField as keyof typeof materialSnapshot];
          }
        }
      }

      const rule = INVENTORY_MATERIAL_AUTO_FILL_RULES.find((item) =>
        (item.templateFieldKeys as readonly string[]).includes(fieldKey)
      );
      return rule ? materialSnapshot[rule.materialField] : undefined;
    };

    if (schemaItem.type === 'table') {
      const rows = Array.isArray(nextData[schemaItem.key]) ? [...nextData[schemaItem.key]] : [];
      nextData[schemaItem.key] = rows.map((row) => {
        const nextRow = { ...(row || {}) };
        fields.forEach((field) => {
          const autoFillValue = getAutoFillValue(field.key);
          if (autoFillValue !== undefined) nextRow[field.key] = autoFillValue || nextRow[field.key] || '';
        });
        return nextRow;
      });
      return;
    }

    const sectionValue =
      nextData[schemaItem.key] &&
      typeof nextData[schemaItem.key] === 'object' &&
      !Array.isArray(nextData[schemaItem.key])
        ? { ...nextData[schemaItem.key] }
        : {};

    fields.forEach((field) => {
      const autoFillValue = getAutoFillValue(field.key);
      if (autoFillValue !== undefined) sectionValue[field.key] = autoFillValue || sectionValue[field.key] || '';
    });

    nextData[schemaItem.key] = sectionValue;
  });

  return nextData;
};

const validateUniqueSchemaKeys = (schema: IInventoryTemplateSchemaItem[]) => {
  const keys = new Set<string>();
  for (const item of schema) {
    const normalizedKey = normalizeSlug(item.key);
    if (keys.has(normalizedKey)) return item.key;
    keys.add(normalizedKey);
  }
  return null;
};

const hasValue = (value: unknown) => value !== undefined && value !== null && value !== '';
const hasPayloadField = (payload: Record<string, unknown>, key: string) =>
  Object.prototype.hasOwnProperty.call(payload, key);

const validateFieldValue = (field: IInventoryTemplateField, value: unknown) => {
  if (!hasValue(value)) return !field.required;

  if (field.type === 'number') return typeof value === 'number' && Number.isFinite(value);
  if (field.type === 'boolean') return typeof value === 'boolean';
  if (field.type === 'date') return !Number.isNaN(new Date(String(value)).getTime());
  if (field.type === 'select') {
    if (field.lookup?.model === INVENTORY_MATERIAL_LOOKUP_MODEL)
      return typeof value === 'string' && value.trim().length > 0;
    return field.options.some((option) => option.value === value);
  }
  return typeof value === 'string';
};

const validateLogDataByTemplate = (template: IInventoryTemplate, data: Record<string, any>) => {
  const errors: Array<{ path: string; message: string }> = [];

  template.schema.forEach((item) => {
    const value = data[item.key];
    const fields = item.type === 'table' ? item.columns : item.fields;

    if (item.type === 'table') {
      if (!hasValue(value)) return;
      if (!Array.isArray(value)) {
        errors.push({ path: item.key, message: `${item.name} must be an array` });
        return;
      }

      value.forEach((row, rowIndex) => {
        fields.forEach((field) => {
          if (!validateFieldValue(field, row?.[field.key])) {
            errors.push({ path: `${item.key}.${rowIndex}.${field.key}`, message: `${field.label} is invalid` });
          }
        });
      });
      return;
    }

    if (!hasValue(value)) {
      if (fields.some((field) => field.required)) {
        errors.push({ path: item.key, message: `${item.name} is required` });
      }
      return;
    }

    if (typeof value !== 'object' || Array.isArray(value)) {
      errors.push({ path: item.key, message: `${item.name} must be an object` });
      return;
    }

    fields.forEach((field) => {
      if (!validateFieldValue(field, value[field.key])) {
        errors.push({ path: `${item.key}.${field.key}`, message: `${field.label} is invalid` });
      }
    });
  });

  return errors;
};

const syncInventorySharedValuesSafely = async ({ farm, template, log }: { farm: any; template: any; log: any }) => {
  try {
    await syncSharedFieldValuesFromInventoryLog({ farm, template, log });
  } catch (error) {
    console.error('Error syncSharedFieldValuesFromInventoryLog:', error);
  }
};

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
    res.status(409).json({ message: 'Template key and version already exists' });
    return;
  }

  console.error(logLabel, error);
  res.status(500).json({ message: 'Server error' });
};

export const createInventoryTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsedPayload = createTemplateSchema.parse(req.body);
    const payload = normalizeTemplatePayload(parsedPayload);

    if (payload.farm_id) {
      const farm = await FarmModel.exists({ _id: payload.farm_id });
      if (!farm) {
        res.status(404).json({ message: 'Farm not found' });
        return;
      }
    }

    if (payload.farm_type_id) {
      const farmType = await Farmtype.exists({ _id: payload.farm_type_id });
      if (!farmType) {
        res.status(404).json({ message: 'Farm type not found' });
        return;
      }
    }

    const duplicateKey = validateUniqueSchemaKeys(payload.schema as IInventoryTemplateSchemaItem[]);
    if (duplicateKey) {
      res.status(400).json({ message: `Duplicate schema key: ${duplicateKey}` });
      return;
    }

    const template = await InventoryTemplateModel.create({
      ...payload,
      created_by: req.user?.id
    });

    res.status(201).json({ message: 'Create inventory template successfully', data: template });
  } catch (error) {
    handleControllerError(res, error, 'Error createInventoryTemplate:');
  }
};

export const getInventoryTemplates = async (req: Request, res: Response): Promise<void> => {
  try {
    const { domain, category, farm_id, farm_type_id, status, search, page = 1, limit = 20 } = req.query;
    const pageNumber = parsePositiveInt(page, 1);
    const limitNumber = parsePositiveInt(limit, 20);
    const skip = (pageNumber - 1) * limitNumber;
    const filter: Record<string, any> = {};
    let scopedFarmTypeId = '';
    let scopedFarmId = '';

    if (domain) filter.domain = normalizeSlug(String(domain));
    if (category) filter.category = normalizeSlug(String(category));
    if (status) filter.status = status;

    if (farm_type_id) {
      if (!isValidObjectId(String(farm_type_id))) {
        res.status(400).json({ message: 'Invalid farm_type_id' });
        return;
      }
      filter.farm_type_id = farm_type_id;
    }

    if (farm_id) {
      if (!isValidObjectId(String(farm_id))) {
        res.status(400).json({ message: 'Invalid farm_id' });
        return;
      }
      filter.farm_id = farm_id;
    }

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
      } else if (farm_type_id) {
        filter.farm_id = null;
      } else {
        filter.farm_id = null;
      }
    }

    if (search && String(search).trim()) {
      const escapedSearch = String(search)
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { name: { $regex: escapedSearch, $options: 'i' } },
        { key: { $regex: escapedSearch, $options: 'i' } }
      ];
    }

    if (scopedFarmId) {
      const searchFilter = filter.$or;
      delete filter.$or;
      filter.$and = [
        {
          $or: [
            { farm_id: scopedFarmId },
            { farm_id: null, farm_type_id: scopedFarmTypeId },
            { farm_id: null, farm_type_id: null }
          ]
        },
        ...(searchFilter ? [{ $or: searchFilter }] : [])
      ];
    }

    const [templates, total] = await Promise.all([
      InventoryTemplateModel.find(filter)
        .populate('farm_type_id', 'type_name image description')
        .populate('farm_id', 'farm_name avatar')
        .populate('created_by', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),
      InventoryTemplateModel.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: templates,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber)
      }
    });
  } catch (error) {
    handleControllerError(res, error, 'Error getInventoryTemplates:');
  }
};

export const getInventoryTemplateById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400).json({ message: 'Invalid template id' });
      return;
    }

    const template = await InventoryTemplateModel.findById(req.params.id)
      .populate('farm_type_id', 'type_name image description')
      .populate('farm_id', 'farm_name avatar')
      .populate('created_by', 'name email role');

    if (!template) {
      res.status(404).json({ message: 'Inventory template not found' });
      return;
    }

    if (!isAdminUser(req.user)) {
      if (template.status !== 'active') {
        res.status(404).json({ message: 'Inventory template not found' });
        return;
      }

      if (template.farm_id) {
        const farmAccess = await assertFarmAccess(req.user, String(template.farm_id));
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

        if (template.farm_type_id && String(template.farm_type_id) !== String(farmAccess.farm.farm_type_id)) {
          res.status(403).json({ message: 'Template does not match farm type' });
          return;
        }
      }
    }

    res.status(200).json({ success: true, data: template });
  } catch (error) {
    handleControllerError(res, error, 'Error getInventoryTemplateById:');
  }
};

export const updateInventoryTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400).json({ message: 'Invalid template id' });
      return;
    }

    const parsedPayload = updateTemplateSchema.parse(req.body);
    const payload = normalizeTemplatePayload(parsedPayload);

    if (payload.farm_id) {
      const farm = await FarmModel.exists({ _id: payload.farm_id });
      if (!farm) {
        res.status(404).json({ message: 'Farm not found' });
        return;
      }
    }

    if (payload.farm_type_id) {
      const farmType = await Farmtype.exists({ _id: payload.farm_type_id });
      if (!farmType) {
        res.status(404).json({ message: 'Farm type not found' });
        return;
      }
    }

    if (payload.schema) {
      const duplicateKey = validateUniqueSchemaKeys(payload.schema as IInventoryTemplateSchemaItem[]);
      if (duplicateKey) {
        res.status(400).json({ message: `Duplicate schema key: ${duplicateKey}` });
        return;
      }
    }

    const template = await InventoryTemplateModel.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true
    });

    if (!template) {
      res.status(404).json({ message: 'Inventory template not found' });
      return;
    }

    res.status(200).json({ message: 'Update inventory template successfully', data: template });
  } catch (error) {
    handleControllerError(res, error, 'Error updateInventoryTemplate:');
  }
};

export const deleteInventoryTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400).json({ message: 'Invalid template id' });
      return;
    }

    const logCount = await InventoryLogModel.countDocuments({ template_id: req.params.id });
    if (logCount > 0) {
      res.status(409).json({ message: 'Cannot delete template that already has inventory logs' });
      return;
    }

    const template = await InventoryTemplateModel.findByIdAndDelete(req.params.id);
    if (!template) {
      res.status(404).json({ message: 'Inventory template not found' });
      return;
    }

    res.status(200).json({ message: 'Delete inventory template successfully', data: template });
  } catch (error) {
    handleControllerError(res, error, 'Error deleteInventoryTemplate:');
  }
};

export const createInventoryLog = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = createLogSchema.parse(req.body);
    const farmAccess = await assertFarmAccess(req.user, payload.farm_id);
    if (!farmAccess.ok) {
      res.status(farmAccess.status).json({ message: farmAccess.message });
      return;
    }

    const [farm, template] = await Promise.all([
      FarmModel.findById(payload.farm_id).select('_id farm_type_id'),
      InventoryTemplateModel.findById(payload.template_id)
    ]);

    if (!farm) {
      res.status(404).json({ message: 'Không tìm thấy trang trại' });
      return;
    }

    if (!template || template.status === 'archived') {
      res.status(404).json({ message: 'Không tìm thấy mẫu nhật ký tồn kho' });
      return;
    }

    if (template.farm_id && String(template.farm_id) !== String(farm._id)) {
      res.status(400).json({ message: 'Mẫu không thuộc về trang trại này' });
      return;
    }

    if (template.farm_type_id && String(template.farm_type_id) !== String(farm.farm_type_id)) {
      res.status(400).json({ message: 'Mẫu không phù hợp với loại trang trại' });
      return;
    }

    const resolvedMaterialId = payload.material_id || resolveMaterialFieldValue(template, payload.data);
    if (resolvedMaterialId && !isValidObjectId(String(resolvedMaterialId))) {
      res.status(400).json({ message: 'ID vật tư không hợp lệ' });
      return;
    }

    let material: any = null;
    if (resolvedMaterialId) {
      material = await InventoryMaterialModel.findById(resolvedMaterialId).select(
        '_id name supplier_name manufacturer unit category farm_id farm_type_id status'
      );

      if (!material || material.status === 'archived') {
        res.status(404).json({ message: 'Không tìm thấy vật tư trong kho' });
        return;
      }

      if (material.farm_id && String(material.farm_id) !== String(farm._id)) {
        res.status(400).json({ message: 'Vật tư không thuộc về trang trại này' });
        return;
      }

      if (material.farm_type_id && String(material.farm_type_id) !== String(farm.farm_type_id)) {
        res.status(400).json({ message: 'Vật tư không phù hợp với loại trang trại' });

        return;
      }
    }

    const nextData = applyMaterialSnapshotToLogData(template, payload.data, material);

    const dataErrors = validateLogDataByTemplate(template, nextData);
    if (dataErrors.length > 0) {
      res.status(400).json({
        message: 'Dữ liệu nhật ký tồn kho không hợp lệ',
        errors: dataErrors
      });
      return;
    }

    let normalizedBookId: string | null = null;
    if (payload.book_id) {
      const book = await ProductionBookModel.findById(payload.book_id).select('_id farm_id deleted_at');

      if (!book || book.deleted_at) {
        res.status(404).json({ message: 'Không tìm thấy sổ sản xuất' });
        return;
      }

      if (String(book.farm_id) !== String(farm._id)) {
        res.status(400).json({ message: 'Sổ sản xuất không thuộc về trang trại này' });
        return;
      }

      normalizedBookId = String(book._id);
    }

    const logDate = payload.log_date || payload.date || new Date();
    const quantity =
      typeof payload.quantity === 'number' ? payload.quantity : resolveInventoryLogQuantity(template, nextData);
    const materialSnapshot = material ? normalizeMaterialSnapshot(material) : payload.material_snapshot || undefined;

    const log = await InventoryLogModel.create({
      ...payload,
      farm_id: farm._id,
      book_id: normalizedBookId || undefined,
      material_id: resolvedMaterialId || undefined,
      log_date: logDate,
      quantity,
      unit: payload.unit || materialSnapshot?.unit || '',
      material_snapshot: materialSnapshot,
      data: nextData,
      domain: template.domain,
      category: template.category,
      template_key: template.key,
      template_version: template.version,
      source_reference:
        payload.source_reference || payload.legacy_source
          ? {
              model: (payload.source_reference || payload.legacy_source)!.model,
              id: (payload.source_reference || payload.legacy_source)!.id
            }
          : undefined,
      created_by: req.user?.id
    });

    await syncInventorySharedValuesSafely({ farm, template, log });

    if (resolvedMaterialId && quantity > 0) {
      await syncInventoryStockFromLog({
        farmId: String(farm._id),
        materialId: String(resolvedMaterialId),
        templateId: template._id,
        materialName: material?.name || materialSnapshot?.material_name || '',
        supplierName: material?.supplier_name || materialSnapshot?.supplier_name || '',
        unit: payload.unit || materialSnapshot?.unit || material?.unit || '',
        category: template.category,
        quantity,
        transactionType: payload.transaction_type,
        logId: String(log._id)
      });
    }

    res.status(201).json({
      message: 'Tạo nhật ký tồn kho thành công',
      data: log
    });
  } catch (error) {
    handleControllerError(res, error, 'Lỗi khi tạo nhật ký tồn kho:');
  }
};

export const getInventoryLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      farm_id,
      farmer_id,
      book_id,
      template_id,
      template_key,
      domain,
      category,
      transaction_type,
      status,
      from,
      to,
      page = 1,
      limit = 20
    } = req.query;
    const pageNumber = parsePositiveInt(page, 1);
    const limitNumber = parsePositiveInt(limit, 20);
    const skip = (pageNumber - 1) * limitNumber;
    const filter: Record<string, any> = {};

    if (farm_id) {
      if (!isValidObjectId(String(farm_id))) {
        res.status(400).json({ message: 'Invalid farm_id' });
        return;
      }
      filter.farm_id = farm_id;
    }

    const accessValidation = await applyInventoryLogAccessFilter(
      req.user,
      filter,
      farm_id ? String(farm_id) : undefined
    );
    if (!accessValidation.ok) {
      res.status(accessValidation.status).json({ message: accessValidation.message });
      return;
    }

    if (book_id) {
      if (!isValidObjectId(String(book_id))) {
        res.status(400).json({ message: 'Invalid book_id' });
        return;
      }
      filter.book_id = book_id;
    }

    if (farmer_id) {
      if (!isValidObjectId(String(farmer_id))) {
        res.status(400).json({ message: 'Invalid farmer_id' });
        return;
      }

      const accessCondition = isAdminUser(req.user)
        ? {}
        : getFarmAccessCondition(req.user as NonNullable<Express.Request['user']> | undefined);
      if (!accessCondition) {
        res.status(403).json({ message: 'Forbidden' });
        return;
      }

      const farms = await FarmModel.find({ ...accessCondition, user_id: farmer_id })
        .select('_id')
        .lean();
      const farmerFarmIds = farms.map((farm) => String(farm._id));

      if (typeof filter.farm_id === 'string') {
        if (!farmerFarmIds.includes(String(filter.farm_id))) {
          filter.farm_id = { $in: [] };
        }
      } else {
        filter.farm_id = { $in: farmerFarmIds };
      }
    }

    if (template_id) {
      if (!isValidObjectId(String(template_id))) {
        res.status(400).json({ message: 'Invalid template_id' });
        return;
      }
      filter.template_id = template_id;
    }

    if (template_key) {
      filter.template_key = normalizeSlug(String(template_key));
    }

    if (domain) filter.domain = normalizeSlug(String(domain));
    if (category) filter.category = normalizeSlug(String(category));
    if (transaction_type) filter.transaction_type = transaction_type;
    if (status) filter.status = status;

    if (from || to) {
      filter.log_date = {};
      if (from) filter.log_date.$gte = new Date(String(from));
      if (to) filter.log_date.$lte = new Date(String(to));
    }

    const [logs, total] = await Promise.all([
      InventoryLogModel.find(filter)
        .populate('farm_id', 'farm_name avatar owner_id user_id farm_type_id')
        .populate('book_id', 'name farm_id farm_type_id status')
        .populate('material_id', 'name supplier_name manufacturer unit category status')
        .populate('template_id', 'name key domain category version status')
        .populate('created_by', 'name email role')
        .sort({ log_date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),
      InventoryLogModel.countDocuments(filter)
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
    handleControllerError(res, error, 'Error getInventoryLogs:');
  }
};

export const getInventoryLogById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400).json({ message: 'Invalid inventory log id' });
      return;
    }

    const baseLog = await InventoryLogModel.findById(req.params.id).select('farm_id');
    if (!baseLog) {
      res.status(404).json({ message: 'Inventory log not found' });
      return;
    }

    const accessValidation = await applyInventoryLogAccessFilter(req.user, {}, String(baseLog.farm_id));
    if (!accessValidation.ok) {
      res.status(accessValidation.status).json({ message: accessValidation.message });
      return;
    }

    const log = await InventoryLogModel.findById(req.params.id)
      .populate('farm_id', 'farm_name avatar owner_id user_id farm_type_id')
      .populate('book_id', 'name farm_id farm_type_id status')
      .populate('material_id', 'name supplier_name manufacturer unit category status')
      .populate('template_id', 'name key domain category version status schema')
      .populate('created_by', 'name email role');

    if (!log) {
      res.status(404).json({ message: 'Inventory log not found' });
      return;
    }

    res.status(200).json({ success: true, data: log });
  } catch (error) {
    handleControllerError(res, error, 'Error getInventoryLogById:');
  }
};

export const updateInventoryLog = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400).json({ message: 'Invalid inventory log id' });
      return;
    }

    const payload = updateLogSchema.parse(req.body);
    const currentLog = await InventoryLogModel.findById(req.params.id);
    if (!currentLog) {
      res.status(404).json({ message: 'Inventory log not found' });
      return;
    }

    const currentAccess = await applyInventoryLogAccessFilter(req.user, {}, String(currentLog.farm_id));
    if (!currentAccess.ok) {
      res.status(currentAccess.status).json({ message: currentAccess.message });
      return;
    }

    const templateId = payload.template_id || String(currentLog.template_id);
    const template = await InventoryTemplateModel.findById(templateId);
    if (!template || template.status === 'archived') {
      res.status(404).json({ message: 'Inventory template not found' });
      return;
    }

    if (payload.farm_id) {
      const nextFarmAccess = await assertFarmAccess(req.user, payload.farm_id);
      if (!nextFarmAccess.ok) {
        res.status(nextFarmAccess.status).json({ message: nextFarmAccess.message });
        return;
      }

      const farm = await FarmModel.findById(payload.farm_id).select('_id farm_type_id');
      if (!farm) {
        res.status(404).json({ message: 'Farm not found' });
        return;
      }

      if (template.farm_id && String(template.farm_id) !== String(farm._id)) {
        res.status(400).json({ message: 'Template does not belong to this farm' });
        return;
      }

      if (template.farm_type_id && String(template.farm_type_id) !== String(farm.farm_type_id)) {
        res.status(400).json({ message: 'Template does not match farm type' });
        return;
      }
    }

    if (payload.book_id) {
      const book = await ProductionBookModel.exists({ _id: payload.book_id, deleted_at: null });
      if (!book) {
        res.status(404).json({ message: 'Production book not found' });
        return;
      }
    }

    const materialIdTouched = hasPayloadField(payload as Record<string, unknown>, 'material_id');
    const dataTouched = hasPayloadField(payload as Record<string, unknown>, 'data');
    const nextDataSource = payload.data ?? currentLog.data;
    const nextMaterialId = materialIdTouched
      ? payload.material_id || null
      : dataTouched
        ? resolveMaterialFieldValue(template, nextDataSource) || String(currentLog.material_id || '') || null
        : String(currentLog.material_id || '') || null;
    let material: any = null;
    if (nextMaterialId) {
      material = await InventoryMaterialModel.findById(nextMaterialId).select(
        '_id name supplier_name manufacturer unit category farm_id farm_type_id status'
      );

      if (!material || material.status === 'archived') {
        res.status(404).json({ message: 'Khong tim thay vat tu kho' });
        return;
      }

      const accessFarmId = payload.farm_id || String(currentLog.farm_id);
      const accessFarm = await FarmModel.findById(accessFarmId).select('_id farm_type_id');
      if (!accessFarm) {
        res.status(404).json({ message: 'Farm not found' });
        return;
      }

      if (material.farm_id && String(material.farm_id) !== String(accessFarm._id)) {
        res.status(400).json({ message: 'Vat tu khong thuoc ve trang trai nay' });
        return;
      }

      if (material.farm_type_id && String(material.farm_type_id) !== String(accessFarm.farm_type_id)) {
        res.status(400).json({ message: 'Vat tu khong phu hop voi loai trang trai' });
        return;
      }
    }

    const nextData = applyMaterialSnapshotToLogData(template, nextDataSource, material);
    const dataErrors = validateLogDataByTemplate(template, nextData);
    if (dataErrors.length > 0) {
      res.status(400).json({ message: 'Inventory log data is invalid', errors: dataErrors });
      return;
    }

    const nextQuantity =
      typeof payload.quantity === 'number' ? payload.quantity : resolveInventoryLogQuantity(template, nextData);
    const currentQuantity = Number(currentLog.quantity || resolveInventoryLogQuantity(template, currentLog.data));
    const nextTransactionType = payload.transaction_type || currentLog.transaction_type;
    const currentMovement = currentQuantity * getInventoryLogTransactionFactor(currentLog.transaction_type);
    const materialSnapshot = material
      ? normalizeMaterialSnapshot(material)
      : payload.material_snapshot || currentLog.material_snapshot || undefined;

    const updatePayload = {
      ...payload,
      log_date: payload.log_date || payload.date || currentLog.log_date,
      quantity: nextQuantity,
      unit: payload.unit || materialSnapshot?.unit || currentLog.unit || '',
      material_id: nextMaterialId || undefined,
      material_snapshot: materialSnapshot,
      data: nextData,
      domain: template.domain,
      category: template.category,
      template_key: template.key,
      template_version: template.version,
      source_reference:
        payload.source_reference || payload.legacy_source
          ? {
              model: (payload.source_reference || payload.legacy_source)!.model,
              id: (payload.source_reference || payload.legacy_source)!.id
            }
          : payload.source_reference || payload.legacy_source
    };

    const log = await InventoryLogModel.findByIdAndUpdate(req.params.id, updatePayload, {
      new: true,
      runValidators: true
    });

    const syncFarmId = payload.farm_id || String(currentLog.farm_id);
    const syncFarm = await FarmModel.findById(syncFarmId).select('_id farm_type_id');
    if (log && syncFarm) {
      await syncInventorySharedValuesSafely({ farm: syncFarm, template, log });
      const currentMaterialId = String(currentLog.material_id || '');
      const currentFarmId = String(currentLog.farm_id);
      const nextFarmId = String(syncFarm._id);
      const sameStockBucket =
        currentMaterialId &&
        nextMaterialId &&
        currentMaterialId === String(nextMaterialId) &&
        currentFarmId === nextFarmId;

      if (sameStockBucket) {
        await syncInventoryStockFromLog({
          farmId: String(syncFarm._id),
          materialId: String(nextMaterialId),
          templateId: template._id,
          materialName: material?.name || materialSnapshot?.material_name || '',
          supplierName: material?.supplier_name || materialSnapshot?.supplier_name || '',
          unit: updatePayload.unit || material?.unit || materialSnapshot?.unit || '',
          category: template.category,
          quantity: nextQuantity,
          transactionType: nextTransactionType,
          logId: String(log._id),
          previousMovement: currentMovement
        });
      } else {
        if (currentMaterialId) {
          await reverseInventoryStockFromLog({
            farmId: currentFarmId,
            materialId: currentMaterialId,
            templateId: currentLog.template_id,
            materialName: currentLog.material_snapshot?.material_name || '',
            supplierName: currentLog.material_snapshot?.supplier_name || '',
            unit: currentLog.unit || currentLog.material_snapshot?.unit || '',
            category: currentLog.category,
            quantity: currentQuantity,
            transactionType: currentLog.transaction_type,
            logId: String(log._id)
          });
        }

        if (nextMaterialId) {
          await syncInventoryStockFromLog({
            farmId: String(syncFarm._id),
            materialId: String(nextMaterialId),
            templateId: template._id,
            materialName: material?.name || materialSnapshot?.material_name || '',
            supplierName: material?.supplier_name || materialSnapshot?.supplier_name || '',
            unit: updatePayload.unit || material?.unit || materialSnapshot?.unit || '',
            category: template.category,
            quantity: nextQuantity,
            transactionType: nextTransactionType,
            logId: String(log._id)
          });
        }
      }
    }

    res.status(200).json({ message: 'Update inventory log successfully', data: log });
  } catch (error) {
    handleControllerError(res, error, 'Error updateInventoryLog:');
  }
};

export const deleteInventoryLog = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400).json({ message: 'Invalid inventory log id' });
      return;
    }

    const currentLog = await InventoryLogModel.findById(req.params.id).select(
      'farm_id material_id quantity transaction_type data unit template_id category material_snapshot'
    );
    if (!currentLog) {
      res.status(404).json({ message: 'Inventory log not found' });
      return;
    }

    const accessValidation = await applyInventoryLogAccessFilter(req.user, {}, String(currentLog.farm_id));
    if (!accessValidation.ok) {
      res.status(accessValidation.status).json({ message: accessValidation.message });
      return;
    }

    const log = await InventoryLogModel.findByIdAndDelete(req.params.id);

    if (log && currentLog.material_id) {
      const template = await InventoryTemplateModel.findById(String(currentLog.template_id));
      if (template) {
        const farm = await FarmModel.findById(String(currentLog.farm_id)).select('_id farm_type_id');
        if (farm) {
          const currentQuantity = Number(currentLog.quantity || resolveInventoryLogQuantity(template, currentLog.data));
          await reverseInventoryStockFromLog({
            farmId: String(farm._id),
            materialId: String(currentLog.material_id),
            templateId: template._id,
            materialName: currentLog.material_snapshot?.material_name || '',
            supplierName: currentLog.material_snapshot?.supplier_name || '',
            unit: currentLog.unit || currentLog.material_snapshot?.unit || '',
            category: template.category,
            quantity: currentQuantity,
            transactionType: currentLog.transaction_type,
            logId: String(log._id)
          });
        }
      }
    }

    res.status(200).json({ message: 'Delete inventory log successfully', data: log });
  } catch (error) {
    handleControllerError(res, error, 'Error deleteInventoryLog:');
  }
};
