import { Request, Response } from 'express';
import mongoose, { Types } from 'mongoose';
import { z } from 'zod';
import Farmtype from '~/models/Farmtype.model';
import OperationalLogModel from '~/models/OperationalLog.model';
import OperationalLogTemplateModel, {
  IOperationalLogTemplate,
  IOperationalTemplateField,
  IOperationalTemplateSchemaItem
} from '~/models/OperationalLogTemplate.model';
import ProductionBookModel from '~/models/ProductionBook.model';

const FIELD_TYPES = ['text', 'number', 'date', 'select', 'textarea', 'image', 'boolean'] as const;
const SCHEMA_ITEM_TYPES = ['section', 'table'] as const;
const TEMPLATE_STATUSES = ['draft', 'active', 'archived'] as const;
const LOG_STATUSES = ['draft', 'submitted', 'approved'] as const;

const parsePositiveInt = (value: unknown, fallback: number, max = 100) => {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (Number.isNaN(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, max);
};

const isValidObjectId = (value: string) => Types.ObjectId.isValid(value);

const normalizeSlug = (value: string) => value.trim().toLowerCase().replace(/\s+/g, '_');

const optionSchema = z.object({
  label: z.string().trim().min(1, 'Option label is required'),
  value: z.string().trim().min(1, 'Option value is required')
});

const fieldSchema = z
  .object({
    key: z.string().trim().min(1, 'Field key is required'),
    label: z.string().trim().min(1, 'Field label is required'),
    type: z.enum(FIELD_TYPES),
    required: z.boolean().optional().default(false),
    options: z.array(optionSchema).optional().default([]),
    unit: z.string().trim().optional(),
    placeholder: z.string().trim().optional()
  })
  .superRefine((field, ctx) => {
    if (field.type === 'select' && field.options.length === 0) {
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
    type: z.enum(SCHEMA_ITEM_TYPES),
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
  farm_type_id: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine((value) => !value || isValidObjectId(value), 'Invalid farm_type_id'),
  domain: z.string().trim().min(1, 'Domain is required'),
  category: z.string().trim().min(1, 'Category is required'),
  key: z.string().trim().min(1, 'Template key is required'),
  name: z.string().trim().min(1, 'Template name is required'),
  description: z.string().trim().optional().default(''),
  schema: z.array(schemaItemSchema).min(1, 'Schema is required'),
  version: z.number().int().positive().optional().default(1),
  status: z.enum(TEMPLATE_STATUSES).optional().default('active')
});

const createTemplateSchema = baseTemplateSchema;
const updateTemplateSchema = baseTemplateSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: 'At least one field is required'
});

const createLogSchema = z.object({
  book_id: z.string().trim().refine(isValidObjectId, 'Invalid book_id'),
  template_id: z.string().trim().refine(isValidObjectId, 'Invalid template_id'),
  log_date: z.coerce.date().optional().default(() => new Date()),
  data: z.record(z.any()).optional().default({}),
  notes: z.string().trim().optional().default(''),
  status: z.enum(LOG_STATUSES).optional().default('submitted'),
  legacy_source: z
    .object({
      model: z.enum(['ProductionLog', 'manual']),
      id: z.string().trim().optional().refine((value) => !value || isValidObjectId(value), 'Invalid legacy_source.id')
    })
    .optional()
});

const updateLogSchema = createLogSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: 'At least one field is required'
});

const normalizeTemplatePayload = (
  payload: z.infer<typeof createTemplateSchema> | z.infer<typeof updateTemplateSchema>
) => ({
  ...payload,
  farm_type_id: payload.farm_type_id || null,
  domain: payload.domain ? normalizeSlug(payload.domain) : undefined,
  category: payload.category ? normalizeSlug(payload.category) : undefined,
  key: payload.key ? normalizeSlug(payload.key) : undefined,
  schema: payload.schema?.map((item) => ({
    ...item,
    key: normalizeSlug(item.key),
    fields: item.type === 'section' ? item.fields.map((field) => ({ ...field, key: normalizeSlug(field.key) })) : [],
    columns: item.type === 'table' ? item.columns.map((field) => ({ ...field, key: normalizeSlug(field.key) })) : []
  }))
});

const validateUniqueSchemaKeys = (schema: IOperationalTemplateSchemaItem[]) => {
  const keys = new Set<string>();
  for (const item of schema) {
    const normalizedKey = normalizeSlug(item.key);
    if (keys.has(normalizedKey)) return item.key;
    keys.add(normalizedKey);
  }
  return null;
};

const hasValue = (value: unknown) => value !== undefined && value !== null && value !== '';

const validateFieldValue = (field: IOperationalTemplateField, value: unknown) => {
  if (!hasValue(value)) return !field.required;

  if (field.type === 'number') return typeof value === 'number' && Number.isFinite(value);
  if (field.type === 'boolean') return typeof value === 'boolean';
  if (field.type === 'date') return !Number.isNaN(new Date(String(value)).getTime());
  if (field.type === 'select') return field.options.some((option) => option.value === value);
  return typeof value === 'string';
};

