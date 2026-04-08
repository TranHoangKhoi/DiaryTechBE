import { Request, Response } from 'express';
import mongoose from 'mongoose';
import cloudinary from '~/config/cloudinary';
import { Crop } from '~/models/CropCategories';
import FarmModel from '~/models/Farm.model';
import { FarmCrop } from '~/models/FarmCrop.model';
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
    const { farm_name, location, farm_type_id, description, password, name, phone, area, polygon, unit, crop_id } =
      req.body;
    let { geo_location, province, ward } = req.body;
    const ownerId = req.user?.id;

    let polygonData = polygon;

    if (typeof polygonData === 'string') {
      polygonData = JSON.parse(polygonData);
    }

    // nếu là FeatureCollection
    if (polygonData?.type === 'FeatureCollection') {
      polygonData = polygonData.features?.[0]?.geometry;
    }

    // if (!polygonData || polygonData.type !== 'Polygon') {
    //   res.status(400).json({ message: 'Polygon không hợp lệ' });
    //   return;
    // }

    if (!ownerId) {
      res.status(401).json({ message: 'User không hợp lệ' });
      return;
    }

    // sau khi tạo newFarm
    const crop = await Crop.findById(crop_id);

    if (!crop) {
      res.status(400).json({ message: 'Crop không tồn tại' });
      return;
    }

    // validate farm_type
    if (crop.farm_type_id.toString() !== farm_type_id.toString()) {
      res.status(400).json({ message: 'Crop không hợp lệ với farm type' });
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
    let avatarUrl: string | undefined;

    if (!farm_name || !password) {
      res.status(400).json({ error: 'Thiếu dữ liệu bắt buộc' });
      return;
    }

    // trường hợp FE gửi link
    if (req.body.image && typeof req.body.image === 'string') {
      avatarUrl = req.body.image;
    }

    // trường hợp gửi file
    if (imageFile) {
      const imageRes = await streamUpload(imageFile.buffer, 'image', 'Farms');
      avatarUrl = imageRes.secure_url;
    }

    if (!avatarUrl) {
      // res.status(400).json({ error: 'Thiếu ảnh' });
      avatarUrl = '';
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

    // Bắt đầu transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Tạo subUser
      const [subUser] = await UserModel.create(
        [
          {
            phone,
            password,
            name,
            role: 'sub_account',
            owner_id: ownerId,
            avatar: avatarUrl
          }
        ],
        { session }
      );

      // Tạo farm
      const [newFarm] = await FarmModel.create(
        [
          {
            owner_id: ownerId,
            user_id: subUser._id,
            farm_name,
            location,
            farm_type_id,
            geo_location,
            description,
            area,
            polygon: polygonData,
            avatar: avatarUrl,
            province,
            unit,
            ward
          }
        ],
        { session }
      );

      // tạo farmCrop
      await FarmCrop.create(
        [
          {
            farm_id: newFarm._id,
            crop_id,
            area: area || 0,
            is_primary: true
          }
        ],
        { session }
      );

      // Xác nhận các thay đổi
      await session.commitTransaction();
      session.endSession();

      res.status(201).json({
        message: 'Tạo Farm thành công',
        farm: newFarm
      });
    } catch (error) {
      // Rollback nếu có lỗi
      await session.abortTransaction();
      session.endSession();
      throw error; // Ném lỗi ra catch bên ngoài
    }
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

export const getFarmsByUserIdFormAdmin = async (req: Request, res: Response) => {
  try {
    // Nếu muốn lấy userId từ query hoặc params, có thể sửa dòng dưới
    const userId = req.params.userId;

    if (!userId) {
      res.status(400).json({ message: 'Thiếu userId' });
      return;
    }

    // Tìm tất cả farm có user_id trùng với userId
    const farms = await FarmModel.findOne({ user_id: userId })
      .populate('owner_id', 'name avatar')
      .populate('farm_type_id', 'type_name');

    res.status(200).json({
      success: true,
      data: farms
    });
  } catch (error) {
    console.error('Error fetching farms:', error);
    res.status(500).json({ message: 'Lỗi server', error });
  }
};
