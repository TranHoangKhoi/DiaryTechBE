import mongoose, { Document } from 'mongoose';

export type MapAssistantScopeType = 'ward' | 'hamlet' | 'feature';
export type MapAssistantStatus = 'active' | 'inactive';

export interface IMapAssistantHighlight {
  label: string;
  detail: string;
}

export interface IMapAssistantStep {
  id: string;
  title: string;
  description: string;
  speech: string;
  sort_order: number;
}

export interface IMapAssistantContent extends Document {
  tenant_id: mongoose.Types.ObjectId;
  scope_type: MapAssistantScopeType;
  target_key: string;
  target_feature_id?: mongoose.Types.ObjectId | null;
  locale: string;
  context_label: string;
  title: string;
  summary: string;
  speech: string;
  highlights: IMapAssistantHighlight[];
  steps: IMapAssistantStep[];
  hint?: string;
  status: MapAssistantStatus;
  is_active: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

const MapAssistantHighlightSchema = new mongoose.Schema<IMapAssistantHighlight>(
  {
    label: { type: String, required: true, trim: true },
    detail: { type: String, required: true, trim: true }
  },
  { _id: false }
);

const MapAssistantStepSchema = new mongoose.Schema<IMapAssistantStep>(
  {
    id: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    speech: { type: String, required: true, trim: true },
    sort_order: { type: Number, default: 0 }
  },
  { _id: false }
);

const MapAssistantContentSchema = new mongoose.Schema<IMapAssistantContent>(
  {
    tenant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MapTenant',
      required: true
    },
    scope_type: {
      type: String,
      enum: ['ward', 'hamlet', 'feature'],
      required: true
    },
    target_key: { type: String, required: true, trim: true, lowercase: true },
    target_feature_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MapFeature',
      default: null
    },
    locale: { type: String, default: 'vi-VN', trim: true },
    context_label: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    summary: { type: String, required: true, trim: true },
    speech: { type: String, required: true, trim: true },
    highlights: { type: [MapAssistantHighlightSchema], default: [] },
    steps: { type: [MapAssistantStepSchema], default: [] },
    hint: { type: String, default: '' },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    is_active: { type: Boolean, default: true },
    sort_order: { type: Number, default: 0 }
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
);

MapAssistantContentSchema.index(
  { tenant_id: 1, scope_type: 1, target_key: 1, locale: 1 },
  { unique: true }
);
MapAssistantContentSchema.index({ tenant_id: 1, scope_type: 1, is_active: 1, status: 1 });
MapAssistantContentSchema.index({ tenant_id: 1, target_feature_id: 1 });
MapAssistantContentSchema.index({ tenant_id: 1, sort_order: 1 });

export default mongoose.model<IMapAssistantContent>('MapAssistantContent', MapAssistantContentSchema);
