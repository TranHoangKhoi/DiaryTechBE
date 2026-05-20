import mongoose, { Types } from 'mongoose';
import { Request, Response } from 'express';
import FarmModel from '~/models/Farm.model';
import FarmTypeConfigModel from '~/models/FarmTypeConfig.model';
import ProductionBookModel from '~/models/ProductionBook.model';
import ProductionLogModel from '~/models/ProductionLogs.model';

const MAX_GENERAL_INFO_BYTES = 20 * 1024;
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
const DEFAULT_IMAGE_URL = 'https://res.cloudinary.com/delix6nht/image/upload/v1760068625/3_xs0l5w.png';

const notDeletedFilter = {
  deleted_at: null
};

const allowedStatus = new Set(['ongoing', 'completed']);
const elevatedRoles = new Set(['superadmin', 'admin']);

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const isValidDate = (value: unknown) => {
  if (value === undefined || value === null || value === '') return false;
  const date = new Date(value as string);
  return !Number.isNaN(date.getTime());
};

const parseDate = (value: unknown) => new Date(value as string);

const parsePositiveInt = (value: unknown, fallback: number, max = MAX_LIMIT) => {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (Number.isNaN(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, max);
};

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (!value || typeof value !== 'object') return false;
  return !Array.isArray(value);
};

const validateGeneralInfo = (value: unknown) => {
  if (value === undefined) return null;
  if (!isPlainObject(value)) return 'general_info must be an object';

  const size = Buffer.byteLength(JSON.stringify(value), 'utf8');
  if (size > MAX_GENERAL_INFO_BYTES) {
    return `general_info is too large. Max size is ${MAX_GENERAL_INFO_BYTES} bytes`;
  }

  return null;
};

type GeneralInfoLabelMaps = {
  fieldLabels: Map<string, string>;
  tableLabels: Map<string, Map<string, string>>;
};

const fallbackLabelFromKey = (key: string) => key.replace(/_/g, ' ');

const buildGeneralInfoLabelMaps = (config: any): GeneralInfoLabelMaps => {
  const fieldLabels = new Map<string, string>();
  const tableLabels = new Map<string, Map<string, string>>();

  const sections = Array.isArray(config?.sections) ? config.sections : [];

  for (const section of sections) {
    for (const field of section?.fields ?? []) {
      if (field?.key && field?.label) {
        fieldLabels.set(field.key, field.label);
      }
    }

    if (section?.type === 'table') {
      const columnLabels = new Map<string, string>();
      for (const column of section?.columns ?? []) {
        if (column?.key && column?.label) {
          columnLabels.set(column.key, column.label);
          fieldLabels.set(column.key, column.label);
        }
      }

      if (section?.key && columnLabels.size > 0) {
        tableLabels.set(section.key, columnLabels);
      }
    }
  }

  return { fieldLabels, tableLabels };
};

const serializeGeneralInfoValue = (value: unknown, key: string, maps: GeneralInfoLabelMaps): unknown => {
  if (Array.isArray(value)) {
    if (value.every(isPlainObject)) {
      return value.map((item) => serializeGeneralInfoObject(item, maps, key));
    }
    return value;
  }

  if (isPlainObject(value)) {
    return serializeGeneralInfoObject(value, maps, key);
  }

  return value;
};

const serializeGeneralInfoObject = (raw: Record<string, unknown>, maps: GeneralInfoLabelMaps, parentKey?: string) => {
  return Object.entries(raw).map(([key, value]) => {
    const tableLabel = parentKey ? maps.tableLabels.get(parentKey)?.get(key) : undefined;
    const label = tableLabel ?? maps.fieldLabels.get(key) ?? fallbackLabelFromKey(key);

    return {
      key,
      label,
      value: serializeGeneralInfoValue(value, key, maps)
    };
  });
};

const serializeGeneralInfo = (raw: unknown, maps: GeneralInfoLabelMaps) => {
  if (!isPlainObject(raw)) return [];
  return Object.entries(raw).map(([key, value]) => ({
    key,
    label: maps.fieldLabels.get(key) ?? fallbackLabelFromKey(key),
    value: serializeGeneralInfoValue(value, key, maps)
  }));
};

