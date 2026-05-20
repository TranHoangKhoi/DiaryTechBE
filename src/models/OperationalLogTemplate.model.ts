import mongoose from 'mongoose';

export type OperationalFieldType = 'text' | 'number' | 'date' | 'select' | 'textarea' | 'image' | 'boolean';
export type OperationalSchemaItemType = 'section' | 'table';
export type OperationalTemplateStatus = 'draft' | 'active' | 'archived';

export interface IOperationalTemplateOption {
  label: string;
  value: string;
}

export interface IOperationalTemplateField {
  key: string;
  label: string;
  type: OperationalFieldType;
  required: boolean;
  options: IOperationalTemplateOption[];
  unit?: string;
  placeholder?: string;
}

export interface IOperationalTemplateSchemaItem {
  key: string;
  name: string;
  type: OperationalSchemaItemType;
  fields: IOperationalTemplateField[];
  columns: IOperationalTemplateField[];
}

export interface IOperationalLogTemplate {
  farm_type_id?: mongoose.Types.ObjectId | null;
  domain: string;
  category: string;
  key: string;
  name: string;
  description?: string;
  schema: IOperationalTemplateSchemaItem[];
  version: number;
  status: OperationalTemplateStatus;
  created_by: mongoose.Types.ObjectId;
}

const OperationalTemplateOptionSchema = new mongoose.Schema<IOperationalTemplateOption>(
  {
    label: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true }
  },
  { _id: false }
);

const OperationalTemplateFieldSchema = new mongoose.Schema<IOperationalTemplateField>(
  {
    key: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['text', 'number', 'date', 'select', 'textarea', 'image', 'boolean'],
      required: true
    },
    required: { type: Boolean, default: false },
    options: { type: [OperationalTemplateOptionSchema], default: [] },
    unit: { type: String, trim: true },
    placeholder: { type: String, trim: true }
  },
  { _id: false }
);

const OperationalTemplateSchemaItemSchema = new mongoose.Schema<IOperationalTemplateSchemaItem>(
  {
    key: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['section', 'table'], required: true },
    fields: { type: [OperationalTemplateFieldSchema], default: [] },
    columns: { type: [OperationalTemplateFieldSchema], default: [] }
  },
  { _id: false }
);

const OperationalLogTemplateSchema = new mongoose.Schema<IOperationalLogTemplate>(
  {
    farm_type_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmtype', default: null },
    domain: { type: String, required: true, trim: true, lowercase: true },
    category: { type: String, required: true, trim: true, lowercase: true },
    key: { type: String, required: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    schema: { type: [OperationalTemplateSchemaItemSchema], default: [] },
    version: { type: Number, default: 1, min: 1 },
    status: { type: String, enum: ['draft', 'active', 'archived'], default: 'active' },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

OperationalLogTemplateSchema.index({ domain: 1, category: 1, status: 1 });
OperationalLogTemplateSchema.index({ farm_type_id: 1, status: 1 });
OperationalLogTemplateSchema.index({ domain: 1, category: 1, key: 1, version: 1 }, { unique: true });

export default mongoose.model<IOperationalLogTemplate>('OperationalLogTemplate', OperationalLogTemplateSchema);
