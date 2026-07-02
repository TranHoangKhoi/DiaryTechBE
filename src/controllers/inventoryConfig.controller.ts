import { Request, Response } from 'express';
import { INVENTORY_CATEGORIES, INVENTORY_UNITS } from '~/config/inventory.config';

export const getInventoryConfigs = async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({
      success: true,
      data: {
        categories: INVENTORY_CATEGORIES,
        unit_groups: INVENTORY_UNITS
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error getting inventory configs' });
  }
};