const readGeneralInfoValue = (raw: unknown, sectionValue: unknown, key: string) => {
  if (isPlainObject(sectionValue) && key in sectionValue) {
    return (sectionValue as Record<string, unknown>)[key] ?? null;
  }

  if (isPlainObject(raw) && key in raw) {
    return (raw as Record<string, unknown>)[key] ?? null;
  }

  return null;
};

const serializeGeneralInfoRows = (sectionValue: unknown, columns: any[]) => {
  const rowsSource = Array.isArray(sectionValue) ? sectionValue : isPlainObject(sectionValue) ? [sectionValue] : [];

  return rowsSource.filter(isPlainObject).map((row) => {
    const rowData: Record<string, unknown> = {};

    for (const column of columns) {
      rowData[column.key] = row[column.key] ?? null;
    }

    return rowData;
  });
};

const serializeGeneralInfoBySections = (raw: unknown, config: any) => {
  if (!isPlainObject(raw)) return [];

  const sections = Array.isArray(config?.sections) ? config.sections : [];

  return sections.map((section: any) => {
    const sectionValue = (raw as Record<string, unknown>)[section.key];
    const fields = Array.isArray(section?.fields)
      ? section.fields.map((field: any) => ({
          ...field,
          value: readGeneralInfoValue(raw, sectionValue, field.key)
        }))
      : [];
    const columns = Array.isArray(section?.columns)
      ? section.columns.map((column: any) => ({
          ...column
        }))
      : [];
    const rows = section?.type === 'table' ? serializeGeneralInfoRows(sectionValue, columns) : [];

    return {
      key: section.key,
      name: section.name,
      type: section.type,
      fields,
      columns,
      ...(rows.length ? { rows } : {})
    };
  });
};

const getUserContext = (req: Request) => req.user;

const getFarmAccessCondition = (user?: { id: string; role: string }) => {
  if (!user) return null;
  if (elevatedRoles.has(user.role)) return {};
  if (user.role === 'owner') return { owner_id: user.id };
  if (user.role === 'sub_account') return { user_id: user.id };
  return null;
};

const assertFarmAccess = async (user: { id: string; role: string } | undefined, farmId: string) => {
  if (!user) {
    return { ok: false, status: 401, message: 'Unauthorized' };
  }

  if (!Types.ObjectId.isValid(farmId)) {
    return { ok: false, status: 400, message: 'Invalid farmId' };
  }

  const accessCondition = getFarmAccessCondition(user);
  if (!accessCondition) {
    return { ok: false, status: 403, message: 'Forbidden' };
  }

  const farm = await FarmModel.findOne({ _id: farmId, ...accessCondition }).select('_id farm_type_id owner_id user_id');

  if (!farm) {
    return { ok: false, status: 403, message: 'You do not have access to this farm' };
  }

  return { ok: true as const, farm };
};

const buildBaseFilter = (farmId: string) => ({
  farm_id: farmId,
  ...notDeletedFilter
});

const serializeProductionBook = (book: any, latestLogCount?: number, serializedGeneralInfo?: unknown) => ({
  _id: book._id?.toString?.() ?? book._id,
  id: book._id?.toString?.() ?? book._id,
  farm: book.farm_id
    ? {
        id: book.farm_id._id?.toString?.() ?? book.farm_id?.toString?.() ?? book.farm_id,
        name: book.farm_id.farm_name ?? book.farm_id.name ?? null
      }
    : null,
  farm_type: book.farm_type_id
    ? {
        id: book.farm_type_id._id?.toString?.() ?? book.farm_type_id?.toString?.() ?? book.farm_type_id,
        name: book.farm_type_id.type_name ?? book.farm_type_id.name ?? null
      }
    : null,
  created_by: book.created_by
    ? {
        id: book.created_by._id?.toString?.() ?? book.created_by?.toString?.() ?? book.created_by,
        name: book.created_by.name ?? null,
        avatar: book.created_by.avatar ?? null
      }
    : null,
  name: book.name,
  description: book.description ?? null,
  production: book.production,
  image: book.image,
  start_date: book.start_date,
  end_date: book.end_date ?? null,
  status: book.status,
  general_info: serializedGeneralInfo ?? book.general_info ?? {},
  deleted_at: book.deleted_at ?? null,
  createdAt: book.createdAt,
  updatedAt: book.updatedAt,
  ...(latestLogCount !== undefined ? { latest_log_count: latestLogCount } : {})
});

