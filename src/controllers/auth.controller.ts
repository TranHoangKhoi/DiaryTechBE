import User from '../models/User.model';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { Types } from 'mongoose';
import { Request, Response } from 'express';

const farmSchema = z.object({
  farm_name: z.string().min(1, { message: 'Tên trang trại là bắt buộc' }),
  location: z.string().min(1, { message: 'Vị trí trang trại là bắt buộc' }),
  farm_type_id: z.string().regex(/^[0-9a-fA-F]{24}$/, { message: 'farm_type_id phải là ObjectId hợp lệ' }), // Kiểm tra ObjectId
  geo_location: z.string().optional(),
  area: z.number().positive({ message: 'Diện tích phải là số dương' }),
  province: z.number().positive({ message: 'ID tỉnh thành phải là số dương' }),
  district: z.number().positive({ message: 'ID quận huyện phải là số dương' }),
  ward: z.number().positive({ message: 'ID phương xã phải là số dương' }),
  soil_type: z.string().optional(),
  farm_status: z.enum(['active', 'inactive', 'under_maintenance']).default('active'),
  description: z.string().optional()
});

// Schema validation chính cho register
const registerSchema = z.object({
  phone: z
    .string()
    .min(10, { message: 'Số điện thoại phải có ít nhất 10 chữ số' })
    .max(10, { message: 'Số điện thoại không được vượt quá 10 chữ số' }),
  password: z.string().min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' }),
  name: z.string().min(1, { message: 'Tên là bắt buộc' }),
  des: z.string().optional(),
  address: z.string().min(1, { message: 'Địa chỉ là bắt buộc' }),
  gender: z.number().min(1, { message: 'Giới tính là nam hoặc nữ' }),
  role: z.enum(['sub_account', 'owner', 'admin'], { message: 'Vai trò chưa phù hợp' }),
  owner_id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, { message: 'owner_id phải là ObjectId hợp lệ' })
    .optional()
});

const loginSchema = z.object({
  phone: z.string().min(10).max(10),
  password: z.string().min(6)
});

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { password, name, role, address, phone, owner_id, gender, des } = registerSchema.parse(req.body);

    let user = await User.findOne({ phone });

    if (user) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    let avatar = '';
    if (gender) {
      avatar =
        gender === 1
          ? 'https://res.cloudinary.com/delix6nht/image/upload/v1755744492/1_wlrjjb.png'
          : 'https://res.cloudinary.com/delix6nht/image/upload/v1755744493/2_giyotm.png';
    }
    user = new User({ password, name, role, address, phone, owner_id, gender, avatar, des });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET as string, {
      expiresIn: '1y'
    });

    res.status(201).json({ token, user: { id: user._id, phone: user.phone, role: user.role } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors });
    } else {
      console.log(error);
      res.status(500).json({ message: error });
    }
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, password } = loginSchema.parse(req.body);
    const user = await User.findOne({ phone });

    if (!user) {
      res.status(400).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng !' });
      return;
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      console.log('Phone: ', phone);
      res.status(400).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng !' });
      return;
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET as string, {
      expiresIn: '1y'
    });
    res.json({ token, user: { id: user._id, phone: user.phone, role: user.role } });
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
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
