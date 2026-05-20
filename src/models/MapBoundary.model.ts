import mongoose, { Document } from 'mongoose';

export type MapBoundaryLevel = 'country' | 'province' | 'district' | 'ward' | 'custom';
export type MapBoundarySourceType = 'manual' | 'geojson' | 'osm' | 'import';

export interface IMapBoundary extends Document {
  tenant_id: mongoose.Types.ObjectId;
  name: string;
  level: MapBoundaryLevel;
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
  bbox?: [number, number, number, number] | null;
  source_type: MapBoundarySourceType;
  source_ref?: string;
  is_primary: boolean;
  is_active: boolean;
  meta?: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

const MapBoundarySchema = new mongoose.Schema<IMapBoundary>(
  {
    tenant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MapTenant',
      required: true
    },
    name: { type: String, required: true, trim: true },
    level: {
      type: String,
      enum: ['country', 'province', 'district', 'ward', 'custom'],
      required: true
    },
    geometry: {
      type: {
        type: String,
        enum: ['Polygon', 'MultiPolygon'],
        required: true
      },
      coordinates: {
        type: mongoose.Schema.Types.Mixed,
        required: true
      }
    },
    bbox: {
      type: [Number],
      default: null
    },
    source_type: {
      type: String,
      enum: ['manual', 'geojson', 'osm', 'import'],
      default: 'import'
    },
    source_ref: { type: String, default: '' },
    is_primary: { type: Boolean, default: false },
    is_active: { type: Boolean, default: true },
    meta: { type: mongoose.Schema.Types.Mixed, default: undefined }
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
);

MapBoundarySchema.index({ tenant_id: 1, level: 1 });
MapBoundarySchema.index({ tenant_id: 1, is_primary: 1 });
MapBoundarySchema.index({ tenant_id: 1, is_active: 1 });
MapBoundarySchema.index({ geometry: '2dsphere' });

export default mongoose.model<IMapBoundary>('MapBoundary', MapBoundarySchema);
