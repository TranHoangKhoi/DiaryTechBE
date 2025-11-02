import mongoose, { Document } from 'mongoose';

interface IProvince {
  id: string;
  province_code: string;
  name: string;
  short_name: string;
  code: string;
  place_type: string;
  country: string;
  created_at: string | null;
  updated_at: string | null;
}

interface IWard {
  id: string;
  ward_code: string;
  name: string;
  province_code: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface IFarm extends Document {
  owner_id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  farm_name: string;
  location: string;
  farm_type_id: mongoose.Types.ObjectId;
  geo_location?: string;
  area: string;
  avatar: string;
  soil_type?: string;
  farm_status: 'active' | 'inactive' | 'under_maintenance';
  description?: string;
  province: IProvince;
  ward: IWard;
  created_at: Date;
  updated_at: Date;
}

// ✅ SubSchema cho Ward
const WardSchema = new mongoose.Schema<IWard>(
  {
    id: { type: String },
    ward_code: { type: String, required: true },
    name: { type: String, required: true },
    province_code: { type: String, required: true },
    created_at: { type: String, default: null },
    updated_at: { type: String, default: null }
  },
  { _id: false }
);

// ✅ SubSchema cho Province
const ProvinceSchema = new mongoose.Schema<IProvince>(
  {
    id: { type: String },
    province_code: { type: String, required: true },
    name: { type: String, required: true },
    short_name: { type: String },
    code: { type: String },
    place_type: { type: String },
    country: { type: String, default: 'VN' },
    created_at: { type: String, default: null },
    updated_at: { type: String, default: null }
  },
  { _id: false }
);

// SubSchema cho ward

const FarmSchema = new mongoose.Schema<IFarm>({
  owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  farm_name: { type: String, required: true },
  location: { type: String, required: true },
  farm_type_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmtype',
    required: true
  },
  geo_location: { type: [Number] },
  area: { type: String },
  soil_type: { type: String },
  farm_status: {
    type: String,
    enum: ['active', 'inactive', 'under_maintenance'],
    default: 'active'
  },
  description: { type: String },
  avatar: { type: String, required: true },
  province: { type: ProvinceSchema, required: true },
  ward: { type: WardSchema, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

export default mongoose.model<IFarm>('Farm', FarmSchema);
