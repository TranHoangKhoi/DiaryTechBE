export const MODULE_KEYS = {
  farmDiary: 'farm_diary',
  agriMap: 'agri_map',
  traceOrigin: 'trace_origin'
} as const;

export const MODULE_KEY_VALUES = Object.values(MODULE_KEYS);

export type ModuleKey = (typeof MODULE_KEYS)[keyof typeof MODULE_KEYS];
