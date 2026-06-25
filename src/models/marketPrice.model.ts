import mongoose, { Document, Schema } from 'mongoose';
import { IUserProvince } from './User.model';

export interface IMarketPrice extends Document {
  name: string;
  price: number;
  unit: string;
  userId: mongoose.Types.ObjectId;
  province?: IUserProvince | null;
  date: Date;
  imageUrl?: string;
  type: string; // e.g. "Shrimp", "Fish"
  createdAt: Date;
  updatedAt: Date;
}

const ProvinceSchema = new mongoose.Schema<IUserProvince>(
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

const MarketPriceSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      default: 'kg',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    province: {
      type: ProvinceSchema,
      default: null,
    },
    date: {
      type: Date,
      required: true,
      index: true, // For fast querying by date
    },
    imageUrl: {
      type: String,
    },
    type: {
      type: String,
      required: true,
      default: 'Shrimp',
    },
  },
  { timestamps: true }
);

export const MarketPrice = mongoose.model<IMarketPrice>('MarketPrice', MarketPriceSchema);
