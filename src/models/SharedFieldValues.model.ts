import mongoose, { Document } from 'mongoose';
import {
  SHARED_FIELD_KEY_VALUES,
  SHARED_FIELD_SCOPES,
  SharedFieldKey,
  SharedFieldScope,
  SharedFieldValueType
} from '~/constants/sharedFieldKeys';

export interface ISharedFieldValue extends Document {
  scope_type: SharedFieldScope;
  scope_id: mongoose.Types.ObjectId;
  farm_id?: mongoose.Types.ObjectId | null;
  farm_type_id?: mongoose.Types.ObjectId | null;
  field_key: SharedFieldKey;
  field_label: string;
  field_type: SharedFieldValueType;
  value: unknown;
  value_text?: string;
  value_number?: number;
  value_date?: Date;
  value_hash: string;
  source_activity_id?: mongoose.Types.ObjectId | null;
  source_log_id?: mongoose.Types.ObjectId | null;
  source_book_id?: mongoose.Types.ObjectId | null;
  usage_count: number;
  last_used_at: Date;
  created_at: Date;
  updated_at: Date;
}

const SharedFieldValueSchema = new mongoose.Schema<ISharedFieldValue>(
  {
    scope_type: {
      type: String,
      enum: Object.values(SHARED_FIELD_SCOPES),
      required: true
    },
    scope_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    farm_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      default: null
    },
    farm_type_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmtype',
      default: null
    },
    field_key: {
      type: String,
      enum: SHARED_FIELD_KEY_VALUES,
      required: true,
      trim: true
    },
    field_label: {
      type: String,
      required: true,
      trim: true
    },
    field_type: {
      type: String,
      enum: ['text', 'number', 'date', 'select', 'textarea', 'image', 'boolean'],
      required: true
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    value_text: {
      type: String,
      trim: true
    },
    value_number: {
      type: Number
    },
    value_date: {
      type: Date
    },
    value_hash: {
      type: String,
      required: true,
      trim: true
    },
    source_activity_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Activities',
      default: null
    },
    source_log_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductionLog',
      default: null
    },
    source_book_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductionBook',
      default: null
    },
    usage_count: {
      type: Number,
      default: 1,
      min: 1
    },
    last_used_at: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
);

SharedFieldValueSchema.index(
  { scope_type: 1, scope_id: 1, field_key: 1, value_hash: 1 },
  { unique: true }
);
SharedFieldValueSchema.index({ scope_type: 1, scope_id: 1, field_key: 1, last_used_at: -1 });
SharedFieldValueSchema.index({ farm_id: 1, field_key: 1, last_used_at: -1 });
SharedFieldValueSchema.index({ farm_type_id: 1, field_key: 1, last_used_at: -1 });
SharedFieldValueSchema.index({ source_log_id: 1 });

SharedFieldValueSchema.pre('validate', function (next) {
  if (this.scope_type === SHARED_FIELD_SCOPES.farm) {
    if (!this.farm_id) {
      this.invalidate('farm_id', 'farm_id is required when scope_type is farm');
      next();
      return;
    }

    this.scope_id = this.farm_id;
  }

  if (this.scope_type === SHARED_FIELD_SCOPES.farmType) {
    if (!this.farm_type_id) {
      this.invalidate('farm_type_id', 'farm_type_id is required when scope_type is farm_type');
      next();
      return;
    }

    this.scope_id = this.farm_type_id;
  }

  next();
});

export default mongoose.model<ISharedFieldValue>('SharedFieldValue', SharedFieldValueSchema);
