import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

import FarmModel from '../src/models/Farm.model';
import { Crop } from '../src/models/CropCategories';
import { FarmCrop } from '../src/models/FarmCrop.model';
import { FarmMedia } from '../src/models/FarmMedia';
import { ProductionReport } from '../src/models/ProductionReport';
import UserModel from '../src/models/User.model';
import { farmHouseGeoJson } from './FakeData';
import { FARM_FAKE_DATA } from './farmDetails';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const OWNER_ID = new mongoose.Types.ObjectId('68a68a6a2e3470286e746d1b');

// ===== FIXED PROVINCE =====
const PROVINCE = {
  id: '33',
  province_code: '92',
  name: 'Thành phố Cần Thơ',
  short_name: 'Thành phố Cần Thơ',
  code: 'CTO',
  place_type: 'Thành phố Trung Ương',
  country: 'VN',
  created_at: null,
  updated_at: null
};

const WARD = {
  id: '3184',
  ward_code: '31299',
  name: 'Xã Phong Điền',
  province_code: '92',
  created_at: null,
  updated_at: null
};

// ===== MAP cropId → slug =====
const CROP_SLUG_MAP: Record<string, string> = {
  dau: 'crop-dau',
  'sau-rieng': 'crop-sau-rieng',
  'mang-cut': 'crop-mang-cut',
  'chom-chom': 'chom-chom',
  xoai: 'xoai'
};

async function cleanupLastSeedFarms() {
  const farms = await FarmModel.find({ owner_id: OWNER_ID }).sort({ created_at: -1 }).limit(5);

  const farmIds = farms.map((f) => f._id);
  const userIds = farms.map((f) => f.user_id);

  await Promise.all([
    FarmCrop.deleteMany({ farm_id: { $in: farmIds } }),
    FarmMedia.deleteMany({ farm_id: { $in: farmIds } }),
    ProductionReport.deleteMany({ farm_id: { $in: farmIds } })
  ]);

  await FarmModel.deleteMany({ _id: { $in: farmIds } });
  await UserModel.deleteMany({ _id: { $in: userIds } });

  console.log('🧹 Cleaned old farms');
}

async function seed() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('Missing MONGO_URI');

  await mongoose.connect(uri);
  console.log('✅ Connected DB');

  // ===== cleanup trước =====
  await cleanupLastSeedFarms();

  // ===== load crops =====
  const crops = await Crop.find({ is_active: true });

  // ===== build geo map =====
  const geoMap: Record<string, any> = {};

  for (const f of farmHouseGeoJson.features) {
    const id = f.id;

    if (!id) continue;

    if (f.geometry.type === 'Point') {
      if (!geoMap[id]) geoMap[id] = {};
      geoMap[id].point = f.geometry.coordinates;
    }

    if (f.geometry.type === 'Polygon') {
      const baseId = id.replace('-area', '');
      if (!geoMap[baseId]) geoMap[baseId] = {};
      geoMap[baseId].polygon = f.geometry;
    }
  }

  //   const farms = FARM_FAKE_DATA.slice(0, 5);
  const farms = FARM_FAKE_DATA;

  for (const farm of farms) {
    const geo = geoMap[farm.id];

    if (!geo || !geo.point || !geo.polygon) {
      console.log(`❌ Skip ${farm.id} (thiếu geo)`);
      continue;
    }

    // ===== tìm crop đúng =====
    const slug = CROP_SLUG_MAP[farm.cropId];

    if (!slug) {
      console.log(`❌ Không map crop: ${farm.cropId}`);
      continue;
    }

    const crop = crops.find((c) => c.slug === slug);

    if (!crop) {
      console.log(`❌ Không tìm thấy crop: ${slug}`);
      continue;
    }

    const farmTypeId = crop.farm_type_id;

    // ===== create user =====
    const user = await UserModel.create({
      phone: farm.phone + Math.floor(Math.random() * 1000),
      password: '12345678',
      name: farm.owner,
      role: 'sub_account',
      owner_id: OWNER_ID,
      avatar: farm.images?.[0]
    });

    // ===== create farm =====
    const newFarm = await FarmModel.create({
      owner_id: OWNER_ID,
      user_id: user._id,
      farm_name: farm.name,
      location: farm.address,
      farm_type_id: farmTypeId,
      geo_location: geo.point,
      polygon: geo.polygon,
      area: farm.area,
      unit: 'ha',
      avatar: farm.images?.[0],
      description: farm.description,
      province: PROVINCE,
      ward: WARD
    });

    // ===== farm crop =====
    await FarmCrop.create({
      farm_id: newFarm._id,
      crop_id: crop._id,
      area: farm.area,
      is_primary: true
    });

    // ===== media =====
    if (farm.images?.length) {
      await FarmMedia.insertMany(
        farm.images.map((url: string, i: number) => ({
          farm_id: newFarm._id,
          url,
          is_cover: i === 0,
          order: i
        }))
      );
    }

    // ===== report =====
    if (farm.reports?.length) {
      await ProductionReport.insertMany(
        farm.reports.map((r: any) => ({
          farm_id: newFarm._id,
          year: r.year,
          yield: r.yield
        }))
      );
    }

    console.log(`✅ Created farm: ${farm.name}`);
  }

  console.log('🎉 DONE SEED CLEAN DATA');
  process.exit();
}

seed().catch(console.error);
