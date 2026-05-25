import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';

import {
  THANH_BINH_ASSISTANT_CONTENTS,
  THANH_BINH_MAP_PROFILE,
  THANH_BINH_MAP_RESOURCES,
  THANH_BINH_TENANT,
  THANH_BINH_TOURISM_POIS
} from '../../DiaryTechWeb/components/map-profiles/thanh-binh';

import MapAssistantContentModel from '../src/models/MapAssistantContent.model';
import MapBoundaryModel from '../src/models/MapBoundary.model';
import MapFeatureModel from '../src/models/MapFeature.model';
import MapProfileModel from '../src/models/MapProfile.model';
import MapTenantModel from '../src/models/MapTenant.model';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

type GeoJsonFeature = GeoJSON.Feature & {
  properties?: Record<string, any>;
};

const collectCoordinates = (value: unknown, acc: [number, number][] = []): [number, number][] => {
  if (!Array.isArray(value)) return acc;

  if (value.length >= 2 && typeof value[0] === 'number' && typeof value[1] === 'number') {
    acc.push([Number(value[0]), Number(value[1])]);
    return acc;
  }

  for (const item of value) {
    collectCoordinates(item, acc);
  }

  return acc;
};

const getCenterFromGeometry = (geometry: GeoJSON.Geometry | undefined) => {
  if (!geometry) return THANH_BINH_MAP_PROFILE.center;

  const points = collectCoordinates((geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon).coordinates);
  if (!points.length) return THANH_BINH_MAP_PROFILE.center;

  const lngs = points.map(([lng]) => lng);
  const lats = points.map(([, lat]) => lat);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  return [Number(((minLng + maxLng) / 2).toFixed(6)), Number(((minLat + maxLat) / 2).toFixed(6))] as [
    number,
    number
  ];
};

const getBboxFromGeometry = (geometry: GeoJSON.Geometry | undefined) => {
  if (!geometry) return null;

  const points = collectCoordinates((geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon).coordinates);
  if (!points.length) return null;

  const lngs = points.map(([lng]) => lng);
  const lats = points.map(([, lat]) => lat);

  return [
    Number(Math.min(...lngs).toFixed(6)),
    Number(Math.min(...lats).toFixed(6)),
    Number(Math.max(...lngs).toFixed(6)),
    Number(Math.max(...lats).toFixed(6))
  ] as [number, number, number, number];
};

const upsertTenant = async () => {
  return MapTenantModel.findOneAndUpdate(
    { slug: THANH_BINH_TENANT.slug },
    { $set: THANH_BINH_TENANT },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  );
};

const buildTourismFeaturePayloads = (tenantId: mongoose.Types.ObjectId) => {
  return THANH_BINH_TOURISM_POIS.map((poi, index) => ({
    tenant_id: tenantId,
    feature_type: 'poi' as const,
    layer_key: 'tourism',
    name: poi.name,
    external_ref: poi.key,
    geometry: {
      type: 'Point' as const,
      coordinates: poi.coordinates
    },
    properties: {
      display_name: poi.name,
      assistant_target_key: poi.key,
      tourism: true,
      category_key: poi.category_key,
      category: poi.category,
      category_label: poi.category_label,
      images: poi.images,
      summary: poi.summary,
      address: poi.address,
      opening_hours: poi.opening_hours,
      ticket_info: poi.ticket_info,
      contact: poi.contact,
      map_hint: poi.map_hint,
      description: poi.description,
      speech: poi.speech,
      highlights: poi.highlights,
      source_name: poi.source_name,
      source_url: poi.source_url,
      coordinate_source: poi.coordinate_source
    },
    icon_key: poi.category_key,
    color: '',
    status: 'active' as const,
    is_active: true,
    is_public: true,
    sort_order: index,
    source_type: 'manual',
    source_ref: 'ThanhBinhTourismSeed'
  }));
};

