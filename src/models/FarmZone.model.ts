import mongoose, { Document } from 'mongoose';

export interface IFarmZone extends Document {
  farm_id: mongoose.Types.ObjectId;
  farm_type_id: mongoose.Types.ObjectId;
  name: string;
  zone_type: string;
  area?: number;
  unit?: string;
  status: 'active' | 'inactive' | 'under_maintenance';
  properties: Record<string, any>;
  species: string;
  coordinates: number[];
  polygon?: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  images?: string[];
  created_by: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

const FarmZoneSchema = new mongoose.Schema<IFarmZone>(
  {
    farm_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },
    farm_type_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmtype', required: true },
    name: { type: String, required: true },
    zone_type: { type: String, default: 'pond' },
    area: { type: Number, default: 0 },
    unit: { type: String, default: 'm2' },
    status: {
      type: String,
      enum: ['active', 'inactive', 'under_maintenance'],
      default: 'active'
    },
    properties: { type: mongoose.Schema.Types.Mixed, default: {} },
    species: { type: String, required: true },
    coordinates: { type: [Number], required: true },
    polygon: {
      type: {
        type: String,
        enum: ['Polygon']
      },
      coordinates: {
        type: [[[Number]]]
      }
    },
    images: { type: [String], default: [] },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

FarmZoneSchema.index({ farm_id: 1 });
FarmZoneSchema.index({ farm_type_id: 1 });
FarmZoneSchema.index({ coordinates: '2dsphere' });
FarmZoneSchema.index({ polygon: '2dsphere' });

export default mongoose.model<IFarmZone>('FarmZone', FarmZoneSchema);
