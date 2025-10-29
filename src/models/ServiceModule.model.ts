// Danh sách chức năng có thể thuê

import mongoose, { Document } from 'mongoose';

export interface IServiceModule extends Document {
  key: string; // "farm_diary", "agri_map", "trace_origin"
  name: string; // Nhật ký điện tử, Bản đồ số, Truy xuất nguồn gốc
  description?: string;
  is_active: boolean;
}

const ServiceModuleSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  is_active: { type: Boolean, default: true }
});

export default mongoose.model<IServiceModule>('ServiceModule', ServiceModuleSchema);
