import mongoose from 'mongoose';
import { INVENTORY_QUANTITY_FIELD_KEYS, getInventoryTransactionFactor } from '~/constants/inventoryContract';
import InventoryStockModel from '~/models/InventoryStock.model';

const normalizeNumber = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const getFields = (template: any) =>
  Array.isArray(template?.schema)
    ? template.schema.flatMap((item: any) => (item.type === 'table' ? item.columns || [] : item.fields || []))
    : [];

const readFieldValuesByTemplate = (template: any, data: Record<string, any>, fieldKey: string) => {
  const values: unknown[] = [];

  if (!Array.isArray(template?.schema)) return values;

  template.schema.forEach((item: any) => {
    if (item.type === 'table') {
      const rows = Array.isArray(data?.[item.key]) ? data[item.key] : [];
      rows.forEach((row: any) => values.push(row?.[fieldKey]));
      return;
    }

    values.push(data?.[item.key]?.[fieldKey]);
  });

  return values;
};

export const resolveInventoryLogQuantity = (template: any, data: Record<string, any>) => {
  for (const field of getFields(template)) {
    if (field?.type !== 'number') continue;
    const fieldKey = String(field.key || '')
      .trim()
      .toLowerCase();
    if (!INVENTORY_QUANTITY_FIELD_KEYS.includes(fieldKey as any)) continue;

    const values = readFieldValuesByTemplate(template, data, field.key);
    for (const value of values) {
      const numericValue = normalizeNumber(value);
      if (numericValue > 0) return numericValue;
    }
  }

  for (const key of INVENTORY_QUANTITY_FIELD_KEYS) {
    const value = data?.[key];
    const numericValue = normalizeNumber(value);
    if (numericValue > 0) return numericValue;
  }

  return 0;
};

export const getInventoryLogTransactionFactor = (transactionType: string) => {
  return getInventoryTransactionFactor(transactionType);
};

export const syncInventoryStockFromLog = async ({
  farmId,
  materialId,
  templateId,
  materialName,
  supplierName,
  unit,
  category,
  quantity,
  transactionType,
  logId,
  previousMovement
}: {
  farmId: mongoose.Types.ObjectId | string;
  materialId: mongoose.Types.ObjectId | string;
  templateId?: mongoose.Types.ObjectId | string | null;
  materialName: string;
  supplierName?: string;
  unit: string;
  category: string;
  quantity: number;
  transactionType: string;
  logId: mongoose.Types.ObjectId | string;
  previousMovement?: number;
}) => {
  const factor = getInventoryLogTransactionFactor(transactionType);
  if (!factor || !Number.isFinite(quantity) || quantity <= 0) return;

  const movement = quantity * factor;
  const appliedMovement = Number.isFinite(previousMovement || 0) ? previousMovement || 0 : 0;
  const delta = movement - appliedMovement;
  if (delta === 0) return;

  await applyInventoryStockDelta({
    farmId,
    materialId,
    templateId,
    materialName,
    supplierName,
    unit,
    category,
    delta,
    transactionType,
    logId
  });
};

export const reverseInventoryStockFromLog = async ({
  farmId,
  materialId,
  templateId,
  materialName,
  supplierName,
  unit,
  category,
  quantity,
  transactionType,
  logId
}: {
  farmId: mongoose.Types.ObjectId | string;
  materialId: mongoose.Types.ObjectId | string;
  templateId?: mongoose.Types.ObjectId | string | null;
  materialName?: string;
  supplierName?: string;
  unit?: string;
  category: string;
  quantity: number;
  transactionType: string;
  logId: mongoose.Types.ObjectId | string;
}) => {
  const factor = getInventoryLogTransactionFactor(transactionType);
  if (!factor || !Number.isFinite(quantity) || quantity <= 0) return;

  await applyInventoryStockDelta({
    farmId,
    materialId,
    templateId,
    materialName: materialName || '',
    supplierName: supplierName || '',
    unit: unit || '',
    category,
    delta: quantity * factor * -1,
    transactionType,
    logId
  });
};

const applyInventoryStockDelta = async ({
  farmId,
  materialId,
  templateId,
  materialName,
  supplierName,
  unit,
  category,
  delta,
  transactionType,
  logId
}: {
  farmId: mongoose.Types.ObjectId | string;
  materialId: mongoose.Types.ObjectId | string;
  templateId?: mongoose.Types.ObjectId | string | null;
  materialName: string;
  supplierName?: string;
  unit: string;
  category: string;
  delta: number;
  transactionType: string;
  logId: mongoose.Types.ObjectId | string;
}) => {
  if (!Number.isFinite(delta) || delta === 0) return;

  const current = await InventoryStockModel.findOne({ farm_id: farmId, material_id: materialId });
  const nextQuantity = (current?.quantity_on_hand || 0) + delta;

  await InventoryStockModel.findOneAndUpdate(
    { farm_id: farmId, material_id: materialId },
    {
      $set: {
        farm_id: farmId,
        material_id: materialId,
        template_id: templateId || null,
        category,
        material_name: materialName || current?.material_name || '',
        supplier_name: supplierName || current?.supplier_name || '',
        unit: unit || current?.unit || '',
        quantity_on_hand: nextQuantity,
        status: nextQuantity <= 0 ? 'depleted' : 'active',
        last_transaction_type: transactionType,
        last_transaction_at: new Date(),
        last_log_id: logId
      },
      $setOnInsert: {
        quantity_reserved: 0
      }
    },
    { upsert: true, new: true }
  );
};
