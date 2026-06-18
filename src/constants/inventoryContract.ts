export const INVENTORY_FIELD_TYPES = ['text', 'number', 'date', 'select', 'textarea', 'image', 'boolean'] as const;
export const INVENTORY_SCHEMA_ITEM_TYPES = ['section', 'table'] as const;
export const INVENTORY_TEMPLATE_STATUSES = ['draft', 'active', 'archived'] as const;
export const INVENTORY_MATERIAL_STATUSES = ['draft', 'active', 'archived'] as const;
export const INVENTORY_MATERIAL_SCOPES = ['farm', 'farm_type'] as const;
export const INVENTORY_LOG_STATUSES = ['draft', 'submitted', 'approved'] as const;
export const INVENTORY_TRANSACTION_TYPES = ['in', 'out', 'adjustment', 'transfer', 'stocktake'] as const;
export const INVENTORY_MATERIAL_LOOKUP_MODEL = 'InventoryMaterial' as const;

export const INVENTORY_MATERIAL_SNAPSHOT_FIELDS = ['material_name', 'supplier_name', 'manufacturer', 'unit'] as const;

export const INVENTORY_QUANTITY_FIELD_KEYS = [
  'quantity',
  'qty',
  'so_luong',
  'khoi_luong_kg',
  'khoi_luong',
  'stock_quantity'
] as const;

export const INVENTORY_MATERIAL_AUTO_FILL_RULES = [
  {
    materialField: 'material_name',
    templateFieldKeys: ['material_name', 'feed_name', 'chemical_name']
  },
  {
    materialField: 'supplier_name',
    templateFieldKeys: ['supplier_name', 'seller']
  },
  {
    materialField: 'unit',
    templateFieldKeys: ['unit', 'chemical_unit']
  },
  {
    materialField: 'manufacturer',
    templateFieldKeys: ['feed_manufacturer', 'chemical_manufacturer', 'manufacturer']
  }
] as const;

export const INVENTORY_LEGACY_TEMPLATE_MATERIAL_MAP = {
  feed_import: {
    category: 'feed',
    materialSnapshotFields: {
      material_name: ['feed_name'],
      manufacturer: ['feed_manufacturer'],
      supplier_name: ['seller']
    },
    quantityFields: ['khoi_luong_kg'],
    businessFields: ['ngay_thang_nam', 'feed_size', 'han_su_dung', 'receiver', 'thanh_tien_vnd']
  },
  chemical_import: {
    category: 'chemical',
    materialSnapshotFields: {
      material_name: ['chemical_name'],
      manufacturer: ['chemical_manufacturer'],
      supplier_name: ['seller'],
      unit: ['chemical_unit']
    },
    quantityFields: ['so_luong'],
    businessFields: ['ngay_thang', 'chemical_usage', 'han_su_dung', 'receiver', 'thanh_tien_vnd']
  }
} as const;

export const getInventoryTransactionFactor = (transactionType: string) => {
  if (transactionType === 'out') return -1;
  if (transactionType === 'in') return 1;
  if (transactionType === 'adjustment') return 1;
  return 0;
};
