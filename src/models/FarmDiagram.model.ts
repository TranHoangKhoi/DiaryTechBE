import mongoose, { Document } from 'mongoose';

export type FarmDiagramType = 'ao_lang' | 'ao_san_sang' | 'ao_bun' | 'kenh_cap' | 'kenh_thai' | 'choi' | 'diem_lay_mau' | 'other';

export interface IFarmDiagram extends Document {
  farm_id: mongoose.Types.ObjectId;
  name: string;
  type: FarmDiagramType;
  area: number;
  unit: string;
  coordinates: number[];
  polygon?: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  properties?: Record<string, any>;
  created_by: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

const FarmDiagramSchema = new mongoose.Schema<IFarmDiagram>(
  {
    farm_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['ao_lang', 'ao_san_sang', 'ao_bun', 'kenh_cap', 'kenh_thai', 'choi', 'diem_lay_mau', 'other'],
      required: true
    },
    area: { type: Number, default: 0 },
    unit: { type: String, default: 'm2' },
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
    properties: { type: mongoose.Schema.Types.Mixed, default: {} },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

FarmDiagramSchema.index({ farm_id: 1 });
FarmDiagramSchema.index({ type: 1 });
FarmDiagramSchema.index({ coordinates: '2dsphere' });
FarmDiagramSchema.index({ polygon: '2dsphere' });

export default mongoose.model<IFarmDiagram>('FarmDiagram', FarmDiagramSchema);