const getLogCountsByBookIds = async (bookIds: string[]) => {
  if (!bookIds.length) return new Map<string, number>();

  const counts = await ProductionLogModel.aggregate([
    {
      $match: {
        book_id: { $in: bookIds.map((id) => new mongoose.Types.ObjectId(id)) }
      }
    },
    {
      $group: {
        _id: '$book_id',
        total: { $sum: 1 }
      }
    }
  ]);

  return new Map<string, number>(counts.map((item) => [item._id.toString(), item.total as number]));
};

const getLogCountByBookId = async (bookId: string) => {
  return ProductionLogModel.countDocuments({ book_id: new mongoose.Types.ObjectId(bookId) });
};

const buildListQuery = ({ farmId, search, status }: { farmId: string; search?: string; status?: string }) => {
  const query: Record<string, any> = {
    ...buildBaseFilter(farmId)
  };

  if (search) {
    const regex = new RegExp(escapeRegExp(search), 'i');
    query.$or = [{ name: regex }, { production: regex }, { description: regex }];
  }

  if (status && allowedStatus.has(status)) {
    query.status = status;
  }

  return query;
};

const validateGeneralInfoByConfig = (generalInfo: unknown, config: any) => {
  const generalInfoError = validateGeneralInfo(generalInfo);
  if (generalInfoError) return generalInfoError;
  if (generalInfo === undefined || !config?.sections?.length) return null;

  const raw = generalInfo as Record<string, unknown>;

  for (const section of config.sections) {
    if (section.type === 'section') {
      const sectionValue = isPlainObject(raw[section.key]) ? (raw[section.key] as Record<string, unknown>) : raw;

      for (const field of section.fields ?? []) {
        const value = sectionValue[field.key];
        if (field.required && (value === undefined || value === null || String(value).trim() === '')) {
          return `${field.label || field.key} is required`;
        }
      }
      continue;
    }

    if (section.type === 'table') {
      const rows = raw[section.key];
      if (rows === undefined) continue;
      if (!Array.isArray(rows)) return `${section.name || section.key} must be an array`;

      for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
        const row = rows[rowIndex];
        if (!isPlainObject(row)) return `${section.name || section.key} row ${rowIndex + 1} must be an object`;

        for (const column of section.columns ?? []) {
          const value = row[column.key];
          if (column.required && (value === undefined || value === null || String(value).trim() === '')) {
            return `${column.label || column.key} is required at row ${rowIndex + 1}`;
          }
        }
      }
    }
  }

  return null;
};

const getFarmAndConfig = async (farmId: string, farmTypeId: string) => {
  if (!Types.ObjectId.isValid(farmId)) {
    return { ok: false as const, status: 400, message: 'Invalid farm_id' };
  }

  if (!Types.ObjectId.isValid(farmTypeId)) {
    return { ok: false as const, status: 400, message: 'Invalid farm_type_id' };
  }

  const [farm, farmTypeConfig] = await Promise.all([
    FarmModel.findById(farmId).select('_id farm_name farm_type_id owner_id user_id'),
    FarmTypeConfigModel.findOne({ farm_type_id: farmTypeId }).select('title description sections').lean()
  ]);

  if (!farm) {
    return { ok: false as const, status: 404, message: 'Farm not found' };
  }

  if (String((farm as any).farm_type_id) !== String(farmTypeId)) {
    return { ok: false as const, status: 400, message: 'farm_type_id does not match farm_id' };
  }

  return { ok: true as const, farm, farmTypeConfig };
};

