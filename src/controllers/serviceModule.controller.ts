import { Request, Response } from 'express';
import { MODULE_KEY_VALUES } from '~/constants/moduleKeys';
import ServiceModuleModel from '~/models/ServiceModule.model';

export const createServiceModule = async (req: Request, res: Response) => {
  try {
    const { key, name, description, sort_order } = req.body;

    if (!key || !name || !description) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: key, name or description.'
      });
      return;
    }

    if (!MODULE_KEY_VALUES.includes(key)) {
      res.status(400).json({
        success: false,
        message: 'Invalid module key.'
      });
      return;
    }

    const existing = await ServiceModuleModel.findOne({ key });
    if (existing) {
      res.status(400).json({
        success: false,
        message: `Module vá»›i key '${key}' Ä‘Ã£ tá»“n táº¡i.`
      });
      return;
    }

    const newModule = await ServiceModuleModel.create({ key, name, description, sort_order });

      res.status(201).json({
      success: true,
      message: 'Service module created successfully.',
      data: newModule
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to create service module.',
      error
    });
  }
};

export const getAllServiceModules = async (req: Request, res: Response) => {
  try {
    const modules = await ServiceModuleModel.find().sort({ sort_order: 1, key: 1 });

    res.status(200).json({
      success: true,
      message: 'Service modules fetched successfully.',
      data: modules
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service modules.',
      error
    });
  }
};
