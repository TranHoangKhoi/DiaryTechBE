import { Request, Response } from 'express';
import mongoose, { Types } from 'mongoose';
import { z } from 'zod';
import FarmModel from '~/models/Farm.model';
import ProductionBookModel from '~/models/ProductionBook.model';
import ProductionLogsModel from '~/models/ProductionLogs.model';
import { ProductionReport } from '~/models/ProductionReport';
import { assertFarmAccess } from '~/services/farmAccess.service';

const reportStatusValues = ['draft', 'finalized'] as const;

const moneyItemSchema = z.object({
  category: z.string().trim().min(1),
  amount: z.coerce.number().min(0).default(0),
  note: z.string().optional().default('')
});

const harvestItemSchema = z.object({
  date: z.string().optional(),
  species: z.string().optional().default(''),
  quantity: z.coerce.number().min(0).default(0),
  unit: z.string().optional().default('kg'),
  revenue: z.coerce.number().min(0).default(0),
  buyer: z.string().optional().default(''),
  note: z.string().optional().default('')
});

const reportPayloadSchema = z.object({
  farm_id: z.string().optional(),
  farm_type_id: z.string().optional(),
  book_id: z.string().optional(),
  year: z.coerce.number().int().min(1900).max(3000).optional(),
  season_name: z.string().optional(),
  species: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  yield: z.coerce.number().min(0).optional(),
  unit: z.string().optional(),
  total_harvest: z.coerce.number().min(0).optional(),
  harvest_unit: z.string().optional(),
  total_revenue: z.coerce.number().min(0).optional(),
  total_cost: z.coerce.number().min(0).optional(),
  harvest_items: z.array(harvestItemSchema).optional(),
  cost_items: z.array(moneyItemSchema).optional(),
  status: z.enum(reportStatusValues).optional(),
  notes: z.string().optional()
});

const isValidObjectId = (value: unknown) => typeof value === 'string' && Types.ObjectId.isValid(value);

const parseDate = (value?: string) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const normalizeHarvestItems = (items: z.infer<typeof harvestItemSchema>[] = []) =>
  items.map((item) => ({
    ...item,
    date: parseDate(item.date) || undefined
  }));

const sumHarvestQuantity = (items: Array<{ quantity?: number }> = []) =>
  items.reduce((total, item) => total + Number(item.quantity || 0), 0);

const sumHarvestRevenue = (items: Array<{ revenue?: number }> = []) =>
  items.reduce((total, item) => total + Number(item.revenue || 0), 0);

const sumCost = (items: Array<{ amount?: number }> = []) =>
  items.reduce((total, item) => total + Number(item.amount || 0), 0);

const buildLogSummaryByBook = async (bookId: string) => {
  const [summary] = await ProductionLogsModel.aggregate([
    { $match: { book_id: new mongoose.Types.ObjectId(bookId) } },
    {
      $group: {
        _id: null,
        total_logs: { $sum: 1 },
        first_log_date: { $min: '$date' },
        last_log_date: { $max: '$date' }
      }
    }
  ]);

  const byActivity = await ProductionLogsModel.aggregate([
    { $match: { book_id: new mongoose.Types.ObjectId(bookId) } },
    { $group: { _id: '$activity_id', count: { $sum: 1 } } },
    {
      $lookup: {
        from: 'activities',
        localField: '_id',
        foreignField: '_id',
        as: 'activity'
      }
    },
    { $unwind: { path: '$activity', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        activity_id: '$_id',
        activity_name: '$activity.activity_name',
        count: 1
      }
    }
  ]);

  return {
    total_logs: summary?.total_logs || 0,
    first_log_date: summary?.first_log_date || null,
    last_log_date: summary?.last_log_date || null,
    by_activity: byActivity
  };
};

