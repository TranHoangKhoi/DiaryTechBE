import { createHash } from 'crypto';
import mongoose from 'mongoose';
import {
  DEFAULT_SHARED_FIELD_SUGGESTION_LIMIT,
  getSharedFieldDefinition,
  isSharedFieldKey,
  MAX_SHARED_FIELD_SUGGESTION_LIMIT,
  SHARED_FIELD_SCOPES,
  SharedFieldValueType,
  normalizeSharedFieldKey
} from '~/constants/sharedFieldKeys';
import SharedFieldValueModel from '~/models/SharedFieldValues.model';

type ActivityFieldLike = {
  key?: string;
  field_name?: string;
  field_type?: string;
};

type ActivityLike = {
  _id: mongoose.Types.ObjectId | unknown;
  fields?: ActivityFieldLike[];
};

type FarmLike = {
  _id: mongoose.Types.ObjectId | unknown;
  farm_type_id: mongoose.Types.ObjectId | unknown;
};

type SharedHistoryFieldLike = {
  key?: string;
};

type BookLike = {
  _id: mongoose.Types.ObjectId | unknown;
};

type ProductionLogLike = {
  _id: mongoose.Types.ObjectId | unknown;
  data?: Record<string, unknown>;
};

export const normalizeFieldKey = (key: string) => key.trim().toLowerCase();

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

export const isEmptySharedValue = (value: unknown) => {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  return false;
};

const stableStringify = (value: unknown): string => {
  if (!isPlainObject(value)) return JSON.stringify(value);

  return JSON.stringify(
    Object.keys(value)
      .sort()
      .reduce<Record<string, unknown>>((result, key) => {
        result[key] = value[key];
        return result;
      }, {})
  );
};

const normalizeValueForHash = (value: unknown) => {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') return value.trim();
  return value;
};

const createValueHash = (fieldKey: string, value: unknown) =>
  createHash('sha1').update(`${fieldKey}:${stableStringify(normalizeValueForHash(value))}`).digest('hex');

const getValueText = (value: unknown) => {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return undefined;
};

const getValueNumber = (value: unknown) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
};

const getValueDate = (value: unknown) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }
  return undefined;
};

export const normalizeProductionLogDataByActivity = (data: unknown, activity: ActivityLike) => {
  const rawData = isPlainObject(data) ? data : {};
  const normalizedData: Record<string, unknown> = { ...rawData };

  for (const field of activity.fields || []) {
    if (!field.key) continue;

    const fieldKey = normalizeSharedFieldKey(field.key);
    const fieldName = field.field_name;
    const value = rawData[fieldKey] ?? (fieldName ? rawData[fieldName] : undefined);

    if (value === undefined) continue;

    normalizedData[fieldKey] = value;
    if (fieldName && fieldName !== fieldKey) delete normalizedData[fieldName];
  }

  return normalizedData;
};

export const syncSharedFieldValuesFromLog = async ({
  farm,
  activity,
  book,
  log
}: {
  farm: FarmLike;
  activity: ActivityLike;
  book: BookLike;
  log: ProductionLogLike;
}) => {
  const data = isPlainObject(log.data) ? log.data : {};
  const operations = [];

  for (const field of activity.fields || []) {
    if (!field.key) continue;

    const fieldKey = normalizeSharedFieldKey(field.key);
    if (!isSharedFieldKey(fieldKey)) continue;

    const value = data[fieldKey];
    if (isEmptySharedValue(value)) continue;

    const definition = getSharedFieldDefinition(fieldKey);
    if (!definition) continue;

    const scopeType = definition.default_scope;
    const scopeId = scopeType === SHARED_FIELD_SCOPES.farm ? farm._id : farm.farm_type_id;
    const valueHash = createValueHash(fieldKey, value);

    operations.push({
      updateOne: {
        filter: {
          scope_type: scopeType,
          scope_id: scopeId,
          field_key: fieldKey,
          value_hash: valueHash
        },
        update: {
          $set: {
            farm_id: farm._id,
            farm_type_id: farm.farm_type_id,
            field_label: field.field_name || definition.label,
            field_type: field.field_type || definition.value_type,
            value,
            value_text: getValueText(value),
            value_number: getValueNumber(value),
            value_date: getValueDate(value),
            source_activity_id: activity._id,
            source_log_id: log._id,
            source_book_id: book._id,
            last_used_at: new Date()
          },
          $setOnInsert: {
            scope_type: scopeType,
            scope_id: scopeId,
            field_key: fieldKey,
            value_hash: valueHash
          },
          $inc: {
            usage_count: 1
          }
        },
        upsert: true
      }
    });
  }

  if (operations.length === 0) return;

  await SharedFieldValueModel.bulkWrite(operations, { ordered: false });
};

const parseSuggestionLimit = (value: unknown) => {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (Number.isNaN(parsed) || parsed <= 0) return DEFAULT_SHARED_FIELD_SUGGESTION_LIMIT;
  return Math.min(parsed, MAX_SHARED_FIELD_SUGGESTION_LIMIT);
};

const serializeSharedValue = (item: any) => ({
  id: String(item._id),
  value: item.value,
  value_text: item.value_text,
  value_number: item.value_number,
  value_date: item.value_date,
  usage_count: item.usage_count,
  source_activity_id: item.source_activity_id,
  source_log_id: item.source_log_id,
  source_book_id: item.source_book_id,
  last_used_at: item.last_used_at
});

export const getSharedFieldHistoryForFields = async ({
  farm,
  fields,
  limit
}: {
  farm: FarmLike;
  fields: SharedHistoryFieldLike[];
  limit?: unknown;
}) => {
  const suggestionLimit = parseSuggestionLimit(limit);
  const sharedKeys = Array.from(
    new Set(
      fields
      .map((field) => (field.key ? normalizeSharedFieldKey(field.key) : ''))
        .filter((key) => key && isSharedFieldKey(key))
    )
  );

  if (sharedKeys.length === 0) return {};

  const records = await SharedFieldValueModel.find({
    field_key: { $in: sharedKeys },
    $or: [
      {
        scope_type: SHARED_FIELD_SCOPES.farm,
        scope_id: farm._id
      },
      {
        scope_type: SHARED_FIELD_SCOPES.farmType,
        scope_id: farm.farm_type_id
      }
    ]
  })
    .sort({ last_used_at: -1 })
    .lean();

  const result: Record<string, any> = {};

  for (const key of sharedKeys) {
    const definition = getSharedFieldDefinition(key);
    const items = records.filter((record) => record.field_key === key);
    const primaryScopeItems = items.filter((record) => record.scope_type === definition?.default_scope);
    const fallbackScopeItems = items.filter((record) => record.scope_type !== definition?.default_scope);
    const orderedItems = [...primaryScopeItems, ...fallbackScopeItems];
    const suggestions = orderedItems.slice(0, suggestionLimit).map(serializeSharedValue);

    result[key] = {
      key,
      label: definition?.label,
      mode: definition?.mode,
      default_scope: definition?.default_scope,
      latest_value: suggestions[0] ?? null,
      suggestions
    };
  }

  return result;
};