const buildPoiAssistantContent = (
  tenantId: mongoose.Types.ObjectId,
  featureIdByKey: Map<string, mongoose.Types.ObjectId>
) => {
  return THANH_BINH_TOURISM_POIS.map((poi, index) => ({
    tenant_id: tenantId,
    scope_type: 'feature' as const,
    target_key: poi.key,
    target_feature_id: featureIdByKey.get(poi.key) ?? null,
    locale: 'vi-VN',
    context_label: poi.category_label,
    title: poi.name,
    summary: poi.summary,
    speech: poi.speech,
    highlights: poi.highlights,
    steps: [
      {
        id: 'overview',
        title: 'Tổng quan',
        description: poi.summary,
        speech: poi.speech,
        sort_order: 0
      },
      {
        id: 'detail',
        title: 'Thông tin chi tiết',
        description: poi.description,
        speech: poi.description,
        sort_order: 1
      },
      {
        id: 'visit-note',
        title: 'Gợi ý tham quan',
        description: poi.map_hint,
        speech: poi.map_hint,
        sort_order: 2
      }
    ],
    hint: 'Bấm nút đọc để assistant thuyết minh điểm đang chọn.',
    status: 'active' as const,
    is_active: true,
    sort_order: index + 1
  }));
};

const seed = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('Missing MONGO_URI');
  }

  await mongoose.connect(mongoUri);

  const tenant = await upsertTenant();
  const tenantId = tenant._id as mongoose.Types.ObjectId;
  const boundaryFeature = (THANH_BINH_MAP_RESOURCES.boundary as { features?: GeoJsonFeature[] }).features?.[0];

  if (!boundaryFeature?.geometry) {
    throw new Error('Missing Thanh Binh boundary geometry');
  }

  await Promise.all([
    MapBoundaryModel.deleteMany({ tenant_id: tenantId }),
    MapFeatureModel.deleteMany({ tenant_id: tenantId }),
    MapAssistantContentModel.deleteMany({ tenant_id: tenantId })
  ]);

  const boundary = await MapBoundaryModel.create({
    tenant_id: tenantId,
    name: 'Ranh giới Thạnh Bình',
    level: 'ward',
    geometry: boundaryFeature.geometry,
    bbox: getBboxFromGeometry(boundaryFeature.geometry),
    source_type: 'geojson',
    source_ref: 'ThanhBinhWard.json',
    is_primary: true,
    is_active: true,
    meta: boundaryFeature.properties ?? {}
  });

  const profile = await MapProfileModel.findOneAndUpdate(
    { tenant_id: tenantId, code: THANH_BINH_MAP_PROFILE.code },
    {
      $set: {
        ...THANH_BINH_MAP_PROFILE,
        tenant_id: tenantId,
        center: getCenterFromGeometry(boundaryFeature.geometry)
      }
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  );

  const features = await MapFeatureModel.insertMany(buildTourismFeaturePayloads(tenantId));
  const featureIdByKey = new Map<string, mongoose.Types.ObjectId>();
  features.forEach((feature) => {
    featureIdByKey.set(String(feature.external_ref), feature._id as mongoose.Types.ObjectId);
  });

  await MapAssistantContentModel.create([
    {
      tenant_id: tenantId,
      scope_type: 'ward',
      target_key: THANH_BINH_ASSISTANT_CONTENTS.ward.target_key,
      locale: 'vi-VN',
      context_label: THANH_BINH_ASSISTANT_CONTENTS.ward.context_label,
      title: THANH_BINH_ASSISTANT_CONTENTS.ward.title,
      summary: THANH_BINH_ASSISTANT_CONTENTS.ward.summary,
      speech: THANH_BINH_ASSISTANT_CONTENTS.ward.speech,
      highlights: THANH_BINH_ASSISTANT_CONTENTS.ward.highlights,
      steps: [
        {
          id: 'overview',
          title: THANH_BINH_ASSISTANT_CONTENTS.ward.title,
          description: THANH_BINH_ASSISTANT_CONTENTS.ward.summary,
          speech: THANH_BINH_ASSISTANT_CONTENTS.ward.speech,
          sort_order: 0
        }
      ],
      hint: 'Chọn từng POI để nghe thông tin chi tiết hơn.',
      status: 'active',
      is_active: true,
      sort_order: 0
    },
    ...buildPoiAssistantContent(tenantId, featureIdByKey)
  ]);

  await MapTenantModel.updateOne(
    { _id: tenantId },
    {
      $set: {
        default_profile_id: profile._id,
        meta: {
          ...THANH_BINH_TENANT.meta,
          boundary_id: boundary._id,
          tourism_poi_count: features.length
        }
      }
    }
  );

  console.log(`Seeded Thanh Binh map tenant: ${tenant.slug}`);
  console.log(`Boundary: ${boundary._id}`);
  console.log(`Profile: ${profile._id}`);
  console.log(`Tourism POIs: ${features.length}`);
};

seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
