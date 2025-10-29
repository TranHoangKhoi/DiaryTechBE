import { Request, Response } from 'express';
import mongoose from 'mongoose';
import cloudinary from '~/config/cloudinary';
import FarmModel from '~/models/Farm.model';
import FarmtypeModel from '~/models/Farmtype.model';
import UserModel from '~/models/User.model';

export const streamUpload = (buffer: Buffer, type: 'image' | 'video' = 'image', folder?: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const uploadOptions: any = {
      resource_type: type
    };

    if (folder) {
      uploadOptions.folder = folder;
    }

    const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });

    stream.end(buffer);
  });
};

export const createFarm = async (req: Request, res: Response): Promise<void> => {
  try {
    const { farm_name, location, farm_type_id, description, password, name, phone } = req.body;
    let { geo_location, province, ward } = req.body;
    const ownerId = req.user?.id;

    console.log('Data:', req.body);

    if (!ownerId) {
      res.status(401).json({ message: 'User không hợp lệ' });
      return;
    }

    // Kiểm tra farm_type có tồn tại không
    const farmType = await FarmtypeModel.findById(farm_type_id);
    if (!farmType) {
      res.status(400).json({ message: 'Farm type không tồn tại' });
      return;
    }

    const files = req.files as any;
    const imageFile = files?.['image']?.[0];
    if (!farm_name || !password || !imageFile) {
      res.status(400).json({ error: 'Thiếu dữ liệu bắt buộc' });
      return;
    }

    // Xử lý dữ liệu
    if (typeof geo_location === 'string') {
      geo_location = geo_location.split(',').map(Number);
    }

    if (typeof province === 'string') {
      province = JSON.parse(province);
    }

    if (typeof ward === 'string') {
      ward = JSON.parse(ward);
    }

    // Upload ảnh
    const imageRes = await streamUpload(imageFile.buffer, 'image', 'Farms');

    // Tạo subUser
    const subUser = await UserModel.create({
      phone,
      password,
      name,
      role: 'sub_account',
      owner_id: ownerId,
      avatar: imageRes.secure_url
    });

    // Tạo farm
    const newFarm = await FarmModel.create({
      owner_id: ownerId,
      user_id: subUser._id,
      farm_name,
      location,
      farm_type_id,
      geo_location,
      description,
      avatar: imageRes.secure_url,
      province,
      ward
    });

    res.status(201).json({
      message: 'Tạo Farm thành công',
      farm: newFarm
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Server error',
      error
    });
  }
};

export const getFarmsByOwner = async (req: Request, res: Response) => {
  try {
    const ownerId = req.user?.id;

    console.log('ownerId: ', ownerId);

    if (!ownerId) {
      res.status(400).json({ message: 'Thiếu ownerId' });
      return;
    }

    const farms = await FarmModel.find({ owner_id: ownerId }).populate('farm_type_id').populate('user_id');

    res.status(200).json({
      success: true,
      data: farms
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export const getFarmsByUserId = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    // Lấy farm đầu tiên theo user_id
    const farm = await FarmModel.findOne({ user_id: userId })
      .populate('owner_id', 'name avatar')
      .populate('farm_type_id', 'type_name');

    if (!farm) {
      res.status(404).json({ message: 'Không tìm thấy farm nào cho user này' });
      return;
    }

    res.json(farm);
  } catch (error) {
    console.error('Error fetching farm:', error);
    res.status(500).json({ message: 'Lỗi server', error });
  }
};
