import { Request, Response } from 'express';
import { FarmMedia } from '~/models/FarmMedia';

export const addFarmMedia = async (req: Request, res: Response) => {
  try {
    const { farmId } = req.params;
    const medias = req.body; // array

    const data = medias.map((item: any) => ({
      farm_id: farmId,
      url: item.url,
      type: item.type || 'image',
      is_cover: item.is_cover || false
    }));

    const result = await FarmMedia.insertMany(data);

    res.status(201).json({ data: result });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getFarmMedia = async (req: Request, res: Response) => {
  try {
    const { farmId } = req.params;

    const media = await FarmMedia.find({ farm_id: farmId }).sort({ order: 1 });

    res.json({ data: media });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteFarmMedia = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await FarmMedia.findByIdAndDelete(id);

    res.json({ message: 'Đã xóa media' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
