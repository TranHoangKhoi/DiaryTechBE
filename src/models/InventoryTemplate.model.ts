import mongoose from 'mongoose';

export type InventoryFieldType = 'text' | 'number' | 'date' | 'select' | 'textarea' | 'image' | 'boolean';
export type InventorySchemaItemType = 'section' | 'table';
export type InventoryTemplateStatus = 'draft' | 'active' | 'archived';

export interface IInventoryTemplateOption {
  label: string;
  value: string;
}

export interface IInventoryTemplateField {
  key: string;
  label: string;
  type: InventoryFieldType;
  required: boolean;
  options: IInventoryTemplateOption[];
  unit?: string;
  placeholder?: string;
  lookup?: {
    model: 'InventoryMaterial';
    scope?: 'farm' | 'farm_type';
    category?: string;
    auto_fill?: Record<string, string>;
  };
}

export interface IInventoryTemplateSchemaItem {
  key: string;
  name: string;
  type: InventorySchemaItemType;
  fields: IInventoryTemplateField[];
  columns: IInventoryTemplateField[];
}

export interface IInventoryTemplate {
  farm_type_id?: mongoose.Types.ObjectId | null;
  farm_id?: mongoose.Types.ObjectId | null;
  domain: string;
  category: string;
  key: string;
  name: string;
  description?: string;
  schema: IInventoryTemplateSchemaItem[];
  version: number;
  status: InventoryTemplateStatus;
  created_by: mongoose.Types.ObjectId;
}

const InventoryTemplateOptionSchema = new mongoose.Schema<IInventoryTemplateOption>(
  {
    label: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true }
  },
  { _id: false }
);

const InventoryTemplateFieldSchema = new mongoose.Schema<IInventoryTemplateField>(
  {
    key: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['text', 'number', 'date', 'select', 'textarea', 'image', 'boolean'],
      required: true
    },
    required: { type: Boolean, default: false },
    options: { type: [InventoryTemplateOptionSchema], default: [] },
    unit: { type: String, trim: true },
    placeholder: { type: String, trim: true },
    lookup: {
      model: { type: String, enum: ['InventoryMaterial'] },
      scope: { type: String, enum: ['farm', 'farm_type'] },
      category: { type: String, trim: true, lowercase: true },
      auto_fill: {
        type: Map,
        of: String,
        default: undefined
      }
    }
  },
  { _id: false }
);

const InventoryTemplateSchemaItemSchema = new mongoose.Schema<IInventoryTemplateSchemaItem>(
  {
    key: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['section', 'table'], required: true },
    fields: { type: [InventoryTemplateFieldSchema], default: [] },
    columns: { type: [InventoryTemplateFieldSchema], default: [] }
  },
  { _id: false }
);

const InventoryTemplateSchema = new mongoose.Schema<IInventoryTemplate>(
  {
    farm_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', default: null },
    farm_type_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmtype', default: null },
    domain: { type: String, required: true, trim: true, lowercase: true, default: 'inventory' },
    category: { type: String, required: true, trim: true, lowercase: true },
    key: { type: String, required: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    schema: { type: [InventoryTemplateSchemaItemSchema], default: [] },
    version: { type: Number, default: 1, min: 1 },
    status: { type: String, enum: ['draft', 'active', 'archived'], default: 'active' },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

InventoryTemplateSchema.index({ domain: 1, category: 1, status: 1 });
InventoryTemplateSchema.index({ farm_type_id: 1, status: 1 });
InventoryTemplateSchema.index({ farm_id: 1, status: 1 });
InventoryTemplateSchema.index({ domain: 1, category: 1, key: 1, version: 1 });

export default mongoose.model<IInventoryTemplate>('InventoryTemplate', InventoryTemplateSchema);
