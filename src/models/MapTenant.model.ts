import mongoose, { Document } from 'mongoose';

export type MapTenantType = 'global' | 'province' | 'district' | 'ward' | 'customer';
export type MapTenantStatus = 'active' | 'inactive' | 'archived';

export interface IMapTenant extends Document {
  name: string;
  slug: string;
  code: string;
  type: MapTenantType;
  status: MapTenantStatus;
  description?: string;
  logo?: string;
  theme?: {
    primary_color?: string;
    secondary_color?: string;
    accent_color?: string;
    map_style?: string;
  };
  meta?: Record<string, unknown> | null;
  owner_user_id?: mongoose.Types.ObjectId | null;
  default_profile_id?: mongoose.Types.ObjectId | null;
  region_code?: string | null;
  created_at: Date;
  updated_at: Date;
}

const MapTenantThemeSchema = new mongoose.Schema(
  {
    primary_color: { type: String },
    secondary_color: { type: String },
    accent_color: { type: String },
    map_style: { type: String }
  },
  { _id: false }
);

const MapTenantSchema = new mongoose.Schema<IMapTenant>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    code: { type: String, required: true, trim: true, uppercase: true },
    type: {
      type: String,
      enum: ['global', 'province', 'district', 'ward', 'customer'],
      required: true
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'archived'],
      default: 'active'
    },
    description: { type: String, default: '' },
    logo: { type: String, default: '' },
    theme: { type: MapTenantThemeSchema, default: undefined },
    meta: { type: mongoose.Schema.Types.Mixed, default: undefined },
    owner_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    default_profile_id: { type: mongoose.Schema.Types.ObjectId, ref: 'MapProfile', default: null },
    region_code: { type: String, default: null }
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
);

MapTenantSchema.index({ slug: 1 }, { unique: true });
MapTenantSchema.index({ code: 1 }, { unique: true });
MapTenantSchema.index({ type: 1, status: 1 });
MapTenantSchema.index({ owner_user_id: 1 });

export default mongoose.model<IMapTenant>('MapTenant', MapTenantSchema);
