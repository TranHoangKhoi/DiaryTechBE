import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';

import {
  DAT_DO_MAP_PROFILE,
  DAT_DO_MAP_RESOURCES,
  DAT_DO_NEIGHBOR_LABELS,
  DAT_DO_TENANT
} from '../../DiaryTechWeb/components/map-profiles/dat-do';

import MapBoundaryModel from '../src/models/MapBoundary.model';
import MapFeatureModel from '../src/models/MapFeature.model';
import MapProfileModel from '../src/models/MapProfile.model';
import MapTenantModel from '../src/models/MapTenant.model';
import { seedDatDoAssistantContents } from './datDoAssistantSeed';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const GLOBAL_TENANT = {
  name: 'Global Map',
  slug: 'global',
  code: 'GLOBAL',
  type: 'global' as const,
  status: 'active' as const,
  description: 'Bản đồ toàn hệ thống cho toàn bộ farm',
  region_code: 'VN',
  meta: {
    display_name: 'Global Agriculture Map',
    scope_label: 'global'
  }
};

type GeoJsonFeature = GeoJSON.Feature & {
  properties?: Record<string, any>;
};

type OSMElement = {
  id: number;
  type: 'node' | 'way';
  lon?: number;
  lat?: number;
  nodes?: number[];
  tags?: Record<string, string>;
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
  if (!geometry) return [107.28, 10.56] as [number, number];

  const points = collectCoordinates((geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon).coordinates);
  if (!points.length) return [107.28, 10.56] as [number, number];

  const lngs = points.map(([lng]) => lng);
  const lats = points.map(([, lat]) => lat);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  return [Number(((minLng + maxLng) / 2).toFixed(6)), Number(((minLat + maxLat) / 2).toFixed(6))] as [number, number];
};

const getBboxFromGeometry = (geometry: GeoJSON.Geometry | undefined) => {
  if (!geometry) return null;

  const points = collectCoordinates((geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon).coordinates);
  if (!points.length) return null;

  const lngs = points.map(([lng]) => lng);
  const lats = points.map(([, lat]) => lat);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  return [
    Number(minLng.toFixed(6)),
    Number(minLat.toFixed(6)),
    Number(maxLng.toFixed(6)),
    Number(maxLat.toFixed(6))
  ] as [number, number, number, number];
};

const buildFeaturesFromGeoJson = (
  tenantId: mongoose.Types.ObjectId,
  featureType: 'hamlet' | 'river' | 'road',
  layerKey: string,
  collection: { features: GeoJsonFeature[] }
) => {
  return collection.features.map((feature, index) => ({
    tenant_id: tenantId,
    feature_type: featureType,
    layer_key: layerKey,
    name: String(
      feature.properties?.display_name ||
        feature.properties?.name ||
        feature.properties?.osm_name ||
        `${layerKey}-${index + 1}`
    ),
    external_ref: String(feature.id ?? feature.properties?.id ?? `${layerKey}-${index + 1}`),
    geometry: feature.geometry,
    properties: feature.properties ?? {},
    icon_key: '',
    color: String(feature.properties?.fill_color || feature.properties?.color || ''),
    status: 'active' as const,
    is_active: true,
    is_public: true,
    sort_order: index,
    source_type: 'import',
    source_ref: layerKey
  }));
};

