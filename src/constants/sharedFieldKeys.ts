export const SHARED_FIELD_SCOPES = {
  farm: 'farm',
  farmType: 'farm_type'
} as const;

export type SharedFieldScope = (typeof SHARED_FIELD_SCOPES)[keyof typeof SHARED_FIELD_SCOPES];

export type SharedFieldValueType = 'text' | 'number' | 'date' | 'select' | 'textarea' | 'image' | 'boolean';

export type SharedFieldMode = 'suggest' | 'latest';

export type SharedFieldDefinition = {
  key: string;
  label: string;
  value_type: SharedFieldValueType;
  default_scope: SharedFieldScope;
  mode: SharedFieldMode;
};

export const DEFAULT_SHARED_FIELD_SUGGESTION_LIMIT = 5;
export const MAX_SHARED_FIELD_SUGGESTION_LIMIT = 10;

export const SHARED_FIELD_KEYS = {
  ACTIVITY_NAME: 'activity_name',
  CHEMICAL_USED: 'chemical_used',
  CHEMICAL_NAME: 'chemical_name',
  CHEMICAL_USAGE: 'chemical_usage',
  CHEMICAL_MANUFACTURER: 'chemical_manufacturer',
  CHEMICAL_SELLER: 'chemical_seller',
  CHEMICAL_RECEIVER: 'chemical_receiver',
  CHEMICAL_UNIT: 'chemical_unit',
  CHEMICAL_TREATMENT: 'chemical_treatment',
  WATER_TREATMENT_CHEMICAL: 'water_treatment_chemical',
  TREATMENT_CHEMICAL: 'treatment_chemical',
  FEED_CODE: 'feed_code',
  FEED_SUPPLEMENT: 'feed_supplement',
  SEED_SIZE: 'seed_size',
  SEED_QUALITY: 'seed_quality',
  SPECIES: 'species',
  EXPENSE_CATEGORY: 'expense_category',
  WASTE_CATEGORY: 'waste_category',
  DISPOSAL_METHOD: 'disposal_method',
  EQUIPMENT_NAME: 'equipment_name',
  MAINTENANCE_CONTENT: 'maintenance_content',
  SYMPTOM_DIAGNOSIS: 'symptom_diagnosis',
  UNIT: 'unit',
  WATER_PH: 'water_ph',
  WATER_OXY: 'water_oxy',
  WATER_NH3: 'water_nh3',
  WATER_NO2: 'water_no2',
  WATER_PO4: 'water_po4',
  WATER_H2S: 'water_h2s',
  WATER_BOD5: 'water_bod5',
  WATER_ALKALINITY: 'water_alkalinity',
  WATER_SALINITY: 'water_salinity',
  OIL_FAT: 'oil_fat',
  ODOR: 'odor'
} as const;

export type SharedFieldKey = (typeof SHARED_FIELD_KEYS)[keyof typeof SHARED_FIELD_KEYS];

