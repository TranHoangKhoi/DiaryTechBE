import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

import FarmModel from '../src/models/Farm.model';
import { farmHouseGeoJson } from './FakeData';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const DAT_DO_PROVINCE = {
  id: '28',
  province_code: '79',
  name: 'Thành phố Hồ Chí Minh',
  short_name: 'Thành phố Hồ Chí Minh',
  code: 'HCM',
  place_type: 'Thành phố Trung Ương',
  country: 'VN',
  created_at: null,
  updated_at: null
};

const DAT_DO_WARD = {
  id: '2657',
  ward_code: '26680',
  name: 'Xã Đất Đỏ',
  province_code: '79',
  created_at: null,
  updated_at: null
};

type GeoEntry = {
  sourceId: string;
  point: number[];
  polygon: {
    type: 'Polygon';
    coordinates: number[][][];
  };
};

function parseArgs() {
  const args = process.argv.slice(2);
  const shouldApply = args.includes('--apply');
  const showHelp = args.includes('--help') || args.includes('-h');
  const limitArg = args.find((arg) => arg.startsWith('--limit='));
  const ownerIdArg = args.find((arg) => arg.startsWith('--owner-id='));

  const limit = limitArg ? Number(limitArg.split('=')[1]) : undefined;
  const ownerId = ownerIdArg ? ownerIdArg.split('=')[1] : undefined;

  if (limit !== undefined && (!Number.isInteger(limit) || limit <= 0)) {
    throw new Error('`--limit` phải là số nguyên dương.');
  }

  if (ownerId && !mongoose.Types.ObjectId.isValid(ownerId)) {
    throw new Error('`--owner-id` không phải ObjectId hợp lệ.');
  }

  return { shouldApply, showHelp, limit, ownerId };
}

function printHelp() {
  console.log(`
Script cập nhật geo/polygon/province/ward cho Farm sang dữ liệu Xã Đất Đỏ.

Mặc định: dry-run, chỉ in preview và không ghi DB.

Ví dụ:
  npx tsx farmseed/updateFarmGeoToDatDo.ts
  npx tsx farmseed/updateFarmGeoToDatDo.ts --apply
  npx tsx farmseed/updateFarmGeoToDatDo.ts --limit=10
  npx tsx farmseed/updateFarmGeoToDatDo.ts --owner-id=YOUR_OWNER_ID --apply
`);
}

function buildGeoEntries(): GeoEntry[] {
  const geoMap = new Map<string, Partial<GeoEntry>>();

  for (const feature of farmHouseGeoJson.features) {
    const rawId = feature?.id;
    const geometry = feature?.geometry;

    if (!rawId || !geometry?.type) continue;

    const baseId = rawId.replace(/-area$/, '');
    const current = geoMap.get(baseId) ?? { sourceId: baseId };

    if (geometry.type === 'Point' && Array.isArray(geometry.coordinates)) {
      current.point = geometry.coordinates;
    }

    if (geometry.type === 'Polygon' && Array.isArray(geometry.coordinates)) {
      current.polygon = {
        type: 'Polygon',
        coordinates: geometry.coordinates
      };
    }

    geoMap.set(baseId, current);
  }

  return Array.from(geoMap.values())
    .filter((entry): entry is GeoEntry => Array.isArray(entry.point) && !!entry.polygon)
    .sort((a, b) => {
      const aNum = Number(a.sourceId.replace('farm-', ''));
      const bNum = Number(b.sourceId.replace('farm-', ''));
      return aNum - bNum;
    });
}

async function main() {
  const { shouldApply, showHelp, limit, ownerId } = parseArgs();

  if (showHelp) {
    printHelp();
    return;
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('Missing MONGO_URI in .env.local');
  }

  const geoEntries = buildGeoEntries();
  if (!geoEntries.length) {
    throw new Error('Không build được dữ liệu geo từ farmHouseGeoJson');
  }

  await mongoose.connect(uri);
  console.log('Connected DB');

  const farmQuery = ownerId ? { owner_id: new mongoose.Types.ObjectId(ownerId) } : {};
  const farms = await FarmModel.find(farmQuery)
    .sort({ created_at: 1, _id: 1 })
    .select('_id farm_name owner_id geo_location polygon province ward created_at')
    .lean();

  const targetFarms = limit ? farms.slice(0, limit) : farms;
  const pairCount = Math.min(targetFarms.length, geoEntries.length);

  console.log(`Mode: ${shouldApply ? 'APPLY' : 'DRY-RUN'}`);
  console.log(`Total farms matched: ${farms.length}`);
  console.log(`Farms selected: ${targetFarms.length}`);
  console.log(`Geo entries available: ${geoEntries.length}`);
  console.log(`Pairs to process: ${pairCount}`);

  if (!pairCount) {
    console.log('Không có farm nào để xử lý.');
    return;
  }

  const preview = Array.from({ length: Math.min(pairCount, 5) }, (_, index) => {
    const farm = targetFarms[index];
    const geo = geoEntries[index];

    return {
      order: index + 1,
      farm_id: farm._id.toString(),
      farm_name: farm.farm_name,
      source_geo_id: geo.sourceId,
      new_geo_location: geo.point,
      new_polygon_points: geo.polygon.coordinates[0]?.length ?? 0,
      new_province: DAT_DO_PROVINCE.name,
      new_ward: DAT_DO_WARD.name
    };
  });

  console.log('Preview first records:');
  console.table(preview);

  if (!shouldApply) {
    console.log('Dry-run hoàn tất. Chưa có dữ liệu nào bị cập nhật.');
    return;
  }

  const now = new Date();
  const operations = targetFarms.slice(0, pairCount).map((farm, index) => {
    const geo = geoEntries[index];

    return {
      updateOne: {
        filter: { _id: farm._id },
        update: {
          $set: {
            geo_location: geo.point,
            polygon: geo.polygon,
            province: DAT_DO_PROVINCE,
            ward: DAT_DO_WARD,
            updated_at: now
          }
        }
      }
    };
  });

  const result = await FarmModel.bulkWrite(operations);

  console.log('Cập nhật hoàn tất.');
  console.log(
    JSON.stringify(
      {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      },
      null,
      2
    )
  );

  if (targetFarms.length > geoEntries.length) {
    console.log(
      `Có ${targetFarms.length - geoEntries.length} farm chưa được cập nhật vì thiếu dữ liệu geo tương ứng.`
    );
  }
}

main()
  .catch((error) => {
    console.error('Script failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
