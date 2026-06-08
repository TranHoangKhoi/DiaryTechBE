import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import FarmZoneModel from '~/models/FarmZone.model';
import FarmModel from '~/models/Farm.model';

const polygonSchema = z.object({
  type: z.literal('Polygon'),
  coordinates: z.array(z.array(z.array(z.number()))).min(1)
});

const createFarmZoneSchema = z.object({
  farm_id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), 'Invalid farm_id'),
  name: z.string().trim().min(1, 'Name is required'),
  zone_type: z.string().trim().optional(),
  area: z.number().min(0).optional(),
  unit: z.string().trim().optional(),
  status: z.enum(['active', 'inactive', 'under_maintenance']).optional(),
  properties: z.record(z.any()).optional(),
  species: z.string().trim().min(1, 'Species is required'),
  coordinates: z.tuple([z.number(), z.number()]),
  polygon: polygonSchema.optional(),
  images: z.array(z.string()).optional()
});

const updateFarmZoneSchema = createFarmZoneSchema.partial().omit({ farm_id: true });

export const getFarmZonesByFarmId = async (req: Request, res: Response) => {
  try {
    const { farm_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(farm_id)) {
      res.status(400).json({ message: 'Invalid farm_id' });
      return;
    }

    // Optional: check permissions here, but we assume middleware does it or owner/sub_account check is needed
    // Usually handled by some farm access service in this project.
    
    const zones = await FarmZoneModel.find({ farm_id }).sort({ created_at: -1 }).lean();

    res.status(200).json({
      message: 'Get farm zones successfully',
      data: zones
    });
  } catch (error) {
    console.error('Error getFarmZonesByFarmId:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createFarmZone = async (req: Request, res: Response) => {
  try {
    const payload = createFarmZoneSchema.parse(req.body);
    const userId = (req as any).user?.id || (req as any).user?._id;

    const farm = await FarmModel.findById(payload.farm_id).lean();
    if (!farm) {
      res.status(404).json({ message: 'Farm not found' });
      return;
    }

    const newZone = await FarmZoneModel.create({
      ...payload,
      farm_type_id: farm.farm_type_id,
      created_by: userId
    });

    res.status(201).json({
      message: 'Create farm zone successfully',
      data: newZone
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors });
      return;
    }
    console.error('Error createFarmZone:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateFarmZone = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid zone id' });
      return;
    }

    const payload = updateFarmZoneSchema.parse(req.body);

    const updatedZone = await FarmZoneModel.findByIdAndUpdate(
      id,
      { $set: payload },
      { new: true, runValidators: true }
    );

    if (!updatedZone) {
      res.status(404).json({ message: 'Farm zone not found' });
      return;
    }

    res.status(200).json({
      message: 'Update farm zone successfully',
      data: updatedZone
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors });
      return;
    }
    console.error('Error updateFarmZone:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteFarmZone = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid zone id' });
      return;
    }

    const deletedZone = await FarmZoneModel.findByIdAndDelete(id);

    if (!deletedZone) {
      res.status(404).json({ message: 'Farm zone not found' });
      return;
    }

    res.status(200).json({
      message: 'Delete farm zone successfully',
      data: deletedZone
    });
  } catch (error) {
    console.error('Error deleteFarmZone:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
