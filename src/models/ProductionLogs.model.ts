import mongoose, { Document } from 'mongoose';

interface IProductionLog extends Document {
  farm_id: string;
  activity_id: string;
  date: Date;
  data: []; // dữ liệu form động
  // chemical_usages: [
  //   {
  //     chemical_id: string;
  //     quantity: number;
  //     unit: string;
  //     application_date: Date;
  //     notes: string;
  //   }
  // ];
  notes: string;
  created_by: Date;
  created_at: Date;
  updated_at: Date;
}

const ProductionLogSchema = new mongoose.Schema({
  farm_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },
  activity_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Activities', required: true },
  date: { type: Date, required: true },
  data: { type: Object, default: {} }, // dữ liệu form động
  // chemical_usages: [
  //   {
  //     chemical_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Chemical', required: true },
  //     quantity: { type: Number, required: true },
  //     unit: { type: String, required: true },
  //     application_date: { type: Date, required: true },
  //     notes: { type: String }
  //   }
  // ],
  notes: { type: String },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

export default mongoose.model<IProductionLog>('ProductionLog', ProductionLogSchema);
