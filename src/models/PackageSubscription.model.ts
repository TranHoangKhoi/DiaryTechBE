import mongoose, { Document } from 'mongoose';

export interface IPackageSubscription extends Document {
  owner_id: mongoose.Types.ObjectId;
  package_id: mongoose.Types.ObjectId;
  purchase_date: Date;
  expiry_date: Date;
  status: 'active' | 'expired' | 'cancelled';
  sub_accounts_allowed: number;
  sub_accounts_created: number;
  created_at: Date;
  updated_at: Date;
}

const PackageSubscriptionSchema = new mongoose.Schema<IPackageSubscription>({
  owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  package_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
  purchase_date: { type: Date, required: true },
  expiry_date: { type: Date, required: true },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active'
  },
  sub_accounts_allowed: { type: Number, required: true },
  sub_accounts_created: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

export default mongoose.model<IPackageSubscription>('PackageSubscription', PackageSubscriptionSchema);
