import { Request, Response } from 'express';
import mongoose, { Types } from 'mongoose';
import { z } from 'zod';
import Activities from '../models/Activities.model';
import FarmModel from '~/models/Farm.model';
import Farmtype from '../models/Farmtype.model';
import { getSharedFieldDefinition, normalizeSharedFieldKey } from '~/constants/sharedFieldKeys';
import ProductionLogsModel from '~/models/ProductionLogs.model';
import { assertFarmAccess } from '~/services/farmAccess.service';
import { getSharedFieldHistoryForFields } from '~/services/sharedFieldValue.service';

const DEFAULT_ACTIVITY_IMAGE = 'https://res.cloudinary.com/delix6nht/image/upload/v1760068625/3_xs0l5w.png';
const FIELD_TYPES = ['text', 'number', 'date', 'image', 'select', 'textarea'] as const;

const fieldSchema = z
  .object({
    key: z.string().trim().min(1, 'Field key is required'),
    field_name: z.string().trim().min(1, 'Field name is required'),
    field_type: z.enum(FIELD_TYPES),
    is_required: z.boolean().optional().default(false),
    options: z.array(z.string().trim().min(1, 'Option is required')).optional().default([])
  })
  .superRefine((field, ctx) => {
    if (field.field_type === 'select' && field.options.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['options'],
        message: 'Select field must have at least one option'
      });
    }
  });

const baseActivitySchema = z.object({
  activity_name: z.string().trim().min(1, 'Activity name is required'),
  description: z.string().trim().optional().default(''),
  image: z.string().trim().optional().default(DEFAULT_ACTIVITY_IMAGE),
  fields: z.array(fieldSchema).default([])
});

const createActivitySchema = baseActivitySchema.extend({
  farm_type_id: z.string().refine((value) => Types.ObjectId.isValid(value), 'Invalid farm_type_id')
});

const updateActivitySchema = baseActivitySchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: 'At least one field is required'
});