export const SHARED_FIELD_DEFINITIONS: SharedFieldDefinition[] = [
  {
    key: SHARED_FIELD_KEYS.ACTIVITY_NAME,
    label: 'Hoạt động',
    value_type: 'text',
    default_scope: SHARED_FIELD_SCOPES.farm,
    mode: 'suggest'
  },
  {
    key: SHARED_FIELD_KEYS.CHEMICAL_USED,
    label: 'Hóa chất sử dụng',
    value_type: 'textarea',
    default_scope: SHARED_FIELD_SCOPES.farm,
    mode: 'suggest'
  },
  {
    key: SHARED_FIELD_KEYS.CHEMICAL_NAME,
    label: 'Tên hóa chất',
    value_type: 'text',
    default_scope: SHARED_FIELD_SCOPES.farm,
    mode: 'suggest'
  },
  {
    key: SHARED_FIELD_KEYS.CHEMICAL_USAGE,
    label: 'Công dụng hóa chất',
    value_type: 'textarea',
    default_scope: SHARED_FIELD_SCOPES.farm,
    mode: 'suggest'
  },
  {
    key: SHARED_FIELD_KEYS.CHEMICAL_MANUFACTURER,
    label: 'Cơ sở sản xuất hóa chất',
    value_type: 'text',
    default_scope: SHARED_FIELD_SCOPES.farm,
    mode: 'suggest'
  },
  {
    key: SHARED_FIELD_KEYS.CHEMICAL_SELLER,
    label: 'Người bán',
    value_type: 'text',
    default_scope: SHARED_FIELD_SCOPES.farm,
    mode: 'suggest'
  },
  {
    key: SHARED_FIELD_KEYS.CHEMICAL_RECEIVER,
    label: 'Người nhận',
    value_type: 'text',
    default_scope: SHARED_FIELD_SCOPES.farm,
    mode: 'suggest'
  },
  {
    key: SHARED_FIELD_KEYS.CHEMICAL_UNIT,
    label: 'Đơn vị hóa chất',
    value_type: 'text',
    default_scope: SHARED_FIELD_SCOPES.farm,
    mode: 'suggest'
  },
  {
    key: SHARED_FIELD_KEYS.CHEMICAL_TREATMENT,
    label: 'Hóa chất xử lý',
    value_type: 'textarea',
    default_scope: SHARED_FIELD_SCOPES.farm,
    mode: 'suggest'
  },
  {
    key: SHARED_FIELD_KEYS.WATER_TREATMENT_CHEMICAL,
    label: 'Hóa chát xử lý môi trường',
    value_type: 'textarea',
    default_scope: SHARED_FIELD_SCOPES.farm,
    mode: 'suggest'
  },
  {
    key: SHARED_FIELD_KEYS.TREATMENT_CHEMICAL,
    label: 'Hóa chất kháng sinh xử lý',
    value_type: 'textarea',
    default_scope: SHARED_FIELD_SCOPES.farm,
    mode: 'suggest'
  },
  {
    key: SHARED_FIELD_KEYS.FEED_CODE,
    label: 'Mã thức ăn',
    value_type: 'text',
    default_scope: SHARED_FIELD_SCOPES.farm,
    mode: 'suggest'
  },
  {
    key: SHARED_FIELD_KEYS.FEED_SUPPLEMENT,
    label: 'Chất bổ xung thức ăn',
    value_type: 'textarea',
    default_scope: SHARED_FIELD_SCOPES.farm,
    mode: 'suggest'
  },
  {
    key: SHARED_FIELD_KEYS.SEED_SIZE,
    label: 'Kích cỡ giống',
    value_type: 'text',
    default_scope: SHARED_FIELD_SCOPES.farm,
    mode: 'suggest'
  },
  {
    key: SHARED_FIELD_KEYS.SEED_QUALITY,
    label: 'Chất lượng giống',
    value_type: 'text',
    default_scope: SHARED_FIELD_SCOPES.farm,
    mode: 'suggest'
  },
  {
    key: SHARED_FIELD_KEYS.SPECIES,
    label: 'Loại nuôi',
    value_type: 'text',
    default_scope: SHARED_FIELD_SCOPES.farmType,
    mode: 'suggest'
  },
  {
    key: SHARED_FIELD_KEYS.EXPENSE_CATEGORY,
    label: 'Hạng mục chi phí',
    value_type: 'select',
    default_scope: SHARED_FIELD_SCOPES.farmType,
    mode: 'suggest'
  },
  {
    key: SHARED_FIELD_KEYS.WASTE_CATEGORY,
    label: 'Danh mục chất thải',
    value_type: 'text',
    default_scope: SHARED_FIELD_SCOPES.farmType,
    mode: 'suggest'
  },
  {
    key: SHARED_FIELD_KEYS.DISPOSAL_METHOD,
    label: 'Phương án xử lý',
    value_type: 'text',
    default_scope: SHARED_FIELD_SCOPES.farmType,
    mode: 'suggest'
  },
  {
    key: SHARED_FIELD_KEYS.EQUIPMENT_NAME,
    label: 'Thiết bị',
    value_type: 'text',
    default_scope: SHARED_FIELD_SCOPES.farm,
    mode: 'suggest'
  },
  {
    key: SHARED_FIELD_KEYS.MAINTENANCE_CONTENT,
    label: 'Nội dung bảo dưỡng',
    value_type: 'textarea',
    default_scope: SHARED_FIELD_SCOPES.farm,
    mode: 'suggest'
  },
  {
    key: SHARED_FIELD_KEYS.SYMPTOM_DIAGNOSIS,
    label: 'Triệu chứng - chẩn đoán',
    value_type: 'textarea',
    default_scope: SHARED_FIELD_SCOPES.farm,
    mode: 'suggest'
  },
  {
    key: SHARED_FIELD_KEYS.UNIT,
    label: 'Đơn vị tính',
    value_type: 'text',
    default_scope: SHARED_FIELD_SCOPES.farmType,
    mode: 'suggest'
  },
  {
    key: SHARED_FIELD_KEYS.WATER_PH,
    label: 'pH',
    value_type: 'number',
    default_scope: SHARED_FIELD_SCOPES.farm,
    mode: 'latest'
  },
  {
    key: SHARED_FIELD_KEYS.WATER_OXY,
    label: 'Oxy',
    value_type: 'number',
    default_scope: SHARED_FIELD_SCOPES.farm,
    mode: 'latest'
  },
  {
    key: SHARED_FIELD_KEYS.WATER_NH3,
    label: 'NH3',
    value_type: 'number',
    default_scope: SHARED_FIELD_SCOPES.farm,
    mode: 'latest'
  },
  {
    key: SHARED_FIELD_KEYS.WATER_NO2,
    label: 'NO2',
    value_type: 'number',
    default_scope: SHARED_FIELD_SCOPES.farm,
    mode: 'latest'
  },
  {
    key: SHARED_FIELD_KEYS.WATER_PO4,
    label: 'PO4',
    value_type: 'number',
    default_scope: SHARED_FIELD_SCOPES.farm,
    mode: 'latest'
  },
  {
    key: SHARED_FIELD_KEYS.WATER_H2S,
    label: 'H2S',
    value_type: 'number',
    default_scope: SHARED_FIELD_SCOPES.farm,
    mode: 'latest'
  },
  {
    key: SHARED_FIELD_KEYS.WATER_BOD5,
    label: 'BOD5',
    value_type: 'number',
    default_scope: SHARED_FIELD_SCOPES.farm,
    mode: 'latest'
  },
  {
    key: SHARED_FIELD_KEYS.WATER_ALKALINITY,
    label: 'Độ kiềm',
    value_type: 'number',
    default_scope: SHARED_FIELD_SCOPES.farm,
    mode: 'latest'
  },
  {
    key: SHARED_FIELD_KEYS.WATER_SALINITY,
    label: 'Độ mặn',
    value_type: 'number',
    default_scope: SHARED_FIELD_SCOPES.farm,
    mode: 'latest'
  },
  {
    key: SHARED_FIELD_KEYS.OIL_FAT,
    label: 'Dầu mỏ khoáng',
    value_type: 'text',
    default_scope: SHARED_FIELD_SCOPES.farm,
    mode: 'latest'
  },
  {
    key: SHARED_FIELD_KEYS.ODOR,
    label: 'Mùi - cảm quan',
    value_type: 'text',
    default_scope: SHARED_FIELD_SCOPES.farm,
    mode: 'latest'
  }
];