const resolveReportContext = async (payload: z.infer<typeof reportPayloadSchema>) => {
  let farmId = payload.farm_id;
  let farmTypeId = payload.farm_type_id;
  let book: any = null;

  if (payload.book_id) {
    if (!isValidObjectId(payload.book_id)) {
      return { ok: false as const, status: 400, message: 'Invalid book_id' };
    }

    book = await ProductionBookModel.findById(payload.book_id).select(
      '_id farm_id farm_type_id name production start_date end_date status deleted_at'
    );

    if (!book || book.deleted_at) {
      return { ok: false as const, status: 404, message: 'Production book not found' };
    }

    farmId = String(book.farm_id);
    farmTypeId = String(book.farm_type_id);
  }

  if (!farmId || !isValidObjectId(farmId)) {
    return { ok: false as const, status: 400, message: 'Invalid farm_id' };
  }

  const farm = await FarmModel.findById(farmId).select('_id farm_type_id farm_name');
  if (!farm) {
    return { ok: false as const, status: 404, message: 'Farm not found' };
  }

  const resolvedFarmTypeId = farmTypeId || String((farm as any).farm_type_id);
  if (!isValidObjectId(resolvedFarmTypeId)) {
    return { ok: false as const, status: 400, message: 'Invalid farm_type_id' };
  }

  if (String((farm as any).farm_type_id) !== String(resolvedFarmTypeId)) {
    return { ok: false as const, status: 400, message: 'farm_type_id does not match farm_id' };
  }

  return {
    ok: true as const,
    farm,
    book,
    farm_id: String(farm._id),
    farm_type_id: resolvedFarmTypeId
  };
};

const buildReportData = async (payload: z.infer<typeof reportPayloadSchema>, userId?: string) => {
  const context = await resolveReportContext(payload);
  if (!context.ok) return context;

  const startDate = parseDate(payload.start_date);
  const endDate = parseDate(payload.end_date);

  if (startDate === null) return { ok: false as const, status: 400, message: 'Invalid start_date' };
  if (endDate === null) return { ok: false as const, status: 400, message: 'Invalid end_date' };

  const harvestItems = normalizeHarvestItems(payload.harvest_items);
  const costItems = payload.cost_items || [];
  const totalHarvest = payload.total_harvest ?? payload.yield ?? sumHarvestQuantity(harvestItems);
  const totalRevenue = payload.total_revenue ?? sumHarvestRevenue(harvestItems);
  const totalCost = payload.total_cost ?? sumCost(costItems);
  const reportStartDate = startDate || context.book?.start_date;
  const reportYear = payload.year || new Date(reportStartDate || Date.now()).getFullYear();
  const logSummary = context.book ? await buildLogSummaryByBook(String(context.book._id)) : undefined;

  return {
    ok: true as const,
    data: {
      farm_id: context.farm_id,
      farm_type_id: context.farm_type_id,
      book_id: payload.book_id || null,
      year: reportYear,
      season_name: payload.season_name ?? context.book?.name ?? '',
      species: payload.species ?? context.book?.production ?? '',
      start_date: reportStartDate,
      end_date: endDate || context.book?.end_date,
      yield: totalHarvest,
      unit: payload.unit || payload.harvest_unit || 'kg',
      total_harvest: totalHarvest,
      harvest_unit: payload.harvest_unit || payload.unit || 'kg',
      total_revenue: totalRevenue,
      total_cost: totalCost,
      profit: totalRevenue - totalCost,
      harvest_items: harvestItems,
      cost_items: costItems,
      ...(logSummary ? { log_summary: logSummary } : {}),
      status: payload.status || 'draft',
      notes: payload.notes || '',
      updated_by: userId ? new mongoose.Types.ObjectId(userId) : null
    }
  };
};

