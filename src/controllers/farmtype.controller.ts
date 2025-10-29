import { Request, Response } from 'express';
import { z } from 'zod';
import Farmtype from '../models/Farmtype.model';

// Schema validation với Zod
const craeteFarmtypeSchema = z.object({
  type_name: z.string().min(4),
  description: z.string(),
  image: z.string()
});

const updateFarmtypeSchema = z.object({
  type_name: z.string().min(1, 'Type name is required').optional(),
  description: z.string().optional()
});

export const createFarmType = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type_name, description, image } = craeteFarmtypeSchema.parse(req.body);
    const farmTypeRes = new Farmtype({ type_name, description, image });
    await farmTypeRes.save();
    res.status(201).json(`Created Farm Type: ${type_name}`);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors });
    } else {
      console.log(error);
      res.status(500).json({ message: error });
    }
  }
};

export const updateFarmType = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // lấy id từ URL
    const updateData = updateFarmtypeSchema.parse(req.body);

    const farmTypeRes = await Farmtype.findByIdAndUpdate(
      id,
      { ...updateData, updated_at: new Date() },
      { new: true } // trả về document mới sau khi update
    );

    if (!farmTypeRes) {
      res.status(404).json({ message: 'FarmType not found' });
      return;
    }

    res.status(200).json(farmTypeRes);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors });
    } else {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

// export const getAllFarmTypes = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const farmtype = await Farmtype.find();
//     res.status(200).json(farmtype);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: error });
//   }
// };

export const getFarmType = async (req: Request, res: Response): Promise<void> => {
  try {
    const farmTypeId = req.params.id;
    const farmtype = await Farmtype.findById(farmTypeId);
    if (!farmtype) {
      res.status(404).json({ message: 'Farm type not found' });
      return;
    }
    res.status(200).json(farmtype);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error });
  }
};

export const getAllFarmTypes = async (req: Request, res: Response): Promise<void> => {
  try {
    const farmTypes = await Farmtype.aggregate([
      {
        $lookup: {
          from: 'farms',
          localField: '_id',
          foreignField: 'farm_type_id',
          as: 'farms'
        }
      },
      {
        $addFields: {
          farm_count: { $size: '$farms' }
        }
      },
      {
        $project: {
          farms: 0
        }
      },
      {
        $sort: { created_at: -1 } // 👈 sắp xếp mới nhất lên đầu
      }
    ]);

    res.status(200).json(farmTypes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching farm types', error });
  }
};
