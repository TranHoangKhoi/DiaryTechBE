import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Crop } from '~/models/CropCategories';
import FarmModel from '~/models/Farm.model';
import { FarmCrop } from '~/models/FarmCrop.model';
import FarmtypeModel from '~/models/Farmtype.model';
import FarmZoneModel from '~/models/FarmZone.model';
import ServiceModuleModel from '~/models/ServiceModule.model';
import UserSubscriptionModel from '~/models/UserSubscription.model';
import UserModel from '~/models/User.model';
import { MODULE_KEYS } from '~/constants/moduleKeys';
import { syncUserFileServer } from '~/services/userFileServerSync.service';
import { appendPublicUrlToFile, uploadFileServerFiles } from '~/services/fileServer.service';

const FARM_DIARY_MODULE_KEYS = [MODULE_KEYS.farmDiary, 'diary'];

const normalizeOptionalDate = (value: unknown) => {
  if (value === '' || value === null || typeof value === 'undefined') return null;
  return value;
};

const parseJsonField = <T>(value: unknown): T | unknown => {
  if (typeof value !== 'string') return value;
  return JSON.parse(value);
};

const normalizeAllowedModules = (value: unknown) => {
  const parsed = parseJsonField<unknown>(value);
  const rows = Array.isArray(parsed) ? parsed : [];
  return rows.filter(
    (item): item is (typeof MODULE_KEYS)[keyof typeof MODULE_KEYS] =>
      typeof item === 'string' && Object.values(MODULE_KEYS).includes(item as any)
  );
};

const resolveProfileFolderAlias = (user: any) => {
  const folders = user?.file_server_folders || [];
  const matchedFolder = folders.find(
    (folder: any) =>
      folder.alias === 'profile' ||
      folder.name === 'há»“ sÆ¡' ||
      folder.name === 'hồ sơ' ||
      folder.alias === 'há»“ sÆ¡' ||
      folder.alias === 'hồ sơ'
  );

  return matchedFolder?.alias || 'home';
};

const uploadFarmAvatarToFileServer = async (ownerId: string, imageFile?: Express.Multer.File) => {
  if (!imageFile) return '';

  await syncUserFileServer(ownerId);
  const owner = await UserModel.findById(ownerId).select('+file_server_client.key');
  const apiKey = owner?.file_server_client?.key;
  if (!owner?.external_id || !apiKey) {
    throw Object.assign(new Error('File server is not ready for owner account'), { statusCode: 503 });
  }

  const uploadResult = await uploadFileServerFiles({
    apiKey,
    external_id: owner.external_id,
    alias: resolveProfileFolderAlias(owner),
    file_system: false,
    files: [
      {
        buffer: imageFile.buffer,
        filename: imageFile.originalname || `sub_account_${Date.now()}.jpg`,
        mimeType: imageFile.mimetype
      }
    ]
  });

  const uploadedFile = uploadResult?.results?.[0]?.file;
  const uploadedUrl = uploadedFile ? appendPublicUrlToFile(uploadedFile).url : '';
  if (!uploadedUrl) {
    throw Object.assign(new Error('Cannot upload avatar to file server'), { statusCode: 502 });
  }

  return uploadedUrl;
};

