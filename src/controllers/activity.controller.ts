import { Request, Response } from 'express';
import { z } from 'zod';
import Activities from '../models/Activities.model';

const fieldSchema = z.object({
  field_name: z.string(),
  field_type: z.string(),
  is_required: z.boolean(),
  options: z.array(z.string())
});

// Schema validation với Zod
const createActivitySchema = z.object({
  farm_type_id: z.string(),
  activity_name: z.string(),
  description: z.string(),
  image: z.string(),
  fields: z.array(fieldSchema) // Sử dụng z.array() để định nghĩa mảng
});

export const createActivity = async (req: Request, res: Response): Promise<void> => {
  //   res.json(req.body);
  try {
    const { farm_type_id, activity_name, description, fields, image } = createActivitySchema.parse(req.body);
    const activityRes = new Activities({ farm_type_id, activity_name, description, fields, image });
    await activityRes.save();
    res.status(201).json(`Created Activity: ${activity_name}`);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors });
    } else {
      console.log(error);
      res.status(500).json({ message: error });
    }
  }
};

export const getAllActivityByIdType = async (req: Request, res: Response): Promise<void> => {
  //   res.json(req.body);
  try {
    const farmTypeId = req.params.id;
    const activitiesRes = await Activities.find({ farm_type_id: farmTypeId });
    if (!activitiesRes) {
      res.status(404).json({ message: 'Farm type not found' });
      return;
    }
    res.status(200).json(activitiesRes);
    // res.status(201).json(`Created Activity: ${activity_name}`);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

export const getActivityById = async (req: Request, res: Response): Promise<void> => {
  //   res.json(req.body);
  try {
    const activitiesID = req.params.id;
    const activitiesRes = await Activities.findById(activitiesID);
    if (!activitiesRes) {
      res.status(404).json({ message: 'Farm type not found' });
      return;
    }
    res.status(200).json(activitiesRes);
    // res.status(201).json(`Created Activity: ${activity_name}`);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

export const updateActivities = async (req: Request, res: Response): Promise<void> => {
  try {
    const activityId = req.params.id;
    const updateData = req.body;

    const updatedActivity = await Activities.findByIdAndUpdate(activityId, updateData, {
      new: true,
      runValidators: true
    });

    if (!updatedActivity) {
      res.status(404).json({ message: 'Activity not found' });
      return;
    }

    res.status(200).json(updatedActivity);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};
