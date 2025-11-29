import { Request, Response } from 'express';
import FarmTypeConfigModel from '~/models/FarmTypeConfig.model';

export const createFarmTypeConfig = async (req: Request, res: Response) => {
  try {
    const { farm_type_id, title, description, sections } = req.body;

    // Validate bắt buộc
    if (!farm_type_id) {
      res.status(400).json({ message: 'farm_type_id is required' });
      return;
    }

    // Check farm type đã có config chưa (vì unique)
    const existed = await FarmTypeConfigModel.findOne({ farm_type_id });
    if (existed) {
      res.status(400).json({
        message: 'Config for this farm type already exists'
      });
      return;
    }

    const newConfig = await FarmTypeConfigModel.create({
      farm_type_id,
      title,
      description,
      sections
    });

    res.status(201).json({
      message: 'Create config successfully',
      data: newConfig
    });
  } catch (err: any) {
    console.error('Error createFarmTypeConfig:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const getFarmTypeConfigByFarmTypeId = async (req: Request, res: Response) => {
  try {
    const { farm_type_id } = req.params;

    if (!farm_type_id) {
      res.status(400).json({ message: 'farm_type_id is required' });
      return;
    }

    const config = await FarmTypeConfigModel.findOne({ farm_type_id });

    if (!config) {
      res.status(404).json({ message: 'Config not found for this farm_type_id' });
      return;
    }

    res.status(200).json({
      message: 'Get config successfully',
      data: config
    });
  } catch (err: any) {
    console.error('Error getFarmTypeConfigByFarmTypeId:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