export const createFarm = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      farm_name,
      location,
      farm_type_id,
      description,
      password,
      name,
      phone,
      cccd,
      date_of_birth,
      cccd_issue_place,
      cccd_issue_date,
      area,
      polygon,
      unit,
      crop_id,
      allowed_modules
    } = req.body;
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
      avatarUrl = await uploadFarmAvatarToFileServer(ownerId, imageFile);
    }

    if (!avatarUrl) {
      // res.status(400).json({ error: 'Thiếu ảnh' });
      avatarUrl = '';
    }

    // Xử lý dữ liệu
    if (typeof geo_location === 'string') {
      geo_location = geo_location.split(',').map(Number);
    }

    province = parseJsonField(province);
    ward = parseJsonField(ward);
    const normalizedAllowedModules = normalizeAllowedModules(allowed_modules);

    // Bắt đầu transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Tạo subUser
      const now = new Date();
      const farmDiaryModule = await ServiceModuleModel.findOne({
        key: { $in: FARM_DIARY_MODULE_KEYS },
        is_active: true
      })
        .select('_id')
        .session(session);

      if (!farmDiaryModule) {
        throw Object.assign(new Error('Module nhật ký điện tử chưa được kích hoạt'), { statusCode: 400 });
      }

      const activeSubscription = await UserSubscriptionModel.findOneAndUpdate(
        {
          user_id: ownerId,
          module_id: farmDiaryModule._id,
          status: 'active',
          start_date: { $lte: now },
          end_date: { $gt: now },
          remaining_sub_accounts: { $gt: 0 }
        },
        {
          $inc: { remaining_sub_accounts: -1 }
        },
        { new: true, session }
      );

      if (!activeSubscription) {
        throw Object.assign(new Error('Bạn đã đạt giới hạn tài khoản phụ của gói nhật ký điện tử'), {
          statusCode: 400
        });
      }

      const [subUser] = await UserModel.create(
        [
          {
            phone,
            cccd: cccd || '',
            date_of_birth: normalizeOptionalDate(date_of_birth),
            cccd_issue_place: cccd_issue_place || '',
            cccd_issue_date: normalizeOptionalDate(cccd_issue_date),
            password,
            name,
            role: 'sub_account',
            owner_id: ownerId,
            allowed_modules: normalizedAllowedModules,
            province,
            ward,
            address: location || '',
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
      await syncUserFileServer(String(subUser._id));

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
    const statusCode =
      error instanceof Error && 'statusCode' in error ? Number((error as { statusCode: number }).statusCode) : 500;

    if (statusCode !== 500) {
      res.status(statusCode).json({
        message: error instanceof Error ? error.message : 'Không thể tạo tài khoản phụ'
      });
      return;
    }

    res.status(500).json({
      message: 'Server error',
      error
    });
  }
};

export const updateFarmSubAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const { farmId } = req.params;
    const ownerId = req.user?.id;
    const {
      farm_name,
      location,
      farm_type_id,
      description,
      password,
      name,
      phone,
      cccd,
      date_of_birth,
      cccd_issue_place,
      cccd_issue_date,
      area,
      polygon,
      unit,
      crop_id,
      allowed_modules
    } = req.body;
    let { geo_location, province, ward } = req.body;

    if (!ownerId) {
      res.status(401).json({ message: 'User khÃ´ng há»£p lá»‡' });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(farmId)) {
      res.status(400).json({ message: 'Farm khÃ´ng há»£p lá»‡' });
      return;
    }

    const farm = await FarmModel.findById(farmId);
    if (!farm || String(farm.owner_id) !== ownerId) {
      res.status(404).json({ message: 'KhÃ´ng tÃ¬m tháº¥y nÃ´ng há»™ cáº§n cáº­p nháº­t' });
      return;
    }

    if (crop_id) {
      const crop = await Crop.findById(crop_id);
      if (!crop) {
        res.status(400).json({ message: 'Crop khÃ´ng tá»“n táº¡i' });
        return;
      }

      const nextFarmTypeId = farm_type_id || String(farm.farm_type_id);
      if (crop.farm_type_id.toString() !== nextFarmTypeId.toString()) {
        res.status(400).json({ message: 'Crop khÃ´ng há»£p lá»‡ vá»›i farm type' });
        return;
      }
    }

    if (farm_type_id) {
      const farmType = await FarmtypeModel.findById(farm_type_id);
      if (!farmType) {
        res.status(400).json({ message: 'Farm type khÃ´ng tá»“n táº¡i' });
        return;
      }
    }

    const files = req.files as any;
    const imageFile = files?.['image']?.[0];
    let avatarUrl = '';

    if (req.body.image && typeof req.body.image === 'string') {
      avatarUrl = req.body.image;
    }

    if (imageFile) {
      avatarUrl = await uploadFarmAvatarToFileServer(ownerId, imageFile);
    }

    if (typeof geo_location === 'string') {
      geo_location = geo_location.split(',').map(Number);
    }

    province = province ? parseJsonField(province) : undefined;
    ward = ward ? parseJsonField(ward) : undefined;

    let polygonData = polygon;
    if (typeof polygonData === 'string') {
      polygonData = JSON.parse(polygonData);
    }
    if (polygonData?.type === 'FeatureCollection') {
      polygonData = polygonData.features?.[0]?.geometry;
    }

    const normalizedAllowedModules =
      typeof allowed_modules === 'undefined' ? undefined : normalizeAllowedModules(allowed_modules);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const subUser = await UserModel.findById(farm.user_id).session(session);
      if (!subUser) {
        throw Object.assign(new Error('KhÃ´ng tÃ¬m tháº¥y tÃ i khoáº£n nÃ´ng há»™'), { statusCode: 404 });
      }

      if (name !== undefined) subUser.name = name;
      if (phone !== undefined) subUser.phone = phone;
      if (cccd !== undefined) subUser.cccd = cccd || '';
      if (date_of_birth !== undefined) subUser.date_of_birth = normalizeOptionalDate(date_of_birth) as any;
      if (cccd_issue_place !== undefined) subUser.cccd_issue_place = cccd_issue_place || '';
      if (cccd_issue_date !== undefined) subUser.cccd_issue_date = normalizeOptionalDate(cccd_issue_date) as any;
      if (password?.trim()) subUser.password = password;
      if (province !== undefined) subUser.province = province as any;
      if (ward !== undefined) subUser.ward = ward as any;
      if (location !== undefined) subUser.address = location || '';
      if (normalizedAllowedModules !== undefined) subUser.allowed_modules = normalizedAllowedModules;
      if (avatarUrl) subUser.avatar = avatarUrl;
      subUser.updated_at = new Date();
      await subUser.save({ session });

      if (farm_name !== undefined) farm.farm_name = farm_name;
      if (location !== undefined) farm.location = location;
      if (farm_type_id !== undefined) (farm as any).farm_type_id = farm_type_id;
      if (geo_location !== undefined) (farm as any).geo_location = geo_location;
      if (description !== undefined) farm.description = description;
      if (area !== undefined) farm.area = Number(area) || 0;
      if (unit !== undefined) (farm as any).unit = unit;
      if (polygonData !== undefined) farm.polygon = polygonData;
      if (province !== undefined) farm.province = province as any;
      if (ward !== undefined) farm.ward = ward as any;
      if (avatarUrl) farm.avatar = avatarUrl;
      farm.updated_at = new Date();
      await farm.save({ session });

      if (crop_id) {
        await FarmCrop.updateMany({ farm_id: farm._id }, { is_primary: false }, { session });
        await FarmCrop.findOneAndUpdate(
          { farm_id: farm._id, crop_id },
          { area: Number(area) || 0, is_primary: true },
          { new: true, upsert: true, setDefaultsOnInsert: true, session }
        );
      }

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
        message: 'Cáº­p nháº­t nÃ´ng há»™ thÃ nh cÃ´ng',
        farm
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error(error);
    const statusCode =
      error instanceof Error && 'statusCode' in error ? Number((error as { statusCode: number }).statusCode) : 500;

    if (statusCode !== 500) {
      res.status(statusCode).json({
        message: error instanceof Error ? error.message : 'KhÃ´ng thá»ƒ cáº­p nháº­t nÃ´ng há»™'
      });
      return;
    }

    res.status(500).json({
      message: 'Server error',
      error
    });
  }
};


