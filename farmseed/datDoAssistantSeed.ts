import mongoose from 'mongoose';

import assistantContentData from '../../DiaryTechWeb/assets/LocationJson/DatDo/assistantContent.json';
import MapAssistantContentModel from '../src/models/MapAssistantContent.model';

type AssistantHighlight = {
  label: string;
  detail: string;
};

type AssistantEntry = {
  slug: string;
  name: string;
  summary: string;
  speech: string;
  highlights: AssistantHighlight[];
  hint?: string;
};

type WardAssistantEntry = AssistantEntry & {
  stats: {
    area: string;
    population: string;
    density: string;
  };
};

type HamletFeatureLike = {
  _id?: unknown;
  id?: unknown;
  name?: string;
  properties?: Record<string, any>;
};

type SeedOptions = {
  forceContent?: boolean;
};

const slugify = (value?: string) => {
  if (!value) return '';
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-)|(-$)/g, '');
};

const getFeatureId = (feature?: HamletFeatureLike | null) => {
  const rawId = feature?._id ?? feature?.id;
  if (rawId instanceof mongoose.Types.ObjectId) return rawId;
  if (typeof rawId === 'string' && mongoose.Types.ObjectId.isValid(rawId)) {
    return new mongoose.Types.ObjectId(rawId);
  }
  return null;
};

const getHamletCandidateName = (feature: HamletFeatureLike) => {
  const props = feature.properties ?? {};
  return String(props.display_name_short || props.display_name || props.osm_name || props.name || feature.name || '');
};

const buildFeatureBySlug = (features: HamletFeatureLike[]) => {
  return features.reduce((acc, feature) => {
    const slug = slugify(getHamletCandidateName(feature));
    if (slug && !acc.has(slug)) {
      acc.set(slug, feature);
    }
    return acc;
  }, new Map<string, HamletFeatureLike>());
};

const buildWardSteps = (wardData: WardAssistantEntry) => [
  {
    id: 'summary',
    title: wardData.name,
    description: wardData.summary,
    speech: wardData.speech,
    sort_order: 0
  },
  ...wardData.highlights.map((highlight, index) => ({
    id: `highlight-${index}`,
    title: highlight.label,
    description: highlight.detail,
    speech: `${highlight.label}. ${highlight.detail}`,
    sort_order: index + 1
  })),
  {
    id: 'stats',
    title: 'So lieu',
    description: `Dien tich ${wardData.stats.area}, dan so ${wardData.stats.population}, mat do ${wardData.stats.density}.`,
    speech: `Dien tich ${wardData.stats.area}, dan so ${wardData.stats.population}, mat do ${wardData.stats.density}.`,
    sort_order: wardData.highlights.length + 1
  }
];

const buildHamletSteps = (entry: AssistantEntry, props: Record<string, any>) => [
  {
    id: 'summary',
    title: entry.name,
    description: entry.summary,
    speech: entry.speech,
    sort_order: 0
  },
  ...entry.highlights.map((highlight, index) => ({
    id: `highlight-${index}`,
    title: highlight.label,
    description: highlight.detail,
    speech: `${highlight.label}. ${highlight.detail}`,
    sort_order: index + 1
  })),
  {
    id: 'stats',
    title: 'So lieu thuc te',
    description: `Dan so: ${props.population || '---'} nguoi. Dien tich: ${props.area_km2 || '---'} km2.`,
    speech: `Theo ban do thuc te, khu vuc co dan so khoang ${props.population || 'chua ro'} nguoi va dien tich khoang ${
      props.area_km2 || 'chua ro'
    } kilomet vuong.`,
    sort_order: entry.highlights.length + 1
  }
];

const buildUpsertUpdate = (payload: Record<string, any>, forceContent: boolean) => {
  const identityFields = {
    tenant_id: payload.tenant_id,
    scope_type: payload.scope_type,
    target_key: payload.target_key,
    target_feature_id: payload.target_feature_id,
    locale: payload.locale,
    status: payload.status,
    is_active: payload.is_active,
    sort_order: payload.sort_order
  };

  if (forceContent) {
    return {
      $set: payload
    };
  }

  const contentOnInsert = { ...payload };
  Object.keys(identityFields).forEach((key) => {
    delete contentOnInsert[key];
  });

  return {
    $set: identityFields,
    $setOnInsert: contentOnInsert
  };
};

export const seedDatDoAssistantContents = async (
  tenantId: mongoose.Types.ObjectId,
  hamletFeatures: HamletFeatureLike[],
  options: SeedOptions = {}
) => {
  const wardData = assistantContentData.ward as WardAssistantEntry;
  const hamletEntries = assistantContentData.hamlets as AssistantEntry[];
  const featureBySlug = buildFeatureBySlug(hamletFeatures);
  const forceContent = options.forceContent === true;

  const wardPayload = {
    tenant_id: tenantId,
    scope_type: 'ward',
    target_key: wardData.slug || 'xa-dat-do',
    target_feature_id: null,
    locale: 'vi-VN',
    context_label: 'Tong quan xa',
    title: wardData.name,
    summary: `${wardData.summary} Dien tich ${wardData.stats.area}, dan so ${wardData.stats.population}, mat do ${wardData.stats.density}.`,
    speech: wardData.speech,
    highlights: [
      ...wardData.highlights,
      { label: 'Dien tich xa', detail: wardData.stats.area },
      { label: 'Dan so chinh thuc', detail: wardData.stats.population }
    ],
    steps: buildWardSteps(wardData),
    hint: wardData.hint || '',
    status: 'active',
    is_active: true,
    sort_order: 0
  };

  const hamletPayloads = hamletEntries.map((entry, index) => {
    const feature = featureBySlug.get(entry.slug);
    const props = feature?.properties ?? {};

    return {
      tenant_id: tenantId,
      scope_type: 'hamlet',
      target_key: entry.slug,
      target_feature_id: getFeatureId(feature),
      locale: 'vi-VN',
      context_label: 'Tong quan ap',
      title: entry.name,
      summary: `${entry.summary} (Dan so: ${props.population || '---'}, Dien tich: ${props.area_km2 || '---'} km2)`,
      speech: entry.speech,
      highlights: entry.highlights,
      steps: buildHamletSteps(entry, props),
      hint: entry.hint || '',
      status: 'active',
      is_active: true,
      sort_order: index + 1
    };
  });

  const operations = [wardPayload, ...hamletPayloads].map((payload) => ({
    updateOne: {
      filter: {
        tenant_id: payload.tenant_id,
        scope_type: payload.scope_type,
        target_key: payload.target_key,
        locale: payload.locale
      },
      update: buildUpsertUpdate(payload, forceContent),
      upsert: true
    }
  }));

  if (!operations.length) {
    return {
      total: 0,
      matched: 0,
      modified: 0,
      upserted: 0,
      missingHamlets: []
    };
  }

  const result = await MapAssistantContentModel.bulkWrite(operations, { ordered: false });
  const missingHamlets = hamletEntries.filter((entry) => !featureBySlug.has(entry.slug)).map((entry) => entry.slug);

  return {
    total: operations.length,
    matched: result.matchedCount,
    modified: result.modifiedCount,
    upserted: result.upsertedCount,
    missingHamlets
  };
};
