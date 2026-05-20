import mongoose, { Document } from 'mongoose';

export type MapFeatureType = 'farm' | 'poi' | 'road' | 'river' | 'boundary' | 'hamlet' | 'marker' | 'label' | 'custom';
export type MapFeatureStatus = 'active' | 'inactive';

export interface IMapFeature extends Document {
  tenant_id: mongoose.Types.ObjectId;
  feature_type: MapFeatureType;
  layer_key: string;
  name: string;
  external_ref?: string;
  farm_id?: mongoose.Types.ObjectId | null;
  geometry: {
    type: 'Point' | 'LineString' | 'Polygon' | 'MultiPolygon';
    coordinates: unknown;
  };
  properties?: Record<string, unknown>;
  icon_key?: string;
  color?: string;
  status: MapFeatureStatus;
  is_active: boolean;
  is_public: boolean;
  sort_order: number;
  source_type?: string;
  source_ref?: string;
  created_at: Date;
  updated_at: Date;
}

const MapFeatureSchema = new mongoose.Schema<IMapFeature>(
  {
    tenant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MapTenant',
      required: true
    },
    feature_type: {
      type: String,
      enum: ['farm', 'poi', 'road', 'river', 'boundary', 'hamlet', 'marker', 'label', 'custom'],
      required: true
    },
    layer_key: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    external_ref: { type: String, default: '' },
    farm_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', default: null },
    geometry: {
      type: {
        type: String,
        enum: ['Point', 'LineString', 'Polygon', 'MultiPolygon'],
        required: true
      },
      coordinates: {
        type: mongoose.Schema.Types.Mixed,
        required: true
      }
    },
    properties: { type: mongoose.Schema.Types.Mixed, default: undefined },
    icon_key: { type: String, default: '' },
    color: { type: String, default: '' },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    is_active: { type: Boolean, default: true },
    is_public: { type: Boolean, default: true },
    sort_order: { type: Number, default: 0 },
    source_type: { type: String, default: '' },
    source_ref: { type: String, default: '' }
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
);

MapFeatureSchema.index({ tenant_id: 1, feature_type: 1, status: 1 });
MapFeatureSchema.index({ tenant_id: 1, layer_key: 1 });
MapFeatureSchema.index({ tenant_id: 1, is_active: 1 });
MapFeatureSchema.index({ tenant_id: 1, is_public: 1 });
MapFeatureSchema.index({ geometry: '2dsphere' });

export default mongoose.model<IMapFeature>('MapFeature', MapFeatureSchema);
