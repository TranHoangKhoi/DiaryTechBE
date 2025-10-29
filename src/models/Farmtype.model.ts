import mongoose, { Document } from 'mongoose';

interface IFarmType extends Document {
  type_name: string;
  image: string;
  description: string;
  created_at: Date;
  updated_at: Date;
}

const FarmTypeSchema = new mongoose.Schema({
  type_name: { type: String, required: true },
  image: { type: String, required: true },
  description: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

export default mongoose.model<IFarmType>('Farmtype', FarmTypeSchema);
