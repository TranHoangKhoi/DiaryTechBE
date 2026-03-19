import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Crop } from '~/models/CropCategories';

export const createCrop = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, slug, farm_type_id, icon, image, color } = req.body;

    const exist = await Crop.findOne({ slug });
    if (exist) {
      res.status(400).json({ message: 'Slug đã tồn tại' });
      return;
    }

    const crop = await Crop.create({
      name,
      slug,
      farm_type_id,
      icon,
      image,
      color
    });

    res.status(201).json({ data: crop });
  } catch (err) {
    res.status(500).json({ message: 'Server error', err });
  }
};

export const getCrops = async (req: Request, res: Response) => {
  try {
    const { farm_type_id } = req.query;

    const match: any = { is_active: true };

    if (farm_type_id) {
      match.farm_type_id = new mongoose.Types.ObjectId(farm_type_id as string);
    }

    const crops = await Crop.aggregate([
      { $match: match },

      {
        $lookup: {
          from: 'farmcrops',
          let: { cropId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$crop_id', '$$cropId'] },
                is_primary: true // 🔥 chỉ tính crop hiển thị map
              }
            },
            {
              $group: {
                _id: '$crop_id',
                count: { $sum: 1 }
              }
            }
          ],
          as: 'farmStats'
        }
      },

      {
        $addFields: {
          farmCount: {
            $ifNull: [{ $arrayElemAt: ['$farmStats.count', 0] }, 0]
          }
        }
      },

      {
        $project: {
          farmStats: 0
        }
      }
    ]);

    res.json({ data: crops });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateCrop = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const crop = await Crop.findByIdAndUpdate(id, req.body, {
      new: true
    });

    res.json({ data: crop });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteCrop = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await Crop.findByIdAndUpdate(id, { is_active: false });

    res.json({ message: 'Đã xóa' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
