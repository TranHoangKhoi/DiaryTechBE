import mongoose from 'mongoose';
import { IReportTemplate } from '../../models/ReportTemplate.model';
import ProductionLog from '../../models/ProductionLogs.model';
import ProductionBook from '../../models/ProductionBook.model';
import Farm from '../../models/Farm.model';

/**
 * Hàm hỗ trợ định dạng dữ liệu xuất:
 * - Chuyển ngày YYYY-MM-DD sang DD/MM/YYYY
 * - Format số (VD: 150000 -> 150.000)
 */
const formatExportData = (data: any) => {
  if (!data || typeof data !== 'object') return data;
  const formatted: any = {};
  for (const key in data) {
    let val = data[key];

    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}(T.*)?$/.test(val)) {
      const dateObj = new Date(val);
      if (!isNaN(dateObj.getTime())) {
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        val = `${day}/${month}/${year}`;
      }
    } else if (typeof val === 'number') {
      val = new Intl.NumberFormat('vi-VN').format(val);
    } else if (typeof val === 'string' && val.trim() !== '' && !isNaN(Number(val))) {
      // Không format các chuỗi số bắt đầu bằng 0 (SĐT) hoặc chỉ chứa khoảng trắng
      if (!val.startsWith('0')) {
        val = new Intl.NumberFormat('vi-VN').format(Number(val));
      }
    }
    formatted[key] = val;
  }
  return formatted;
};

/**
 * Hàm gom nhóm dữ liệu dạng chuỗi sự kiện 1-1
 * Có thể dùng chung cho nhiều loại Farm (Tôm, Cây, Cá...)
 * Ví dụ: Báo cáo Thả giống, Báo cáo cải tạo ao
 */
export const aggregateEventLog = async (
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
  })
    .sort({ date: 1 })
    .populate('created_by', 'name');

  // Lấy thông tin cuốn nhật ký và FarmZone liên kết
  const book = await ProductionBook.findById(bookId).populate('zone_id');
  const zone_name = book?.zone_id ? (book.zone_id as any).name : '';

  // Lấy thông tin Farm để lấy Chủ Farm (Owner) và Người dùng trực tiếp (User)
  const farm = await Farm.findById(farmId).populate('owner_id', 'name').populate('user_id', 'name');

  const farm_owner_name = farm?.owner_id ? (farm.owner_id as any).name : '';
  const farm_user_name = farm?.user_id ? (farm.user_id as any).name : '';

  const rows = logs.map((log) => {
    const day = String(log.date.getDate()).padStart(2, '0');
    const month = String(log.date.getMonth() + 1).padStart(2, '0');
    const year = log.date.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    const formattedData = formatExportData(log.data || {});

    // Xử lý đặc thù cho Nhật ký xử lý chất thải
    if (template.report_code === 'WASTE_PROCESSING_MONITORING_LOG') {
      if (!formattedData.amount || formattedData.amount === '0' || formattedData.amount === 0) {
        formattedData.amount = '';
        formattedData.chemical_unit = '';
      }
    }

    console.log('Formatted Data:', farm_user_name, formattedData);

    return {
      date: formattedDate,
      zone_name: zone_name,
      farm_owner_name: farm_owner_name,
      farm_user_name: farm_user_name,
      ...formatExportData(book?.general_info || {}),
      ...formattedData,
      created_by_name: (log.created_by as any)?.name || ''
    };
  });

  return { rows, add_names: [] };
};
