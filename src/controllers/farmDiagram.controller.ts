import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import FarmModel from '~/models/Farm.model';
import FarmZoneModel from '~/models/FarmZone.model';
import FarmDiagramModel from '~/models/FarmDiagram.model';

const polygonSchema = z.object({
  type: z.enum(['Polygon', 'LineString']),
  coordinates: z.array(z.any())
});

const syncPayloadSchema = z.object({
  updatedFarm: z.object({
    polygon: polygonSchema.optional()
  }).optional(),
  updatedZones: z.array(z.object({
    _id: z.string(),
    polygon: polygonSchema.optional()
  })).optional(),
  diagrams: z.object({
    create: z.array(z.object({
      name: z.string().trim().min(1),
      type: z.enum(['ao_lang', 'ao_san_sang', 'ao_bun', 'kenh_cap', 'kenh_thai', 'choi', 'diem_lay_mau', 'other']),
      area: z.number().optional(),
      coordinates: z.array(z.number()),
      polygon: polygonSchema.optional(),
      properties: z.record(z.any()).optional()
    })).optional(),
    update: z.array(z.object({
      _id: z.string(),
      name: z.string().trim().min(1).optional(),
      type: z.enum(['ao_lang', 'ao_san_sang', 'ao_bun', 'kenh_cap', 'kenh_thai', 'choi', 'diem_lay_mau', 'other']).optional(),
      area: z.number().optional(),
      coordinates: z.array(z.number()).optional(),
      polygon: polygonSchema.optional(),
      properties: z.record(z.any()).optional()
    })).optional(),
    delete: z.array(z.string()).optional()
  }).optional()
});

export const getFarmDiagram = async (req: Request, res: Response) => {
  try {
    const { farm_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(farm_id)) {
      res.status(400).json({ message: 'Invalid farm_id' });
      return;
    }

    const farm = await FarmModel.findById(farm_id).lean();
    if (!farm) {
      res.status(404).json({ message: 'Farm not found' });
      return;
    }

    const zones = await FarmZoneModel.find({ farm_id }).lean();
    const diagrams = await FarmDiagramModel.find({ farm_id }).lean();

    res.status(200).json({
      message: 'Get farm diagram successfully',
      data: {
        farm,
        zones,
        diagrams
      }
    });
  } catch (error) {
    console.error('Error getFarmDiagram:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const syncFarmDiagram = async (req: Request, res: Response) => {
  try {
    const { farm_id } = req.params;
    const userId = (req as any).user?.id || (req as any).user?._id;

    if (!mongoose.Types.ObjectId.isValid(farm_id)) {
      res.status(400).json({ message: 'Invalid farm_id' });
      return;
    }

    const payload = syncPayloadSchema.parse(req.body);

    const farm = await FarmModel.findById(farm_id);
    if (!farm) {
      res.status(404).json({ message: 'Farm not found' });
      return;
    }

    const isOwner = farm.owner_id.toString() === userId.toString();

    // 1. Update Farm
    if (payload.updatedFarm && payload.updatedFarm.polygon) {
      if (!isOwner) {
        res.status(403).json({ message: 'Only owner can edit farm boundary' });
        return;
      }
      await FarmModel.findByIdAndUpdate(farm_id, { polygon: payload.updatedFarm.polygon });
    }

    // 2. Update Zones
    if (payload.updatedZones && payload.updatedZones.length > 0) {
      const zoneBulkOps = payload.updatedZones.map(zone => ({
        updateOne: {
          filter: { _id: zone._id, farm_id },
          update: { $set: { polygon: zone.polygon } }
        }
      }));
      if (zoneBulkOps.length > 0) {
        await FarmZoneModel.bulkWrite(zoneBulkOps as any);
      }
    }

    // 3. Diagrams Create
    if (payload.diagrams?.create && payload.diagrams.create.length > 0) {
      const docs = payload.diagrams.create.map(d => ({
        ...d,
        farm_id,
        created_by: userId
      }));
      await FarmDiagramModel.insertMany(docs);
    }

    // 4. Diagrams Update
    if (payload.diagrams?.update && payload.diagrams.update.length > 0) {
      const diagBulkOps = payload.diagrams.update.map(d => {
        const { _id, ...updateData } = d;
        return {
          updateOne: {
            filter: { _id, farm_id },
            update: { $set: updateData }
          }
        };
      });
      if (diagBulkOps.length > 0) {
        await FarmDiagramModel.bulkWrite(diagBulkOps as any);
      }
    }

    // 5. Diagrams Delete
    if (payload.diagrams?.delete && payload.diagrams.delete.length > 0) {
      await FarmDiagramModel.deleteMany({
        _id: { $in: payload.diagrams.delete },
        farm_id
      });
    }

    res.status(200).json({
      message: 'Sync farm diagram successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors });
      return;
    }
    console.error('Error syncFarmDiagram:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
