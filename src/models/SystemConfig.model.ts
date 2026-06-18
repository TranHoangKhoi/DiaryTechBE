import mongoose, { Document } from 'mongoose';

export interface ISystemConfig extends Document {
  allow_negative_stock: boolean;
  updated_at: Date;
}

const SystemConfigSchema = new mongoose.Schema<ISystemConfig>(
  {
    allow_negative_stock: { type: Boolean, default: false },
    updated_at: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model<ISystemConfig>('SystemConfig', SystemConfigSchema);
