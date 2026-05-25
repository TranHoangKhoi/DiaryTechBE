import { Request, Response } from 'express';
import User from '../models/User.model';
import { z } from 'zod';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .regex(/[A-Z]/, 'New password must contain an uppercase letter')
      .regex(/[a-z]/, 'New password must contain a lowercase letter')
      .regex(/\d/, 'New password must contain a number'),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Confirm password does not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const {
      name,
      phone,
      gender,
      province,
      ward,
      address,
      des,
      avatar,
    } = req.body;

    const updateData: Record<string, unknown> = {
      updated_at: new Date(),
    };

    if (typeof name !== 'undefined') updateData.name = name;
    if (typeof phone !== 'undefined') updateData.phone = phone;
    if (typeof gender !== 'undefined') updateData.gender = Number(gender);
    if (typeof province !== 'undefined') updateData.province = province;
    if (typeof ward !== 'undefined') updateData.ward = ward;
    if (typeof address !== 'undefined') updateData.address = address;
    if (typeof des !== 'undefined') updateData.des = des;
    if (typeof avatar !== 'undefined') updateData.avatar = avatar;

    if (typeof phone !== 'undefined') {
      const existedPhone = await User.findOne({
        phone,
        _id: { $ne: userId },
      }).select('_id');

      if (existedPhone) {
        res.status(400).json({ message: 'Phone already exists' });
        return;
      }
    }

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      res.status(400).json({ message: 'Current password is incorrect' });
      return;
    }

    user.password = newPassword;
    user.updated_at = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        message: error.errors[0]?.message || 'Invalid password payload',
        errors: error.errors,
      });
      return;
    }

    res.status(500).json({ message: 'Server error' });
  }
};
