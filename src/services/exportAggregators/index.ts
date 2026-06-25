import { aggregateShrimpDailyLog } from './shrimp.aggregator';
import { aggregateEventLog } from './common.aggregator';
import { aggregateInventoryMaterial } from './inventory.aggregator';

export type ReportAggregatorFunction = (
  template: any,
  farmId: string,
  bookId: string,
  startDate: Date,
  endDate: Date
) => Promise<any>;

/**
 * Bộ chia (Factory/Registry) kết nối tên hàm cấu hình trên DB
 * với logic xử lý code thực tế.
 */
export const ReportAggregatorFactory: Record<string, ReportAggregatorFunction> = {
  // Tương thích ngược: Khi template cũ đang dùng key 'aggregateDailyLog' sẽ mapping sang hàm của Tôm
  aggregateDailyLog: aggregateShrimpDailyLog,

  // Tên mới chuẩn
  aggregateShrimpDailyLog: aggregateShrimpDailyLog,

  // Hàm chung
  aggregateEventLog: aggregateEventLog,

  // Hàm xuất kho vật tư
  aggregateInventoryMaterial: aggregateInventoryMaterial
};
