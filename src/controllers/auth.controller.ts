import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { z } from 'zod';
import User from '../models/User.model';
import {
  getAccessContextByUserId,
  getActiveModuleKeysByOwnerId,
  getVisibleSubscriptionsByUserId
} from '~/services/subscriptionAccess.service';

const registerSchema = z.object({
  phone: z
    .string()
    .min(10, { message: 'Sá»‘ Ä‘iá»‡n thoáº¡i pháº£i cÃ³ Ã­t nháº¥t 10 chá»¯ sá»‘' })
    .max(10, { message: 'Sá»‘ Ä‘iá»‡n thoáº¡i khÃ´ng Ä‘Æ°á»£c vÆ°á»£t quÃ¡ 10 chá»¯ sá»‘' }),
  password: z.string().min(6, { message: 'Máº­t kháº©u pháº£i cÃ³ Ã­t nháº¥t 6 kÃ½ tá»±' }),
  name: z.string().min(1, { message: 'TÃªn lÃ  báº¯t buá»™c' }),
  des: z.string().optional(),
  address: z.string().min(1, { message: 'Äá»‹a chá»‰ lÃ  báº¯t buá»™c' }),
  gender: z.number().min(1, { message: 'Giá»›i tÃ­nh lÃ  nam hoáº·c ná»¯' }),
  role: z.enum(['sub_account', 'owner'], { message: 'Vai trÃ² chÆ°a phÃ¹ há»£p' }),
  owner_id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, { message: 'owner_id pháº£i lÃ  ObjectId há»£p lá»‡' })
    .optional(),
  allowed_modules: z
    .array(z.enum(['farm_diary', 'agri_map', 'trace_origin']))
    .optional()
    .default([])
});

const loginSchema = z.object({
  phone: z.string().min(10).max(10),
  password: z.string().min(6)
});

const buildToken = (userId: string) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
    expiresIn: '1y'
  });

const buildAuthResponse = async (userId: string) => {
  const [user, accessContext, subscriptions] = await Promise.all([
    User.findById(userId).select('-password'),
    getAccessContextByUserId(userId),
    getVisibleSubscriptionsByUserId(userId)
  ]);

  if (!user || !accessContext) {
    return null;
  }

  return {
    user: {
      ...user.toObject(),
      accessible_modules: accessContext.accessibleModules,
      subscriptions
    }
  };
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { password, name, role, address, phone, owner_id, gender, des, allowed_modules } = registerSchema.parse(
      req.body
    );

    const existedUser = await User.findOne({ phone });
    if (existedUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    let resolvedOwnerId: string | undefined;
    let normalizedAllowedModules: string[] = [];

    if (role === 'owner') {
      if (!req.user || req.user.role !== 'superadmin') {
        res.status(403).json({ message: 'Only superadmin can create owner accounts' });
        return;
      }

      if (owner_id) {
        res.status(400).json({ message: 'owner_id is not allowed for owner account' });
        return;
      }
    }

    if (role === 'sub_account') {
      if (!req.user || !['owner', 'superadmin'].includes(req.user.role)) {
        res.status(403).json({ message: 'Only owner or superadmin can create sub_account' });
        return;
      }

      if (!owner_id) {
        res.status(400).json({ message: 'owner_id is required for sub_account' });
        return;
      }

      resolvedOwnerId = req.user.role === 'owner' ? req.user.id : owner_id;
      if (req.user.role === 'owner' && owner_id !== req.user.id) {
        res.status(403).json({ message: 'You can only create sub_account for your own owner account' });
        return;
      }

      if (!resolvedOwnerId) {
        res.status(400).json({ message: 'owner_id is required for sub_account' });
        return;
      }

      const owner = await User.findById(resolvedOwnerId).select('_id role status');
      if (!owner || owner.role !== 'owner') {
        res.status(404).json({ message: 'Owner not found' });
        return;
      }

      if (owner.status !== 'active') {
        res.status(400).json({ message: 'Owner is not active' });
        return;
      }

      const ownerModules = await getActiveModuleKeysByOwnerId(resolvedOwnerId);
      if (!ownerModules.length) {
        res.status(400).json({ message: 'Owner has no active module subscription' });
        return;
      }

      normalizedAllowedModules = ownerModules;
    }

    const avatar =
      gender === 1
        ? 'https://res.cloudinary.com/delix6nht/image/upload/v1755744492/1_wlrjjb.png'
        : 'https://res.cloudinary.com/delix6nht/image/upload/v1755744493/2_giyotm.png';

    const user = new User({
      password,
      name,
      role,
      address,
      phone,
      owner_id: resolvedOwnerId,
      allowed_modules: role === 'sub_account' ? normalizedAllowedModules : undefined,
      gender,
      avatar,
      des
    });

    await user.save();

    if (req.user) {
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: {
          id: user._id,
          phone: user.phone,
          role: user.role,
          owner_id: user.owner_id,
          allowed_modules: user.allowed_modules ?? []
        }
      });
      return;
    }

    const token = buildToken(String(user._id));
    const payload = await buildAuthResponse(String(user._id));
    if (!payload) {
      res.status(500).json({ message: 'Server error' });
      return;
    }

    res.status(201).json({
      token,
      ...payload
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors });
    } else {
      console.log(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, password } = loginSchema.parse(req.body);
    const user = await User.findOne({ phone });

    if (!user) {
      res.status(400).json({ message: 'Số điện thoại hoặc mật khẩu không đúng' });
      return;
    }

    if (user.status !== 'active') {
      res.status(403).json({ message: 'Tài khoản không hoạt động' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(400).json({ message: 'Số điện thoại hoặc mật khẩu không đúng' });
      return;
    }

    const token = buildToken(String(user._id));
    const payload = await buildAuthResponse(String(user._id));
    if (!payload) {
      res.status(500).json({ message: 'Server error' });
      return;
    }

    res.json({ token, ...payload });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
};

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const payload = await buildAuthResponse(userId);
    if (!payload) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Lấy thông tin thành công.',
      data: payload
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getUserProfileByAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      res.status(400).json({ success: false, message: 'Thiếu userId' });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ success: false, message: 'User ID không hợp lệ' });
      return;
    }

    const payload = await buildAuthResponse(userId);
    if (!payload) {
      res.status(404).json({ success: false, message: 'Không tìm thấy người dùng!' });
      return;
    }

    res.json({
      success: true,
      message: 'Lấy thông tin thành công.',
      data: payload
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
