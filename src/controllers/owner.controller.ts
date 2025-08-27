import { Request, Response } from 'express';
import User from '../models/User.model';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { Types } from 'mongoose';
import { roleUser } from '~/config/constant';

// Schema validation với Zod
const registerSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(10).max(10),
  password: z.string().min(6),
  name: z.string(),
  address: z.string()
});

export const getFarmer = async (req: Request, res: Response) => {
  try {
    const ownerId = req?.user?.id;
    console.log('ownerId: ', ownerId);

    // Kiểm tra ownerId có hợp lệ không
    if (!ownerId || !Types.ObjectId.isValid(ownerId)) {
      res.status(400).json({ message: 'Invalid owner ID' });
      return;
    }

    // Truy vấn danh sách user với owner_id
    const listFarmer = await User.find({ owner_id: ownerId }).exec();

    // Kiểm tra xem có dữ liệu hay không
    if (!listFarmer || listFarmer.length === 0) {
      res.status(404).json({ message: 'No users found for this owner' });
      return;
    }

    res.status(200).json(listFarmer);
  } catch (error) {
    console.error('Error fetching farmers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getFarmerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const idFarmer = req.params.id;
    const ownerAccount = req?.user;

    if (ownerAccount?.role !== roleUser.owner) {
      res.status(400).json({ message: 'Invalid permission !' });
    }

    if (!idFarmer || !Types.ObjectId.isValid(idFarmer)) {
      res.status(400).json({ message: 'Invalid farmer ID' });
      return;
    }

    const farmerInfo = await User.findById(idFarmer).exec();
    if (!farmerInfo) {
      res.status(404).json({ message: 'No users found for this owner' });
      return;
    }

    res.status(200).json(farmerInfo);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error' });
  }
};
