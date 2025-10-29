import mongoose, { Document } from 'mongoose';

interface IProvince {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  phone_code: number;
  wards: IWard[];
}

interface IWard {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  province_code: number;
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

const WardSchema = new mongoose.Schema<IWard>(
  {
    name: { type: String, required: true },
    code: { type: Number, required: true },
    division_type: { type: String, required: true },
    codename: { type: String, required: true },
    province_code: { type: Number, required: true }
  },
  { _id: false } // không tạo _id riêng cho subdocument
);

// SubSchema cho province
const ProvinceSchema = new mongoose.Schema<IProvince>(
  {
    name: { type: String, required: true },
    code: { type: Number, required: true },
    division_type: { type: String, required: true },
    codename: { type: String, required: true },
    phone_code: { type: Number, required: true },
    wards: { type: [WardSchema], required: true }
  },
  { _id: false } // không tạo _id riêng cho subdocument
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
