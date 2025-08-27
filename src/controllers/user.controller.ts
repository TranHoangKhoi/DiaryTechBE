import { Request, Response } from 'express';
import User from '../models/User.model';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { Types } from 'mongoose';

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    const user = await User.findByIdAndUpdate(req.user?.id, { name, updatedAt: new Date() }, { new: true }).select(
      '-password'
    );
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
