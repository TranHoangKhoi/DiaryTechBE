import mongoose, { Document } from 'mongoose';

interface IProvince {
  province_code: string;
  name: string;
}

interface IWard {
  ward_name: string;
  ward_code: string;
  province_code: string;
  province_name: string;
  province_short_name: string;
  province_code_short: string;
  place_type: string;
  has_merger: boolean;
  old_units: string[];
  old_units_count: number;
  merger_details: string;
  province_is_merged: boolean;
  province_merged_with: string[];
  administrative_center: string;
}

export interface IFarm extends Document {
  // owner_id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  farm_name: string;
  location: string;
  farm_type_id: mongoose.Types.ObjectId;
  geo_location?: string;
  area: number;
  avatar: string;
  soil_type?: string;
  farm_status: 'active' | 'inactive' | 'under_maintenance';
  description?: string;
  province: IProvince;
  ward: IWard;
  created_at: Date;
  updated_at: Date;
}

// SubSchema cho province
const ProvinceSchema = new mongoose.Schema<IProvince>(
  {
    province_code: { type: String, required: true },
    name: { type: String, required: true }
  },
  { _id: false } // không tạo _id riêng cho subdocument
);

// SubSchema cho ward
const WardSchema = new mongoose.Schema<IWard>(
  {
    ward_name: { type: String, required: true },
    ward_code: { type: String, required: true },
    province_code: { type: String, required: true },
    province_name: { type: String, required: true },
    province_short_name: { type: String },
    province_code_short: { type: String },
    place_type: { type: String },
    has_merger: { type: Boolean, default: false },
    old_units: { type: [String], default: [] },
    old_units_count: { type: Number, default: 0 },
    merger_details: { type: String },
    province_is_merged: { type: Boolean, default: false },
    province_merged_with: { type: [String], default: [] },
    administrative_center: { type: String }
  },
  { _id: false }
);

const FarmSchema = new mongoose.Schema<IFarm>({
  // owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  farm_name: { type: String, required: true },
  location: { type: String, required: true },
  farm_type_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmtype',
    required: true
  },
  geo_location: { type: String },
  area: { type: Number, required: true },
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