const parsePositiveInt = (value: unknown, fallback: number, max = 100) => {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (Number.isNaN(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, max);
};

const isValidObjectId = (value: string) => Types.ObjectId.isValid(value);

const validateUniqueFieldNames = (fields: Array<{ field_name: string }>) => {
  const names = new Set<string>();
  for (const field of fields) {
    const normalized = field.field_name.trim().toLowerCase();
    if (names.has(normalized)) return field.field_name;
    names.add(normalized);
  }
  return null;
};

const validateUniqueFieldKeys = (fields: Array<{ key: string }>) => {
  const keys = new Set<string>();
  for (const field of fields) {
    const normalized = normalizeSharedFieldKey(field.key);
    if (keys.has(normalized)) return field.key;
    keys.add(normalized);
  }
  return null;
};

const normalizeActivityPayload = (
  payload: z.infer<typeof createActivitySchema> | z.infer<typeof updateActivitySchema>
) => {
  return {
    ...payload,
    image: payload.image?.trim() || DEFAULT_ACTIVITY_IMAGE,
    ...(payload.fields
      ? {
          fields: payload.fields.map((field) => ({
            key: normalizeSharedFieldKey(field.key),
            field_name: field.field_name,
            field_type: field.field_type,
            is_required: field.is_required ?? false,
            options: field.field_type === 'select' ? field.options || [] : [],
            is_shared: Boolean(getSharedFieldDefinition(normalizeSharedFieldKey(field.key))),
            shared_scope: getSharedFieldDefinition(normalizeSharedFieldKey(field.key))?.default_scope,
            shared_mode: getSharedFieldDefinition(normalizeSharedFieldKey(field.key))?.mode
          }))
        }
      : {})
  };
};

export const createActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = createActivitySchema.parse(req.body);

    const farmType = await Farmtype.exists({ _id: payload.farm_type_id });
    if (!farmType) {
      res.status(404).json({ message: 'Farm type not found' });
      return;
    }

    const duplicateField = validateUniqueFieldNames(payload.fields);
    if (duplicateField) {
      res.status(400).json({ message: `Duplicate field name: ${duplicateField}` });
      return;
    }

    const duplicateKey = validateUniqueFieldKeys(payload.fields);
    if (duplicateKey) {
      res.status(400).json({ message: `Duplicate field key: ${duplicateKey}` });
      return;
    }

    const activity = await Activities.create(normalizeActivityPayload(payload));

    res.status(201).json({
      message: 'Create activity successfully',
      data: activity
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors });
      return;
    }

    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({ message: 'Validation error', error: error.message });
      return;
    }

    console.error('Error createActivity:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllActivityByIdType = async (req: Request, res: Response): Promise<void> => {
  try {
    const farmTypeId = req.params.id;

    if (!isValidObjectId(farmTypeId)) {
      res.status(400).json({ message: 'Invalid farm_type_id' });
      return;
    }

    const activitiesRes = await Activities.find({ farm_type_id: farmTypeId }).sort({ createdAt: -1 });
    res.status(200).json(activitiesRes);
  } catch (error) {
    console.error('Error getAllActivityByIdType:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getActivityById = async (req: Request, res: Response): Promise<void> => {
  try {
    const activitiesID = req.params.id;

    if (!isValidObjectId(activitiesID)) {
      res.status(400).json({ message: 'Invalid activity id' });
      return;
    }

    const activitiesRes = await Activities.findById(activitiesID);
    if (!activitiesRes) {
      res.status(404).json({ message: 'Activity not found' });
      return;
    }
    res.status(200).json(activitiesRes);
  } catch (error) {
    console.error('Error getActivityById:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getActivityFormWithHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { farm_id, limit } = req.query;

    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid activity id' });
      return;
    }

    if (!farm_id || !isValidObjectId(farm_id as string)) {
      res.status(400).json({ success: false, message: 'Invalid farm_id' });
      return;
    }

    const farmAccess = await assertFarmAccess(req.user, farm_id as string);
    if (!farmAccess.ok) {
      res.status(farmAccess.status).json({ success: false, message: farmAccess.message });
      return;
    }

    const [activity, farm] = await Promise.all([
      Activities.findById(id).lean(),
      FarmModel.findById(farm_id).select('_id farm_type_id').lean()
    ]);

  if (!activity) {
      res.status(404).json({ success: false, message: 'Activity not found' });
      return;
    }

    if (!farm) {
      res.status(404).json({ success: false, message: 'Farm not found' });
      return;
    }

    if (String(activity.farm_type_id) !== String(farm.farm_type_id)) {
      res.status(400).json({ success: false, message: 'activity_id does not match farm_type_id' });
      return;
    }

    const fields = Array.isArray(activity.fields) ? activity.fields : [];
    const sharedValues = await getSharedFieldHistoryForFields({
      farm,
      fields,
      limit
    });

  const fieldsWithHistory = fields.map((field: any) => ({
    ...field,
    shared_history: field.key ? sharedValues[normalizeSharedFieldKey(field.key)] ?? null : null
  }));

    res.status(200).json({
      success: true,
      data: {
        activity: {
          ...activity,
          fields: fieldsWithHistory
        },
        template_fields: fieldsWithHistory,
        shared_values: sharedValues
      }
    });
  } catch (error) {
    console.error('Error getActivityFormWithHistory:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getManageActivities = async (req: Request, res: Response): Promise<void> => {
  try {
    const { farm_type_id, search, page = 1, limit = 20 } = req.query;
    const pageNumber = parsePositiveInt(page, 1);
    const limitNumber = parsePositiveInt(limit, 20);
    const skip = (pageNumber - 1) * limitNumber;
    const filter: Record<string, any> = {};

    if (farm_type_id) {
      if (!isValidObjectId(farm_type_id as string)) {
        res.status(400).json({ message: 'Invalid farm_type_id' });
        return;
      }
      filter.farm_type_id = farm_type_id;
    }

    if (search && String(search).trim()) {
      const escapedSearch = String(search)
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [{ activity_name: { $regex: escapedSearch, $options: 'i' } }];
    }

    const [activities, total] = await Promise.all([
      Activities.find(filter)
        .populate('farm_type_id', 'type_name image description')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),
      Activities.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: activities,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber)
      }
    });
  } catch (error) {
    console.error('Error getManageActivities:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateActivities = async (req: Request, res: Response): Promise<void> => {
  try {
    const activityId = req.params.id;

    if (!isValidObjectId(activityId)) {
      res.status(400).json({ message: 'Invalid activity id' });
      return;
    }

    const payload = updateActivitySchema.parse(req.body);

    if (payload.fields) {
      const duplicateField = validateUniqueFieldNames(payload.fields);
      if (duplicateField) {
        res.status(400).json({ message: `Duplicate field name: ${duplicateField}` });
        return;
      }

      const duplicateKey = validateUniqueFieldKeys(payload.fields);
      if (duplicateKey) {
        res.status(400).json({ message: `Duplicate field key: ${duplicateKey}` });
        return;
      }
    }

    const updatedActivity = await Activities.findByIdAndUpdate(activityId, normalizeActivityPayload(payload), {
      new: true,
      runValidators: true
    });

    if (!updatedActivity) {
      res.status(404).json({ message: 'Activity not found' });
      return;
    }

    res.status(200).json({
      message: 'Update activity successfully',
      data: updatedActivity
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors });
      return;
    }

    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({ message: 'Validation error', error: error.message });
      return;
    }

    console.error('Error updateActivities:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const activityId = req.params.id;

    if (!isValidObjectId(activityId)) {
      res.status(400).json({ message: 'Invalid activity id' });
      return;
    }

    const logCount = await ProductionLogsModel.countDocuments({ activity_id: activityId });
    if (logCount > 0) {
      res.status(409).json({ message: 'Cannot delete activity that already has production logs' });
      return;
    }

    const deletedActivity = await Activities.findByIdAndDelete(activityId);
    if (!deletedActivity) {
      res.status(404).json({ message: 'Activity not found' });
      return;
    }

    res.status(200).json({
      message: 'Delete activity successfully',
      data: deletedActivity
    });
  } catch (error) {
    console.error('Error deleteActivity:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
