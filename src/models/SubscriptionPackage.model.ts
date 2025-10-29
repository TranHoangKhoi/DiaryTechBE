// Gói thuê cụ thể cho từng module

import mongoose, { Document } from 'mongoose';

export interface ISubscriptionPackage extends Document {
  module_id: mongoose.Types.ObjectId; // liên kết đến ServiceModule
  name: string; // Gói Basic / Pro / Enterprise
  max_sub_accounts: number;
  price_per_month: number;
  duration_in_days: number; // ví dụ 30, 90, 365
  description?: string;
}

const SubscriptionPackageSchema = new mongoose.Schema({
  module_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceModule', required: true },
  name: { type: String, required: true },
  max_sub_accounts: { type: Number, default: 1 },
  price_per_month: { type: Number, required: true },
  duration_in_days: { type: Number, required: true },
  description: { type: String }
});

export default mongoose.model<ISubscriptionPackage>('SubscriptionPackage', SubscriptionPackageSchema);