export const SHARED_FIELD_KEY_VALUES = Object.values(SHARED_FIELD_KEYS);

export const SHARED_FIELD_DEFINITION_MAP = new Map(SHARED_FIELD_DEFINITIONS.map((field) => [field.key, field]));

export const SHARED_FIELD_KEY_ALIASES = {
  product_name: SHARED_FIELD_KEYS.CHEMICAL_NAME,
  product_usage: SHARED_FIELD_KEYS.CHEMICAL_USAGE,
  manufacturer: SHARED_FIELD_KEYS.CHEMICAL_MANUFACTURER,
  seller: SHARED_FIELD_KEYS.CHEMICAL_SELLER,
  receiver: SHARED_FIELD_KEYS.CHEMICAL_RECEIVER,
  unit: SHARED_FIELD_KEYS.CHEMICAL_UNIT
} as const;

export const normalizeSharedFieldKey = (key: string) => {
  const normalizedKey = key.trim().toLowerCase();
  return SHARED_FIELD_KEY_ALIASES[normalizedKey as keyof typeof SHARED_FIELD_KEY_ALIASES] || normalizedKey;
};

export const NON_SHARED_FIELD_KEYS = {
  EVENT_TIME: 'event_time',
  MEASURE_TIME: 'measure_time',
  STOCK_DATE: 'stock_date',
  FEED_DATE: 'feed_date',
  CHECK_DATE: 'check_date',
  SALE_DATE: 'sale_date',
  MAINTENANCE_DATE: 'maintenance_date',
  WASTE_DATE: 'waste_date',
  WASTEWATER_DATE: 'wastewater_date',
  QUANTITY: 'quantity',
  FEED_AMOUNT: 'feed_amount',
  SEED_QUANTITY: 'seed_quantity',
  DEAD_COUNT: 'dead_count',
  DEAD_QUANTITY: 'dead_quantity',
  CURRENT_QUANTITY: 'current_quantity',
  AVERAGE_WEIGHT: 'average_weight',
  TOTAL_WEIGHT: 'total_weight',
  WEIGHT: 'weight',
  REVENUE: 'revenue',
  TOTAL_REVENUE: 'total_revenue',
  EXPENSE_AMOUNT: 'expense_amount',
  TOTAL_EXPENSE: 'total_expense',
  PROFIT: 'profit',
  RESULT: 'result',
  TREATMENT_RESULT: 'treatment_result',
  WATER_TREATMENT_RESULT: 'water_treatment_result',
  NOTE: 'note',
  FEED_NOTE: 'feed_note',
  SELLER: 'seller',
  RECEIVER: 'receiver',
  EXECUTOR: 'executor',
  INSPECTOR: 'inspector',
  HANDLER: 'handler',
  SEED_INVOICE: 'seed_invoice',
  EXPIRY_DATE: 'expiry_date'
} as const;

export const NON_SHARED_FIELD_KEY_VALUES = Object.values(NON_SHARED_FIELD_KEYS);

export const isSharedFieldKey = (key: string): key is SharedFieldKey => SHARED_FIELD_DEFINITION_MAP.has(key);

export const getSharedFieldDefinition = (key: string) => SHARED_FIELD_DEFINITION_MAP.get(key);
