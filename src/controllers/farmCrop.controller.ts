import { Crop } from '~/models/CropCategories';
import FarmModel from '~/models/Farm.model';
import { FarmCrop } from '~/models/FarmCrop.model';
import { Request, Response } from 'express';

export const addCropToFarm = async (req: Request, res: Response) => {
  try {
    const { farmId } = req.params;
    const { crop_id, area, is_primary } = req.body;

    const farm = await FarmModel.findById(farmId);
    if (!farm) {
      res.status(404).json({ message: 'Farm không tồn tại' });
      return;
    }

    const crop = await Crop.findById(crop_id);
    if (!crop) {
      res.status(404).json({ message: 'Crop không tồn tại' });
      return;
    }

    // validate cùng farm_type
    if (crop.farm_type_id.toString() !== farm.farm_type_id.toString()) {
      res.status(400).json({ message: 'Crop không hợp lệ' });
      return;
    }

    // nếu set primary → reset cái cũ
    if (is_primary) {
      await FarmCrop.updateMany({ farm_id: farmId }, { is_primary: false });
    }

    const farmCrop = await FarmCrop.create({
      farm_id: farmId,
      crop_id,
      area,
      is_primary: is_primary ?? true
    });

    res.status(201).json({ data: farmCrop });
  } catch (err) {
    res.status(500).json({ message: 'Server error', err });
  }
};

export const getFarmCrops = async (req: Request, res: Response) => {
  try {
    const { farmId } = req.params;

    const data = await FarmCrop.find({ farm_id: farmId }).populate('crop_id');

    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteFarmCrop = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await FarmCrop.findByIdAndDelete(id);

    res.json({ message: 'Đã xóa crop khỏi farm' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
