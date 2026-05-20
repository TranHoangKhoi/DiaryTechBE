import { Request, Response } from 'express';
import FarmModel from '~/models/Farm.model';
import MapBoundaryModel from '~/models/MapBoundary.model';
import MapAssistantContentModel from '~/models/MapAssistantContent.model';
import MapFeatureModel from '~/models/MapFeature.model';
import MapProfileModel from '~/models/MapProfile.model';
import MapTenantModel from '~/models/MapTenant.model';
import { VietnamAddressConverter } from '../addressConvert/VietnamAddressConverter';

import path from 'path';
import mongoose from 'mongoose';
import { z } from 'zod';
import { assertFarmAccess } from '~/services/farmAccess.service';

type LeanObject = Record<string, any>;
type GeoJsonFeature = {
  type: 'Feature';
  geometry: any;
  properties: Record<string, unknown>;
};
type GeoJsonFeatureCollection = {
  type: 'FeatureCollection';
  features: GeoJsonFeature[];
};

const assistantScopeSchema = z.enum(['ward', 'hamlet', 'feature']);

const assistantHighlightSchema = z.object({
  label: z.string().trim().min(1),
  detail: z.string().trim().min(1)
});

const assistantStepSchema = z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  speech: z.string().trim().min(1),
  sort_order: z.number().int().default(0)
});

const mapAssistantPayloadSchema = z.object({
  scope_type: assistantScopeSchema,
  target_key: z.string().trim().min(1),
  target_feature_id: z.string().trim().optional().nullable(),
  locale: z.string().trim().min(2).default('vi-VN'),
  context_label: z.string().trim().min(1),
  title: z.string().trim().min(1),
  summary: z.string().trim().min(1),
  speech: z.string().trim().min(1),
  highlights: z.array(assistantHighlightSchema).default([]),
  steps: z.array(assistantStepSchema).default([]),
  hint: z.string().trim().default(''),
  status: z.enum(['active', 'inactive']).default('active'),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().default(0)
});

const mapAssistantUpdateSchema = mapAssistantPayloadSchema.partial();

const toId = (value: unknown) => {
  if (value instanceof mongoose.Types.ObjectId) return value.toString();
  if (typeof value === 'string') return value;
  return value ? String(value) : null;
};

const serializeTenant = (tenant: LeanObject) => ({
  id: toId(tenant._id),
  name: tenant.name,
  slug: tenant.slug,
  code: tenant.code,
  type: tenant.type,
  status: tenant.status,
  description: tenant.description ?? '',
  logo: tenant.logo ?? '',
  theme: tenant.theme ?? null,
  meta: tenant.meta ?? null,
  owner_user_id: toId(tenant.owner_user_id),
  default_profile_id: toId(tenant.default_profile_id),
  region_code: tenant.region_code ?? null,
  created_at: tenant.created_at ?? null,
  updated_at: tenant.updated_at ?? null
});

const serializeLayer = (layer: LeanObject) => ({
  key: layer.key,
  name: layer.name,
  source_type: layer.source_type,
  source_ref: layer.source_ref ?? '',
  visible: layer.visible ?? true,
  order: layer.order ?? 0,
  paint: layer.paint ?? null,
  layout: layer.layout ?? null
});

const serializeProfile = (profile: LeanObject) => ({
  id: toId(profile._id),
  tenant_id: toId(profile.tenant_id),
  code: profile.code,
  name: profile.name,
  mode: profile.mode,
  source_mode: profile.source_mode,
  style_id: profile.style_id,
  center: profile.center,
  zoom: profile.zoom,
  min_zoom: profile.min_zoom,
  max_zoom: profile.max_zoom,
  show_sidebar: profile.show_sidebar,
  show_legend: profile.show_legend,
  show_statistics: profile.show_statistics,
  layers: Array.isArray(profile.layers) ? profile.layers.map(serializeLayer) : [],
  is_active: profile.is_active,
  description: profile.description ?? '',
  created_at: profile.created_at ?? null,
  updated_at: profile.updated_at ?? null
});

const serializeBoundary = (boundary: LeanObject) => ({
  id: toId(boundary._id),
  tenant_id: toId(boundary.tenant_id),
  name: boundary.name,
  level: boundary.level,
  geometry: boundary.geometry,
  bbox: boundary.bbox ?? null,
  source_type: boundary.source_type,
  source_ref: boundary.source_ref ?? '',
  is_primary: boundary.is_primary,
  is_active: boundary.is_active,
  meta: boundary.meta ?? null,
  created_at: boundary.created_at ?? null,
  updated_at: boundary.updated_at ?? null
});

