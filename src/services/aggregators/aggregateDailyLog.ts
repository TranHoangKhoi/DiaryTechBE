import ProductionLog from '../../models/ProductionLogs.model';
import mongoose from 'mongoose';

export const aggregateDailyLog = async (book_id: string, activity_ids: string[], padEmptyRows: number) => {
  const logs = await ProductionLog.find({
    book_id: new mongoose.Types.ObjectId(book_id),
    activity_id: { $in: activity_ids.map(id => new mongoose.Types.ObjectId(id)) }
  }).sort({ date: 1 });

  // Bước 1: Thu thập danh sách các chất bổ sung
  const additiveSet = new Set<string>();
  logs.forEach(log => {
    if (log.data?.class === 'Chất bổ xung') {
      const name = log.data.feed_additive_1 || log.data.feed_code;
      if (name) additiveSet.add(String(name).trim());
    }
  });

  const add_names = Array.from(additiveSet);

  // Bước 2: Gom nhóm dữ liệu theo ngày
  const groupedByDate: Record<string, any> = {};

  logs.forEach(log => {
    const dateStr = new Date(log.date).toISOString().split('T')[0];
    
    if (!groupedByDate[dateStr]) {
      groupedByDate[dateStr] = {
        date: dateStr,
        feed_amount: null,
        feed_code: '',
        feeding_note: '',
        dead_count: null,
        symptom_diagnosis: '',
        ph: null,
        oxy: null,
        salinity: null,
        alkalinity: null,
        nh3: null,
        clo: null,
        em: null,
        cao: null,
        result: '',
        additives: {} as Record<string, number>
      };
    }

    const row = groupedByDate[dateStr];
    const data = log.data || {};

    // Gán dữ liệu dựa theo trường
    if (data.class === 'Thức ăn') {
      if (data.feed_amount) row.feed_amount = (row.feed_amount || 0) + Number(data.feed_amount);
      if (data.feed_code) row.feed_code = row.feed_code ? `${row.feed_code}, ${data.feed_code}` : data.feed_code;
      if (data.feeding_note) row.feeding_note = data.feeding_note;
      if (data.dead_count) row.dead_count = data.dead_count;
      if (data.symptom_diagnosis) row.symptom_diagnosis = data.symptom_diagnosis;
    } else if (data.class === 'Chất bổ xung') {
      const name = String(data.feed_additive_1 || data.feed_code || '').trim();
      if (name && data.feed_amount) {
        row.additives[name] = (row.additives[name] || 0) + Number(data.feed_amount);
      }
    } else {
      // Dữ liệu đo kiểm tra
      if (data.ph !== undefined) row.ph = data.ph;
      if (data.oxy !== undefined) row.oxy = data.oxy;
      if (data.salinity !== undefined) row.salinity = data.salinity;
      if (data.alkalinity !== undefined) row.alkalinity = data.alkalinity;
      if (data.nh3 !== undefined) row.nh3 = data.nh3;
      if (data.clo !== undefined) row.clo = data.clo;
      if (data.em !== undefined) row.em = data.em;
      if (data.cao !== undefined) row.cao = data.cao;
      if (data.result !== undefined) row.result = data.result;
      
      // Merge ghi chú nếu có
      if (data.feeding_note) row.feeding_note = row.feeding_note ? `${row.feeding_note}\n${data.feeding_note}` : data.feeding_note;
      if (data.dead_count) row.dead_count = data.dead_count;
      if (data.symptom_diagnosis) row.symptom_diagnosis = row.symptom_diagnosis ? `${row.symptom_diagnosis}\n${data.symptom_diagnosis}` : data.symptom_diagnosis;
    }
  });

  // Bước 3: Chuyển object thành array và làm phẳng (flatten) mảng additives
  const rows = Object.values(groupedByDate).map(row => {
    const flatRow: any = { ...row };
    delete flatRow.additives;
    
    // Khởi tạo các biến add_amt_1, add_amt_2... dựa trên danh sách add_names
    add_names.forEach((name, index) => {
      flatRow[`add_amt_${index + 1}`] = row.additives[name] || null;
    });
    
    return flatRow;
  });

  // Bước 4: Chèn các dòng rỗng (Padding) nếu cần
  if (rows.length < padEmptyRows) {
    const paddingCount = padEmptyRows - rows.length;
    for (let i = 0; i < paddingCount; i++) {
      const emptyRow: any = { date: '' };
      add_names.forEach((name, index) => {
        emptyRow[`add_amt_${index + 1}`] = null;
      });
      rows.push(emptyRow);
    }
  }

  return { rows, add_names };
};
