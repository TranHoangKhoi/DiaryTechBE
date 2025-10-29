// Bảng quản lý thuê bao của user
import mongoose, { Document } from 'mongoose';

export interface IUserSubscription extends Document {
  user_id: mongoose.Types.ObjectId; // chủ tài khoản thuê
  module_id: mongoose.Types.ObjectId;
  package_id: mongoose.Types.ObjectId;
  start_date: Date;
  end_date: Date;
  status: 'active' | 'expired' | 'pending';
  remaining_sub_accounts: number;
}

const UserSubscriptionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  module_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceModule', required: true },
  package_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPackage', required: true },
  start_date: { type: Date, default: Date.now },
  end_date: { type: Date, required: true },
  status: { type: String, enum: ['active', 'expired', 'pending'], default: 'active' },
  remaining_sub_accounts: { type: Number, default: 0 }
});

export default mongoose.model<IUserSubscription>('UserSubscription', UserSubscriptionSchema);