const serializeFeature = (feature: LeanObject) => ({
  id: toId(feature._id),
  tenant_id: toId(feature.tenant_id),
  feature_type: feature.feature_type,
  layer_key: feature.layer_key,
  name: feature.name,
  external_ref: feature.external_ref ?? '',
  farm_id: toId(feature.farm_id),
  geometry: feature.geometry,
  properties: feature.properties ?? {},
  icon_key: feature.icon_key ?? '',
  color: feature.color ?? '',
  status: feature.status,
  is_active: feature.is_active,
  is_public: feature.is_public,
  sort_order: feature.sort_order ?? 0,
  source_type: feature.source_type ?? '',
  source_ref: feature.source_ref ?? '',
  created_at: feature.created_at ?? null,
  updated_at: feature.updated_at ?? null
});

const serializeAssistantContent = (content: LeanObject) => ({
  id: toId(content._id),
  tenant_id: toId(content.tenant_id),
  scope_type: content.scope_type,
  target_key: content.target_key,
  target_feature_id: toId(content.target_feature_id),
  locale: content.locale ?? 'vi-VN',
  context_label: content.context_label,
  title: content.title,
  summary: content.summary,
  speech: content.speech,
  highlights: Array.isArray(content.highlights) ? content.highlights : [],
  steps: Array.isArray(content.steps)
    ? [...content.steps].sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0))
    : [],
  hint: content.hint ?? '',
  status: content.status,
  is_active: content.is_active,
  sort_order: content.sort_order ?? 0,
  created_at: content.created_at ?? null,
  updated_at: content.updated_at ?? null
});

const featureToGeoJson = (feature: LeanObject): GeoJsonFeature => ({
  type: 'Feature',
  geometry: feature.geometry,
  properties: {
    ...feature.properties,
    id: toId(feature._id),
    tenant_id: toId(feature.tenant_id),
    feature_type: feature.feature_type,
    layer_key: feature.layer_key,
    name: feature.name,
    external_ref: feature.external_ref ?? '',
    farm_id: toId(feature.farm_id),
    icon_key: feature.icon_key ?? '',
    color: feature.color ?? '',
    status: feature.status,
    is_active: feature.is_active,
    is_public: feature.is_public,
    sort_order: feature.sort_order ?? 0,
    source_type: feature.source_type ?? '',
    source_ref: feature.source_ref ?? ''
  }
});

const groupFeaturesByType = (features: LeanObject[]) => {
  return features.reduce<Record<string, GeoJsonFeatureCollection>>((acc, feature) => {
    const key = feature.feature_type || 'custom';
    if (!acc[key]) {
      acc[key] = {
        type: 'FeatureCollection',
        features: []
      };
    }

    acc[key].features.push(featureToGeoJson(feature));
    return acc;
  }, {});
};

const normalizeAssistantTargetKey = (value: string) => value.trim().toLowerCase();

const toObjectIdOrNull = (value?: string | null) => {
  if (!value) return null;
  if (!mongoose.Types.ObjectId.isValid(value)) return null;
  return new mongoose.Types.ObjectId(value);
};

const buildAssistantQuery = (tenantId: unknown, query: Record<string, unknown> = {}) => {
  const filter: Record<string, unknown> = {
    tenant_id: tenantId,
    is_active: true,
    status: 'active'
  };

  if (typeof query.scope_type === 'string' && assistantScopeSchema.safeParse(query.scope_type).success) {
    filter.scope_type = query.scope_type;
  }

  if (typeof query.target_key === 'string' && query.target_key.trim()) {
    filter.target_key = normalizeAssistantTargetKey(query.target_key);
  }

  if (typeof query.target_feature_id === 'string' && mongoose.Types.ObjectId.isValid(query.target_feature_id)) {
    filter.target_feature_id = new mongoose.Types.ObjectId(query.target_feature_id);
  }

  if (typeof query.locale === 'string' && query.locale.trim()) {
    filter.locale = query.locale.trim();
  }

  return filter;
};

const getAssistantContentsByTenantId = async (tenantId: unknown, query: Record<string, unknown> = {}) => {
  const contents = await MapAssistantContentModel.find(buildAssistantQuery(tenantId, query))
    .sort({ scope_type: 1, sort_order: 1, created_at: 1 })
    .lean();

  return contents.map(serializeAssistantContent);
};

