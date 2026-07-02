export const INVENTORY_CATEGORIES = [
  { value: 'feed', label: 'Thức ăn', domain: 'inventory' },
  { value: 'chemical', label: 'Hóa chất', domain: 'inventory' },
  { value: 'medicine', label: 'Thuốc / Chế phẩm', domain: 'inventory' },
  { value: 'seed', label: 'Con giống', domain: 'inventory' },
  { value: 'equipment', label: 'Thiết bị', domain: 'inventory' },
  { value: 'other', label: 'Khác', domain: 'inventory' }
];

export const INVENTORY_UNITS = [
  {
    type: 'mass',
    label: 'Khối lượng',
    base_unit: 'kg',
    units: [
      { value: 'g', label: 'Gam (g)', rate_to_base: 0.001 },
      { value: 'kg', label: 'Kilogram (kg)', rate_to_base: 1 },
      { value: 'ton', label: 'Tấn', rate_to_base: 1000 }
    ]
  },
  {
    type: 'volume',
    label: 'Thể tích',
    base_unit: 'l',
    units: [
      { value: 'l', label: 'Lít (l)', rate_to_base: 1 },
      { value: 'ml', label: 'Mililit (ml)', rate_to_base: 0.001 }
    ]
  },
  {
    type: 'quantity',
    label: 'Số lượng',
    base_unit: 'item',
    units: [
      { value: 'Cái', label: 'Cái', rate_to_base: 1 },
      { value: 'Con', label: 'Con', rate_to_base: 1 },
      { value: 'Gói', label: 'Gói', rate_to_base: 1 },
      { value: 'Bao', label: 'Bao', rate_to_base: 1 },
      { value: 'Thùng', label: 'Thùng', rate_to_base: null }
    ]
  }
];
