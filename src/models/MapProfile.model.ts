import mongoose, { Document } from 'mongoose';

export type MapProfileMode = 'global' | 'tenant';
export type MapProfileSourceMode = 'farm' | 'feature' | 'mixed';
export type MapLayerSourceType = 'farm' | 'boundary' | 'feature' | 'external';

export interface IMapLayerConfig {
  key: string;
  name: string;
  source_type: MapLayerSourceType;
  source_ref?: string;
  visible: boolean;
  order: number;
  paint?: Record<string, unknown>;
  layout?: Record<string, unknown>;
}

export interface IMapProfile extends Document {
  tenant_id: mongoose.Types.ObjectId;
  code: string;
  name: string;
  mode: MapProfileMode;
  source_mode: MapProfileSourceMode;
  style_id: string;
  center: [number, number];
  zoom: number;
  min_zoom: number;
  max_zoom: number;
  show_sidebar: boolean;
  show_legend: boolean;
  show_statistics: boolean;
  layers: IMapLayerConfig[];
  is_active: boolean;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

const MapLayerConfigSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    source_type: {
      type: String,
      enum: ['farm', 'boundary', 'feature', 'external'],
      required: true
    },
    source_ref: { type: String, default: '' },
    visible: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    paint: { type: mongoose.Schema.Types.Mixed, default: undefined },
    layout: { type: mongoose.Schema.Types.Mixed, default: undefined }
  },
  { _id: false }
);

const MapProfileSchema = new mongoose.Schema<IMapProfile>(
  {
    tenant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MapTenant',
      required: true
    },
    code: { type: String, required: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    mode: {
      type: String,
      enum: ['global', 'tenant'],
      required: true
    },
    source_mode: {
      type: String,
      enum: ['farm', 'feature', 'mixed'],
      default: 'feature'
    },
    style_id: { type: String, required: true, trim: true },
    center: {
      type: [Number],
      required: true,
      default: [106.6297, 10.8231]
    },
    zoom: { type: Number, default: 10 },
    min_zoom: { type: Number, default: 4 },
    max_zoom: { type: Number, default: 18 },
    show_sidebar: { type: Boolean, default: true },
    show_legend: { type: Boolean, default: true },
    show_statistics: { type: Boolean, default: true },
    layers: { type: [MapLayerConfigSchema], default: [] },
    is_active: { type: Boolean, default: true },
    description: { type: String, default: '' }
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
);

MapProfileSchema.index({ tenant_id: 1, code: 1 }, { unique: true });
MapProfileSchema.index({ tenant_id: 1, is_active: 1 });
MapProfileSchema.index({ mode: 1, is_active: 1 });

export default mongoose.model<IMapProfile>('MapProfile', MapProfileSchema);