const buildFarmGeoJson = async (match: Record<string, unknown>) => {
  const farms = await FarmModel.aggregate([
    {
      $match: match
    },
    {
      $lookup: {
        from: 'farmcrops',
        let: { farmId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ['$farm_id', '$$farmId'] }, { $eq: ['$is_primary', true] }]
              }
            }
          }
        ],
        as: 'farmCrop'
      }
    },
    { $unwind: { path: '$farmCrop', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'crops',
        localField: 'farmCrop.crop_id',
        foreignField: '_id',
        as: 'crop'
      }
    },
    { $unwind: { path: '$crop', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'farmmedias',
        let: { farmId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ['$farm_id', '$$farmId'] }, { $eq: ['$is_cover', true] }]
              }
            }
          },
          { $limit: 1 }
        ],
        as: 'media'
      }
    },
    { $unwind: { path: '$media', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        farm_name: 1,
        geo_location: 1,
        polygon: 1,
        area: 1,
        unit: 1,
        avatar: 1,
        'crop._id': 1,
        'crop.name': 1,
        'crop.image': 1,
        'crop.color': 1,
        'crop.icon': 1,
        cover: '$media.url'
      }
    }
  ]);

  const features: GeoJsonFeature[] = [];

  farms.forEach((farm) => {
    if (farm.geo_location) {
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: farm.geo_location
        },
        properties: {
          farm_id: farm._id,
          farm_name: farm.farm_name,
          avatar: farm.cover || farm.avatar,
          crop_id: farm.crop?._id,
          crop_name: farm.crop?.name,
          crop_image: farm.crop?.image,
          crop_color: farm.crop?.color,
          crop_icon: farm.crop?.icon,
          area: farm.area,
          unit: farm.unit
        }
      });
    }

    if (farm.polygon) {
      features.push({
        type: 'Feature',
        geometry: farm.polygon,
        properties: {
          farm_id: farm._id,
          crop_color: farm.crop?.color,
          crop_id: farm.crop?._id
        }
      });
    }
  });

  return {
    type: 'FeatureCollection',
    features
  } as GeoJsonFeatureCollection;
};

const buildTenantFarmSource = async (tenantId: unknown, profile: LeanObject) => {
  const farmCollection = await buildFarmGeoJson({
    tenant_id: tenantId,
    farm_status: 'active'
  });

  return {
    mode: profile.source_mode,
    farm_collection: farmCollection
  };
};

const buildMapContractResponse = async (tenant: LeanObject, profile: LeanObject | null) => {
  const [boundaries, features, assistantContents] = await Promise.all([
    MapBoundaryModel.find({
      tenant_id: tenant._id,
      is_active: true
    })
      .sort({ is_primary: -1, level: 1, created_at: 1 })
      .lean(),
    MapFeatureModel.find({
      tenant_id: tenant._id,
      is_active: true,
      status: 'active'
    })
      .sort({ sort_order: 1, created_at: 1 })
      .lean(),
    getAssistantContentsByTenantId(tenant._id)
  ]);

  return {
    tenant: serializeTenant(tenant),
    profile: profile ? serializeProfile(profile) : null,
    boundaries: boundaries.map(serializeBoundary),
    feature_collections: groupFeaturesByType(features),
    raw_features: features.map(serializeFeature),
    assistant_contents: assistantContents
  };
};

const getMapScopeByTenantId = async (tenantId: unknown) => {
  const [boundaries, features] = await Promise.all([
    MapBoundaryModel.find({
      tenant_id: tenantId,
      is_active: true
    })
      .sort({ is_primary: -1, level: 1, created_at: 1 })
      .lean(),
    MapFeatureModel.find({
      tenant_id: tenantId,
      is_active: true,
      status: 'active'
    })
      .sort({ sort_order: 1, created_at: 1 })
      .lean()
  ]);

  return {
    boundaries,
    features
  };
};

const getTenantProfileBySlug = async (tenantSlug: string) => {
  const tenant = await MapTenantModel.findOne({
    slug: tenantSlug.toLowerCase(),
    status: 'active'
  }).lean();

  if (!tenant) {
    return null;
  }

  const profile = await MapProfileModel.findOne({
    tenant_id: tenant._id,
    is_active: true
  })
    .sort({ created_at: 1 })
    .lean();

  if (!profile) {
    return {
      tenant,
      profile: null
    };
  }

  return {
    tenant,
    profile
  };
};

