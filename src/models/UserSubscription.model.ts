// Bảng quản lý thuê bao của user
import mongoose, { Document } from 'mongoose';

export interface IUserSubscription extends Document {
  user_id: mongoose.Types.ObjectId; // chủ tài khoản thuê
  module_id: mongoose.Types.ObjectId;
  package_id: mongoose.Types.ObjectId;
  start_date: Date;
  end_date: Date;
  status: 'active' | 'expired' | 'pending' | 'revoked';
  max_sub_accounts: number;
  remaining_sub_accounts: number;
  module_config?: {
    farm_diary?: {
      max_sub_accounts: number;
    };
  };
  assigned_by: mongoose.Types.ObjectId;
  activated_at?: Date;
  revoked_at?: Date;
}

const UserSubscriptionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  module_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceModule', required: true },
  package_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPackage', required: true },
  start_date: { type: Date, default: Date.now },
  end_date: { type: Date, required: true },
  status: { type: String, enum: ['active', 'expired', 'pending', 'revoked'], default: 'active' },
  max_sub_accounts: { type: Number, default: 0 },
  remaining_sub_accounts: { type: Number, default: 0 },
  module_config: {
    farm_diary: {
      max_sub_accounts: { type: Number, default: 0 }
    }
  },
  assigned_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  activated_at: { type: Date, default: Date.now },
  revoked_at: { type: Date }
});

UserSubscriptionSchema.index({ user_id: 1 });
UserSubscriptionSchema.index({ module_id: 1 });
UserSubscriptionSchema.index({ package_id: 1 });
UserSubscriptionSchema.index({ status: 1 });
UserSubscriptionSchema.index({ end_date: -1 });
UserSubscriptionSchema.index({ user_id: 1, module_id: 1 });
UserSubscriptionSchema.index({ user_id: 1, status: 1, end_date: 1 });
UserSubscriptionSchema.index(
  { user_id: 1, module_id: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'active' }
  }
);

export default mongoose.model<IUserSubscription>('UserSubscription', UserSubscriptionSchema);