const validateLogDataByTemplate = (template: IOperationalLogTemplate, data: Record<string, any>) => {
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

export const createOperationalLogTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsedPayload = createTemplateSchema.parse(req.body);
    const payload = normalizeTemplatePayload(parsedPayload);

    if (payload.farm_type_id) {
      const farmType = await Farmtype.exists({ _id: payload.farm_type_id });
      if (!farmType) {
        res.status(404).json({ message: 'Farm type not found' });
        return;
      }
    }

    const duplicateKey = validateUniqueSchemaKeys(payload.schema as IOperationalTemplateSchemaItem[]);
    if (duplicateKey) {
      res.status(400).json({ message: `Duplicate schema key: ${duplicateKey}` });
      return;
    }

    const template = await OperationalLogTemplateModel.create({
      ...payload,
      created_by: req.user?.id
    });

    res.status(201).json({ message: 'Create operational log template successfully', data: template });
  } catch (error) {
    handleControllerError(res, error, 'Error createOperationalLogTemplate:');
  }
};

export const getOperationalLogTemplates = async (req: Request, res: Response): Promise<void> => {
  try {
    const { domain, category, farm_type_id, status, search, page = 1, limit = 20 } = req.query;
    const pageNumber = parsePositiveInt(page, 1);
    const limitNumber = parsePositiveInt(limit, 20);
    const skip = (pageNumber - 1) * limitNumber;
    const filter: Record<string, any> = {};

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

    if (search && String(search).trim()) {
      const escapedSearch = String(search).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [{ name: { $regex: escapedSearch, $options: 'i' } }, { key: { $regex: escapedSearch, $options: 'i' } }];
    }

    const [templates, total] = await Promise.all([
      OperationalLogTemplateModel.find(filter)
        .populate('farm_type_id', 'type_name image description')
        .populate('created_by', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),
      OperationalLogTemplateModel.countDocuments(filter)
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
    handleControllerError(res, error, 'Error getOperationalLogTemplates:');
  }
};

export const getOperationalLogTemplateById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400).json({ message: 'Invalid template id' });
      return;
    }

    const template = await OperationalLogTemplateModel.findById(req.params.id)
      .populate('farm_type_id', 'type_name image description')
      .populate('created_by', 'name email role');

    if (!template) {
      res.status(404).json({ message: 'Operational log template not found' });
      return;
    }

    res.status(200).json({ success: true, data: template });
  } catch (error) {
    handleControllerError(res, error, 'Error getOperationalLogTemplateById:');
  }
};

export const updateOperationalLogTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400).json({ message: 'Invalid template id' });
      return;
    }

    const parsedPayload = updateTemplateSchema.parse(req.body);
    const payload = normalizeTemplatePayload(parsedPayload);

    if (payload.farm_type_id) {
      const farmType = await Farmtype.exists({ _id: payload.farm_type_id });
      if (!farmType) {
        res.status(404).json({ message: 'Farm type not found' });
        return;
      }
    }

    if (payload.schema) {
      const duplicateKey = validateUniqueSchemaKeys(payload.schema as IOperationalTemplateSchemaItem[]);
      if (duplicateKey) {
        res.status(400).json({ message: `Duplicate schema key: ${duplicateKey}` });
        return;
      }
    }

    const template = await OperationalLogTemplateModel.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true
    });

    if (!template) {
      res.status(404).json({ message: 'Operational log template not found' });
      return;
    }

    res.status(200).json({ message: 'Update operational log template successfully', data: template });
  } catch (error) {
    handleControllerError(res, error, 'Error updateOperationalLogTemplate:');
  }
};

export const deleteOperationalLogTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400).json({ message: 'Invalid template id' });
      return;
    }

    const logCount = await OperationalLogModel.countDocuments({ template_id: req.params.id });
    if (logCount > 0) {
      res.status(409).json({ message: 'Cannot delete template that already has operational logs' });
      return;
    }

    const template = await OperationalLogTemplateModel.findByIdAndDelete(req.params.id);
    if (!template) {
      res.status(404).json({ message: 'Operational log template not found' });
      return;
    }

    res.status(200).json({ message: 'Delete operational log template successfully', data: template });
  } catch (error) {
    handleControllerError(res, error, 'Error deleteOperationalLogTemplate:');
  }
};