export const addReport = async (req: Request, res: Response) => {
  try {
    const { farmId } = req.params;
    const { year, yield: yieldValue, unit } = req.body;

    const farmAccess = await assertFarmAccess(req.user, farmId);
    if (!farmAccess.ok) {
      res.status(farmAccess.status).json({ message: farmAccess.message });
      return;
    }

    const report = await ProductionReport.create({
      farm_id: farmId,
      farm_type_id: (farmAccess.farm as any).farm_type_id,
      year,
      yield: yieldValue,
      unit: unit || 'kg',
      total_harvest: yieldValue,
      harvest_unit: unit || 'kg',
      created_by: req.user?.id
    });

    res.status(201).json({ data: report });
  } catch (err) {
    console.error('Error addReport:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getReports = async (req: Request, res: Response) => {
  try {
    const { farmId } = req.params;

    const farmAccess = await assertFarmAccess(req.user, farmId);
    if (!farmAccess.ok) {
      res.status(farmAccess.status).json({ message: farmAccess.message });
      return;
    }

    const reports = await ProductionReport.find({ farm_id: farmId }).sort({ year: 1 });

    res.json({ data: reports });
  } catch (err) {
    console.error('Error getReports:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getManageProductionReports = async (req: Request, res: Response) => {
  try {
    const { farm_id, farm_type_id, book_id, status, page = 1, limit = 20 } = req.query;
    const pageNumber = Math.max(Number.parseInt(String(page), 10) || 1, 1);
    const limitNumber = Math.min(Math.max(Number.parseInt(String(limit), 10) || 20, 1), 100);
    const filter: Record<string, any> = {};

    if (farm_id) filter.farm_id = farm_id;
    if (farm_type_id) filter.farm_type_id = farm_type_id;
    if (book_id) filter.book_id = book_id;
    if (status) filter.status = status;

    const [reports, total] = await Promise.all([
      ProductionReport.find(filter)
        .populate('farm_id', 'farm_name avatar province ward')
        .populate('farm_type_id', 'type_name image')
        .populate('book_id', 'name production status start_date end_date')
        .sort({ updatedAt: -1 })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber),
      ProductionReport.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: reports,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber)
      }
    });
  } catch (err) {
    console.error('Error getManageProductionReports:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createManageProductionReport = async (req: Request, res: Response) => {
  try {
    const payload = reportPayloadSchema.parse(req.body);
    const reportData = await buildReportData(payload, req.user?.id);

    if (!reportData.ok) {
      res.status(reportData.status).json({ message: reportData.message });
      return;
    }

    const report = await ProductionReport.create({
      ...reportData.data,
      created_by: req.user?.id
    });

    res.status(201).json({ success: true, data: report });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: err.errors });
      return;
    }

    console.error('Error createManageProductionReport:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getManageProductionReportById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      res.status(400).json({ message: 'Invalid report id' });
      return;
    }

    const report = await ProductionReport.findById(id)
      .populate('farm_id', 'farm_name avatar province ward')
      .populate('farm_type_id', 'type_name image')
      .populate('book_id', 'name production status start_date end_date')
      .populate('created_by', 'name avatar')
      .populate('updated_by', 'name avatar');

    if (!report) {
      res.status(404).json({ message: 'Report not found' });
      return;
    }

    res.json({ success: true, data: report });
  } catch (err) {
    console.error('Error getManageProductionReportById:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateManageProductionReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      res.status(400).json({ message: 'Invalid report id' });
      return;
    }

    const currentReport = await ProductionReport.findById(id);
    if (!currentReport) {
      res.status(404).json({ message: 'Report not found' });
      return;
    }

    const payload = reportPayloadSchema.parse({
      farm_id: String(currentReport.farm_id),
      farm_type_id: String(currentReport.farm_type_id),
      book_id: currentReport.book_id ? String(currentReport.book_id) : undefined,
      year: currentReport.year,
      ...req.body
    });
    const reportData = await buildReportData(payload, req.user?.id);

    if (!reportData.ok) {
      res.status(reportData.status).json({ message: reportData.message });
      return;
    }

    const report = await ProductionReport.findByIdAndUpdate(id, reportData.data, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, data: report });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: err.errors });
      return;
    }

    console.error('Error updateManageProductionReport:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteManageProductionReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      res.status(400).json({ message: 'Invalid report id' });
      return;
    }

    const report = await ProductionReport.findByIdAndDelete(id);
    if (!report) {
      res.status(404).json({ message: 'Report not found' });
      return;
    }

    res.json({ success: true, message: 'Deleted report' });
  } catch (err) {
    console.error('Error deleteManageProductionReport:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const regenerateProductionReportLogSummary = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      res.status(400).json({ message: 'Invalid report id' });
      return;
    }

    const report = await ProductionReport.findById(id);
    if (!report) {
      res.status(404).json({ message: 'Report not found' });
      return;
    }

    if (!report.book_id) {
      res.status(400).json({ message: 'Report does not have book_id' });
      return;
    }

    report.set('log_summary', await buildLogSummaryByBook(String(report.book_id)));
    if (req.user?.id) {
      report.updated_by = new mongoose.Types.ObjectId(req.user.id) as any;
    }
    await report.save();

    res.json({ success: true, data: report });
  } catch (err) {
    console.error('Error regenerateProductionReportLogSummary:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateReport = updateManageProductionReport;
export const deleteReport = deleteManageProductionReport;