const sendMapScope = async (
  res: Response,
  tenant: LeanObject,
  profile: LeanObject,
  boundaries: LeanObject[],
  features: LeanObject[],
  extra: Record<string, unknown> = {}
) => {
  const primaryBoundary = boundaries.find((boundary) => boundary.is_primary) ?? boundaries[0] ?? null;
  const [assistantContents, source] = await Promise.all([
    getAssistantContentsByTenantId(tenant._id),
    buildTenantFarmSource(tenant._id, profile)
  ]);

  res.status(200).json({
    success: true,
    data: {
      tenant: serializeTenant(tenant),
      profile: serializeProfile(profile),
      boundaries: boundaries.map(serializeBoundary),
      primary_boundary: primaryBoundary ? serializeBoundary(primaryBoundary) : null,
      feature_collections: groupFeaturesByType(features),
      raw_features: features.map(serializeFeature),
      assistant_contents: assistantContents,
      source,
      stats: {
        boundary_count: boundaries.length,
        feature_count: features.length,
        farm_count: source.farm_collection.features.filter((feature) => feature.geometry?.type === 'Point').length
      },
      ...extra
    }
  });
};

// export const getAllFarmsMap = async (req: Request, res: Response) => {
//   try {
//     const farms = await FarmModel.find()
//       .populate('farm_type_id', 'type_name image description') // chọn trường cần thiết
//       .populate('owner_id', 'name phone avatar role') // chỉ lấy thông tin cơ bản
//       .populate('user_id', 'name phone avatar role')
//       .sort({ created_at: -1 }); // sắp xếp farm mới nhất lên đầu

//     res.status(200).json({
//       success: true,
//       total: farms.length,
//       data: farms
//     });
//   } catch (error: any) {
//     console.error('Error getAllFarms:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Lỗi khi lấy danh sách nông trại',
//       error: error.message
//     });
//   }
// };

export const getAllFarmsMap = async (req: Request, res: Response) => {
  try {
    const { crop_id, province_code, owner_id } = req.query;

    const match: any = {
      farm_status: 'active'
    };

    if (province_code) {
      match['province.province_code'] = province_code;
    }

    // Lọc theo owner_id nếu có trong query hoặc từ token (nếu là owner)
    if (req.user?.role === 'superadmin' || req.user?.role === 'admin') {
      if (owner_id && mongoose.Types.ObjectId.isValid(owner_id as string)) {
        match.owner_id = new mongoose.Types.ObjectId(owner_id as string);
      }
    } else if (req.user?.role === 'owner') {
      match.owner_id = new mongoose.Types.ObjectId(req.user.id);
    } else if (req.user?.role === 'sub_account') {
      match.user_id = new mongoose.Types.ObjectId(req.user.id);
      if (req.user.ownerId && mongoose.Types.ObjectId.isValid(req.user.ownerId)) {
        match.owner_id = new mongoose.Types.ObjectId(req.user.ownerId);
      }
    }

    const farmGeoJson = await buildFarmGeoJson(match);

    res.status(200).json({
      success: true,
      type: 'FeatureCollection',
      features: farmGeoJson.features
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Server error'
    });
  }
};

