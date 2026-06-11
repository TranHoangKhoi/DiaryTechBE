import { Request, Response } from 'express';
import mongoose, { Types } from 'mongoose';
import { z } from 'zod';
import FarmTypeConfigModel from '~/models/FarmTypeConfig.model';
import FarmtypeModel from '~/models/Farmtype.model';

const optionSchema = z.object({
  label: z.string().trim().min(1, 'Option label is required'),
  value: z.string().trim().min(1, 'Option value is required')
});

const fieldSchema = z
  .object({
    key: z.string().trim().min(1, 'Field key is required'),
    label: z.string().trim().min(1, 'Field label is required'),
    type: z.enum(['text', 'number', 'date', 'select', 'textarea']),
    required: z.boolean().optional(),
    autoFill: z.string().optional(),
    options: z.array(optionSchema).optional()
  })
  .superRefine((field, ctx) => {
    if (field.type === 'select' && (!field.options || field.options.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['options'],
        message: 'Select field must have at least one option'
      });
    }
  });

const sectionSchema = z
  .object({
    key: z.string().trim().min(1, 'Section key is required'),
    name: z.string().trim().min(1, 'Section name is required'),
    type: z.enum(['section', 'table']),
    scope: z.enum(['zone', 'book', 'log']).optional().default('book'),
    fields: z.array(fieldSchema).optional(),
    columns: z.array(fieldSchema).optional()
  })
  .superRefine((section, ctx) => {
    const fields = section.type === 'section' ? section.fields || [] : section.columns || [];

    if (section.type === 'section' && fields.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['fields'], message: 'Section must have fields' });
    }

    if (section.type === 'table' && fields.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['columns'], message: 'Table must have columns' });
    }

    const keys = new Set<string>();
    for (const field of fields) {
      if (keys.has(field.key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [section.type === 'section' ? 'fields' : 'columns'],
          message: `Duplicate field key: ${field.key}`
        });
      }
      keys.add(field.key);
    }
  });

const baseConfigSchema = z.object({
  title: z.string().trim().optional(),
  description: z.string().trim().optional(),
  sections: z.array(sectionSchema).default([])
});

const createConfigSchema = baseConfigSchema.extend({
  farm_type_id: z.string().refine((value) => Types.ObjectId.isValid(value), 'Invalid farm_type_id')
});

const updateConfigSchema = baseConfigSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: 'At least one field is required'
});

const isValidObjectId = (value: string) => Types.ObjectId.isValid(value);

const normalizeConfigPayload = (payload: z.infer<typeof createConfigSchema> | z.infer<typeof updateConfigSchema>) => ({
  ...payload,
  sections:
    payload.sections?.map((section) => ({
      key: section.key,
      name: section.name,
      type: section.type,
      scope: section.scope || 'book',
      fields: section.type === 'section' ? section.fields || [] : [],
      columns: section.type === 'table' ? section.columns || [] : []
    })) ?? undefined
});

export const getAllFarmTypeConfigs = async (req: Request, res: Response) => {
  try {
    const configs = await FarmTypeConfigModel.find()
      .populate('farm_type_id', 'type_name image description')
      .sort({ updatedAt: -1 })
      .lean();

    res.status(200).json({
      message: 'Get configs successfully',
      data: configs
    });
  } catch (err) {
    console.error('Error getAllFarmTypeConfigs:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createFarmTypeConfig = async (req: Request, res: Response) => {
  try {
    const payload = createConfigSchema.parse(req.body);
    const { farm_type_id } = payload;

    const farmType = await FarmtypeModel.exists({ _id: farm_type_id });
    if (!farmType) {
      res.status(404).json({ message: 'Farm type not found' });
      return;
    }

    const existed = await FarmTypeConfigModel.findOne({ farm_type_id });
    if (existed) {
      res.status(400).json({
        message: 'Config for this farm type already exists'
      });
      return;
    }

    const newConfig = await FarmTypeConfigModel.create(normalizeConfigPayload(payload));

    res.status(201).json({
      message: 'Create config successfully',
      data: newConfig
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: err.errors });
      return;
    }

    if (err instanceof mongoose.Error.ValidationError) {
      res.status(400).json({ message: 'Validation error', error: err.message });
      return;
    }

    console.error('Error createFarmTypeConfig:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getFarmTypeConfigByFarmTypeId = async (req: Request, res: Response) => {
  try {
    const { farm_type_id } = req.params;
    const { scope } = req.query;

    if (!isValidObjectId(farm_type_id)) {
      res.status(400).json({ message: 'Invalid farm_type_id' });
      return;
    }

    const config = await FarmTypeConfigModel.findOne({ farm_type_id }).lean();

    if (!config) {
      res.status(404).json({ message: 'Config not found for this farm_type_id' });
      return;
    }

    if (scope && typeof scope === 'string') {
      (config as any).sections = config.sections.filter((sec: any) => sec.scope === scope || (!sec.scope && scope === 'book'));
    }

    res.status(200).json({
      message: 'Get config successfully',
      data: config
    });
  } catch (err) {
    console.error('Error getFarmTypeConfigByFarmTypeId:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getFarmTypeConfigById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({ message: 'Invalid config id' });
      return;
    }

    const config = await FarmTypeConfigModel.findById(id).populate('farm_type_id', 'type_name image description');

    if (!config) {
      res.status(404).json({ message: 'Config not found' });
      return;
    }

    res.status(200).json({
      message: 'Get config successfully',
      data: config
    });
  } catch (err) {
    console.error('Error getFarmTypeConfigById:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateFarmTypeConfig = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({ message: 'Invalid config id' });
      return;
    }

    const payload = updateConfigSchema.parse(req.body);
    const updatedConfig = await FarmTypeConfigModel.findByIdAndUpdate(id, normalizeConfigPayload(payload), {
      new: true,
      runValidators: true
    });

    if (!updatedConfig) {
      res.status(404).json({ message: 'Config not found' });
      return;
    }

    res.status(200).json({
      message: 'Update config successfully',
      data: updatedConfig
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: err.errors });
      return;
    }

    if (err instanceof mongoose.Error.ValidationError) {
      res.status(400).json({ message: 'Validation error', error: err.message });
      return;
    }

    console.error('Error updateFarmTypeConfig:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteFarmTypeConfig = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({ message: 'Invalid config id' });
      return;
    }

    const deletedConfig = await FarmTypeConfigModel.findByIdAndDelete(id);

    if (!deletedConfig) {
      res.status(404).json({ message: 'Config not found' });
      return;
    }

    res.status(200).json({
      message: 'Delete config successfully',
      data: deletedConfig
    });
  } catch (err) {
    console.error('Error deleteFarmTypeConfig:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