export const createOperationalLog = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = createLogSchema.parse(req.body);

    const [book, template] = await Promise.all([
      ProductionBookModel.exists({ _id: payload.book_id, deleted_at: null }),
      OperationalLogTemplateModel.findById(payload.template_id)
    ]);

    if (!book) {
      res.status(404).json({ message: 'Production book not found' });
      return;
    }

    if (!template || template.status === 'archived') {
      res.status(404).json({ message: 'Operational log template not found' });
      return;
    }

    const dataErrors = validateLogDataByTemplate(template, payload.data);
    if (dataErrors.length > 0) {
      res.status(400).json({ message: 'Operational log data is invalid', errors: dataErrors });
      return;
    }

    const log = await OperationalLogModel.create({
      ...payload,
      domain: template.domain,
      category: template.category,
      template_key: template.key,
      template_version: template.version,
      legacy_source: payload.legacy_source
        ? {
            model: payload.legacy_source.model,
            id: payload.legacy_source.id
          }
        : undefined,
      created_by: req.user?.id
    });

    res.status(201).json({ message: 'Create operational log successfully', data: log });
  } catch (error) {
    handleControllerError(res, error, 'Error createOperationalLog:');
  }
};

export const getOperationalLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { book_id, template_id, domain, category, status, from, to, page = 1, limit = 20 } = req.query;
    const pageNumber = parsePositiveInt(page, 1);
    const limitNumber = parsePositiveInt(limit, 20);
    const skip = (pageNumber - 1) * limitNumber;
    const filter: Record<string, any> = {};

    if (book_id) {
      if (!isValidObjectId(String(book_id))) {
        res.status(400).json({ message: 'Invalid book_id' });
        return;
      }
      filter.book_id = book_id;
    }

    if (template_id) {
      if (!isValidObjectId(String(template_id))) {
        res.status(400).json({ message: 'Invalid template_id' });
        return;
      }
      filter.template_id = template_id;
    }

    if (domain) filter.domain = normalizeSlug(String(domain));
    if (category) filter.category = normalizeSlug(String(category));
    if (status) filter.status = status;

    if (from || to) {
      filter.log_date = {};
      if (from) filter.log_date.$gte = new Date(String(from));
      if (to) filter.log_date.$lte = new Date(String(to));
    }

    const [logs, total] = await Promise.all([
      OperationalLogModel.find(filter)
        .populate('book_id', 'name farm_id farm_type_id status')
        .populate('template_id', 'name key domain category version status')
        .populate('created_by', 'name email role')
        .sort({ log_date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),
      OperationalLogModel.countDocuments(filter)
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
    handleControllerError(res, error, 'Error getOperationalLogs:');
  }
};

export const getOperationalLogById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400).json({ message: 'Invalid operational log id' });
      return;
    }

    const log = await OperationalLogModel.findById(req.params.id)
      .populate('book_id', 'name farm_id farm_type_id status')
      .populate('template_id', 'name key domain category version status schema')
      .populate('created_by', 'name email role');

    if (!log) {
      res.status(404).json({ message: 'Operational log not found' });
      return;
    }

    res.status(200).json({ success: true, data: log });
  } catch (error) {
    handleControllerError(res, error, 'Error getOperationalLogById:');
  }
};

export const updateOperationalLog = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400).json({ message: 'Invalid operational log id' });
      return;
    }

    const payload = updateLogSchema.parse(req.body);
    const currentLog = await OperationalLogModel.findById(req.params.id);
    if (!currentLog) {
      res.status(404).json({ message: 'Operational log not found' });
      return;
    }

    const templateId = payload.template_id || String(currentLog.template_id);
    const template = await OperationalLogTemplateModel.findById(templateId);
    if (!template || template.status === 'archived') {
      res.status(404).json({ message: 'Operational log template not found' });
      return;
    }

    if (payload.book_id) {
      const book = await ProductionBookModel.exists({ _id: payload.book_id, deleted_at: null });
      if (!book) {
        res.status(404).json({ message: 'Production book not found' });
        return;
      }
    }

    const nextData = payload.data ?? currentLog.data;
    const dataErrors = validateLogDataByTemplate(template, nextData);
    if (dataErrors.length > 0) {
      res.status(400).json({ message: 'Operational log data is invalid', errors: dataErrors });
      return;
    }

    const updatePayload = {
      ...payload,
      domain: template.domain,
      category: template.category,
      template_key: template.key,
      template_version: template.version,
      legacy_source: payload.legacy_source
        ? {
            model: payload.legacy_source.model,
            id: payload.legacy_source.id
          }
        : payload.legacy_source
    };

    const log = await OperationalLogModel.findByIdAndUpdate(req.params.id, updatePayload, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ message: 'Update operational log successfully', data: log });
  } catch (error) {
    handleControllerError(res, error, 'Error updateOperationalLog:');
  }
};

export const deleteOperationalLog = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400).json({ message: 'Invalid operational log id' });
      return;
    }

    const log = await OperationalLogModel.findByIdAndDelete(req.params.id);
    if (!log) {
      res.status(404).json({ message: 'Operational log not found' });
      return;
    }

    res.status(200).json({ message: 'Delete operational log successfully', data: log });
  } catch (error) {
    handleControllerError(res, error, 'Error deleteOperationalLog:');
  }
};