const buildTownHallFeatures = (tenantId: mongoose.Types.ObjectId, rawData: { elements?: OSMElement[] }) => {
  const elements = Array.isArray(rawData.elements) ? rawData.elements : [];
  const nodesMap = new Map<number, [number, number]>();

  for (const element of elements) {
    if (element.type === 'node' && typeof element.lon === 'number' && typeof element.lat === 'number') {
      nodesMap.set(element.id, [element.lon, element.lat]);
    }
  }

  const records: any[] = [];

  for (const element of elements) {
    const tags = element.tags || {};
    if (!(tags.amenity || tags.office || tags.government)) continue;

    let coords: [number, number] | null = null;
    let polygonGeometry: GeoJSON.Geometry | null = null;

    if (element.type === 'node' && typeof element.lon === 'number' && typeof element.lat === 'number') {
      coords = [element.lon, element.lat];
    } else if (element.type === 'way' && Array.isArray(element.nodes)) {
      const wayCoords = element.nodes
        .map((nodeId) => nodesMap.get(nodeId))
        .filter((item): item is [number, number] => Boolean(item));

      if (wayCoords.length > 0) {
        const closedWayCoords = [...wayCoords];
        const first = closedWayCoords[0];
        const last = closedWayCoords[closedWayCoords.length - 1];
        if (first[0] !== last[0] || first[1] !== last[1]) {
          closedWayCoords.push(first);
        }

        polygonGeometry = {
          type: 'Polygon',
          coordinates: [closedWayCoords]
        };
        coords = getCenterFromGeometry(polygonGeometry);
      }
    }

    if (!coords) continue;

    let category = 'government';
    if (tags.amenity === 'townhall') category = 'townhall';
    else if (tags.amenity === 'police') category = 'police';
    else if (tags.government === 'prosecutor') category = 'court';
    else if (tags.government === 'public_service') category = 'service';
    else if (tags.government === 'ministry' || tags.office === 'government') category = 'office';

    const baseName = tags.name || tags['name:vi'] || tags.office || tags.amenity || tags.government || 'Cơ quan';
    const externalRef = `townhall-${element.id}`;

    records.push({
      tenant_id: tenantId,
      feature_type: 'poi' as const,
      layer_key: 'admin-units',
      name: baseName,
      external_ref: externalRef,
      geometry: {
        type: 'Point' as const,
        coordinates: coords
      },
      properties: {
        ...tags,
        category,
        base_type: tags.amenity || tags.office || tags.government,
        element_type: element.type
      },
      icon_key: category,
      color: '',
      status: 'active' as const,
      is_active: true,
      is_public: true,
      sort_order: element.id,
      source_type: 'osm',
      source_ref: 'DatDoTownHall'
    });

    if (polygonGeometry) {
      records.push({
        tenant_id: tenantId,
        feature_type: 'boundary' as const,
        layer_key: 'townhall-boundaries',
        name: `${baseName} boundary`,
        external_ref: `${externalRef}-polygon`,
        geometry: polygonGeometry,
        properties: {
          ...tags,
          category,
          base_type: tags.amenity || tags.office || tags.government,
          element_type: element.type
        },
        icon_key: '',
        color: '',
        status: 'active' as const,
        is_active: true,
        is_public: true,
        sort_order: element.id,
        source_type: 'osm',
        source_ref: 'DatDoTownHall'
      });
    }
  }

  return records;
};

