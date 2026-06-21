import mongoose, { Document, Schema } from 'mongoose';

export interface IMarketPrice extends Document {
  name: string;
  price: string;
  unit: string;
  region: string;
  date: Date;
  imageUrl?: string;
  source: string; // e.g. "Tepbac"
  type: string; // e.g. "tom", "ca"
  createdAt: Date;
  updatedAt: Date;
}

const MarketPriceSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: String, // String because it might be "120,000 - 130,000"
      required: true,
    },
    unit: {
      type: String,
      default: 'kg',
    },
    region: {
      type: String,
      default: 'Toàn quốc',
    },
    date: {
      type: Date,
      required: true,
      index: true, // For fast querying by date
    },
    imageUrl: {
      type: String,
    },
    source: {
      type: String,
      default: 'Tepbac',
    },
    type: {
      type: String,
      required: true,
      default: 'tom',
    },
  },
  { timestamps: true }
);

export const MarketPrice = mongoose.model<IMarketPrice>('MarketPrice', MarketPriceSchema);