export const getMapTenants = async (req: Request, res: Response) => {
  try {
    const tenants = await MapTenantModel.find({ status: 'active' }).sort({ type: 1, created_at: 1 }).lean();

    const tenantIds = tenants.map((tenant) => tenant._id);

    const [profiles, boundaries, features] = await Promise.all([
      MapProfileModel.find({
        tenant_id: { $in: tenantIds },
        is_active: true
      })
        .sort({ tenant_id: 1, created_at: 1 })
        .lean(),
      MapBoundaryModel.aggregate([
        {
          $match: {
            tenant_id: { $in: tenantIds },
            is_active: true
          }
        },
        {
          $group: {
            _id: '$tenant_id',
            total: { $sum: 1 }
          }
        }
      ]),
      MapFeatureModel.aggregate([
        {
          $match: {
            tenant_id: { $in: tenantIds },
            is_active: true,
            status: 'active'
          }
        },
        {
          $group: {
            _id: '$tenant_id',
            total: { $sum: 1 }
          }
        }
      ])
    ]);

    const profileByTenantId = new Map(profiles.map((profile) => [String(profile.tenant_id), profile]));
    const boundaryCountByTenantId = new Map(boundaries.map((item) => [String(item._id), item.total]));
    const featureCountByTenantId = new Map(features.map((item) => [String(item._id), item.total]));

    res.status(200).json({
      success: true,
      total: tenants.length,
      data: tenants.map((tenant) => {
        const tenantId = String(tenant._id);
        return {
          ...serializeTenant(tenant),
          default_profile: profileByTenantId.get(tenantId)
            ? serializeProfile(profileByTenantId.get(tenantId) as LeanObject)
            : null,
          boundary_count: boundaryCountByTenantId.get(tenantId) ?? 0,
          feature_count: featureCountByTenantId.get(tenantId) ?? 0
        };
      })
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const getGlobalMapContract = async (req: Request, res: Response) => {
  try {
    const globalTenant = await MapTenantModel.findOne({
      type: 'global',
      status: 'active'
    }).lean();

    if (!globalTenant) {
      res.status(404).json({
        success: false,
        message: 'Global map tenant not found'
      });
      return;
    }

    const profile = await MapProfileModel.findOne({
      tenant_id: globalTenant._id,
      is_active: true
    })
      .sort({ created_at: 1 })
      .lean();

    if (!profile) {
      res.status(404).json({
        success: false,
        message: 'Global map profile not found'
      });
      return;
    }

    const farmGeoJson = await buildFarmGeoJson({
      farm_status: 'active'
    });

    const contract = await buildMapContractResponse(globalTenant, profile);

    res.status(200).json({
      success: true,
      data: {
        ...contract,
        source: {
          mode: profile.source_mode,
          farm_collection: farmGeoJson
        }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const getTenantMapContract = async (req: Request, res: Response) => {
  try {
    const { tenantSlug } = req.params;
    const scope = await getTenantProfileBySlug(tenantSlug);

    if (!scope?.tenant || !scope.profile) {
      res.status(scope?.tenant ? 404 : 404).json({
        success: false,
        message: !scope?.tenant ? 'Map tenant not found' : 'Map profile not found'
      });
      return;
    }

    const { boundaries, features } = await getMapScopeByTenantId(scope.tenant._id);
    await sendMapScope(res, scope.tenant, scope.profile, boundaries, features, {
      route: `/map/tenant/${scope.tenant.slug}`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const getTenantMapProfile = async (req: Request, res: Response) => {
  try {
    const { tenantSlug } = req.params;
    const scope = await getTenantProfileBySlug(tenantSlug);

    if (!scope?.tenant || !scope.profile) {
      res.status(scope?.tenant ? 404 : 404).json({
        success: false,
        message: !scope?.tenant ? 'Map tenant not found' : 'Map profile not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        tenant: serializeTenant(scope.tenant),
        profile: serializeProfile(scope.profile)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const getGlobalMapProfile = async (req: Request, res: Response) => {
  try {
    const globalTenant = await MapTenantModel.findOne({
      type: 'global',
      status: 'active'
    }).lean();

    if (!globalTenant) {
      res.status(404).json({
        success: false,
        message: 'Global map tenant not found'
      });
      return;
    }

    const profile = await MapProfileModel.findOne({
      tenant_id: globalTenant._id,
      is_active: true
    })
      .sort({ created_at: 1 })
      .lean();

    if (!profile) {
      res.status(404).json({
        success: false,
        message: 'Global map profile not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        tenant: serializeTenant(globalTenant),
        profile: serializeProfile(profile)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const getGlobalMapBoundary = async (req: Request, res: Response) => {
  try {
    const globalTenant = await MapTenantModel.findOne({
      type: 'global',
      status: 'active'
    }).lean();

    if (!globalTenant) {
      res.status(404).json({
        success: false,
        message: 'Global map tenant not found'
      });
      return;
    }

    const { boundaries } = await getMapScopeByTenantId(globalTenant._id);

    res.status(200).json({
      success: true,
      data: {
        tenant: serializeTenant(globalTenant),
        boundaries: boundaries.map(serializeBoundary),
        primary_boundary: boundaries.find((boundary) => boundary.is_primary)
          ? serializeBoundary(boundaries.find((boundary) => boundary.is_primary) as LeanObject)
          : null
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const getGlobalMapFeatures = async (req: Request, res: Response) => {
  try {
    const globalTenant = await MapTenantModel.findOne({
      type: 'global',
      status: 'active'
    }).lean();

    if (!globalTenant) {
      res.status(404).json({
        success: false,
        message: 'Global map tenant not found'
      });
      return;
    }

    const { features } = await getMapScopeByTenantId(globalTenant._id);

    res.status(200).json({
      success: true,
      data: {
        tenant: serializeTenant(globalTenant),
        feature_collections: groupFeaturesByType(features),
        raw_features: features.map(serializeFeature)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const getGlobalMapStats = async (req: Request, res: Response) => {
  try {
    const globalTenant = await MapTenantModel.findOne({
      type: 'global',
      status: 'active'
    }).lean();

    if (!globalTenant) {
      res.status(404).json({
        success: false,
        message: 'Global map tenant not found'
      });
      return;
    }

    const [farmCount, scope] = await Promise.all([
      FarmModel.countDocuments({ farm_status: 'active' }),
      getMapScopeByTenantId(globalTenant._id)
    ]);

    res.status(200).json({
      success: true,
      data: {
        tenant: serializeTenant(globalTenant),
        stats: {
          farm_count: farmCount,
          boundary_count: scope.boundaries.length,
          feature_count: scope.features.length
        }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const getTenantMapBoundary = async (req: Request, res: Response) => {
  try {
    const { tenantSlug } = req.params;
    const scope = await getTenantProfileBySlug(tenantSlug);

    if (!scope?.tenant) {
      res.status(404).json({
        success: false,
        message: 'Map tenant not found'
      });
      return;
    }

    const { boundaries } = await getMapScopeByTenantId(scope.tenant._id);
    const primaryBoundary = boundaries.find((boundary) => boundary.is_primary) ?? boundaries[0] ?? null;

    res.status(200).json({
      success: true,
      data: {
        tenant: serializeTenant(scope.tenant),
        boundaries: boundaries.map(serializeBoundary),
        primary_boundary: primaryBoundary ? serializeBoundary(primaryBoundary) : null
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const getTenantMapFeatures = async (req: Request, res: Response) => {
  try {
    const { tenantSlug } = req.params;
    const scope = await getTenantProfileBySlug(tenantSlug);

    if (!scope?.tenant) {
      res.status(404).json({
        success: false,
        message: 'Map tenant not found'
      });
      return;
    }

    const { features } = await getMapScopeByTenantId(scope.tenant._id);

    res.status(200).json({
      success: true,
      data: {
        tenant: serializeTenant(scope.tenant),
        feature_collections: groupFeaturesByType(features),
        raw_features: features.map(serializeFeature)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const getTenantMapStats = async (req: Request, res: Response) => {
  try {
    const { tenantSlug } = req.params;
    const scope = await getTenantProfileBySlug(tenantSlug);

    if (!scope?.tenant) {
      res.status(404).json({
        success: false,
        message: 'Map tenant not found'
      });
      return;
    }

    const [details, farmCount] = await Promise.all([
      getMapScopeByTenantId(scope.tenant._id),
      FarmModel.countDocuments({
        tenant_id: scope.tenant._id,
        farm_status: 'active'
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        tenant: serializeTenant(scope.tenant),
        stats: {
          farm_count: farmCount,
          boundary_count: details.boundaries.length,
          feature_count: details.features.length
        }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const getTenantMapAssistantContents = async (req: Request, res: Response) => {
  try {
    const { tenantSlug } = req.params;
    const scope = await getTenantProfileBySlug(tenantSlug);

    if (!scope?.tenant) {
      res.status(404).json({
        success: false,
        message: 'Map tenant not found'
      });
      return;
    }

    const data = await getAssistantContentsByTenantId(scope.tenant._id, req.query as Record<string, unknown>);

    res.status(200).json({
      success: true,
      total: data.length,
      data
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const getMapAssistantContentById = async (req: Request, res: Response) => {
  try {
    const { assistantId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(assistantId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid assistantId'
      });
      return;
    }

    const content = await MapAssistantContentModel.findById(assistantId).lean();
    if (!content) {
      res.status(404).json({
        success: false,
        message: 'Assistant content not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: serializeAssistantContent(content)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const createTenantMapAssistantContent = async (req: Request, res: Response) => {
  try {
    const { tenantSlug } = req.params;
    const scope = await getTenantProfileBySlug(tenantSlug);

    if (!scope?.tenant) {
      res.status(404).json({
        success: false,
        message: 'Map tenant not found'
      });
      return;
    }

    const payload = mapAssistantPayloadSchema.parse(req.body);
    const targetFeatureId = toObjectIdOrNull(payload.target_feature_id);

    if (payload.target_feature_id && !targetFeatureId) {
      res.status(400).json({
        success: false,
        message: 'Invalid target_feature_id'
      });
      return;
    }

    if (targetFeatureId) {
      const feature = await MapFeatureModel.findOne({
        _id: targetFeatureId,
        tenant_id: scope.tenant._id,
        is_active: true
      }).lean();

      if (!feature) {
        res.status(404).json({
          success: false,
          message: 'Target feature not found'
        });
        return;
      }
    }

    const content = await MapAssistantContentModel.create({
      ...payload,
      tenant_id: scope.tenant._id,
      target_key: normalizeAssistantTargetKey(payload.target_key),
      target_feature_id: targetFeatureId
    });

    res.status(201).json({
      success: true,
      data: serializeAssistantContent(content.toObject())
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: err.errors
      });
      return;
    }

    if (err?.code === 11000) {
      res.status(409).json({
        success: false,
        message: 'Assistant content already exists for this target'
      });
      return;
    }

    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const updateMapAssistantContent = async (req: Request, res: Response) => {
  try {
    const { assistantId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(assistantId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid assistantId'
      });
      return;
    }

    const payload = mapAssistantUpdateSchema.parse(req.body);
    const updateData: Record<string, unknown> = { ...payload };

    if (typeof payload.target_key === 'string') {
      updateData.target_key = normalizeAssistantTargetKey(payload.target_key);
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'target_feature_id')) {
      const targetFeatureId = toObjectIdOrNull(payload.target_feature_id);
      if (payload.target_feature_id && !targetFeatureId) {
        res.status(400).json({
          success: false,
          message: 'Invalid target_feature_id'
        });
        return;
      }
      updateData.target_feature_id = targetFeatureId;
    }

    const current = await MapAssistantContentModel.findById(assistantId).lean();
    if (!current) {
      res.status(404).json({
        success: false,
        message: 'Assistant content not found'
      });
      return;
    }

    if (updateData.target_feature_id) {
      const feature = await MapFeatureModel.findOne({
        _id: updateData.target_feature_id,
        tenant_id: current.tenant_id,
        is_active: true
      }).lean();

      if (!feature) {
        res.status(404).json({
          success: false,
          message: 'Target feature not found'
        });
        return;
      }
    }

    const updated = await MapAssistantContentModel.findByIdAndUpdate(assistantId, updateData, {
      new: true,
      runValidators: true
    }).lean();

    res.status(200).json({
      success: true,
      data: serializeAssistantContent(updated as LeanObject)
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: err.errors
      });
      return;
    }

    if (err?.code === 11000) {
      res.status(409).json({
        success: false,
        message: 'Assistant content already exists for this target'
      });
      return;
    }

    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const deleteMapAssistantContent = async (req: Request, res: Response) => {
  try {
    const { assistantId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(assistantId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid assistantId'
      });
      return;
    }

    const deleted = await MapAssistantContentModel.findByIdAndUpdate(
      assistantId,
      {
        $set: {
          status: 'inactive',
          is_active: false
        }
      },
      { new: true }
    ).lean();

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Assistant content not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: serializeAssistantContent(deleted)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const getFarmDetail = async (req: Request, res: Response) => {
  try {
    const { farmId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(farmId)) {
      res.status(400).json({ message: 'Invalid farmId' });
      return;
    }

    const farmObjectId = new mongoose.Types.ObjectId(farmId);
    // const farmAccess = await assertFarmAccess(req.user, farmId);
    // console.log('Farm access check:', farmAccess);

    // if (!farmAccess.ok) {
    //   res.status(farmAccess.status).json({ message: farmAccess.message });
    //   return;
    // }

    const [farm] = await FarmModel.aggregate([
      // ===== MATCH =====
      {
        $match: { _id: farmObjectId }
      },

      // ===== PROJECT SỚM =====
      {
        $project: {
          farm_name: 1,
          owner_id: 1,
          avatar: 1,
          farm_type_id: 1,
          area: 1,
          unit: 1,
          ward: 1,
          province: 1,
          farm_status: 1,
          description: 1,
          updated_at: 1
        }
      },

      // ===== OWNER =====
      {
        $lookup: {
          from: 'users',
          let: { ownerId: '$owner_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$ownerId'] }
              }
            },
            {
              $project: {
                name: 1,
                phone: 1
              }
            }
          ],
          as: 'owner'
        }
      },

      // ===== FARM TYPE =====
      {
        $lookup: {
          from: 'farmtypes',
          let: { typeId: '$farm_type_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$typeId'] }
              }
            },
            {
              $project: {
                type_name: 1
              }
            }
          ],
          as: 'farmType'
        }
      },

      // ===== CROP =====
      {
        $lookup: {
          from: 'farmcrops',
          let: { farmId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ['$farm_id', '$$farmId'] }, { $eq: ['$is_primary', true] }]
                }
              }
            },
            { $limit: 1 },
            {
              $lookup: {
                from: 'crops',
                localField: 'crop_id',
                foreignField: '_id',
                as: 'crop'
              }
            },
            { $unwind: '$crop' },
            {
              $project: {
                cropId: '$crop._id',
                cropName: '$crop.name',
                cropType: '$crop.category'
              }
            }
          ],
          as: 'cropData'
        }
      },

      // ===== MEDIA =====
      {
        $lookup: {
          from: 'farmmedias',
          let: { farmId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$farm_id', '$$farmId'] }
              }
            },
            {
              $project: {
                url: 1
              }
            }
          ],
          as: 'medias'
        }
      },

      // ===== REPORT =====
      {
        $lookup: {
          from: 'productionreports',
          let: { farmId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$farm_id', '$$farmId'] }
              }
            },
            {
              $project: {
                year: 1,
                yield: 1
              }
            },
            {
              $sort: { year: 1 }
            }
          ],
          as: 'reports'
        }
      },

      // ===== 🔥 LOGS (5 GẦN NHẤT) =====
      {
        $lookup: {
          from: 'productionlogs',
          let: { farmId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$farm_id', '$$farmId'] }
              }
            },
            {
              $sort: { date: -1 } // mới nhất trước
            },
            {
              $limit: 5 // ⚡ chỉ lấy 5 log
            },

            // 👉 JOIN activity (nếu bạn muốn hiển thị tên hoạt động)
            {
              $lookup: {
                from: 'activities',
                localField: 'activity_id',
                foreignField: '_id',
                as: 'activity'
              }
            },
            {
              $unwind: {
                path: '$activity',
                preserveNullAndEmptyArrays: true
              }
            },

            {
              $project: {
                season: {
                  $ifNull: ['$activity.name', 'Hoạt động']
                },
                year: { $year: '$date' },
                result: {
                  $ifNull: ['$notes', 'Không có ghi chú']
                }
              }
            }
          ],
          as: 'seasons'
        }
      },

      // ===== FINAL =====
      {
        $addFields: {
          owner: { $arrayElemAt: ['$owner', 0] },
          farmType: { $arrayElemAt: ['$farmType', 0] },
          cropData: { $arrayElemAt: ['$cropData', 0] }
        }
      },

      {
        $project: {
          id: '$_id',
          name: '$farm_name',

          owner: '$owner.name',
          phone: '$owner.phone',
          avatar: '$avatar',

          cropId: '$cropData.cropId',
          cropName: '$cropData.cropName',
          cropType: '$cropData.cropType',

          farmingModel: {
            $ifNull: ['$farmType.type_name', 'Chưa cập nhật']
          },

          area: 1,
          unit: 1,

          address: {
            $concat: ['$ward.name', ', ', '$province.name']
          },

          status: '$farm_status',

          certification: [],

          images: {
            $map: {
              input: '$medias',
              as: 'm',
              in: '$$m.url'
            }
          },

          description: 1,

          reports: 1,

          seasons: 1, // 🔥 thêm vào FE dùng luôn

          updatedAt: '$updated_at'
        }
      }
    ]);

    console.log('Farm detail:', farm);

    if (!farm) {
      res.status(404).json({ message: 'Farm not found' });
      return;
    }

    res.status(200).json(farm);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Khởi tạo 1 instance toàn cục
const converter = new VietnamAddressConverter();

// ✅ Khởi tạo khi server khởi động
(async () => {
  try {
    const dataPath = path.join(__dirname, '../addressConvert/geojson/vietnameConver.json');
    await converter.initialize(dataPath);
    console.log('✅ VietnamAddressConverter initialized!');
  } catch (error) {
    console.error('❌ Lỗi khởi tạo converter:', error);
  }
})();

// 📍 API chính
export const handleConvertAddress = async (req: Request, res: Response) => {
  try {
    const { address } = req.query; // GET nên lấy từ query

    if (!address || typeof address !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Thiếu tham số ?address=...'
      });
      return;
    }

    const result = converter.convertAddress(address);
    res.json(result);
  } catch (err: any) {
    console.error('❌ Lỗi convert address:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

export const getProvinces = async (req: Request, res: Response) => {
  try {
    const provinces = converter.getProvinces();

    res.json({
      success: true,
      total: provinces.length,
      data: provinces
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getWardsByProvince = async (req: Request, res: Response) => {
  try {
    const { province_code } = req.query;

    if (!province_code || typeof province_code !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Thiếu province_code'
      });
      return;
    }

    const wards = converter.getWardsByProvince(province_code);

    res.json({
      success: true,
      total: wards.length,
      data: wards
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const searchProvinces = async (req: Request, res: Response) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      res.json({
        success: true,
        data: converter.getProvinces()
      });
      return;
    }

    const normalized = keyword.toString().toLowerCase();

    const provinces = converter.getProvinces().filter((p) => p.name.toLowerCase().includes(normalized));

    res.json({
      success: true,
      total: provinces.length,
      data: provinces
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