export const createProductionBook = async (req: Request, res: Response) => {
  try {
    const user = getUserContext(req);
    const { name, description, production, image, start_date, end_date, general_info, farm_id, farm_type_id, status } =
      req.body;

    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!name || !production || !farm_id || !farm_type_id || !start_date) {
      res.status(400).json({ success: false, message: 'Missing required fields' });
      return;
    }

    if (!isValidDate(start_date)) {
      res.status(400).json({ success: false, message: 'Invalid start_date' });
      return;
    }

    if (end_date && !isValidDate(end_date)) {
      res.status(400).json({ success: false, message: 'Invalid end_date' });
      return;
    }

    const generalInfoError = validateGeneralInfo(general_info);
    if (generalInfoError) {
      res.status(400).json({ success: false, message: generalInfoError });
      return;
    }

    if (status && !allowedStatus.has(status)) {
      res.status(400).json({ success: false, message: 'Invalid status' });
      return;
    }

    if (!Types.ObjectId.isValid(farm_type_id)) {
      res.status(400).json({ success: false, message: 'Invalid farm_type_id' });
      return;
    }

    const farmAccess = await assertFarmAccess(user, farm_id);
    if (!farmAccess.ok) {
      res.status(farmAccess.status).json({ success: false, message: farmAccess.message });
      return;
    }

    const farmTypeId = (farmAccess.farm as any).farm_type_id;
    if (farmTypeId.toString() !== farm_type_id.toString()) {
      res.status(400).json({ success: false, message: 'farm_type_id does not match farm_id' });
      return;
    }

    const newBook = await ProductionBookModel.create({
      name,
      description,
      production,
      image: image || DEFAULT_IMAGE_URL,
      start_date: parseDate(start_date),
      end_date: end_date ? parseDate(end_date) : undefined,
      general_info: general_info ?? {},
      farm_id,
      farm_type_id,
      created_by: user.id,
      status: status ?? 'ongoing'
    });

    await newBook.populate('farm_id', 'farm_name');
    await newBook.populate('farm_type_id', 'type_name');
    await newBook.populate('created_by', 'name avatar');

    res.status(201).json({
      success: true,
      data: serializeProductionBook(newBook)
    });
  } catch (err) {
    console.error('Error creating production book:', err);
    res.status(500).json({ success: false, message: 'Error creating production book' });
  }
};

