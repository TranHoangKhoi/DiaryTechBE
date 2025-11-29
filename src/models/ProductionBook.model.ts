import mongoose, { Document } from 'mongoose';

export interface IProductionBook extends Document {
  farm_id: mongoose.Types.ObjectId;
  farm_type_id: mongoose.Types.ObjectId;
  name: string; // "Vụ mùa xuân 2025" hoặc "Ao 1"
  description?: string;
  production: string;
  image: string;
  start_date: Date;
  end_date?: Date;
  status: 'ongoing' | 'completed';
  created_by: mongoose.Types.ObjectId;
  general_info?: Record<string, any>;
}

const ProductionBookSchema = new mongoose.Schema<IProductionBook>(
  {
    farm_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },
    farm_type_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmtype', required: true },
    name: { type: String, required: true },
    production: { type: String, required: true },
    description: { type: String },
    image: { type: String, default: 'https://res.cloudinary.com/delix6nht/image/upload/v1760068625/3_xs0l5w.png' },
    start_date: { type: Date, required: true },
    end_date: { type: Date },
    status: { type: String, enum: ['ongoing', 'completed'], default: 'ongoing' },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    general_info: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

// Index gợi ý
ProductionBookSchema.index({ farm_id: 1, status: 1 });
ProductionBookSchema.index({ created_by: 1 });
ProductionBookSchema.index({ start_date: -1 });

export default mongoose.model<IProductionBook>('ProductionBook', ProductionBookSchema);
