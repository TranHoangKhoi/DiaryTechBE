// Danh sách chức năng có thể thuê

import mongoose, { Document } from 'mongoose';
import { MODULE_KEY_VALUES } from '~/constants/moduleKeys';

export interface IServiceModule extends Document {
  key: string; // "farm_diary", "agri_map", "trace_origin"
  name: string; // Nhật ký điện tử, Bản đồ số, Truy xuất nguồn gốc
  description?: string;
  is_active: boolean;
  sort_order: number;
}

const ServiceModuleSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, enum: MODULE_KEY_VALUES },
  name: { type: String, required: true },
  description: { type: String },
  is_active: { type: Boolean, default: true },
  sort_order: { type: Number, default: 0 }
});

// ServiceModuleSchema.index({ key: 1 }, { unique: true }); // index này đã được tạo tự động bởi { unique: true } ở trên
ServiceModuleSchema.index({ is_active: 1 });
ServiceModuleSchema.index({ sort_order: 1 });

export default mongoose.model<IServiceModule>('ServiceModule', ServiceModuleSchema);