export const getProductionBookByFarm = async (req: Request, res: Response) => {
  try {
    const user = getUserContext(req);
    const farmId = req.params.farmId || req.params.farm_id;
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const status = typeof req.query.status === 'string' ? req.query.status.trim() : '';
    const include = typeof req.query.include === 'string' ? req.query.include : '';
    const page = parsePositiveInt(req.query.page, DEFAULT_PAGE);
    const limit = parsePositiveInt(req.query.limit, DEFAULT_LIMIT);
    const sort = typeof req.query.sort === 'string' && req.query.sort.toLowerCase() === 'asc' ? 1 : -1;

    if (!farmId) {
      res.status(400).json({ success: false, message: 'Missing farmId' });
      return;
    }

    const farmAccess = await assertFarmAccess(user, farmId);
    if (!farmAccess.ok) {
      res.status(farmAccess.status).json({ success: false, message: farmAccess.message });
      return;
    }

    if (status && status !== 'all' && !allowedStatus.has(status)) {
      res.status(400).json({ success: false, message: 'Invalid status' });
      return;
    }

    const query = buildListQuery({
      farmId,
      search,
      status: status === 'all' ? undefined : status
    });

    const total = await ProductionBookModel.countDocuments(query);
    const books = await ProductionBookModel.find(query)
      .populate('farm_id', 'farm_name')
      .populate('farm_type_id', 'type_name')
      .populate('created_by', 'name avatar')
      .sort({ start_date: sort, createdAt: sort })
      .skip((page - 1) * limit)
      .limit(limit);

    const farmTypeConfig = await FarmTypeConfigModel.findOne({
      farm_type_id: String((farmAccess.farm as any).farm_type_id)
    })
      .select('sections')
      .lean();

    const includeLogCount = include
      .split(',')
      .map((item) => item.trim())
      .includes('latest_log_count');
    const bookIds = books.map((book) => String((book as any)._id));
    const logCountMap = includeLogCount ? await getLogCountsByBookIds(bookIds) : new Map<string, number>();

    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: books.map((book) => {
        const currentBook = book as any;
        const groupedGeneralInfo = serializeGeneralInfoBySections(currentBook.general_info ?? {}, farmTypeConfig);

        return serializeProductionBook(currentBook, logCountMap.get(String(currentBook._id)), groupedGeneralInfo);
      })
    });
  } catch (error) {
    console.error('Error fetching production books:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getProductionBookSummaryByFarm = async (req: Request, res: Response) => {
  try {
    const user = getUserContext(req);
    const farmId = req.params.farmId || req.params.farm_id;

    if (!farmId) {
      res.status(400).json({ success: false, message: 'Missing farmId' });
      return;
    }

    const farmAccess = await assertFarmAccess(user, farmId);
    if (!farmAccess.ok) {
      res.status(farmAccess.status).json({ success: false, message: farmAccess.message });
      return;
    }

    const summary = await ProductionBookModel.aggregate([
      {
        $match: {
          farm_id: new mongoose.Types.ObjectId(farmId),
          ...notDeletedFilter
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          ongoing: {
            $sum: {
              $cond: [{ $eq: ['$status', 'ongoing'] }, 1, 0]
            }
          },
          completed: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
            }
          }
        }
      }
    ]);

    const data = summary[0] || { total: 0, ongoing: 0, completed: 0 };

    res.status(200).json({
      success: true,
      data: {
        total: data.total,
        ongoing: data.ongoing,
        completed: data.completed
      }
    });
  } catch (error) {
    console.error('Error fetching production book summary:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getProductionBookById = async (req: Request, res: Response) => {
  try {
    const user = getUserContext(req);
    const bookId = req.params.bookId;

    if (!Types.ObjectId.isValid(bookId)) {
      res.status(400).json({ success: false, message: 'Invalid bookId' });
      return;
    }

    const book = await ProductionBookModel.findOne({
      _id: bookId,
      ...notDeletedFilter
    });

    if (!book) {
      res.status(404).json({ success: false, message: 'Book not found' });
      return;
    }

    const farmAccess = await assertFarmAccess(user, book.farm_id.toString());
    if (!farmAccess.ok) {
      res.status(farmAccess.status).json({ success: false, message: farmAccess.message });
      return;
    }

    await book.populate('farm_id', 'farm_name');
    await book.populate('farm_type_id', 'type_name');
    await book.populate('created_by', 'name avatar');

    const farmTypeId = String((book.farm_type_id as any)?._id ?? book.farm_type_id);
    const [latestLogCount, farmTypeConfig] = await Promise.all([
      getLogCountByBookId(bookId),
      FarmTypeConfigModel.findOne({ farm_type_id: farmTypeId }).select('sections').lean()
    ]);
    const groupedGeneralInfo = serializeGeneralInfoBySections(book.general_info ?? {}, farmTypeConfig);

    res.status(200).json({
      success: true,
      data: serializeProductionBook(book, latestLogCount, groupedGeneralInfo)
    });
  } catch (error) {
    console.error('Error fetching production book:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateProductionBook = async (req: Request, res: Response) => {
  try {
    const user = getUserContext(req);
    const bookId = req.params.bookId;
    const { name, description, image, end_date, status, general_info } = req.body;

    if (!Types.ObjectId.isValid(bookId)) {
      res.status(400).json({ success: false, message: 'Invalid bookId' });
      return;
    }

    const book = await ProductionBookModel.findOne({
      _id: bookId,
      ...notDeletedFilter
    });

    if (!book) {
      res.status(404).json({ success: false, message: 'Book not found' });
      return;
    }

    const farmAccess = await assertFarmAccess(user, book.farm_id.toString());
    if (!farmAccess.ok) {
      res.status(farmAccess.status).json({ success: false, message: farmAccess.message });
      return;
    }

    if (end_date && !isValidDate(end_date)) {
      res.status(400).json({ success: false, message: 'Invalid end_date' });
      return;
    }

    if (status && !allowedStatus.has(status)) {
      res.status(400).json({ success: false, message: 'Invalid status' });
      return;
    }

    const generalInfoError = validateGeneralInfo(general_info);
    if (generalInfoError) {
      res.status(400).json({ success: false, message: generalInfoError });
      return;
    }

    if (name !== undefined) book.name = name;
    if (description !== undefined) book.description = description;
    if (image !== undefined) book.image = image;
    if (end_date !== undefined) book.end_date = end_date ? parseDate(end_date) : undefined;
    if (status !== undefined) book.status = status;
    if (general_info !== undefined) book.general_info = general_info;

    await book.save();
    await book.populate('farm_id', 'farm_name');
    await book.populate('farm_type_id', 'type_name');
    await book.populate('created_by', 'name avatar');

    res.status(200).json({
      success: true,
      data: serializeProductionBook(book)
    });
  } catch (error) {
    console.error('Error updating production book:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const softDeleteProductionBook = async (req: Request, res: Response) => {
  try {
    const user = getUserContext(req);
    const bookId = req.params.bookId;

    if (!Types.ObjectId.isValid(bookId)) {
      res.status(400).json({ success: false, message: 'Invalid bookId' });
      return;
    }

    const book = await ProductionBookModel.findOne({
      _id: bookId,
      ...notDeletedFilter
    });

    if (!book) {
      res.status(404).json({ success: false, message: 'Book not found' });
      return;
    }

    const farmAccess = await assertFarmAccess(user, book.farm_id.toString());
    if (!farmAccess.ok) {
      res.status(farmAccess.status).json({ success: false, message: farmAccess.message });
      return;
    }

    book.deleted_at = new Date();
    await book.save();

    res.status(200).json({
      success: true,
      message: 'Book deleted softly'
    });
  } catch (error) {
    console.error('Error soft deleting production book:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getManageProductionBooks = async (req: Request, res: Response) => {
  try {
    const farmId = typeof req.query.farm_id === 'string' ? req.query.farm_id.trim() : '';
    const farmTypeId = typeof req.query.farm_type_id === 'string' ? req.query.farm_type_id.trim() : '';
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const status = typeof req.query.status === 'string' ? req.query.status.trim() : '';
    const includeDeleted = req.query.include_deleted === 'true';
    const page = parsePositiveInt(req.query.page, DEFAULT_PAGE);
    const limit = parsePositiveInt(req.query.limit, DEFAULT_LIMIT);
    const sort = typeof req.query.sort === 'string' && req.query.sort.toLowerCase() === 'asc' ? 1 : -1;

    if (status && status !== 'all' && !allowedStatus.has(status)) {
      res.status(400).json({ success: false, message: 'Invalid status' });
      return;
    }

    const query: Record<string, any> = includeDeleted ? {} : { ...notDeletedFilter };

    if (farmId) {
      if (!Types.ObjectId.isValid(farmId)) {
        res.status(400).json({ success: false, message: 'Invalid farm_id' });
        return;
      }
      query.farm_id = farmId;
    }

    if (farmTypeId) {
      if (!Types.ObjectId.isValid(farmTypeId)) {
        res.status(400).json({ success: false, message: 'Invalid farm_type_id' });
        return;
      }
      query.farm_type_id = farmTypeId;
    }

    if (search) {
      const regex = new RegExp(escapeRegExp(search), 'i');
      query.$or = [{ name: regex }, { production: regex }, { description: regex }];
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const total = await ProductionBookModel.countDocuments(query);
    const books = await ProductionBookModel.find(query)
      .populate('farm_id', 'farm_name avatar province ward location farm_type_id owner_id user_id')
      .populate('farm_type_id', 'type_name image description')
      .populate('created_by', 'name avatar role')
      .sort({ start_date: sort, createdAt: sort })
      .skip((page - 1) * limit)
      .limit(limit);

    const logCountMap = await getLogCountsByBookIds(books.map((book) => String((book as any)._id)));

    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: books.map((book) => serializeProductionBook(book, logCountMap.get(String((book as any)._id))))
    });
  } catch (error) {
    console.error('Error fetching manage production books:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createManageProductionBook = async (req: Request, res: Response) => {
  try {
    const user = getUserContext(req);
    const { name, description, production, image, start_date, end_date, general_info, farm_id, farm_type_id, status } =
      req.body;

    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!name || !production || !farm_id || !farm_type_id || !start_date) {
      res.status(400).json({ success: false, message: 'Missing required fields' });
      return;
    }

    if (!isValidDate(start_date)) {
      res.status(400).json({ success: false, message: 'Invalid start_date' });
      return;
    }

    if (end_date && !isValidDate(end_date)) {
      res.status(400).json({ success: false, message: 'Invalid end_date' });
      return;
    }

    if (status && !allowedStatus.has(status)) {
      res.status(400).json({ success: false, message: 'Invalid status' });
      return;
    }

    const farmAndConfig = await getFarmAndConfig(farm_id, farm_type_id);
    if (!farmAndConfig.ok) {
      res.status(farmAndConfig.status).json({ success: false, message: farmAndConfig.message });
      return;
    }

    const generalInfoError = validateGeneralInfoByConfig(general_info, farmAndConfig.farmTypeConfig);
    if (generalInfoError) {
      res.status(400).json({ success: false, message: generalInfoError });
      return;
    }

    const newBook = await ProductionBookModel.create({
      name,
      description,
      production,
      image: image || DEFAULT_IMAGE_URL,
      start_date: parseDate(start_date),
      end_date: end_date ? parseDate(end_date) : undefined,
      general_info: general_info ?? {},
      farm_id,
      farm_type_id,
      created_by: user.id,
      status: status ?? 'ongoing'
    });

    await newBook.populate('farm_id', 'farm_name avatar province ward location farm_type_id owner_id user_id');
    await newBook.populate('farm_type_id', 'type_name image description');
    await newBook.populate('created_by', 'name avatar role');

    res.status(201).json({
      success: true,
      data: {
        ...serializeProductionBook(newBook),
        farm_type_config: farmAndConfig.farmTypeConfig ?? null
      }
    });
  } catch (error) {
    console.error('Error creating manage production book:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getManageProductionBookById = async (req: Request, res: Response) => {
  try {
    const bookId = req.params.bookId;

    if (!Types.ObjectId.isValid(bookId)) {
      res.status(400).json({ success: false, message: 'Invalid bookId' });
      return;
    }

    const book = await ProductionBookModel.findById(bookId);
    if (!book) {
      res.status(404).json({ success: false, message: 'Book not found' });
      return;
    }

    await book.populate('farm_id', 'farm_name avatar province ward location farm_type_id owner_id user_id');
    await book.populate('farm_type_id', 'type_name image description');
    await book.populate('created_by', 'name avatar role');

    const farmTypeId = String((book.farm_type_id as any)?._id ?? book.farm_type_id);
    const [latestLogCount, farmTypeConfig] = await Promise.all([
      getLogCountByBookId(bookId),
      FarmTypeConfigModel.findOne({ farm_type_id: farmTypeId }).select('title description sections').lean()
    ]);

    const groupedGeneralInfo = serializeGeneralInfoBySections(book.general_info ?? {}, farmTypeConfig);

    res.status(200).json({
      success: true,
      data: {
        ...serializeProductionBook(book, latestLogCount, groupedGeneralInfo),
        raw_general_info: book.general_info ?? {},
        farm_type_config: farmTypeConfig ?? null
      }
    });
  } catch (error) {
    console.error('Error fetching manage production book:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateManageProductionBook = async (req: Request, res: Response) => {
  try {
    const bookId = req.params.bookId;
    const { name, description, production, image, start_date, end_date, status, general_info, farm_id, farm_type_id } =
      req.body;

    if (!Types.ObjectId.isValid(bookId)) {
      res.status(400).json({ success: false, message: 'Invalid bookId' });
      return;
    }

    const book = await ProductionBookModel.findById(bookId);
    if (!book) {
      res.status(404).json({ success: false, message: 'Book not found' });
      return;
    }

    if (start_date !== undefined && !isValidDate(start_date)) {
      res.status(400).json({ success: false, message: 'Invalid start_date' });
      return;
    }

    if (end_date && !isValidDate(end_date)) {
      res.status(400).json({ success: false, message: 'Invalid end_date' });
      return;
    }

    if (status && !allowedStatus.has(status)) {
      res.status(400).json({ success: false, message: 'Invalid status' });
      return;
    }

    const nextFarmId = String(farm_id ?? book.farm_id);
    const nextFarmTypeId = String(farm_type_id ?? book.farm_type_id);
    const structuralChanged = nextFarmId !== String(book.farm_id) || nextFarmTypeId !== String(book.farm_type_id);

    if (structuralChanged) {
      const logCount = await getLogCountByBookId(bookId);
      if (logCount > 0) {
        res.status(409).json({ success: false, message: 'Cannot change farm or farm_type after logs were created' });
        return;
      }
    }

    const farmAndConfig = await getFarmAndConfig(nextFarmId, nextFarmTypeId);
    if (!farmAndConfig.ok) {
      res.status(farmAndConfig.status).json({ success: false, message: farmAndConfig.message });
      return;
    }

    const nextGeneralInfo = general_info !== undefined ? general_info : book.general_info ?? {};
    const generalInfoError = validateGeneralInfoByConfig(nextGeneralInfo, farmAndConfig.farmTypeConfig);
    if (generalInfoError) {
      res.status(400).json({ success: false, message: generalInfoError });
      return;
    }

    if (name !== undefined) book.name = name;
    if (description !== undefined) book.description = description;
    if (production !== undefined) book.production = production;
    if (image !== undefined) book.image = image || DEFAULT_IMAGE_URL;
    if (start_date !== undefined) book.start_date = parseDate(start_date);
    if (end_date !== undefined) book.end_date = end_date ? parseDate(end_date) : undefined;
    if (status !== undefined) book.status = status;
    if (general_info !== undefined) book.general_info = general_info;
    if (farm_id !== undefined) book.farm_id = new mongoose.Types.ObjectId(nextFarmId);
    if (farm_type_id !== undefined) book.farm_type_id = new mongoose.Types.ObjectId(nextFarmTypeId);

    await book.save();
    await book.populate('farm_id', 'farm_name avatar province ward location farm_type_id owner_id user_id');
    await book.populate('farm_type_id', 'type_name image description');
    await book.populate('created_by', 'name avatar role');

    res.status(200).json({
      success: true,
      data: {
        ...serializeProductionBook(book),
        farm_type_config: farmAndConfig.farmTypeConfig ?? null
      }
    });
  } catch (error) {
    console.error('Error updating manage production book:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteManageProductionBook = async (req: Request, res: Response) => {
  try {
    const bookId = req.params.bookId;

    if (!Types.ObjectId.isValid(bookId)) {
      res.status(400).json({ success: false, message: 'Invalid bookId' });
      return;
    }

    const book = await ProductionBookModel.findById(bookId);
    if (!book) {
      res.status(404).json({ success: false, message: 'Book not found' });
      return;
    }

    book.deleted_at = new Date();
    await book.save();

    res.status(200).json({
      success: true,
      message: 'Book deleted softly'
    });
  } catch (error) {
    console.error('Error deleting manage production book:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getProductionBooksByOwner = async (req: Request, res: Response) => {
  try {
    const user = getUserContext(req);
    const farmId = typeof req.query.farmId === 'string' ? req.query.farmId.trim() : '';
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const status = typeof req.query.status === 'string' ? req.query.status.trim() : '';
    const page = parsePositiveInt(req.query.page, DEFAULT_PAGE);
    const limit = parsePositiveInt(req.query.limit, DEFAULT_LIMIT);
    const sort = typeof req.query.sort === 'string' && req.query.sort.toLowerCase() === 'asc' ? 1 : -1;

    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (status && status !== 'all' && !allowedStatus.has(status)) {
      res.status(400).json({ success: false, message: 'Invalid status' });
      return;
    }

    const accessCondition = getFarmAccessCondition(user);
    if (!accessCondition) {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }

    const farmMatch: Record<string, any> = {
      ...accessCondition
    };

    if (farmId) {
      if (!Types.ObjectId.isValid(farmId)) {
        res.status(400).json({ success: false, message: 'Invalid farmId' });
        return;
      }
      farmMatch._id = farmId;
    }

    const farms = await FarmModel.find(farmMatch).select('_id');
    const farmIds = farms.map((farm) => String((farm as any)._id));

    if (!farmIds.length) {
      res.status(200).json({
        success: true,
        page,
        limit,
        total: 0,
        totalPages: 0,
        data: []
      });
      return;
    }

    const query: Record<string, any> = {
      farm_id: { $in: farmIds },
      ...notDeletedFilter
    };

    if (search) {
      const regex = new RegExp(escapeRegExp(search), 'i');
      query.$or = [{ name: regex }, { production: regex }, { description: regex }];
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const total = await ProductionBookModel.countDocuments(query);
    const books = await ProductionBookModel.find(query)
      .populate('farm_id', 'farm_name')
      .populate('farm_type_id', 'type_name')
      .populate('created_by', 'name avatar')
      .sort({ start_date: sort, createdAt: sort })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: books.map((book) => serializeProductionBook(book))
    });
  } catch (error) {
    console.error('Error fetching owner production books:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
