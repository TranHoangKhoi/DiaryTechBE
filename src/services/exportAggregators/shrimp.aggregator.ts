import mongoose from 'mongoose';
import { IReportTemplate } from '../../models/ReportTemplate.model';
import ProductionLog from '../../models/ProductionLogs.model';
import InventoryMaterial from '../../models/InventoryMaterial.model';

/**
 * Hàm gom nhóm dữ liệu Hằng ngày chuyên biệt cho Tôm (Shrimp)
 * Xử lý đặc biệt: Pivot Chất bổ sung thành các cột động, mapping Vật tư.
 */
export const aggregateShrimpDailyLog = async (
  template: IReportTemplate,
  farmId: string,
  bookId: string | undefined | null,
  startDate: Date,
  endDate: Date
) => {
  if (!bookId) {
    throw new Error('Mẫu báo cáo này yêu cầu bắt buộc phải chọn một cuốn nhật ký cụ thể!');
  }

  const { activity_ids } = template.data_sources;

  const logs = await ProductionLog.find({
    farm_id: new mongoose.Types.ObjectId(farmId),
    book_id: new mongoose.Types.ObjectId(bookId),
    activity_id: { $in: activity_ids },
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: 1 });

  // Fetch materials for mapping code -> name
  const materials = await InventoryMaterial.find({ scope_id: new mongoose.Types.ObjectId(farmId) }).lean();
  const materialMap = new Map<string, string>();
  materials.forEach((m) => {
    materialMap.set(m.code, m.name);
  });

  // Bước 1: Thu thập danh sách các chất bổ sung và thức ăn đầu tiên
  const additiveSet = new Set<string>();
  let first_feed_name = '';

  logs.forEach((log) => {
    if (log.data?.class === 'Chất bổ xung') {
      const code = String(log.data.feed_additive_1 || log.data.feed_code || '').trim();
      const name = materialMap.get(code) || code;
      if (name) additiveSet.add(name);
    } else if (log.data?.class === 'Thức ăn') {
      if (!first_feed_name && log.data.feed_code) {
        const code = String(log.data.feed_code).trim();
        first_feed_name = materialMap.get(code) || code;
      }
    }
  });

  const add_names = Array.from(additiveSet);

  // Bước 2: Gom nhóm theo ngày
  const groupedByDate: Record<string, any> = {};

  logs.forEach((log) => {
    const dateStr = log.date.toLocaleDateString('vi-VN');

    if (!groupedByDate[dateStr]) {
      groupedByDate[dateStr] = {
        date: dateStr,
        additives: {} as Record<string, number>
      };
    }

    const row = groupedByDate[dateStr];
    const data = log.data || {};

    if (data.class === 'Thức ăn') {
      if (data.feed_amount) row.feed_amount = (row.feed_amount || 0) + Number(data.feed_amount);
      if (data.feed_code) {
        const name = materialMap.get(String(data.feed_code).trim()) || data.feed_code;
        row.feed_code = row.feed_code ? `${row.feed_code}, ${name}` : name;
      }
      if (data.feeding_note) row.feeding_note = data.feeding_note;
      if (data.dead_count) row.dead_count = data.dead_count;
      if (data.symptom_diagnosis) row.symptom_diagnosis = data.symptom_diagnosis;
    } else if (data.class === 'Chất bổ xung') {
      const code = String(data.feed_additive_1 || data.feed_code || '').trim();
      const name = materialMap.get(code) || code;
      if (name && data.feed_amount) {
        row.additives[name] = (row.additives[name] || 0) + Number(data.feed_amount);
      }
    } else {
      Object.assign(row, data);
    }
  });

  // Bước 3: Flatten mảng additives để dễ xử lý map cột
  const rows = Object.values(groupedByDate).map((row) => {
    const flatRow: any = { ...row };
    delete flatRow.additives;

    add_names.forEach((name, index) => {
      flatRow[`add_amt_${index + 1}`] = row.additives[name] || null;
    });

    return flatRow;
  });

  return { rows, add_names, first_feed_name };
};
