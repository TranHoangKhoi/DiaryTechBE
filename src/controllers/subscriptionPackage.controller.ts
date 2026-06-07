import { Request, Response } from 'express';
import SubscriptionPackageModel from '~/models/SubscriptionPackage.model';
import ServiceModuleModel from '~/models/ServiceModule.model';

export const createSubscriptionPackage = async (req: Request, res: Response) => {
  try {
    const { module_id, code, name, max_sub_accounts, price_per_month, duration_in_days, description } = req.body;

    const module = await ServiceModuleModel.findById(module_id).select('_id is_active');
    if (!module || !module.is_active) {
      res.status(404).json({
        success: false,
        message: 'Module not found.'
      });
      return;
    }

    const normalizedCode = String(code ?? '')
      .trim()
      .toUpperCase();

    if (!normalizedCode) {
      res.status(400).json({
        success: false,
        message: 'Missing subscription package code.'
      });
      return;
    }

    const existingPackage = await SubscriptionPackageModel.findOne({ module_id, code: normalizedCode }).select('_id');
    if (existingPackage) {
      res.status(409).json({
        success: false,
        message: 'Subscription package code already exists in this module.'
      });
      return;
    }

    const newPackage = await SubscriptionPackageModel.create({
      module_id,
      code: normalizedCode,
      name,
      max_sub_accounts,
      price_per_month,
      duration_in_days,
      description
    });

    res.status(201).json({
      success: true,
      message: 'Subscription package created successfully.',
      data: newPackage
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to create subscription package.',
      error
    });
  }
};

export const getAllSubscriptionPackage = async (req: Request, res: Response) => {
  try {
    const { module_id, is_active } = req.query;
    const filter: Record<string, unknown> = {};

    if (typeof module_id === 'string' && module_id) {
      filter.module_id = module_id;
    }

    if (typeof is_active === 'string' && is_active) {
      filter.is_active =
        is_active === 'true'
          ? {
              $ne: false
            }
          : false;
    }

    const packages = await SubscriptionPackageModel.find(filter)
      .populate('module_id', 'key name is_active')
      .sort({ module_id: 1, price_per_month: 1 });

    res.status(200).json({
      success: true,
      message: 'Subscription packages fetched successfully.',
      data: packages
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription packages.',
      error
    });
  }
};