export const getFarms = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { includeDeleted, user_id } = req.query;
    const isIncludeDeleted = includeDeleted === 'true';

    let query: any = {};

    if (user.role === 'owner') {
      query.owner_id = user.id;
    } else if (user.role === 'sub_account' || user.role === 'farmer') {
      query.user_id = user.id;
    } else if (user.role === 'superadmin' || user.role === 'admin') {
      if (user_id) {
        query.$or = [{ owner_id: user_id }, { user_id: user_id }];
      } else {
        query.owner_id = user.id;
      }
    } else {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    const farmsQuery = FarmModel.find(query);
    
    if (isIncludeDeleted) {
      farmsQuery.setOptions({ includeDeleted: true });
      farmsQuery.populate({ path: 'user_id', options: { includeDeleted: true } });
    } else {
      farmsQuery.populate('user_id');
    }

    const farms = await farmsQuery
      .populate('owner_id', 'name avatar')
      .populate('farm_type_id')
      .lean();

    const farmIds = farms.map((farm) => farm._id);

    const farmCrops = await FarmCrop.find({
      farm_id: { $in: farmIds },
      is_primary: true
    })
      .select('farm_id crop_id')
      .lean();
    const cropMap = new Map(farmCrops.map((farmCrop) => [String(farmCrop.farm_id), String(farmCrop.crop_id)]));

    const farmZones = await FarmZoneModel.find({ farm_id: { $in: farmIds } })
      .select('farm_id')
      .lean();

    const farmZoneMap = new Map<string, number>();
    for (const zone of farmZones) {
      const key = String(zone.farm_id);
      farmZoneMap.set(key, (farmZoneMap.get(key) || 0) + 1);
    }

    res.status(200).json({
      success: true,
      data: farms.map((farm) => ({
        ...farm,
        crop_id: cropMap.get(String(farm._id)) || '',
        total_farm_zones: farmZoneMap.get(String(farm._id)) || 0
      }))
    });
  } catch (error: any) {
    console.error('Error fetching farms:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