const upsertTenant = async (
  payload: typeof GLOBAL_TENANT & {
    owner_user_id?: mongoose.Types.ObjectId | null;
    default_profile_id?: mongoose.Types.ObjectId | null;
  }
) => {
  return MapTenantModel.findOneAndUpdate(
    { slug: payload.slug },
    {
      $set: payload
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  );
};

const seed = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('Missing MONGO_URI');
  }

  await mongoose.connect(mongoUri);
  console.log('Connected DB');

  const globalTenant = await upsertTenant(GLOBAL_TENANT);
  const globalProfile = await MapProfileModel.findOneAndUpdate(
    { tenant_id: globalTenant._id, code: 'GLOBAL_OVERVIEW' },
    {
      $set: {
        tenant_id: globalTenant._id,
        code: 'GLOBAL_OVERVIEW',
        name: 'Global Overview',
        mode: 'global',
        source_mode: 'farm',
        style_id: 'mapbox/standard-satellite',
        center: [106.6297, 10.8231],
        zoom: 5,
        min_zoom: 3,
        max_zoom: 18,
        show_sidebar: true,
        show_legend: true,
        show_statistics: true,
        layers: [
          {
            key: 'farms',
            name: 'All Farms',
            source_type: 'farm',
            source_ref: 'Farm',
            visible: true,
            order: 1
          }
        ],
        is_active: true,
        description: 'Global profile lấy farm toàn hệ thống'
      }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await MapTenantModel.updateOne(
    { _id: globalTenant._id },
    {
      $set: {
        default_profile_id: globalProfile._id
      }
    }
  );

  const datDoTenant = await upsertTenant(DAT_DO_TENANT);

  await Promise.all([
    MapBoundaryModel.deleteMany({ tenant_id: datDoTenant._id }),
    MapFeatureModel.deleteMany({ tenant_id: datDoTenant._id })
  ]);

  const datDoBoundaryFeature = Array.isArray((DAT_DO_MAP_RESOURCES.boundary as any).features)
    ? ((DAT_DO_MAP_RESOURCES.boundary as any).features[0] as GeoJsonFeature | undefined)
    : undefined;

  if (!datDoBoundaryFeature) {
    throw new Error('Không tìm thấy boundary feature cho Đất Đỏ');
  }

  const datDoBoundary = await MapBoundaryModel.create({
    tenant_id: datDoTenant._id,
    name: String(datDoBoundaryFeature.properties?.ten_xa || datDoBoundaryFeature.properties?.name || 'Đất Đỏ'),
    level: 'ward',
    geometry: datDoBoundaryFeature.geometry,
    bbox: getBboxFromGeometry(datDoBoundaryFeature.geometry),
    source_type: 'geojson',
    source_ref: 'DatDoNew',
    is_primary: true,
    is_active: true,
    meta: {
      ...datDoBoundaryFeature.properties,
      display_name: 'Đất Đỏ'
    }
  });

  const datDoProfile = await MapProfileModel.findOneAndUpdate(
    { tenant_id: datDoTenant._id, code: DAT_DO_MAP_PROFILE.code },
    {
      $set: {
        tenant_id: datDoTenant._id,
        code: DAT_DO_MAP_PROFILE.code,
        name: DAT_DO_MAP_PROFILE.name,
        mode: DAT_DO_MAP_PROFILE.mode,
        source_mode: DAT_DO_MAP_PROFILE.source_mode,
        style_id: DAT_DO_MAP_PROFILE.style_id,
        center: getCenterFromGeometry(datDoBoundaryFeature.geometry),
        zoom: DAT_DO_MAP_PROFILE.zoom,
        min_zoom: DAT_DO_MAP_PROFILE.min_zoom,
        max_zoom: DAT_DO_MAP_PROFILE.max_zoom,
        show_sidebar: DAT_DO_MAP_PROFILE.show_sidebar,
        show_legend: DAT_DO_MAP_PROFILE.show_legend,
        show_statistics: DAT_DO_MAP_PROFILE.show_statistics,
        layers: DAT_DO_MAP_PROFILE.layers,
        is_active: DAT_DO_MAP_PROFILE.is_active,
        description: DAT_DO_MAP_PROFILE.description
      }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await MapTenantModel.updateOne(
    { _id: datDoTenant._id },
    {
      $set: {
        default_profile_id: datDoProfile._id
      }
    }
  );

  const hamletFeatures = buildFeaturesFromGeoJson(
    datDoTenant._id,
    'hamlet',
    'hamlets',
    DAT_DO_MAP_RESOURCES.hamlets as any
  );
  const riverFeatures = buildFeaturesFromGeoJson(
    datDoTenant._id,
    'river',
    'rivers',
    DAT_DO_MAP_RESOURCES.rivers as any
  );
  const streetFeatures = buildFeaturesFromGeoJson(
    datDoTenant._id,
    'road',
    'streets',
    DAT_DO_MAP_RESOURCES.streets as any
  );
  const townHallFeatures = buildTownHallFeatures(datDoTenant._id, DAT_DO_MAP_RESOURCES.townHall as any);
  const neighborLabelFeatures = DAT_DO_NEIGHBOR_LABELS.map((item, index) => ({
    tenant_id: datDoTenant._id,
    feature_type: 'label' as const,
    layer_key: 'neighbor-labels',
    name: item.name,
    external_ref: `neighbor-${index + 1}`,
    geometry: {
      type: 'Point' as const,
      coordinates: item.position
    },
    properties: {
      direction: item.direction,
      display_name: item.name
    },
    icon_key: '',
    color: '',
    status: 'active' as const,
    is_active: true,
    is_public: true,
    sort_order: index,
    source_type: 'manual',
    source_ref: 'neighbor-labels'
  }));

  const insertedFeatures = await MapFeatureModel.insertMany([
    ...hamletFeatures,
    ...riverFeatures,
    ...streetFeatures,
    ...townHallFeatures,
    ...neighborLabelFeatures
  ]);

  await MapTenantModel.updateOne(
    { _id: datDoTenant._id },
    {
      $set: {
        meta: {
          ...(DAT_DO_TENANT.meta || {}),
          boundary_id: datDoBoundary._id
        }
      }
    }
  );

  const assistantSeedResult = await seedDatDoAssistantContents(
    datDoTenant._id as mongoose.Types.ObjectId,
    insertedFeatures.filter((feature) => feature.feature_type === 'hamlet'),
    {
      forceContent: process.argv.includes('--force-assistant')
    }
  );

  console.log('Seed map contracts done', {
    assistant: assistantSeedResult
  });
};

seed()
  .catch((error) => {
    console.error('Seed map contracts failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
