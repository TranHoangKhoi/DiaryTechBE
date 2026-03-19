import { Request, Response } from 'express';
import { ProductionReport } from '~/models/ProductionReport';

export const addReport = async (req: Request, res: Response) => {
  try {
    const { farmId } = req.params;
    const { year, yield: yieldValue } = req.body;

    const report = await ProductionReport.create({
      farm_id: farmId,
      year,
      yield: yieldValue
    });

    res.status(201).json({ data: report });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getReports = async (req: Request, res: Response) => {
  try {
    const { farmId } = req.params;

    const reports = await ProductionReport.find({ farm_id: farmId }).sort({ year: 1 });

    res.json({ data: reports });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const report = await ProductionReport.findByIdAndUpdate(id, req.body, { new: true });

    res.json({ data: report });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await ProductionReport.findByIdAndDelete(id);

    res.json({ message: 'Đã xóa report' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
